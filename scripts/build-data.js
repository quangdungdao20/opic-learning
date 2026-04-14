import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../public/data');
const MANIFEST_PATH = path.join(DATA_DIR, 'manifest.json');

function cleanFolderName(name) {
  // For folders, we only want to strip leading "number. " patterns
  // We do NOT strip extensions because folders might have dots (e.g., "1. Music 1")
  const displayNameMatch = name.match(/^\d+\.?\s*(.+)$/);
  return displayNameMatch ? displayNameMatch[1].trim() : name;
}

function cleanFileName(name) {
  // For files, strip extension first
  const base = name.replace(/\.[^/.]+$/, "");
  // Then strip leading numbers
  const displayNameMatch = base.match(/^\d+\.?\s*(.+)$/);
  return displayNameMatch ? displayNameMatch[1].trim() : base;
}

async function getTopicData(dirPath, relativeDir) {
  const files = fs.readdirSync(dirPath);
  const audioFiles = [];
  const scripts = [];
  let hasDocx = false;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const ext = path.extname(file).toLowerCase();
    
    if (ext === '.mp3') {
      audioFiles.push({
        name: file,
        path: `/data/${relativeDir.split(path.sep).map(encodeURIComponent).join('/')}/${encodeURIComponent(file)}`
      });
    } else if (ext === '.docx' || ext === '.doc') {
      hasDocx = true;
      console.log(`Processing DOCX: ${filePath}`);
      try {
        const result = await mammoth.convertToHtml({ path: filePath });
        scripts.push({
          fileName: file,
          name: cleanFileName(file),
          html: result.value
        });
      } catch (e) {
        console.error(`Error processing ${filePath}:`, e);
      }
    }
  }

  if (audioFiles.length === 0 && !hasDocx) return null;

  audioFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  scripts.sort((a, b) => a.fileName.localeCompare(b.fileName));

  return {
    audioFiles,
    scripts,
    hasAnswer: hasDocx
  };
}

async function scanDirectory(currentDir, relativeDir = '') {
  let topics = [];
  const items = fs.readdirSync(currentDir, { withFileTypes: true });

  // Check if current directory itself is a topic
  const topicInfo = await getTopicData(currentDir, relativeDir);
  if (topicInfo) {
    const name = path.basename(currentDir);
    const pathId = relativeDir.replace(/\\/g, '/');
    
    // Parent name logic
    const parentPath = path.dirname(relativeDir);
    const parentName = parentPath === '.' ? null : cleanFolderName(path.basename(parentPath));

    topics.push({
      id: pathId.replace(/\//g, '---'),
      name: cleanFolderName(name),
      fullPath: pathId,
      parent: parentName,
      ...topicInfo
    });
  }

  // Recurse into subdirectories
  for (const item of items) {
    if (item.isDirectory()) {
      const subDir = path.join(currentDir, item.name);
      const subRelativeDir = path.join(relativeDir, item.name);
      const subTopics = await scanDirectory(subDir, subRelativeDir);
      topics = topics.concat(subTopics);
    }
  }

  return topics;
}

async function main() {
  console.log('Scanning directories with fixed naming logic...');
  const topics = await scanDirectory(DATA_DIR);

  topics.sort((a, b) => {
    return a.fullPath.localeCompare(b.fullPath, undefined, { numeric: true, sensitivity: 'base' });
  });

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ topics }, null, 2));
  console.log(`Manifest created with ${topics.length} topics at ${MANIFEST_PATH}`);
}

main().catch(console.error);
