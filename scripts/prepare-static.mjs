import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('public',{recursive:true});
for(const file of ['index.html','app.js','styles.css'])await copyFile(file,'public/'+file);
await cp('assets','public/assets',{recursive:true});
console.log('Static HOME HUB files prepared in public/.');
