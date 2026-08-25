const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const faDir = path.join(srcDir, 'node_modules', '@fortawesome', 'fontawesome-free', 'svgs');

function replaceIcons(content) {
  // Regex to match <i class="..."></i> or <i class="..." aria-hidden="true"></i>
  // Capture the class attribute value
  const regex = /<i\s+class="([^"]+)"(?:[^>]*)><\/i>/g;
  
  return content.replace(regex, (match, classStr) => {
    // Determine style and icon name
    const classes = classStr.split(' ');
    let style = 'solid'; // default fas
    if (classes.includes('far')) style = 'regular';
    if (classes.includes('fab')) style = 'brands';
    
    const iconClass = classes.find(c => c.startsWith('fa-') && c !== 'fa-spin' && c !== 'fa-bars' && c !== 'fa-times' && c !== 'fa-ul' && c !== 'fa-li' && !['fas', 'far', 'fab', 'fa'].includes(c));
    if (!iconClass) {
        // We have to explicitly handle fa-bars and fa-times because our script.js toggles them, but wait, the regex will catch them if we exclude them here.
        // Let's just find the first fa- class that is an icon name.
    }
    const iconNameRegex = /(?:fa-)(?!spin|ul|li|fw|sm|lg|2x|3x|4x|5x|6x)([a-z0-9-]+)/;
    const matchName = classStr.match(iconNameRegex);
    if (!matchName) return match; // skip if no icon name found

    let iconName = matchName[1];
    
    // Read the SVG
    const svgPath = path.join(faDir, style, `${iconName}.svg`);
    if (!fs.existsSync(svgPath)) {
      console.warn(`Warning: SVG not found for ${iconName} at ${svgPath}`);
      return match;
    }

    let svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Extract the classes that are NOT fa related to apply them to the SVG
    const customClasses = classes.filter(c => !c.startsWith('fa') && !['fas', 'far', 'fab'].includes(c)).join(' ');
    const spinClass = classes.includes('fa-spin') ? ' fa-spin' : '';
    
    // We can just add the original class string to the SVG so JS styling doesn't break
    // We will add class="${classStr}" to the SVG and remove width/height attributes if any?
    // Actually, FontAwesome SVGs have viewBox. We can just inject class="${classStr}" into the <svg> tag.
    
    svgContent = svgContent.replace('<svg ', `<svg class="${classStr}" aria-hidden="true" width="1em" height="1em" `);
    // add fill="currentColor" if not present
    if (!svgContent.includes('fill=')) {
        svgContent = svgContent.replace('<path ', '<path fill="currentColor" ');
    }
    
    return svgContent;
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = replaceIcons(content);
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  } else {
    console.log(`No changes for ${path.basename(filePath)}`);
  }
}

processFile(path.join(srcDir, 'index.html'));
processFile(path.join(srcDir, 'script.js'));
