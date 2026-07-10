import * as fs from 'fs';
import * as path from 'path';

function runDocsVerification() {
  console.log('=== Starting PDF Engine Documentation System Verification ===');

  const rootDir = path.resolve(__dirname, '..');
  const docsDir = path.join(rootDir, 'docs');

  // List of all expected documentation files
  const expectedFiles = [
    'README.md',
    'ROADMAP.md',
    'CHANGELOG.md',
    'ARCHITECTURE.md',
    'FOLDER_STRUCTURE.md',
    'phases/phase-4.md',
    'phases/phase-4.1.md',
    'phases/phase-4.2.md',
    'phases/phase-4.3.md',
    'phases/phase-4.4.md',
    'phases/phase-5.0.md',
    'phases/phase-5.1.md',
    'modules/parser.md',
    'modules/object-registry.md',
    'modules/render-engine.md',
    'modules/scene-graph.md',
    'modules/selection-engine.md',
    'modules/text-engine.md',
    'modules/writer.md',
    'modules/mutation-engine.md',
    'diagrams/parser-flow.md',
    'diagrams/render-flow.md',
    'diagrams/object-lifecycle.md',
    'diagrams/save-engine.md',
    'diagrams/text-layout.md',
    'api/interfaces.md',
    'api/classes.md',
    'api/events.md',
    'api/public-api.md',
    'decisions/ADR-001.md',
    'decisions/ADR-002.md',
    'decisions/ADR-003.md'
  ];

  try {
    // 1. Verify docs directory exists
    if (!fs.existsSync(docsDir)) {
      throw new Error(`Documentation directory does not exist at: ${docsDir}`);
    }
    console.log(`✅ Verified docs/ root directory exists.`);

    // 2. Scan and verify each file
    let missingCount = 0;
    expectedFiles.forEach((relPath) => {
      const fullPath = path.join(docsDir, relPath);
      if (!fs.existsSync(fullPath)) {
        console.error(`  ❌ Missing file: docs/${relPath}`);
        missingCount++;
        return;
      }
      
      const stats = fs.statSync(fullPath);
      if (stats.size === 0) {
        console.error(`  ❌ Empty file: docs/${relPath}`);
        missingCount++;
        return;
      }

      console.log(`  - Verified docs/${relPath} (${stats.size} bytes)`);
    });

    if (missingCount > 0) {
      throw new Error(`Verification failed: ${missingCount} documentation files are missing or empty.`);
    }

    console.log('\n✅ ALL DOCUMENTATION SYSTEM VERIFICATION ASSERTIONS PASSED! All SDK reference assets are generated.');

  } catch (err) {
    console.error('❌ Verification failed with error:', err);
    process.exit(1);
  }
}

runDocsVerification();
