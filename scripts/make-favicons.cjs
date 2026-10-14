const { app, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(() => {
  const sourcePath = path.resolve('public/assets/logo-fox.png');
  console.log('Reading source:', sourcePath);
  const img = nativeImage.createFromPath(sourcePath);
  const size = img.getSize();
  console.log('Source size:', size);

  // In the 1024x1024 image, the mint squircle is centered from approx x:110, y:110 to size ~804x804
  // Let's crop to the squircle app icon so it fills the favicon cleanly without the dark border
  const cropX = Math.round(size.width * 0.105);
  const cropY = Math.round(size.height * 0.105);
  const cropW = Math.round(size.width * 0.79);
  const cropH = Math.round(size.height * 0.79);

  const cropped = img.crop({ x: cropX, y: cropY, width: cropW, height: cropH });
  console.log('Cropped size:', cropped.getSize());

  // Generate 64x64, 32x32, 192x192 PNGs
  const resized32 = cropped.resize({ width: 32, height: 32, quality: 'best' });
  const resized64 = cropped.resize({ width: 64, height: 64, quality: 'best' });
  const resized192 = cropped.resize({ width: 192, height: 192, quality: 'best' });
  const resized512 = cropped.resize({ width: 512, height: 512, quality: 'best' });

  // Save cropped versions
  fs.writeFileSync('public/favicon.png', cropped.toPNG());
  fs.writeFileSync('public/favicon-32x32.png', resized32.toPNG());
  fs.writeFileSync('public/favicon-192x192.png', resized192.toPNG());
  fs.writeFileSync('public/assets/logo-fox-cropped.png', cropped.toPNG());

  // Save to dist as well
  if (fs.existsSync('dist')) {
    fs.writeFileSync('dist/favicon.png', cropped.toPNG());
    fs.writeFileSync('dist/favicon-32x32.png', resized32.toPNG());
    fs.writeFileSync('dist/favicon-192x192.png', resized192.toPNG());
  }

  // Create Base64 for favicon.svg so SVG NEVER fails or needs external requests
  const base64Data = cropped.toPNG().toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <image href="data:image/png;base64,${base64Data}" width="128" height="128" preserveAspectRatio="xMidYMid meet"/>
</svg>\n`;

  fs.writeFileSync('public/favicon.svg', svgContent, 'utf-8');
  if (fs.existsSync('dist')) {
    fs.writeFileSync('dist/favicon.svg', svgContent, 'utf-8');
  }

  // Create favicon.ico format:
  // A valid .ico file header with 32x32 PNG payload
  const png32Buffer = resized32.toPNG();
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // ICO type (1 for icon)
  icoHeader.writeUInt16LE(1, 4); // 1 image

  const icoDirEntry = Buffer.alloc(16);
  icoDirEntry.writeUInt8(32, 0); // width 32
  icoDirEntry.writeUInt8(32, 1); // height 32
  icoDirEntry.writeUInt8(0, 2);  // color palette (0 = no palette)
  icoDirEntry.writeUInt8(0, 3);  // reserved
  icoDirEntry.writeUInt16LE(1, 4); // color planes
  icoDirEntry.writeUInt16LE(32, 6); // bits per pixel
  icoDirEntry.writeUInt32LE(png32Buffer.length, 8); // size of image data
  icoDirEntry.writeUInt32LE(6 + 16, 12); // offset of image data

  const icoBuffer = Buffer.concat([icoHeader, icoDirEntry, png32Buffer]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  if (fs.existsSync('dist')) {
    fs.writeFileSync('dist/favicon.ico', icoBuffer);
  }

  console.log('Favicon generation complete! ICO, PNG, and embedded SVG generated.');
  app.exit(0);
});
