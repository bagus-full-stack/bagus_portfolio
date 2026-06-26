import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(file);
    }
  });
  return results;
}

const files = [...walk("src/components"), ...walk("src/pages")];

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(/bg-\[#0B0F14\]/g, "bg-[var(--bg-primary)]");
  content = content.replace(/bg-\[#141B22\]/g, "bg-[var(--bg-card)]");
  content = content.replace(/text-\[#EDEFF2\]/g, "text-[var(--text-primary)]");
  content = content.replace(/text-\[#8B94A3\]/g, "text-[var(--text-muted)]");
  content = content.replace(/text-\[#9BA4B5\]/g, "text-[var(--text-muted)]");
  content = content.replace(/border-\[#8B94A3\]/g, "border-[var(--border-subtle)]");
  content = content.replace(/border-\[#9BA4B5\]/g, "border-[var(--border-subtle)]");
  content = content.replace(/bg-\[#9BA4B5\]/g, "bg-[var(--border-subtle)]");
  fs.writeFileSync(file, content, "utf8");
});
console.log("Replaced colors in " + files.length + " files");
