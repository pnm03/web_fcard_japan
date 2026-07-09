import { supabase } from "./supabase.js";

const THEME_STORAGE_KEY = "nihongo_account_theme";
const AVATAR_BUCKET = "avatars";
const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024;
const AVATAR_OUTPUT_SIZE = 512;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const ACCOUNT_THEMES = [
  {
    id: "paper",
    name: "Giấy Nhật",
    description: "Ấm, cổ điển và dễ tập trung",
    colors: ["#f4f1ea", "#b5482e", "#4f7a4a"]
  },
  {
    id: "sakura",
    name: "Sakura",
    description: "Hồng anh đào, xanh lá trầm",
    colors: ["#fff4f5", "#b83f64", "#3f755b"]
  },
  {
    id: "matcha",
    name: "Matcha",
    description: "Xanh trà, điểm nhấn đất nung",
    colors: ["#f2f6ed", "#557347", "#b75a3c"]
  },
  {
    id: "aozora",
    name: "Aozora",
    description: "Trời trong, xanh ngọc và san hô",
    colors: ["#eff8f8", "#23787d", "#cc624f"]
  },
  {
    id: "fuji",
    name: "Fuji",
    description: "Tím khói, xanh thông thanh lịch",
    colors: ["#f6f2f8", "#74527f", "#3f7567"]
  },
  {
    id: "mono",
    name: "Mực Sumi",
    description: "Tối giản, rõ nét và điềm tĩnh",
    colors: ["#f1f2f2", "#34383b", "#52725f"]
  }
];

const ACCOUNT_THEME_IDS = new Set(ACCOUNT_THEMES.map(theme => theme.id));

export function normalizeAccountTheme(theme) {
  return ACCOUNT_THEME_IDS.has(theme) ? theme : "paper";
}

export function restoreSavedAccountTheme() {
  let theme = "paper";
  try {
    theme = normalizeAccountTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch (error) {
    console.warn("Không đọc được theme đã lưu:", error);
  }
  applyAccountTheme(theme);
  return theme;
}

export function applyAccountTheme(theme) {
  const normalizedTheme = normalizeAccountTheme(theme);
  document.documentElement.dataset.theme = normalizedTheme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
  } catch (error) {
    console.warn("Không lưu được theme:", error);
  }
  return normalizedTheme;
}

export function getDefaultDisplayName(email = "") {
  const localPart = String(email).split("@")[0] || "Học viên";
  return localPart.split(/[._+-]/)[0] || localPart;
}

export function getAccountProfile(user) {
  const metadata = user?.user_metadata || {};
  const displayName = String(metadata.display_name || "").trim()
    || getDefaultDisplayName(user?.email);

  return {
    displayName: displayName.slice(0, 40),
    avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : "",
    theme: normalizeAccountTheme(metadata.theme || localStorage.getItem(THEME_STORAGE_KEY)),
    emailNotifications: metadata.email_notifications === true,
    allowProjectAnalytics: metadata.allow_project_analytics === true
  };
}

export async function updateAccountProfile(patch) {
  const allowedPatch = {};

  if (Object.prototype.hasOwnProperty.call(patch, "displayName")) {
    const displayName = String(patch.displayName || "").trim();
    if (!displayName) throw new Error("Tên hiển thị không được để trống.");
    allowedPatch.display_name = displayName.slice(0, 40);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "avatarUrl")) {
    allowedPatch.avatar_url = String(patch.avatarUrl || "");
  }
  if (Object.prototype.hasOwnProperty.call(patch, "theme")) {
    allowedPatch.theme = normalizeAccountTheme(patch.theme);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "emailNotifications")) {
    allowedPatch.email_notifications = patch.emailNotifications === true;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "allowProjectAnalytics")) {
    allowedPatch.allow_project_analytics = patch.allowProjectAnalytics === true;
  }

  const { data, error } = await supabase.auth.updateUser({ data: allowedPatch });
  if (error) throw error;
  return data?.user || null;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không đọc được tệp ảnh này."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error("Không thể xử lý ảnh đại diện."));
    }, type, quality);
  });
}

async function prepareAvatar(file) {
  if (!ALLOWED_AVATAR_TYPES.has(file?.type)) {
    throw new Error("Avatar chỉ nhận ảnh JPEG, PNG hoặc WebP.");
  }
  if (file.size > AVATAR_MAX_FILE_SIZE) {
    throw new Error("Ảnh đại diện cần nhỏ hơn 5 MB.");
  }

  const image = await loadImage(file);
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = Math.max(0, (image.naturalWidth - sourceSize) / 2);
  const sourceY = Math.max(0, (image.naturalHeight - sourceSize) / 2);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;
  const context = canvas.getContext("2d");
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE
  );

  return canvasToBlob(canvas, "image/webp", 0.86);
}

export async function uploadAccountAvatar(user, file) {
  if (!user?.id) throw new Error("Cần đăng nhập để đổi avatar.");

  const avatarBlob = await prepareAvatar(file);
  const path = `${user.id}/avatar.webp`;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, avatarBlob, {
      cacheControl: "3600",
      contentType: "image/webp",
      upsert: true
    });

  if (error) throw error;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
  const updatedUser = await updateAccountProfile({ avatarUrl });
  return { avatarUrl, user: updatedUser };
}

export async function removeAccountAvatar(user) {
  if (!user?.id) return null;

  const path = `${user.id}/avatar.webp`;
  const { error: storageError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([path]);
  if (storageError) {
    console.warn("Không xóa được tệp avatar cũ:", storageError);
  }

  return updateAccountProfile({ avatarUrl: "" });
}

export async function deleteOwnAccount() {
  const { error } = await supabase.rpc("delete_own_account");
  if (error) throw error;
}
