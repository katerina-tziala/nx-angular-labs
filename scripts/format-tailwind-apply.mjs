import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

export const ignoredDirectories = new Set(['.git', 'coverage', 'dist', 'node_modules']);

const rootDir = process.cwd();
const mode = process.argv.includes('--check') ? 'check' : 'write';
const supportedExtensions = new Set(['.css', '.scss']);

const applyRulePattern = /^([ \t]*)@apply\s+([^;]*?);/gm;

// Matches a CSS rule block: selector(s) { ...content... }
// Used to find blocks containing multiple @apply rules to merge.
const ruleBlockPattern = /^([ \t]*)((?:[^{};\/\n][^\n]*\n)*?[ \t]*[^{};\/\n][^\n]*)\s*\{([^{}]*)\}/gms;

function formatApplyClasses(indent, rawClasses) {
  const classes = [...new Set(rawClasses.trim().split(/\s+/).filter(Boolean))];

  if (classes.length === 0) {
    return `${indent}@apply;`;
  }

  if (classes.length === 1) {
    return `${indent}@apply ${classes[0]};`;
  }

  // Use two extra spaces for continuation lines to stay consistent with the indent style
  const classIndent = `${indent}  `;
  const firstLine = `${indent}@apply ${classes[0]}`;
  const remainingLines = classes.slice(1).map((className, index) => {
    const suffix = index === classes.length - 2 ? ';' : '';
    return `${classIndent}${className}${suffix}`;
  });

  return [firstLine, ...remainingLines].join('\n');
}

function mergeApplyRules(blockContent, blockIndent) {
  const lines = blockContent.split('\n');
  const applyClasses = [];
  const otherLines = [];
  let applyCount = 0;
  let innerIndent = `${blockIndent}  `;

  for (const line of lines) {
    const applyMatch = line.match(/^([ \t]*)@apply\s+([^;]*?);/);
    if (applyMatch) {
      applyCount++;
      innerIndent = applyMatch[1];
      applyClasses.push(...applyMatch[2].trim().split(/\s+/).filter(Boolean));
    } else {
      otherLines.push(line);
    }
  }

  if (applyCount <= 1) {
    return blockContent;
  }

  const mergedApply = formatApplyClasses(innerIndent, applyClasses.join(' '));
  const otherContent = otherLines
    .filter((line, i) => !(line.trim() === '' && i === 0))
    .join('\n');

  return `\n${mergedApply}\n${otherContent}`;
}

function formatApplyRules(source) {
  // First pass: merge duplicate @apply rules within the same rule block
  const merged = source.replace(ruleBlockPattern, (match, indent, selector, blockContent) => {
    const mergedContent = mergeApplyRules(blockContent, indent);
    return mergedContent === blockContent
      ? match
      : `${indent}${selector.trim()} {${mergedContent}}`;
  });

  // Second pass: format individual @apply class lists (dedup + multi-line)
  return merged.replace(applyRulePattern, (_rule, indent, rawClasses) =>
    formatApplyClasses(indent, rawClasses),
  );
}

export function formatTailwindApply(source) {
  return formatApplyRules(source);
}

async function main() {
  const changedFiles = [];
  const files = await collectFiles(rootDir, supportedExtensions);

  for (const filePath of files) {
    const source = await readFile(filePath, 'utf8');
    const formatted = formatTailwindApply(source);

    if (formatted === source) {
      continue;
    }

    changedFiles.push(path.relative(rootDir, filePath));

    if (mode === 'write') {
      await writeFile(filePath, formatted);
    }
  }

  if (mode === 'check' && changedFiles.length > 0) {
    console.error('Tailwind @apply formatting needed:');

    for (const filePath of changedFiles) {
      console.error(`  ${filePath}`);
    }

    process.exitCode = 1;
  } else if (mode === 'write' && changedFiles.length > 0) {
    console.log(`Formatted Tailwind @apply rules in ${changedFiles.length} file(s).`);
  }
}

export async function collectFiles(directory, supportedExtensionsFilter) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await collectFiles(absolutePath, supportedExtensionsFilter)));
      }

      continue;
    }

    if (entry.isFile() && supportedExtensionsFilter.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
