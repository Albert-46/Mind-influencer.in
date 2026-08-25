const { PurgeCSS } = require('purgecss');
const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const cssPath = path.join(srcDir, 'styles.css');

async function runPurge() {
  console.log('Running PurgeCSS...');
  const purgeCSSResults = await new PurgeCSS().purge({
    content: ['index.html', 'script.js'],
    css: ['styles.css'],
    safelist: ['active', 'scrolled', 'error', 'success', 'pending', 'near-limit', 'at-limit', 'fa-bars', 'fa-times']
  });

  console.log('PurgeCSS Results Length:', purgeCSSResults.length);
  if (purgeCSSResults.length > 0) {
    const cleanedCSS = purgeCSSResults[0].css;
    console.log('Original size (bytes):', fs.statSync(cssPath).size);
    console.log('Purged size (bytes):', Buffer.byteLength(cleanedCSS, 'utf8'));

    fs.writeFileSync(cssPath, cleanedCSS, 'utf8');
    console.log('Successfully saved optimized styles.css!');
  } else {
    console.error('PurgeCSS returned no results', purgeCSSResults);
  }
}

runPurge().catch(console.error);
