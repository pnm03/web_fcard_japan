use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    fs,
    path::PathBuf,
    sync::{Arc, Mutex},
    thread,
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, State,
};
use tauri_plugin_notification::NotificationExt;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct LearningSessionReminder {
    id: String,
    goal_id: String,
    goal_title: String,
    scheduled_at: i64,
    deadline_at: i64,
    vocab_count: usize,
    duration_minutes: usize,
    notification_limit: usize,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct NativeSchedule {
    sessions: Vec<LearningSessionReminder>,
    notified_at: HashMap<String, i64>,
    updated_at: i64,
}

struct SchedulerState {
    schedule: Arc<Mutex<NativeSchedule>>,
    path: PathBuf,
}

fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as i64
}

fn persist_schedule(path: &PathBuf, schedule: &NativeSchedule) {
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    if let Ok(json) = serde_json::to_string(schedule) {
        let _ = fs::write(path, json);
    }
}

fn load_schedule(path: &PathBuf) -> NativeSchedule {
    fs::read_to_string(path)
        .ok()
        .and_then(|json| serde_json::from_str(&json).ok())
        .unwrap_or_default()
}

fn due_sessions(schedule: &NativeSchedule, now: i64) -> Vec<LearningSessionReminder> {
    schedule
        .sessions
        .iter()
        .filter(|session| {
            session.scheduled_at <= now
                && session.deadline_at > now
                && !schedule.notified_at.contains_key(&session.id)
        })
        .cloned()
        .collect()
}

fn notifications_in_last_day(schedule: &NativeSchedule, goal_id: &str, now: i64) -> usize {
    const DAY_MS: i64 = 24 * 60 * 60 * 1000;
    schedule
        .sessions
        .iter()
        .filter(|session| session.goal_id == goal_id)
        .filter_map(|session| schedule.notified_at.get(&session.id))
        .filter(|sent_at| now - **sent_at < DAY_MS)
        .count()
}

#[tauri::command]
fn update_learning_schedule(
    sessions: Vec<LearningSessionReminder>,
    state: State<'_, SchedulerState>,
) -> Result<usize, String> {
    let mut schedule = state
        .schedule
        .lock()
        .map_err(|_| "Không khóa được lịch native".to_string())?;
    let valid_ids = sessions
        .iter()
        .map(|session| session.id.as_str())
        .collect::<std::collections::HashSet<_>>();
    schedule
        .notified_at
        .retain(|session_id, _| valid_ids.contains(session_id.as_str()));
    schedule.sessions = sessions;
    schedule.updated_at = now_ms();
    persist_schedule(&state.path, &schedule);
    Ok(schedule.sessions.len())
}

