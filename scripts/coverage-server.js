#!/usr/bin/env node
/**
 * Self-Hosted Coverage Server
 * 
 * A lightweight HTTP server to serve coverage reports locally.
 * This replaces cloud-based coverage services like Codecov or Coveralls.
 * 
 * Features:
 * - Serves HTML coverage reports
 * - Provides JSON API for coverage data
 * - Generates dynamic SVG badges
 * - Supports multiple projects
 * - Maintains coverage history
 * 
 * Usage:
 *   node coverage-server.js [port]
 *   PORT=8080 node coverage-server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const PORT = process.env.COVERAGE_PORT || process.argv[2] || 3000;
const COVERAGE_BASE_DIR = process.env.COVERAGE_DIR || path.join(process.env.HOME, 'coverage-reports');

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain'
};

/**
 * Generate an SVG badge for coverage percentage
 */
function generateBadge(label, value, color) {
  const labelWidth = label.length * 7 + 10;
  const valueWidth = value.length * 7 + 10;
  const totalWidth = labelWidth + valueWidth;
  
  const colorMap = {
    brightgreen: '#4c1',
    green: '#97CA00',
    yellow: '#dfb317',
    orange: '#fe7d37',
    red: '#e05d44',
    blue: '#007ec6',
    grey: '#555'
  };
  
  const badgeColor = colorMap[color] || colorMap.grey;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="20" role="img">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${badgeColor}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${labelWidth * 5}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">${label}</text>
    <text x="${labelWidth * 5}" y="140" transform="scale(.1)" fill="#fff">${label}</text>
    <text aria-hidden="true" x="${labelWidth * 10 + valueWidth * 5}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">${value}</text>
    <text x="${labelWidth * 10 + valueWidth * 5}" y="140" transform="scale(.1)" fill="#fff">${value}</text>
  </g>
</svg>`;
}

/**
 * Get coverage color based on percentage
 */
function getCoverageColor(percentage) {
  if (percentage >= 80) return 'brightgreen';
  if (percentage >= 60) return 'yellow';
  if (percentage >= 40) return 'orange';
  return 'red';
}

/**
 * List all projects with coverage reports
 */
function listProjects() {
  if (!fs.existsSync(COVERAGE_BASE_DIR)) {
    return [];
  }
  
  const projects = [];
  
  function scanDir(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(dir, entry.name);
        const latestPath = path.join(fullPath, 'latest');
        
        if (fs.existsSync(latestPath)) {
          const projectName = prefix ? `${prefix}/${entry.name}` : entry.name;
          const reportPath = path.join(latestPath, 'report.json');
          
          let report = null;
          if (fs.existsSync(reportPath)) {
            try {
              report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
            } catch (e) {
              console.error(`Failed to parse report for ${projectName}:`, e.message);
            }
          }
          
          projects.push({
            name: projectName,
            path: fullPath,
            report
          });
        } else if (entry.name !== 'latest' && entry.name !== 'history') {
          scanDir(fullPath, prefix ? `${prefix}/${entry.name}` : entry.name);
        }
      }
    }
  }
  
  scanDir(COVERAGE_BASE_DIR);
  return projects;
}

/**
 * Generate the dashboard HTML
 */
function generateDashboard() {
  const projects = listProjects();
  
  const projectRows = projects.map(p => {
    const coverage = p.report?.coverage?.lines?.percentage || 0;
    const color = getCoverageColor(coverage);
    const status = p.report?.status || 'unknown';
    const timestamp = p.report?.timestamp || 'N/A';
    const commit = p.report?.commit?.substring(0, 7) || 'N/A';
    
    return `
      <tr>
        <td><a href="/project/${encodeURIComponent(p.name)}">${p.name}</a></td>
        <td>
          <span class="coverage-badge ${color}">${coverage.toFixed(1)}%</span>
        </td>
        <td>${p.report?.coverage?.branches?.percentage?.toFixed(1) || 'N/A'}%</td>
        <td>${p.report?.coverage?.functions?.percentage?.toFixed(1) || 'N/A'}%</td>
        <td><span class="status status-${status}">${status}</span></td>
        <td><code>${commit}</code></td>
        <td>${timestamp}</td>
        <td>
          <a href="/badge/${encodeURIComponent(p.name)}" title="Badge SVG">🏷️</a>
          <a href="/api/${encodeURIComponent(p.name)}" title="JSON API">📊</a>
          <a href="/project/${encodeURIComponent(p.name)}/report" title="Full Report">📄</a>
        </td>
      </tr>
    `;
  }).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Self-Hosted Coverage Dashboard</title>
  <style>
    :root {
      --bg-primary: #0d1117;
      --bg-secondary: #161b22;
      --bg-tertiary: #21262d;
      --text-primary: #c9d1d9;
      --text-secondary: #8b949e;
      --border-color: #30363d;
      --accent: #58a6ff;
      --success: #3fb950;
      --warning: #d29922;
      --danger: #f85149;
    }
    
    * { box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      margin: 0;
      padding: 2rem;
      line-height: 1.5;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      font-weight: 600;
    }
    
    h1::before {
      content: '📊';
      font-size: 2rem;
    }
    
    .info-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 2rem;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      overflow: hidden;
    }
    
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    
    th {
      background: var(--bg-tertiary);
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    tr:hover td {
      background: var(--bg-tertiary);
    }
    
    a {
      color: var(--accent);
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    .coverage-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .coverage-badge.brightgreen { background: #238636; }
    .coverage-badge.green { background: #2ea043; }
    .coverage-badge.yellow { background: #9e6a03; }
    .coverage-badge.orange { background: #bd561d; }
    .coverage-badge.red { background: #cf222e; }
    
    .status {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-passing { background: #238636; }
    .status-warning { background: #9e6a03; }
    .status-failing { background: #cf222e; }
    .status-unknown { background: var(--bg-tertiary); }
    
    code {
      background: var(--bg-tertiary);
      padding: 0.125rem 0.25rem;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      font-size: 0.875rem;
    }
    
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
    }
    
    .empty-state h2 {
      margin-bottom: 1rem;
    }
    
    footer {
      margin-top: 2rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Self-Hosted Coverage Dashboard</h1>
    
    <div class="info-card">
      <strong>Coverage Reports Directory:</strong> <code>${COVERAGE_BASE_DIR}</code><br>
      <strong>Projects Found:</strong> ${projects.length}
    </div>
    
    ${projects.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Project</th>
          <th>Lines</th>
          <th>Branches</th>
          <th>Functions</th>
          <th>Status</th>
          <th>Commit</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${projectRows}
      </tbody>
    </table>
    ` : `
    <div class="empty-state">
      <h2>No Coverage Reports Found</h2>
      <p>Run your CI pipeline to generate coverage reports.</p>
      <p>Reports should be stored in: <code>${COVERAGE_BASE_DIR}/&lt;org&gt;/&lt;repo&gt;/latest/</code></p>
    </div>
    `}
    
    <footer>
      Self-Hosted Coverage Server • <a href="/api">API Documentation</a>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Generate API documentation page
 */
