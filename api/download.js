import {head,getDownloadUrl} from '@vercel/blob';
const tag='v2.0.27';
const files=Object.freeze({
  android:'Home-Android.apk',
  windows:'Home-Windows.zip',
  chrome:'Home-Chrome-Extension.zip',
});
export default async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='HEAD'){
    res.setHeader('Allow','GET, HEAD');return res.status(405).end();
  }
  const which=typeof req.query.file==='string'?req.query.file:'';
  if(!Object.hasOwn(files,which))return res.status(404).json({error:'Arquivo não disponível.'});
  const path=`downloads/home/${tag}/${files[which]}`;
  try{
    const file=await head(path);
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    return res.redirect(307,getDownloadUrl(file.url));
  }catch(error){
    if(error.name==='BlobNotFoundError'||error.status===404)return res.status(503).json({error:'O instalador ainda está sendo preparado.'});
    console.error('Home Hub download lookup failed',error.name);
    return res.status(503).json({error:'Download indisponível no momento.'});
  }
}
