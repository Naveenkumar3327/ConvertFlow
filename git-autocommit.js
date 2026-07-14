const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const DEBOUNCE_DELAY = 5000; // 5 seconds delay to group quick edits
let debounceTimer = null;

const ignoreList = [
  ".git",
  "node_modules",
  ".next",
  "temp_conversions",
  "package-lock.json",
  "git-autocommit.js"
];

function runCommand(cmd) {
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

async function processGitWorkspace() {
  console.log("[Auto-Commit] Inspecting git repository status...");
  
  const statusRes = await runCommand("git status --porcelain");
  if (!statusRes.stdout.trim()) {
    console.log("[Auto-Commit] Workspace is clean. No commits required.");
    return;
  }

  console.log("[Auto-Commit] Changes detected. Staging modifications...");
  const addRes = await runCommand("git add .");
  if (addRes.error) {
    console.error("[Auto-Commit] Staging files failed:", addRes.stderr);
    return;
  }

  console.log("[Auto-Commit] Creating automatic commit...");
  const commitRes = await runCommand('git commit -m "Auto-commit: modifications saved"');
  if (commitRes.error) {
    console.error("[Auto-Commit] Commit failed:", commitRes.stderr);
    return;
  }

  console.log("[Auto-Commit] Pushing modifications to origin/main...");
  const pushRes = await runCommand("git push origin main");
  if (pushRes.error) {
    console.error("[Auto-Commit] Pushing to GitHub failed:", pushRes.stderr);
  } else {
    console.log("[Auto-Commit] Successfully synchronized workspace changes with GitHub!");
  }
}

function initAutocommitDaemon() {
  console.log("[Auto-Commit] Daemon activated. Monitoring workspace directory for changes...");
  
  fs.watch(process.cwd(), { recursive: true }, (eventType, filename) => {
    if (!filename) return;

    // Check if filename path includes any ignored directories
    const shouldIgnore = ignoreList.some((ignored) => {
      const parts = filename.split(path.sep);
      return parts.includes(ignored) || filename.startsWith(ignored);
    });

    if (shouldIgnore) return;

    console.log(`[Auto-Commit] Change registered on file: ${filename}`);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      processGitWorkspace();
    }, DEBOUNCE_DELAY);
  });
}

initAutocommitDaemon();