function generateApiDocs() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Coverage API Documentation</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 2rem auto; padding: 0 1rem; background: #0d1117; color: #c9d1d9; }
    h1 { color: #58a6ff; }
    h2 { color: #8b949e; border-bottom: 1px solid #30363d; padding-bottom: 0.5rem; }
    code { background: #21262d; padding: 0.25rem 0.5rem; border-radius: 4px; }
    pre { background: #161b22; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    .endpoint { margin-bottom: 2rem; }
  </style>
</head>
<body>
  <h1>📊 Coverage API</h1>
  
  <div class="endpoint">
    <h2>GET /</h2>
    <p>Dashboard with all projects and coverage status.</p>
  </div>
  
  <div class="endpoint">
    <h2>GET /api</h2>
    <p>List all projects with coverage data.</p>
    <pre>curl http://localhost:${PORT}/api</pre>
  </div>
  
  <div class="endpoint">
    <h2>GET /api/:project</h2>
    <p>Get coverage data for a specific project.</p>
    <pre>curl http://localhost:${PORT}/api/owner/repo</pre>
  </div>
  
  <div class="endpoint">
    <h2>GET /badge/:project</h2>
    <p>Get SVG badge for a project.</p>
    <pre>&lt;img src="http://localhost:${PORT}/badge/owner/repo" alt="Coverage" /&gt;</pre>
  </div>
  
  <div class="endpoint">
    <h2>GET /project/:project/report</h2>
    <p>View the full HTML coverage report.</p>
  </div>
  
  <div class="endpoint">
    <h2>GET /project/:project/history</h2>
    <p>View coverage history for a project.</p>
  </div>
  
  <p><a href="/">← Back to Dashboard</a></p>
</body>
</html>`;
}

/**
 * Handle HTTP requests
 */
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);
  
  // Dashboard
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(generateDashboard());
    return;
  }
  
  // API endpoints
  if (pathname === '/api' || pathname === '/api/') {
    const projects = listProjects();
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ projects }, null, 2));
    return;
  }
  
  // API documentation
  if (pathname === '/api-docs') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(generateApiDocs());
    return;
  }
  
  // Project API
  const apiMatch = pathname.match(/^\/api\/(.+)$/);
  if (apiMatch) {
    const projectName = apiMatch[1];
    const reportPath = path.join(COVERAGE_BASE_DIR, projectName, 'latest', 'report.json');
    
    if (fs.existsSync(reportPath)) {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(fs.readFileSync(reportPath));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Project not found' }));
    }
    return;
  }
  
  // Badge endpoint
  const badgeMatch = pathname.match(/^\/badge\/(.+)$/);
  if (badgeMatch) {
    const projectName = badgeMatch[1];
    const reportPath = path.join(COVERAGE_BASE_DIR, projectName, 'latest', 'report.json');
    
    let percentage = 0;
    let color = 'grey';
    
    if (fs.existsSync(reportPath)) {
      try {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
        percentage = report.coverage?.lines?.percentage || 0;
        color = getCoverageColor(percentage);
      } catch (e) {
        console.error('Failed to read report:', e);
      }
    }
    
    const svg = generateBadge('coverage', `${percentage.toFixed(1)}%`, color);
    res.writeHead(200, { 
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(svg);
    return;
  }
  
  // Project report
  const reportMatch = pathname.match(/^\/project\/(.+?)\/report(.*)$/);
  if (reportMatch) {
    const projectName = reportMatch[1];
    const subPath = reportMatch[2] || '/index.html';
    const filePath = path.join(COVERAGE_BASE_DIR, projectName, 'latest', subPath === '/' ? 'index.html' : subPath);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(fs.readFileSync(filePath));
    } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      // Redirect to index.html
      res.writeHead(302, { 'Location': pathname + '/index.html' });
      res.end();
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
    return;
  }
  
  // Project overview
  const projectMatch = pathname.match(/^\/project\/(.+)$/);
  if (projectMatch && !pathname.includes('/report')) {
    const projectName = projectMatch[1];
    const latestDir = path.join(COVERAGE_BASE_DIR, projectName, 'latest');
    
    if (fs.existsSync(latestDir)) {
      res.writeHead(302, { 'Location': `/project/${projectName}/report/` });
      res.end();
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Project not found');
    }
    return;
  }
  
  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  
  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

// Create and start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         🚀 Self-Hosted Coverage Server Started             ║
╠════════════════════════════════════════════════════════════╣
║  Dashboard:  http://localhost:${String(PORT).padEnd(5)}                       ║
║  API:        http://localhost:${String(PORT).padEnd(5)}/api                    ║
║  Reports:    ${COVERAGE_BASE_DIR.substring(0, 43).padEnd(43)} ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => process.exit(0));
});
