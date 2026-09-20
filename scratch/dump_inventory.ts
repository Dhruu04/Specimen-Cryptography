import { tracks, lessons } from '../src/content/index';
import { tools } from '../src/lib/tools';
import * as fs from 'fs';

let out = `TOTAL TRACKS: ${tracks.length}\nTOTAL LESSONS: ${lessons.length}\nTOTAL TOOLS: ${tools.length}\n\n`;

for (const t of tracks) {
  const tLessons = lessons.filter(l => l.trackId === t.id);
  out += `\n========================================\nTRACK: [${t.id}] ${t.name} (${tLessons.length} lessons)\n========================================\n`;
  out += `Blurb: ${t.blurb}\nIntro: ${t.intro}\n\n`;
  for (const l of tLessons) {
    out += `  * LESSON [${l.id}] "${l.title}"\n`;
    out += `    Tool: ${l.toolId || 'None'}\n`;
    if (l.workedExample) {
      out += `    Worked Example: "${l.workedExample.title}" (${l.workedExample.steps.length} steps)\n`;
    }
  }
}

out += `\n\n========================================\nALL TOOLS (${tools.length} TOTAL)\n========================================\n`;
for (const tool of tools) {
  out += `* TOOL [${tool.id}] "${tool.name}" (trackId: ${tool.trackId})\n`;
  out += `  Tagline: ${tool.tagline}\n`;
  out += `  Output: ${tool.outputLabel}\n`;
  const fields = tool.fields ?? [];
  out += `  Fields (${fields.length}): ${fields.map(f => `${f.name} [${f.label}] (type: ${f.type}, default: "${f.default}")`).join('; ')}\n`;
}

fs.writeFileSync('scratch/inventory.txt', out, 'utf-8');
console.log('SUCCESS, detailed inventory written to scratch/inventory.txt');
