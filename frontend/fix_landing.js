import fs from 'fs';
import path from 'path';

const dir = 'd:\\group_expense_tracker\\frontend\\src\\landing\\sections';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf-8');
  
  // 1. In ScrollTrigger, remove pin, scrub, and change start/end
  content = content.replace(/start:\s*'top top',\n\s*end:\s*'\+=130%',\n\s*pin:\s*true,\n\s*scrub:\s*[\d.]+,?/g, `start: 'top 80%',\n          toggleActions: 'play none none none',`);
  
  // Also some files might have slightly different formatting for end
  content = content.replace(/start:\s*'top top',[\s\S]*?pin:\s*true,[\s\S]*?scrub:\s*[\d.]+,?/g, `start: 'top 80%',\n          toggleActions: 'play none none none',`);

  // 2. Remove Phase 3 EXIT. We find "// Phase 3: EXIT" and delete everything up to "}, section);"
  content = content.replace(/\/\/\s*Phase 3: EXIT[\s\S]*?(?=\s*\}, section\);)/g, '');

  fs.writeFileSync(p, content);
});

// For LandingPage, remove the snap trigger
let lp = fs.readFileSync('d:\\group_expense_tracker\\frontend\\src\\landing\\LandingPage.jsx', 'utf-8');
lp = lp.replace(/ScrollTrigger\.create\(\{\s*snap:\s*\{[\s\S]*?\}\s*\}\);\s*/g, '');
fs.writeFileSync('d:\\group_expense_tracker\\frontend\\src\\landing\\LandingPage.jsx', lp);

console.log("Fixed files successfully!");
