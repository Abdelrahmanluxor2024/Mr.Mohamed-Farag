const fs = require('fs');
const https = require('https');
const path = require('path');

const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf';
const outputPath = path.join(__dirname, 'src', 'utils', 'arabicFont.ts');

console.log('Downloading font from:', fontUrl);

https.get(fontUrl, (res) => {
  if (res.statusCode !== 200) {
    console.error('Failed to download font:', res.statusCode);
    return;
  }

  const data = [];
  res.on('data', (chunk) => data.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    const base64 = buffer.toString('base64');
    const fileContent = `// This file is auto-generated. Do not edit manually.\nexport const amiriFontBase64 = '${base64}';\n`;
    fs.writeFileSync(outputPath, fileContent);
    console.log('Font successfully downloaded and written to:', outputPath);
  });
}).on('error', (err) => {
  console.error('Error downloading font:', err);
});
