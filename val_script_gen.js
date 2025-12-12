const fs = require('fs');
const path = require('path');

const dictPath = path.join(__dirname, 'src/constants/dictionary.ts');
let content = fs.readFileSync(dictPath, 'utf8');

// Remove TypeScript specific syntax to make it valid JS
content = content.replace(/export type Dictionary = typeof dictionary.pt;/, '');
content = content.replace(/export const dictionary =/, 'const dictionary =');
// Remove type annotations if any (though looking at the file, it seems largely clean of inline types inside the object)
// The file has just the object.

// We will append a check script
const checkScript = `
${content}

function compareObjects(obj1, obj2, path = '') {
    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();

    const allKeys = new Set([...keys1, ...keys2]);
    let errors = [];

    for (const key of allKeys) {
        const p = path ? \`\${path}.\${key}\` : key;
        if (!obj1.hasOwnProperty(key)) {
            errors.push(\`Missing key in PT: \${p}\`);
            continue;
        }
        if (!obj2.hasOwnProperty(key)) {
            errors.push(\`Missing key in EN: \${p}\`);
            continue;
        }

        const val1 = obj1[key];
        const val2 = obj2[key];

        if (typeof val1 !== typeof val2) {
            errors.push(\`Type mismatch at \${p}: \${typeof val1} vs \${typeof val2}\`);
        } else if (typeof val1 === 'object' && val1 !== null && val2 !== null) {
            // Arrays
            if (Array.isArray(val1) && Array.isArray(val2)) {
                if (val1.length !== val2.length) {
                    // console.warn(\`Array length mismatch at \${p}: \${val1.length} vs \${val2.length}. This might be intended but worth checking.\`);
                }
                // Check assumption: arrays contain objects of same shape
                if (val1.length > 0 && val2.length > 0 && typeof val1[0] === 'object') {
                     // Check if all items in array2 match structure of item 0 in array1 (or corresponding item)
                     // Let's compare corresponding items if they exist
                     for (let i = 0; i < Math.max(val1.length, val2.length); i++) {
                        if (val1[i] && val2[i]) {
                             const subErrors = compareObjects(val1[i], val2[i], \`\${p}[\${i}]\`);
                             errors = errors.concat(subErrors);
                        }
                     }
                }
            } else if (!Array.isArray(val1) && !Array.isArray(val2)) {
                 const subErrors = compareObjects(val1, val2, p);
                 errors = errors.concat(subErrors);
            } else {
                 errors.push(\`Array/Object mismatch at \${p}\`);
            }
        }
    }
    return errors;
}

const errors = compareObjects(dictionary.pt, dictionary.en);
if (errors.length > 0) {
    console.error('Validation FAILED with ' + errors.length + ' errors:');
    errors.forEach(e => console.error(e));
    process.exit(1);
} else {
    console.log('Validation SUCCEEDED. English dictionary matches Portuguese structure.');
    // Check coverage specifically for "cover" in services just to be double sure
    const ptServices = dictionary.pt.services.list;
    const enServices = dictionary.en.services.list;
    
    ptServices.forEach((s, i) => {
        if (!s.cover) console.error(\`PT Service \${i} missing cover\`);
    });
    enServices.forEach((s, i) => {
        if (!s.cover) console.error(\`EN Service \${i} missing cover\`);
    });
}
`;

fs.writeFileSync(path.join(__dirname, 'temp_validate.js'), checkScript);
