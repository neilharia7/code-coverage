/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function inputEnvName(name) {
  return `INPUT_${name.toUpperCase().replace(/ /g, '_').replace(/-/g, '_')}`;
}

function getInput(name, def = '') {
  const v = process.env[inputEnvName(name)];
  if (v === undefined || v === null || String(v).trim() === '') return def;
  return String(v).trim();
}

function asNumber(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function writeText(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeToRepoRel(repoRoot, filePath) {
  if (!filePath) return null;
  const norm = filePath.replace(/\\/g, '/');
  const rootNorm = repoRoot.replace(/\\/g, '/').replace(/\/+$/, '');

  if (norm.startsWith(rootNorm + '/')) return norm.slice(rootNorm.length + 1);

  // Heuristic: keep from '/src/' if present
  const srcIdx = norm.lastIndexOf('/src/');
  if (srcIdx >= 0) return norm.slice(srcIdx + 1); // drop leading slash

  // Heuristic: keep from '/tests/' if present
  const testsIdx = norm.lastIndexOf('/tests/');
  if (testsIdx >= 0) return norm.slice(testsIdx + 1);

  // Fallback: filename only
  return path.posix.basename(norm);
}

function parseLcov(lcovText, repoRoot) {
  const fileLineHits = new Map(); // relFile -> Map(lineNo -> hits)
  let currentFile = null;
  let currentLines = null;

  const lines = lcovText.split(/\r?\n/);
  for (const raw of lines) {
    if (raw.startsWith('SF:')) {
      const sf = raw.slice(3).trim();
      const rel = normalizeToRepoRel(repoRoot, sf);
      currentFile = rel;
      if (!fileLineHits.has(rel)) fileLineHits.set(rel, new Map());
      currentLines = fileLineHits.get(rel);
      continue;
    }
    if (raw.startsWith('DA:') && currentFile && currentLines) {
      const rest = raw.slice(3);
      const [lineStr, hitsStr] = rest.split(',');
      const lineNo = Number(lineStr);
      const hits = Number(hitsStr);
      if (Number.isFinite(lineNo) && Number.isFinite(hits)) currentLines.set(lineNo, hits);
      continue;
    }
    if (raw === 'end_of_record') {
      currentFile = null;
      currentLines = null;
    }
  }

  return fileLineHits;
}

function parseJestFailureLocations(jestJson, repoRoot) {
  const fileToLines = new Map(); // relFile -> Set(lineNo)
  if (!jestJson || typeof jestJson !== 'object') return fileToLines;

  const failureTexts = [];
  const testResults = Array.isArray(jestJson.testResults) ? jestJson.testResults : [];
  for (const tr of testResults) {
    const assertionResults = Array.isArray(tr.assertionResults) ? tr.assertionResults : [];
    for (const ar of assertionResults) {
      const msgs = Array.isArray(ar.failureMessages) ? ar.failureMessages : [];
      for (const m of msgs) failureTexts.push(String(m));
    }
    if (tr.message) failureTexts.push(String(tr.message));
  }

  const patterns = [
    /\(([^()]+):(\d+):(\d+)\)/g, // (path:line:col)
    /at [^(]*\s+([^:\s]+):(\d+):(\d+)/g, // at ... path:line:col
  ];

  for (const text of failureTexts) {
    for (const re of patterns) {
      let m;
      while ((m = re.exec(text)) !== null) {
        const absOrRel = m[1];
        const lineNo = Number(m[2]);
        if (!Number.isFinite(lineNo)) continue;
        const rel = normalizeToRepoRel(repoRoot, absOrRel);
        if (!rel) continue;
        if (!fileToLines.has(rel)) fileToLines.set(rel, new Set());
        fileToLines.get(rel).add(lineNo);
      }
    }
  }

  return fileToLines;
}

function readCoverageSummary(summaryPath) {
  const raw = JSON.parse(readText(summaryPath));
  const total = raw.total || {};

  const metrics = {
    lines: total.lines || {},
    branches: total.branches || {},
    functions: total.functions || {},
    statements: total.statements || {},
  };

  // Per-file is keyed by path in Jest output; keep as-is
  const perFile = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'total') continue;
    perFile[k] = v;
  }

  return { metrics, perFile, raw };
}

function pctStr(n) {
  if (!Number.isFinite(n)) return '0.00';
  return n.toFixed(2);
}

function buildHtmlCodePaintingSummary({ title, metrics, threshold, files, maxFiles = 5, maxLinesPerFile = 50 }) {
  const linePct = asNumber(metrics.lines.pct, 0);
  const gate = linePct >= threshold ? 'PASS' : 'FAIL';
  const gateColor = gate === 'PASS' ? '#28a745' : '#dc3545';
  
  const filesToShow = files.slice(0, maxFiles);
  const fileSections = filesToShow.map(f => {
    const lines = [];
    const totalLines = f.sourceLines.length;
    const showLines = Math.min(totalLines, maxLinesPerFile);
    const hasMore = totalLines > maxLinesPerFile;
    
    for (let i = 0; i < showLines; i++) {
      const lineNo = i + 1;
      const line = f.sourceLines[i] || ' ';
      const hits = f.lineHits?.get(lineNo) ?? 0;
      const isCovered = hits > 0;
      const isFail = isCovered && f.failingLines?.has(lineNo);
      
      let bgColor = 'transparent';
      let indicator = '❌';
      if (isFail) {
        bgColor = 'rgba(243, 156, 18, 0.30)';
        indicator = '⚠️';
      } else if (isCovered) {
        bgColor = 'rgba(46, 204, 113, 0.25)';
        indicator = '✅';
      }
      
      const lineNum = String(lineNo).padStart(4, ' ');
      lines.push(
        `<div style="display: grid; grid-template-columns: 40px 60px 1fr; gap: 8px; padding: 2px 8px; background: ${bgColor}; font-family: ui-monospace, monospace; font-size: 12px;">` +
        `<span style="text-align: right; color: #666;">${indicator}</span>` +
        `<span style="text-align: right; color: #999;">${lineNum}</span>` +
        `<span>${escapeHtml(line)}</span>` +
        `</div>`
      );
    }
    
    const coverageBadge = Number.isFinite(f.fileCoveragePct)
      ? ` <span style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 12px; font-size: 11px;">${pctStr(f.fileCoveragePct)}%</span>`
      : '';
    const moreIndicator = hasMore ? ` <em style="color: #999;">(showing first ${maxLinesPerFile} of ${totalLines} lines)</em>` : '';
    
    return `
      <details style="margin: 12px 0; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px;">
        <summary style="cursor: pointer; font-weight: 600; padding: 4px;">📄 ${escapeHtml(f.relPath)}${coverageBadge}${moreIndicator}</summary>
        <div style="margin-top: 8px; border: 1px solid rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
          ${lines.join('\n')}
        </div>
      </details>
    `.trim();
  }).join('\n');
  
  const moreFilesNote = files.length > maxFiles
    ? `<p><em>... and ${files.length - maxFiles} more file(s). Download the HTML report artifact for full details.</em></p>`
    : '';
  
  return `
<h2>${escapeHtml(title)} — Coverage Summary</h2>

<p><strong>Quality Gate (lines ≥ ${threshold}%):</strong> <span style="color: ${gateColor}; font-weight: 600;">${gate}</span></p>

<table>
  <thead>
    <tr>
      <th>Metric</th>
      <th style="text-align: right;">Coverage</th>
      <th style="text-align: right;">Covered / Total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Lines</td>
      <td style="text-align: right;"><strong>${pctStr(asNumber(metrics.lines.pct, 0))}%</strong></td>
      <td style="text-align: right;">${metrics.lines.covered ?? 0} / ${metrics.lines.total ?? 0}</td>
    </tr>
    <tr>
      <td>Branches</td>
      <td style="text-align: right;"><strong>${pctStr(asNumber(metrics.branches.pct, 0))}%</strong></td>
      <td style="text-align: right;">${metrics.branches.covered ?? 0} / ${metrics.branches.total ?? 0}</td>
    </tr>
    <tr>
      <td>Functions</td>
      <td style="text-align: right;"><strong>${pctStr(asNumber(metrics.functions.pct, 0))}%</strong></td>
      <td style="text-align: right;">${metrics.functions.covered ?? 0} / ${metrics.functions.total ?? 0}</td>
    </tr>
    <tr>
      <td>Statements</td>
      <td style="text-align: right;"><strong>${pctStr(asNumber(metrics.statements.pct, 0))}%</strong></td>
      <td style="text-align: right;">${metrics.statements.covered ?? 0} / ${metrics.statements.total ?? 0}</td>
    </tr>
  </tbody>
</table>

<hr>

<h3>🎨 Code Painting</h3>

<p><strong>Legend:</strong></p>
<ul>
  <li>✅ Covered by tests (passing)</li>
  <li>⚠️ Covered by tests (failing - appears in Jest error stack traces)</li>
  <li>❌ Not covered by tests</li>
</ul>

${fileSections}

${moreFilesNote}

<p><em>💡 Expand the file sections above to view the code painting. For a full interactive HTML report, download the workflow artifact.</em></p>
`.trim();
}

function buildCodePaintingMarkdown({ files, maxFiles = 5, maxLinesPerFile = 50 }) {
  const sections = [];
  const filesToShow = files.slice(0, maxFiles);
  
  for (const f of filesToShow) {
    const lines = [];
    const totalLines = f.sourceLines.length;
    const showLines = Math.min(totalLines, maxLinesPerFile);
    const hasMore = totalLines > maxLinesPerFile;
    
    for (let i = 0; i < showLines; i++) {
      const lineNo = i + 1;
      const line = f.sourceLines[i];
      const hits = f.lineHits?.get(lineNo) ?? 0;
      const isCovered = hits > 0;
      const isFail = isCovered && f.failingLines?.has(lineNo);
      
      let indicator = '❌'; // uncovered
      if (isFail) {
        indicator = '⚠️'; // covered but failing
      } else if (isCovered) {
        indicator = '✅'; // covered and passing
      }
      
      const lineNum = String(lineNo).padStart(4, ' ');
      const displayLine = line || ' '; // handle empty lines
      lines.push(`${indicator} ${lineNum} | ${displayLine}`);
    }
    
    const coverageBadge = Number.isFinite(f.fileCoveragePct)
      ? ` — ${pctStr(f.fileCoveragePct)}% coverage`
      : '';
    const moreIndicator = hasMore ? ` _(showing first ${maxLinesPerFile} of ${totalLines} lines)_` : '';
    
    sections.push([
      `<details>`,
      `<summary><strong>📄 ${f.relPath}</strong>${coverageBadge}${moreIndicator}</summary>`,
      ``,
      `\`\`\``,
      ...lines,
      `\`\`\``,
      `</details>`,
      ``,
    ].join('\n'));
  }
  
  if (files.length > maxFiles) {
    sections.push(`_... and ${files.length - maxFiles} more file(s). Download the HTML report for full details._`);
  }
  
  return sections.join('\n');
}

function buildSummaryMarkdown({ title, metrics, threshold, files, includeCodePainting = true }) {
  const linePct = asNumber(metrics.lines.pct, 0);
  const gate = linePct >= threshold ? 'PASS' : 'FAIL';

  const parts = [
    `## ${title} — Coverage Summary`,
    '',
    `- **Quality Gate (lines ≥ ${threshold}%):** ${gate}`,
    '',
    '| Metric | Coverage | Covered / Total |',
    '|---|---:|---:|',
    `| Lines | ${pctStr(asNumber(metrics.lines.pct, 0))}% | ${metrics.lines.covered ?? 0} / ${metrics.lines.total ?? 0} |`,
    `| Branches | ${pctStr(asNumber(metrics.branches.pct, 0))}% | ${metrics.branches.covered ?? 0} / ${metrics.branches.total ?? 0} |`,
    `| Functions | ${pctStr(asNumber(metrics.functions.pct, 0))}% | ${metrics.functions.covered ?? 0} / ${metrics.functions.total ?? 0} |`,
    `| Statements | ${pctStr(asNumber(metrics.statements.pct, 0))}% | ${metrics.statements.covered ?? 0} / ${metrics.statements.total ?? 0} |`,
    '',
  ];
  
  if (includeCodePainting && files && files.length > 0) {
    parts.push(
      '---',
      '',
      '### 🎨 Code Painting',
      '',
      '**Legend:**',
      '- ✅ Covered by tests (passing)',
      '- ⚠️ Covered by tests (failing - appears in Jest error stack traces)',
      '- ❌ Not covered by tests',
      '',
      buildCodePaintingMarkdown({ files }),
      '',
      '_💡 Expand the file sections above to view the code painting. For a full interactive HTML report, download the workflow artifact._',
      '',
    );
  } else {
    parts.push('_Download the "code painting" HTML report from the workflow artifacts to view per-line highlights._', '');
  }
  
  return parts.join('\n');
}

function buildHtmlReport({ title, files }) {
  // files: [{ relPath, sourceLines, lineHits: Map, failingLines: Set, fileCoveragePct }]
  const fileOptions = files
    .map(
      (f, idx) =>
        `<option value="${escapeHtml(f.relPath)}"${idx === 0 ? ' selected' : ''}>${escapeHtml(
          f.relPath
        )}${Number.isFinite(f.fileCoveragePct) ? ` — ${pctStr(f.fileCoveragePct)}%` : ''}</option>`
    )
    .join('');

  const fileSections = files
    .map((f, idx) => {
      const rows = f.sourceLines
        .map((line, i) => {
          const lineNo = i + 1;
          const hits = f.lineHits?.get(lineNo) ?? 0;
          const isCovered = hits > 0;
          const isFail = isCovered && f.failingLines?.has(lineNo);
          const cls = isFail ? 'covered-fail' : isCovered ? 'covered-pass' : 'uncovered';
          const hitsBadge = isCovered ? `<span class="hits">hits:${hits}</span>` : '';
          return `
            <div class="row ${cls}">
              <span class="ln">${lineNo}</span>
              <span class="code">${escapeHtml(line)}</span>
              ${hitsBadge}
            </div>
          `.trim();
        })
        .join('\n');

      return `
        <section class="file" data-file="${escapeHtml(f.relPath)}" style="display:${idx === 0 ? 'block' : 'none'}">
          <div class="fileHeader">
            <div class="filePath">${escapeHtml(f.relPath)}</div>
            <div class="fileMeta">
              ${Number.isFinite(f.fileCoveragePct) ? `<span class="pill">line coverage: ${pctStr(f.fileCoveragePct)}%</span>` : ''}
            </div>
          </div>
          <div class="codePane" role="region" aria-label="painted code">
            ${rows}
          </div>
        </section>
      `.trim();
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #0b1020;
      --panel: #111a33;
      --text: #e8eefc;
      --muted: #9fb0d0;
      --border: rgba(255,255,255,0.10);
      --green: rgba(46, 204, 113, 0.25);
      --orange: rgba(243, 156, 18, 0.30);
    }
    html, body { height: 100%; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
      background: var(--bg);
      color: var(--text);
    }
    .wrap { max-width: 1200px; margin: 0 auto; padding: 18px; }
    .topbar {
      display: flex; gap: 12px; align-items: center; justify-content: space-between;
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .title { font-weight: 700; letter-spacing: 0.2px; }
    .controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    select {
      background: var(--panel);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 8px 10px;
      min-width: min(700px, 80vw);
    }
    .legend { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; color: var(--muted); font-size: 13px; }
    .swatch { width: 10px; height: 10px; border-radius: 3px; display: inline-block; border: 1px solid var(--border); }
    .swatch.pass { background: var(--green); }
    .swatch.fail { background: var(--orange); }
    .swatch.none { background: transparent; }
    .fileHeader { display: flex; gap: 10px; align-items: baseline; justify-content: space-between; margin: 14px 2px 10px; }
    .filePath { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 13px; color: var(--text); }
    .pill { background: rgba(255,255,255,0.06); border: 1px solid var(--border); padding: 4px 8px; border-radius: 999px; color: var(--muted); font-size: 12px; }
    .codePane {
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      background: rgba(255,255,255,0.02);
    }
    .row {
      display: grid;
      grid-template-columns: 64px 1fr auto;
      gap: 10px;
      padding: 2px 12px;
      align-items: start;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 12.5px;
      line-height: 1.6;
      border-top: 1px solid rgba(255,255,255,0.04);
    }
    .row:first-child { border-top: none; }
    .ln { color: rgba(232, 238, 252, 0.35); text-align: right; user-select: none; }
    .code { white-space: pre; overflow-wrap: anywhere; }
    .hits { color: rgba(232, 238, 252, 0.45); font-size: 11.5px; padding-left: 10px; user-select: none; }
    .covered-pass { background: var(--green); }
    .covered-fail { background: var(--orange); }
    .uncovered { background: transparent; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
      <div class="title">${escapeHtml(title)}</div>
      <div class="controls">
        <label for="fileSel" class="legend" style="margin-right:6px;">File</label>
        <select id="fileSel" aria-label="file selector">${fileOptions}</select>
      </div>
    </div>
    <div class="legend" style="margin:10px 2px 0;">
      <span><span class="swatch pass"></span> covered + passing</span>
      <span><span class="swatch fail"></span> covered + failing (from Jest stack traces)</span>
      <span><span class="swatch none"></span> not covered</span>
    </div>
    ${fileSections}
  </div>
  <script>
    (function () {
      const sel = document.getElementById('fileSel');
      function show(file) {
        document.querySelectorAll('section.file').forEach(s => {
          s.style.display = (s.getAttribute('data-file') === file) ? 'block' : 'none';
        });
      }
      sel.addEventListener('change', () => show(sel.value));
      show(sel.value);
    })();
  </script>
</body>
</html>`;
}

async function githubApi({ token, url, method, body }) {
  const res = await fetch(url, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GitHub API error ${res.status} ${res.statusText}: ${t}`);
  }
  return res.status === 204 ? null : res.json();
}

async function upsertPrComment({ token, owner, repo, prNumber, strategy, marker, body }) {
  const base = process.env.GITHUB_API_URL || 'https://api.github.com';
  const listUrl = `${base}/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100`;
  const comments = await githubApi({ token, url: listUrl, method: 'GET' });
  const existing = comments.find((c) => typeof c.body === 'string' && c.body.includes(marker));

  if (strategy === 'ADD' || !existing) {
    const createUrl = `${base}/repos/${owner}/${repo}/issues/${prNumber}/comments`;
    await githubApi({ token, url: createUrl, method: 'POST', body: { body } });
    return;
  }

  if (strategy === 'REMOVE') {
    const delUrl = `${base}/repos/${owner}/${repo}/issues/comments/${existing.id}`;
    await githubApi({ token, url: delUrl, method: 'DELETE' });
    const createUrl = `${base}/repos/${owner}/${repo}/issues/${prNumber}/comments`;
    await githubApi({ token, url: createUrl, method: 'POST', body: { body } });
    return;
  }

  // UPDATE
  const updUrl = `${base}/repos/${owner}/${repo}/issues/comments/${existing.id}`;
  await githubApi({ token, url: updUrl, method: 'PATCH', body: { body } });
}

async function main() {
  const repoRoot = process.env.GITHUB_WORKSPACE || process.cwd();

  const title = getInput('title', 'Code Painting');
  const lcovPath = path.resolve(repoRoot, getInput('lcov-path', 'coverage/lcov.info'));
  const summaryPath = path.resolve(repoRoot, getInput('coverage-summary-json', 'coverage/coverage-summary.json'));
  const jestResultsPath = path.resolve(repoRoot, getInput('jest-results-json', 'jest-results.json'));
  const outDir = path.resolve(repoRoot, getInput('output-dir', 'code-painting-report'));
  const prNumber = getInput('pr-number', '');
  const token = getInput('github-token', '');
  const commentsStrategy = getInput('comments-strategy', 'UPDATE').toUpperCase();
  const threshold = asNumber(getInput('coverage-threshold', '80'), 80);

  if (!exists(summaryPath)) throw new Error(`Missing coverage summary JSON: ${summaryPath}`);
  if (!exists(lcovPath)) throw new Error(`Missing LCOV file: ${lcovPath}`);

  const { metrics, perFile } = readCoverageSummary(summaryPath);
  const lcov = parseLcov(readText(lcovPath), repoRoot);

  let jestJson = null;
  if (exists(jestResultsPath)) {
    try {
      jestJson = JSON.parse(readText(jestResultsPath));
    } catch {
      // ignore
    }
  }
  const failingLocs = parseJestFailureLocations(jestJson, repoRoot);

  // Build per-file report list from LCOV (best source for line-level mapping)
  const files = [];
  for (const [relPath, lineHits] of [...lcov.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const absPath = path.resolve(repoRoot, relPath);
    if (!exists(absPath)) continue;
    const src = readText(absPath);
    const sourceLines = src.split(/\r?\n/);

    const jestKey = Object.keys(perFile).find((k) => normalizeToRepoRel(repoRoot, k) === relPath);
    const fileCoveragePct = jestKey ? asNumber(perFile[jestKey]?.lines?.pct, NaN) : NaN;

    files.push({
      relPath,
      absPath,
      sourceLines,
      lineHits,
      failingLines: failingLocs.get(relPath) || new Set(),
      fileCoveragePct,
    });
  }

  // Write outputs
  fs.mkdirSync(outDir, { recursive: true });
  const indexHtmlPath = path.join(outDir, 'index.html');
  writeText(indexHtmlPath, buildHtmlReport({ title, files }));

  const reportJson = {
    title,
    generatedAt: new Date().toISOString(),
    inputs: {
      lcovPath: path.relative(repoRoot, lcovPath),
      coverageSummaryJson: path.relative(repoRoot, summaryPath),
      jestResultsJson: exists(jestResultsPath) ? path.relative(repoRoot, jestResultsPath) : null,
    },
    qualityGate: {
      metric: 'lines',
      threshold,
      value: asNumber(metrics.lines.pct, 0),
      status: asNumber(metrics.lines.pct, 0) >= threshold ? 'PASS' : 'FAIL',
    },
    totals: metrics,
    files: files.map((f) => ({
      path: f.relPath,
      lineCoveragePct: Number.isFinite(f.fileCoveragePct) ? f.fileCoveragePct : null,
      failingLineCount: f.failingLines ? f.failingLines.size : 0,
      coveredLineCount: [...f.lineHits.values()].filter((h) => h > 0).length,
      instrumentedLineCount: f.lineHits.size,
    })),
  };
  writeText(path.join(outDir, 'report.json'), JSON.stringify(reportJson, null, 2));

  const summaryMd = buildSummaryMarkdown({ title, metrics, threshold, files });
  writeText(path.join(outDir, 'summary.md'), summaryMd);

  // GitHub step summary (supports HTML)
  const stepSummary = process.env.GITHUB_STEP_SUMMARY;
  if (stepSummary) {
    const htmlSummary = buildHtmlCodePaintingSummary({ title, metrics, threshold, files });
    fs.appendFileSync(stepSummary, htmlSummary);
  }

  // PR comment (optional)
  if (prNumber && token && process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    const marker = '<!-- code-painting-action -->';
    const commentBody = `${marker}\n${summaryMd}`;
    await upsertPrComment({
      token,
      owner,
      repo,
      prNumber: Number(prNumber),
      strategy: commentsStrategy,
      marker,
      body: commentBody,
    });
  }

  // Action outputs
  const outFile = process.env.GITHUB_OUTPUT;
  const gate = asNumber(metrics.lines.pct, 0) >= threshold ? 'PASS' : 'FAIL';
  const outputs = [
    `report-dir=${outDir}`,
    `index-html=${indexHtmlPath}`,
    `line-coverage=${pctStr(asNumber(metrics.lines.pct, 0))}`,
    `branch-coverage=${pctStr(asNumber(metrics.branches.pct, 0))}`,
    `function-coverage=${pctStr(asNumber(metrics.functions.pct, 0))}`,
    `statement-coverage=${pctStr(asNumber(metrics.statements.pct, 0))}`,
    `quality-gate=${gate}`,
  ].join('\n');
  if (outFile) fs.appendFileSync(outFile, outputs + '\n');

  console.log(`Wrote report: ${indexHtmlPath}`);
  console.log(`Quality gate (lines >= ${threshold}%): ${gate}`);
}

main().catch((err) => {
  console.error(err?.stack || err);
  process.exitCode = 1;
});

