/* Daily safe update watcher: prepares a PR, never publishes an unverified binary. */
import {readFile,writeFile} from 'node:fs/promises';
const headers={'Accept':'application/vnd.github+json','User-Agent':'homehub-update-watcher'};
if(process.env.GITHUB_TOKEN)headers.Authorization='Bearer '+process.env.GITHUB_TOKEN;
const response=await fetch('https://api.github.com/repos/aqnoeu/home/releases?per_page=30',{headers,signal:AbortSignal.timeout(20000)});
if(!response.ok)throw Error('Release lookup failed HTTP '+response.status);
const releases=await response.json();
const required=['Home-Android.apk','Home-Windows.zip','Home-Chrome-Extension.zip'];
const valid=r=>!r.draft&&!r.prerelease&&/^v\d+\.\d+\.\d+$/.test(r.tag_name)&&required.every(name=>r.assets?.some(a=>a.name===name&&a.size>0&&/^sha256:[a-f0-9]{64}$/i.test(a.digest||'')));
const versionNumbers=t=>t.slice(1).split('.').map(Number);
const compare=(a,b)=>{const x=versionNumbers(a),y=versionNumbers(b);for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]-y[i]}return 0};
const viable=releases.filter(valid).sort((a,b)=>compare(b.tag_name,a.tag_name));
if(!viable.length)throw Error('No release with verified Android, Windows and Chrome assets.');
const target=viable[0].tag_name;
const base=await readFile('scripts/sync-downloads.mjs','utf8');
const current=base.match(/const tag='(v\d+\.\d+\.\d+)'/)?.[1];
if(!current)throw Error('Current pinned tag is missing.');
if(compare(target,current)<=0){console.log('Current verified release:',current,'; no change.');process.exit(0)}
const paths=['scripts/sync-downloads.mjs','api/download.js','index.html','DOWNLOADS.md'];
for(const path of paths){
 const s=await readFile(path,'utf8');
 const updated=s.replaceAll(current,target).replaceAll(current.toUpperCase(),target.toUpperCase());
 if(s===updated)throw Error('Pinned version not found in '+path);
 await writeFile(path,updated);
}
await writeFile('.home-new-version',target);
console.log('Prepared update PR for',target,'from',current);
