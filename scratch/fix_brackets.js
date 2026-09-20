import fs from 'fs';

const files = [
  'd:/Projects/Crypto/Cypher/src/content/numbertheory.ts',
  'd:/Projects/Crypto/Cypher/src/content/postquantum.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/",\s*pitfalls:/g, '",\n    },\n    pitfalls:');
  content = content.replace(/\],\s*\n\s*},\s*\n\s*body:/g, '],\n    body:');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
}
