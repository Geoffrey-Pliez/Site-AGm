import fs from 'fs';
import path from 'path';

const uploadsDir = 'public/wp-content/uploads';
const srcDir = 'src';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      results.push(file.replace(/\\/g, '/'));
    }
  });
  return results;
}

const allMediaFiles = getFiles(uploadsDir).map(f => f.replace(/^public\//, ''));

function findReferences(dir) {
  let refs = new Set();
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      const subRefs = findReferences(file);
      subRefs.forEach(r => refs.add(r));
    } else {
      const content = fs.readFileSync(file, 'utf-8');
      const regex = /wp-content\/uploads\/[^\s"'<>)]+/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        // Clean up the match (it might contain closing quotes or parents if regex was too greedy)
        let ref = match[0];
        // Remove trailing punctuation often found in URLs
        ref = ref.replace(/[.,;!?]$/, '');
        refs.add(ref);
      }
    }
  });
  return refs;
}

const referencedMedia = findReferences(srcDir);

console.log(`Total media files found: ${allMediaFiles.length}`);
console.log(`Unique references found: ${referencedMedia.size}`);

const obsolete = [];
const used = [];

allMediaFiles.forEach(file => {
  // Check if the file itself is referenced
  if (referencedMedia.has(file)) {
    used.push(file);
  } else {
    // Check if a base version of the file is referenced (WordPress often adds sizes like -1024x768)
    // Actually, if the code references a specific size, we want to KEEP that size.
    // But if the code references the original and we have sizes, or vice versa...
    
    // Simple check first: exact match
    let found = false;
    for (const ref of referencedMedia) {
      if (ref === file || ref.startsWith(file) || file.startsWith(ref)) {
        found = true;
        break;
      }
    }
    
    if (found) {
      used.push(file);
    } else {
      obsolete.push(file);
    }
  }
});

console.log(`Obsolete files: ${obsolete.length}`);
console.log(`Used files: ${used.length}`);

fs.writeFileSync('obsolete_media.json', JSON.stringify(obsolete, null, 2));
fs.writeFileSync('used_media.json', JSON.stringify(used, null, 2));

if (obsolete.length > 0) {
    console.log('\nTop 10 Obsolete files:');
    obsolete.slice(0, 10).forEach(f => console.log(f));
}
