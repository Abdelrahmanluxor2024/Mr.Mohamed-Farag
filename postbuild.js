import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'dist', 'index.html');

console.log('Running postbuild script to fix CSS warnings in dist/index.html...');

try {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the specific combination that triggers the CSS warning
    // "vertical-align:middle;display:block" -> "display:block"
    const original = 'vertical-align:middle;display:block';
    const replacement = 'display:block';
    
    if (content.includes(original)) {
      content = content.replaceAll(original, replacement);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Successfully fixed vertical-align warning in dist/index.html.');
    } else {
      console.log('Target CSS pattern not found or already replaced.');
    }
  } else {
    console.error('dist/index.html not found!');
  }
} catch (error) {
  console.error('Error in postbuild script:', error);
}
