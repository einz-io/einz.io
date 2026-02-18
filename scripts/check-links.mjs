import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const docsDir = path.join(rootDir, "docs");

function decodeLink(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getAttrLinks(content) {
  const links = [];
  const regex = /(href|src)\s*=\s*(["'])(.*?)\2/gi;
  let match;
  while ((match = regex.exec(content))) {
    links.push({ attr: match[1].toLowerCase(), value: match[3] });
  }
  return links;
}

function getIds(content) {
  const ids = new Set();
  const regex = /\sid\s*=\s*(["'])(.*?)\1/gi;
  let match;
  while ((match = regex.exec(content))) {
    ids.add(match[2]);
  }
  return ids;
}

function shouldSkipLink(link) {
  const lower = link.toLowerCase();
  return (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("javascript:") ||
    lower.startsWith("data:")
  );
}

async function listHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await listHtmlFiles(fullPath);
      files.push(...nested);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function validateHtmlFiles(htmlFiles) {
  const errors = [];
  const fileCache = new Map();
  const idCache = new Map();

  async function readFileCached(filePath) {
    if (!fileCache.has(filePath)) {
      const content = await fs.readFile(filePath, "utf-8");
      fileCache.set(filePath, content);
      idCache.set(filePath, getIds(content));
    }
    return fileCache.get(filePath);
  }

  for (const filePath of htmlFiles) {
    const content = await readFileCached(filePath);
    const links = getAttrLinks(content);

    for (const { attr, value } of links) {
      if (attr !== "href") {
        continue;
      }

      if (!value || shouldSkipLink(value)) {
        continue;
      }

      if (value.startsWith("#")) {
        const localAnchor = value.slice(1);
        if (!localAnchor) {
          continue;
        }

        const ids = idCache.get(filePath) ?? new Set();
        if (!ids.has(localAnchor)) {
          errors.push(`${path.relative(rootDir, filePath)}: missing local anchor #${localAnchor}`);
        }
        continue;
      }

      const [rawTarget, rawFragment] = value.split("#");
      const targetPath = decodeLink(rawTarget);
      const fragment = rawFragment ? decodeLink(rawFragment) : "";
      const resolvedPath = path.resolve(path.dirname(filePath), targetPath);

      try {
        const stat = await fs.stat(resolvedPath);
        if (!stat.isFile()) {
          errors.push(`${path.relative(rootDir, filePath)}: target is not a file -> ${value}`);
          continue;
        }
      } catch {
        errors.push(`${path.relative(rootDir, filePath)}: broken file link -> ${value}`);
        continue;
      }

      if (fragment) {
        await readFileCached(resolvedPath);
        const targetIds = idCache.get(resolvedPath) ?? new Set();
        if (!targetIds.has(fragment)) {
          errors.push(`${path.relative(rootDir, filePath)}: missing anchor in ${path.relative(rootDir, resolvedPath)} -> #${fragment}`);
        }
      }
    }
  }

  return errors;
}

async function validateNavConfig() {
  const errors = [];
  const navFile = path.join(rootDir, "assets", "docs-nav.js");

  try {
    const content = await fs.readFile(navFile, "utf-8");
    const hrefRegex = /href:\s*"([^"]+)"/g;
    let match;

    while ((match = hrefRegex.exec(content))) {
      const href = match[1];
      if (shouldSkipLink(href)) {
        continue;
      }

      const fullPath = path.resolve(docsDir, href);
      try {
        const stat = await fs.stat(fullPath);
        if (!stat.isFile()) {
          errors.push(`assets/docs-nav.js: nav href is not a file -> ${href}`);
        }
      } catch {
        errors.push(`assets/docs-nav.js: broken nav href -> ${href}`);
      }
    }
  } catch {
    // Optional file.
  }

  return errors;
}

async function main() {
  const htmlFiles = await listHtmlFiles(rootDir);
  const htmlErrors = await validateHtmlFiles(htmlFiles);
  const navErrors = await validateNavConfig();
  const errors = [...htmlErrors, ...navErrors];

  if (errors.length > 0) {
    console.error("Broken link check failed:\n");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Broken link check passed (${htmlFiles.length} HTML files checked).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
