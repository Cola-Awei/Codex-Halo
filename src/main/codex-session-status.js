import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function inferStatusFromEvent(event, nowMs = Date.now()) {
  return inferStatusTransitionFromEvent(event, nowMs) ?? 'thinking';
}

function inferStatusTransitionFromEvent(event, nowMs = Date.now()) {
  if (!event || typeof event !== 'object') return undefined;
  const payload = event.payload ?? {};

  if (event.type === 'response_item') {
    if (payload.type === 'reasoning' || payload.type === 'function_call') {
      return 'thinking';
    }
    if (payload.type === 'message' && payload.role === 'assistant') {
      return payload.phase === 'final_answer' ? 'done' : 'thinking';
    }
  }

  if (event.type === 'event_msg') {
    if (payload.type === 'user_message') return 'thinking';
    if (payload.type === 'agent_message') {
      return payload.phase === 'final_answer' ? 'done' : 'thinking';
    }
  }

  return undefined;
}

export function inferStatusFromSessionLines(lines, nowMs = Date.now()) {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try {
      const status = inferStatusTransitionFromEvent(JSON.parse(lines[index]), nowMs);
      if (status) return status;
    } catch {
      // Ignore partial or non-JSON lines while the log is being written.
    }
  }
  return 'thinking';
}

export function findLatestCodexSessionFile(homeDir = os.homedir()) {
  const sessionsDir = path.join(homeDir, '.codex', 'sessions');
  const files = [];
  collectJsonlFiles(sessionsDir, files);
  files.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return files[0]?.filePath;
}

export function readStatusFromCodexSession(filePath, nowMs = Date.now()) {
  if (!filePath || !fs.existsSync(filePath)) return 'thinking';
  const content = fs.readFileSync(filePath, 'utf8');
  return inferStatusFromSessionLines(content.trimEnd().split(/\r?\n/), nowMs);
}

function collectJsonlFiles(dir, files) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJsonlFiles(entryPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
      const stat = fs.statSync(entryPath);
      files.push({ filePath: entryPath, mtimeMs: stat.mtimeMs });
    }
  }
}
