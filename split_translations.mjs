import fs from 'fs';

const code = fs.readFileSync('./src/utils/translations.js', 'utf8');

// remove everything after the translations object
const parts = code.split('export const getTranslation');
let cleanCode = parts[0];

// replace the export
cleanCode = cleanCode.replace('export const translations =', 'global.translations =');

eval(cleanCode);

const localesDir = './src/locales';
if (!fs.existsSync(localesDir)) fs.mkdirSync(localesDir);

for (const [lang, content] of Object.entries(global.translations)) {
    const fileContent = `export default ${JSON.stringify(content, null, 2)};`;
    fs.writeFileSync(`${localesDir}/${lang}.js`, fileContent);
    console.log(`Wrote ${lang}.js with ${Object.keys(content).length} keys`);
}
