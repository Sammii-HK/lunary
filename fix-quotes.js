const fs = require('fs');

const files = [
  'src/lib/pdf/content-generators/astrology-content.ts',
  'src/lib/pdf/content-generators/seasonal-content.ts',
  'src/lib/pdf/content-generators/tarot-content.ts',
  'src/lib/pdf/content-generators/birthchart-content.ts',
  'src/lib/pdf/content-generators/retrograde-content.ts',
  'src/lib/pdf/content-generators/crystal-content.ts',
  'src/lib/pdf/content-generators/spell-content.ts',
];

files.forEach((file) => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    // Replace RIGHT SINGLE QUOTATION MARK (U+2019) - commonly used as apostrophe
    // With escaped straight apostrophe when inside single-quoted strings
    // We do this by changing single-quoted strings to double-quoted strings
    // then the curly apostrophe just becomes a regular char

    // Actually, simpler approach: Just replace all U+2019 with regular apostrophe
    // and if that breaks a string (because it's inside single quotes),
    // escape it

    // Step 1: Replace curly quotes with straight equivalents
    content = content.replace(/\u2018/g, "'"); // LEFT SINGLE
    content = content.replace(/\u2019/g, "'"); // RIGHT SINGLE (apostrophe)
    content = content.replace(/\u201C/g, '"'); // LEFT DOUBLE
    content = content.replace(/\u201D/g, '"'); // RIGHT DOUBLE

    // Step 2: Now we need to escape apostrophes that are inside single-quoted strings
    // This is the tricky part - we need to find patterns like 'word's word'
    // and escape the middle apostrophe

    // Match single-quoted strings that contain an unescaped apostrophe
    // Pattern: find 'text with apostrophe' where apostrophe is in the middle
    let prevContent;
    do {
      prevContent = content;
      // Match: 'text' where text contains an unescaped apostrophe between letters
      content = content.replace(
        /'([^']*?)(\w)'(\w)([^']*?)'/g,
        "'$1$2\\'$3$4'",
      );
    } while (content !== prevContent);

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed: ' + file);
    } else {
      console.log('No changes needed: ' + file);
    }
  } catch (e) {
    console.error('Error with ' + file + ': ' + e.message);
  }
});

console.log('Done!');
