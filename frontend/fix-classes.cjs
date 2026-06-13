const fs = require('fs');
const path = require('path');

const dir = 'd:/Campus_Resell_unique_3d_seeded/frontend/src';

const map = {
  'text-slate-900': 'text-primary',
  'text-slate-800': 'text-primary',
  'text-gray-900': 'text-primary',
  'text-gray-800': 'text-primary',
  'text-black': 'text-primary',
  'text-slate-700': 'text-primary',
  'text-slate-600': 'text-muted',
  'text-slate-500': 'text-muted',
  'text-gray-600': 'text-muted',
  'text-gray-500': 'text-muted',
  'bg-white': 'bg-card',
  'bg-slate-50': 'bg-elevated',
  'bg-slate-100': 'bg-elevated',
  'border-slate-200': 'border-border',
  'border-slate-300': 'border-border',
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'text-slate-400': 'text-muted'
};

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [key, value] of Object.entries(map)) {
        // use lookaround to match tailwind classes strictly
        const regex = new RegExp(`(?<=[\\s"'\\\`])` + key + `(?=[\\s"'\\\`])`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, value);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + fullPath);
      }
    }
  }
}

processDir(dir);