fn start_native_scheduler(
    app: tauri::AppHandle,
    schedule: Arc<Mutex<NativeSchedule>>,
    path: PathBuf,
) {
    thread::spawn(move || loop {
        let now = now_ms();
        let (due, initial_counts) = {
            let guard = schedule.lock();
            match guard {
                Ok(current) => {
                    let due = due_sessions(&current, now);
                    let counts = due
                        .iter()
                        .map(|session| {
                            (
                                session.goal_id.clone(),
                                notifications_in_last_day(&current, &session.goal_id, now),
                            )
                        })
                        .collect::<HashMap<_, _>>();
                    (due, counts)
                }
                Err(_) => (Vec::new(), HashMap::new()),
            }
        };

        let mut sent_per_goal = initial_counts;
        for session in due {
            let sent = sent_per_goal.entry(session.goal_id.clone()).or_insert(0);
            if *sent >= session.notification_limit.max(1) {
                continue;
            }
            let deadline_hours = ((session.deadline_at - now) as f64 / 3_600_000.0).max(0.0);
            let deadline_text = if deadline_hours < 24.0 {
                format!("còn {} giờ", deadline_hours.round().max(1.0) as i64)
            } else {
                format!(
                    "còn {} ngày",
                    (deadline_hours / 24.0).round().max(1.0) as i64
                )
            };
            let sent_result = app
                .notification()
                .builder()
                .id(902)
                .title(format!("Đến giờ: {}", session.goal_title))
                .body(format!(
                    "{} từ · khoảng {} phút · {}.",
                    session.vocab_count, session.duration_minutes, deadline_text
                ))
                .extra("action", "open-goal")
                .extra("goalId", session.goal_id.clone())
                .auto_cancel()
                .show();
            if sent_result.is_ok() {
                *sent += 1;
                if let Ok(mut current) = schedule.lock() {
                    current.notified_at.insert(session.id, now);
                    persist_schedule(&path, &current);
                }
            }
        }
        thread::sleep(Duration::from_secs(30));
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    fn reminder(id: &str, goal_id: &str, scheduled_at: i64) -> LearningSessionReminder {
        LearningSessionReminder {
            id: id.into(),
            goal_id: goal_id.into(),
            goal_title: "Mục tiêu".into(),
            scheduled_at,
            deadline_at: 10_000,
            vocab_count: 5,
            duration_minutes: 4,
            notification_limit: 3,
        }
    }

    #[test]
    fn only_returns_due_unnotified_sessions() {
        let mut schedule = NativeSchedule {
            sessions: vec![reminder("past", "g", 100), reminder("future", "g", 5_000)],
            ..Default::default()
        };
        assert_eq!(due_sessions(&schedule, 1_000).len(), 1);
        schedule.notified_at.insert("past".into(), 900);
        assert!(due_sessions(&schedule, 1_000).is_empty());
    }

    #[test]
    fn counts_recent_notifications_per_goal() {
        let now = 90_000_000;
        let mut schedule = NativeSchedule {
            sessions: vec![reminder("a", "g1", 100), reminder("b", "g2", 100)],
            ..Default::default()
        };
        schedule.notified_at.insert("a".into(), now - 1_000);
        schedule.notified_at.insert("b".into(), now - 90_000_000);
        assert_eq!(notifications_in_last_day(&schedule, "g1", now), 1);
        assert_eq!(notifications_in_last_day(&schedule, "g2", now), 0);
    }
}

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![update_learning_schedule])
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            show_main_window(app);
        }))
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_autostart::Builder::new()
                .app_name("Nihongo Flashcard")
                .args(["--hidden"])
                .build(),
        )
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let schedule_path = app.path().app_data_dir()?.join("learning-schedule.json");
            let native_schedule = Arc::new(Mutex::new(load_schedule(&schedule_path)));
            app.manage(SchedulerState {
                schedule: native_schedule.clone(),
                path: schedule_path.clone(),
            });
            start_native_scheduler(app.handle().clone(), native_schedule, schedule_path);

            let open_item =
                MenuItem::with_id(app, "open", "Mở Nihongo Flashcard", true, None::<&str>)?;
            let review_item =
                MenuItem::with_id(app, "review", "Ôn từ đến hạn", true, None::<&str>)?;
            let goal_item =
                MenuItem::with_id(app, "goal", "Học mục tiêu tiếp theo", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Thoát hoàn toàn", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open_item, &review_item, &goal_item, &quit_item])?;

            let mut tray = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(false)
                .tooltip("Nihongo Flashcard")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "open" => show_main_window(app),
                    "review" => {
                        show_main_window(app);
                        let _ = app.emit("desktop-review-requested", ());
                    }
                    "goal" => {
                        show_main_window(app);
                        let _ = app.emit("desktop-goal-requested", ());
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main_window(tray.app_handle());
                    }
                });

            if let Some(icon) = app.default_window_icon() {
                tray = tray.icon(icon.clone());
            }
            tray.build(app)?;

            if std::env::args().any(|arg| arg == "--hidden") {
                if let Some(window) = app.get_webview_window("main") {
                    window.hide()?;
                }
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Nihongo Flashcard");
}
