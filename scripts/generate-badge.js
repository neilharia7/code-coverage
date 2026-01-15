#!/usr/bin/env node
/**
 * Coverage Badge Generator
 * 
 * Generates SVG badges from coverage reports.
 * Can be run locally or in CI to create static badge files.
 * 
 * Usage:
 *   node generate-badge.js [coverage-summary.json] [output-dir]
 */

const fs = require('fs');
const path = require('path');

// Default paths
const DEFAULT_COVERAGE_FILE = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), 'coverage-badges');

/**
 * Get color based on coverage percentage
 */
function getColor(percentage) {
  if (percentage >= 80) return { name: 'brightgreen', hex: '#4c1' };
  if (percentage >= 70) return { name: 'green', hex: '#97CA00' };
  if (percentage >= 60) return { name: 'yellow', hex: '#dfb317' };
  if (percentage >= 40) return { name: 'orange', hex: '#fe7d37' };
  return { name: 'red', hex: '#e05d44' };
}

/**
 * Generate SVG badge
 */
function generateSvgBadge(label, value, color) {
  const labelWidth = Math.max(label.length * 6.5 + 10, 50);
  const valueWidth = Math.max(value.length * 7 + 10, 40);
  const totalWidth = labelWidth + valueWidth;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
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
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${labelWidth * 5}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(labelWidth - 10) * 10}">${label}</text>
    <text x="${labelWidth * 5}" y="140" transform="scale(.1)" fill="#fff" textLength="${(labelWidth - 10) * 10}">${label}</text>
    <text aria-hidden="true" x="${labelWidth * 10 + valueWidth * 5}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(valueWidth - 10) * 10}">${value}</text>
    <text x="${labelWidth * 10 + valueWidth * 5}" y="140" transform="scale(.1)" fill="#fff" textLength="${(valueWidth - 10) * 10}">${value}</text>
  </g>
</svg>`;
}

/**
 * Generate flat badge style
 */
function generateFlatBadge(label, value, color) {
  const labelWidth = Math.max(label.length * 6 + 10, 50);
  const valueWidth = Math.max(value.length * 6.5 + 10, 40);
  const totalWidth = labelWidth + valueWidth;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="18" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <rect width="${labelWidth}" height="18" fill="#24292f"/>
  <rect x="${labelWidth}" width="${valueWidth}" height="18" fill="${color}"/>
  <g fill="#fff" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-weight="600" font-size="11">
    <text x="${labelWidth / 2}" y="13">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="13">${value}</text>
  </g>
</svg>`;
}

/**
 * Main function
 */
function main() {
  const coverageFile = process.argv[2] || DEFAULT_COVERAGE_FILE;
  const outputDir = process.argv[3] || DEFAULT_OUTPUT_DIR;
  
  // Check if coverage file exists
  if (!fs.existsSync(coverageFile)) {
    console.error(`❌ Coverage file not found: ${coverageFile}`);
    console.log('Run "npm run test:coverage" first to generate coverage data.');
    process.exit(1);
  }
  
  // Read coverage data
  let coverageData;
  try {
    coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
  } catch (e) {
    console.error(`❌ Failed to parse coverage file: ${e.message}`);
    process.exit(1);
  }
  
  const total = coverageData.total;
  if (!total) {
    console.error('❌ No total coverage data found');
    process.exit(1);
  }
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate badges for each metric
  const metrics = [
    { name: 'lines', label: 'lines' },
    { name: 'branches', label: 'branches' },
    { name: 'functions', label: 'functions' },
    { name: 'statements', label: 'statements' }
  ];
  
  console.log('📊 Generating coverage badges...\n');
  
  metrics.forEach(metric => {
    const data = total[metric.name];
    if (!data) return;
    
    const percentage = data.pct;
    const color = getColor(percentage);
    const value = `${percentage.toFixed(1)}%`;
    
    // Generate standard badge
    const svgContent = generateSvgBadge(metric.label, value, color.hex);
    const svgPath = path.join(outputDir, `${metric.name}.svg`);
    fs.writeFileSync(svgPath, svgContent);
    
    // Generate flat badge
    const flatSvgContent = generateFlatBadge(metric.label, value, color.hex);
    const flatSvgPath = path.join(outputDir, `${metric.name}-flat.svg`);
    fs.writeFileSync(flatSvgPath, flatSvgContent);
    
    console.log(`  ${color.name === 'brightgreen' || color.name === 'green' ? '✅' : color.name === 'yellow' ? '⚠️' : '❌'} ${metric.label}: ${value} → ${svgPath}`);
  });
  
  // Generate combined coverage badge (using lines as primary metric)
  const lineCoverage = total.lines.pct;
  const lineColor = getColor(lineCoverage);
  const combinedBadge = generateSvgBadge('coverage', `${lineCoverage.toFixed(1)}%`, lineColor.hex);
  fs.writeFileSync(path.join(outputDir, 'coverage.svg'), combinedBadge);
  
  // Generate shields.io compatible JSON endpoint
  const shieldsJson = {
    schemaVersion: 1,
    label: 'coverage',
    message: `${lineCoverage.toFixed(1)}%`,
    color: lineColor.name,
    namedLogo: 'jest'
  };
  fs.writeFileSync(path.join(outputDir, 'coverage.json'), JSON.stringify(shieldsJson, null, 2));
  
  // Generate detailed report
  const report = {
    timestamp: new Date().toISOString(),
    coverage: {
      lines: {
        percentage: total.lines.pct,
        covered: total.lines.covered,
        total: total.lines.total,
        missed: total.lines.total - total.lines.covered
      },
      branches: {
        percentage: total.branches.pct,
        covered: total.branches.covered,
        total: total.branches.total
      },
      functions: {
        percentage: total.functions.pct,
        covered: total.functions.covered,
        total: total.functions.total
      },
      statements: {
        percentage: total.statements.pct,
        covered: total.statements.covered,
        total: total.statements.total
      }
    },
    status: lineCoverage >= 80 ? 'passing' : lineCoverage >= 60 ? 'warning' : 'failing',
    threshold: 80
  };
  fs.writeFileSync(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
  
  console.log(`\n✅ Badges generated in: ${outputDir}`);
  console.log('\n📝 Files created:');
  console.log('   - coverage.svg (main badge)');
  console.log('   - coverage.json (shields.io endpoint)');
  console.log('   - report.json (detailed report)');
  console.log('   - lines.svg, branches.svg, functions.svg, statements.svg');
  
  console.log('\n🔗 Usage in README:');
  console.log('   ![Coverage](./coverage-badges/coverage.svg)');
  console.log('   or with local server:');
  console.log('   ![Coverage](http://localhost:3000/badge/owner/repo)');
  
  // Exit with error if coverage is below threshold
  if (lineCoverage < 80) {
    console.log(`\n⚠️  Warning: Coverage (${lineCoverage.toFixed(1)}%) is below 80% threshold`);
  }
}

main();
