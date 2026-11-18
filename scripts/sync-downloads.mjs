/* Copies verified HOME release assets to the project's own Vercel Blob store.
 * Executed by Vercel during build, sequentially (avoid memory spikes).
 * Never expose BLOB_READ_WRITE_TOKEN through the site's client JavaScript.
 */
import {put, head, BlobNotFoundError} from '@vercel/blob';
import {createHash} from 'node:crypto';
import {createReadStream,createWriteStream} from 'node:fs';
import {mkdtemp,rm,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pipeline} from 'node:stream/promises';

const tag='v2.0.24';
const source='aqnoeu/home';
const entries=[
  {name:'Home-Android.apk',type:'application/vnd.android.package-archive'},
  {name:'Home-Windows.zip',type:'application/zip'},
  {name:'Home-Chrome-Extension.zip',type:'application/zip'},
];
if(!process.env.BLOB_READ_WRITE_TOKEN)throw new Error('Vercel Blob is not connected: missing BLOB_READ_WRITE_TOKEN');
const releaseResponse=await fetch(`https://api.github.com/repos/${source}/releases/tags/${tag}`,{
  headers:{'Accept':'application/vnd.github+json','User-Agent':'HomeHub-Downloads-Mirror/1.0'},
  signal:AbortSignal.timeout(30000)
});
if(!releaseResponse.ok)throw new Error(`Release metadata HTTP ${releaseResponse.status}`);
const release=await releaseResponse.json();
const work=await mkdtemp(join(tmpdir(),'homehub-downloads-'));
try{
for(const entry of entries){
  const asset=release.assets.find(x=>x.name===entry.name);
  if(!asset||!/^sha256:[a-f0-9]{64}$/i.test(asset.digest))throw new Error(`Release asset missing SHA256: ${entry.name}`);
  const pathname=`downloads/home/${tag}/${entry.name}`;
  try{
    const saved=await head(pathname);
    if(saved.size===asset.size){console.log(`Already mirrored: ${pathname}`);continue}
    throw new Error(`Existing Blob size mismatch: ${pathname}`);
  }catch(error){
    if(!(error instanceof BlobNotFoundError)&&error.name!=='BlobNotFoundError'&&!String(error.message||'').includes('requested blob does not exist')&&error.status!==404)throw error;
  }
  const response=await fetch(asset.browser_download_url,{
    headers:{'User-Agent':'HomeHub-Downloads-Mirror/1.0','Accept':'application/octet-stream'},
    redirect:'follow',
    signal:AbortSignal.timeout(240000)
  });
  if(!response.ok||!response.body)throw new Error(`Download upstream failed: ${entry.name}, HTTP ${response.status}`);
  const destination=join(work,entry.name);
  await pipeline(response.body,createWriteStream(destination));
  const size=(await stat(destination)).size;
  if(size!==asset.size)throw new Error(`Size mismatch: ${entry.name}: ${size} vs ${asset.size}`);
  const hash=createHash('sha256');
  for await(const chunk of createReadStream(destination))hash.update(chunk);
  const digest=hash.digest('hex');
  if(digest!==asset.digest.slice(7).toLowerCase())throw new Error(`SHA256 failed for ${entry.name}`);
  console.log(`Verified ${entry.name}: ${size} bytes, sha256 OK`);
  await put(pathname,createReadStream(destination),{
    access:'public',addRandomSuffix:false,multipart:true,
    contentType:entry.type,cacheControlMaxAge:3600
  });
  console.log(`Mirrored to Vercel Blob: ${pathname}`);
}
}finally{await rm(work,{force:true,recursive:true})}
console.log('HOME downloads mirrors are verified and available via Vercel Blob.');
