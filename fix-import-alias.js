// code to fix import alias @ and ../

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "src");

function toRelativePath(fromFile, targetFile) {
  const relative = path.relative(path.dirname(fromFile), targetFile);
  return relative.startsWith(".") ? relative : "./" + relative;
}

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  let changed = false;

  const importRegex = /from\s+['"]@\/([^'"]+)['"]/g;
  content = content.replace(importRegex, (match, importPath) => {
    const targetPath = path.join(rootDir, importPath);

    const possibleExtensions = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js", "/index.jsx"];
    const resolved = possibleExtensions.find(ext => fs.existsSync(targetPath + ext));
    if (!resolved) {
      console.warn(`⚠️  Cannot resolve: ${targetPath}`);
      return match;
    }

    const relativePath = toRelativePath(filePath, targetPath).replace(/\\/g, "/");
    changed = true;
    return `from "${relativePath}"`;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("✅ Fixed:", filePath);
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      fixImportsInFile(fullPath);
    }
  }
}

walkDir(rootDir);
