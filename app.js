import {createClient} from "https://esm.sh/@supabase/supabase-js@2.95.0";
const $=id=>document.getElementById(id);const icon="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABIBAMAAADMq+AhAAAAMFBMVEX///////////////////////////////////////////////////////////////9Or7hAAAAAEHRSTlMAESIzRFVmd4iZqrvM3e7/dpUBFQAAAbJJREFUeNrtVr9Lw0AUfkkLrmlVXJNzcHGoKDi4VMe66O6if4A4dlOcBAU3Z1dBFJxcpIvVRdHRX8QiTlKaFKdiks/BNM2V9HqtQ6Hct73v3n353r13SYgUFBQUhgZaAje1QnRSSSCDfRlJffIQwK7Fs2wbgL9kSAgU7m0Ab7dcbvrKBhC8bnXfP18CAMA/iimkD/5IPK922586D1Phr7fYhSaJm25FFJwo9ynKTZci0utiQY8MAJ7ZZEdaJK7FAhMtAwiihy3HBBqWUGAzlopy01YpRgYXbZ75aDEezTaHzYyRdVMTCIznuLUwGo2Thg5BBdPxCiK3yxz7kxc4yPD3JLQ+x0+KKRAwE30JZ4cTSOVl7q/RWUCfSdziSjvQcjIlCNqoaRKe285U77loYr0KtMPp2QFJH2I/kBCAMO7DgTZwAWPgbbz7bxdqnQWCh6RrGFSk58A75hctiRNJc2ZPdzIE24WboaxFTmjIdg2qvRPqRtYiqj6KvowlINhgjDG2BjTCho05QJkxxlgBwKfAAfl7l4Qzl4jou0he+CqqFg16sYmIPopEX+qvTEFBYWjxC7bNAK4EHQZAAAAAAElFTkSuQmCC";let supabase=null,user=null,activeChat=null,chats=[],messages=[],busy=false,authMode="login",configured=false;
const modelNames={qwen:"Qwen 3",glm:"GLM 4.7 Flash",nemotron:"Nemotron 3 Super",gemma:"Gemma 4",llama:"Llama 3.3 70B",granite:"Granite 4 Micro"};
function usageKey(){return "homehub:neurons:"+new Date().toISOString().slice(0,10)}
function localUsage(){try{return Number(localStorage.getItem(usageKey()))||0}catch{return 0}}
function updateUsage(){const el=$("usageLocal");if(el)el.textContent=localUsage().toLocaleString("pt-BR",{maximumFractionDigits:2})+" Neurons";}
function recordUsage(usage){const n=usage?.neurons;if(typeof n!=="number"||!Number.isFinite(n)||n<0)return;try{localStorage.setItem(usageKey(),String(localUsage()+n))}catch{}updateUsage();}
function notify(s){const e=$("toast");e.textContent=s;e.classList.add("show");clearTimeout(notify.timer);notify.timer=setTimeout(()=>e.classList.remove("show"),3500)}
function safe(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function setConnection(text,ok){$("connectionText").textContent=text;$("connection").querySelector(".status-dot").style.background=ok?"#00C46A":"#FF6A00"}
function openAuth(){if(user){supabase.auth.signOut().then(()=>{user=null;activeChat=null;chats=[];messages=[];refreshAuth();renderHistory();renderMessages();notify("Sessão encerrada.");});return}$("authModal").classList.remove("hidden");$("email").focus()}
function closeAuth(){$("authModal").classList.add("hidden");$("authStatus").textContent=""}
function refreshAuth(){$("accountButton").textContent=user?"Sair":"Entrar";setConnection(user?"Conectado":configured?"Pronto":"Configuração pendente",!!configured)}
function showPage(){const chat=location.hash==="#chat";const account=location.hash==="#conta";const downloads=location.hash==="#downloads";$("homePage").classList.toggle("hidden",chat||account||downloads);$("features").classList.toggle("hidden",chat||account||downloads);document.querySelector("footer").classList.toggle("hidden",chat||account||downloads);$("chatPage").classList.toggle("hidden",!chat);$("accountPage").classList.toggle("hidden",!account);$("downloadsPage").classList.toggle("hidden",!downloads);$("navDownloads").classList.toggle("active",downloads);$("navAccount").classList.toggle("active",account);if(account)loadHomeAccount();$("navChat").classList.toggle("active",chat);$("navHome").classList.toggle("active",!chat&&!account&&!downloads);if((chat||account)&&!user&&configured)openAuth()}
function renderHistory(){
const host=$("chatHistory");host.replaceChildren();
$("deleteAllChats").disabled=!user||!chats.length||busy;
if(!chats.length){const p=document.createElement("p");p.className="history-empty";p.textContent="Suas conversas aparecerão aqui.";host.append(p);return;}
for(const c of chats){
const line=document.createElement("div");line.className="history-row";
const open=document.createElement("button");open.type="button";open.className="history-button"+(c.id===activeChat?" active":"");open.textContent="▤  "+(c.title||"Conversa");open.title=c.title||"Conversa";open.addEventListener("click",()=>openChat(c.id));
const remove=document.createElement("button");remove.type="button";remove.className="history-delete";remove.title="Excluir esta conversa";remove.setAttribute("aria-label","Excluir conversa "+(c.title||""));remove.textContent="×";remove.addEventListener("click",()=>deleteChats([c.id],false));line.append(open,remove);host.append(line);
}
}
async function deleteChats(ids,all){
if(!user||!supabase||busy||!ids.length)return;
const question=all?"Excluir permanentemente todas as "+ids.length+" conversas e suas mensagens? Esta ação não pode ser desfeita.":"Excluir permanentemente esta conversa e suas mensagens? Esta ação não pode ser desfeita.";
if(!confirm(question))return;
const before=activeChat;const targets=ids.filter(id=>chats.some(c=>c.id===id));if(!targets.length)return;
try{
$("deleteAllChats").disabled=true;
for(const id of targets){
const {error:messagesError}=await supabase.from("homehub_messages").delete().eq("user_id",user.id).eq("chat_id",id);
if(messagesError)throw Error("Falha ao excluir mensagens: "+messagesError.message);
const {error:chatError}=await supabase.from("homehub_chats").delete().eq("user_id",user.id).eq("id",id);
if(chatError)throw Error("Falha ao excluir conversa: "+chatError.message);
}
await loadChats();
if(targets.includes(before)){activeChat=null;messages=[];$("chatTitle").textContent="Nova conversa";renderMessages();}
renderHistory();notify(all?"Conversas excluídas.":"Conversa excluída.");
}catch(err){notify("Exclusão não concluída: "+err.message);await loadChats();renderHistory();}
}

function renderMessages(){const el=$("chatMessages");if(!messages.length){el.innerHTML='<div class="chat-empty"><img src="'+icon+'" alt="HOME"><h2>Como posso ajudar?</h2><p>Escolha um modelo e comece sua conversa.</p><div class="chips"><button data-suggest="Me ajude a planejar um novo projeto.">Planejar um projeto ↗</button><button data-suggest="Me explique um tema de forma simples.">Explicar um assunto ↗</button><button data-suggest="Me ajude a revisar um texto.">Revisar um texto ↗</button></div></div>';el.querySelectorAll("[data-suggest]").forEach(b=>b.addEventListener("click",()=>{const x=$("chatInput");x.value=b.dataset.suggest;x.focus();resize()}));return}el.innerHTML=messages.map(m=>'<div class="message '+safe(m.role)+'">'+(m.role==="assistant"?'<img class="message-icon" src="'+icon+'" alt="HOME">':'')+'<div class="bubble">'+safe(m.content)+'</div></div>').join("");el.scrollTop=el.scrollHeight}
function resize(){const t=$("chatInput");t.style.height="auto";t.style.height=Math.min(170,t.scrollHeight)+"px"}
async function loadChats(){
if(!user||!supabase)return;
const all=[];let from=0;const batchSize=500;
while(true){
const {data,error}=await supabase.from("homehub_chats").select("id,title,model,updated_at").order("updated_at",{ascending:false}).range(from,from+batchSize-1);
if(error){notify("Não foi possível carregar conversas: "+error.message);return;}
all.push(...(data||[]));
if(!data||data.length<batchSize)break;
from+=batchSize;
}
chats=all;renderHistory();
}
async function openChat(id){activeChat=id;const c=chats.find(x=>x.id===id);$("chatTitle").textContent=c?.title||"Nova conversa";$("modelSelect").value=c?.model||"auto";messages=[];renderMessages();renderHistory();$("chatPage").querySelector(".sidebar").classList.remove("open");if(!id)return;const {data,error}=await supabase.from("homehub_messages").select("id,role,content,model,created_at").eq("chat_id",id).order("created_at",{ascending:true}).limit(150);if(error){notify("Não foi possível carregar mensagens.");return}if(activeChat===id){messages=data||[];renderMessages()}}
async function startNew(){activeChat=null;messages=[];await loadModelPreference();$("chatTitle").textContent="Nova conversa";renderHistory();renderMessages();$("chatPage").querySelector(".sidebar").classList.remove("open");$("chatInput").focus()}
async function submitMessage(ev){ev.preventDefault();const text=$("chatInput").value.trim();if(!text||busy)return;if(!configured){notify("Configuração do Supabase indisponível.");return}if(!user){openAuth();return}busy=true;$("sendButton").disabled=true;$("chatInput").value="";resize();let chatId=activeChat;const selected=$("modelSelect").value;try{
if(!chatId){const {data,error}=await supabase.from("homehub_chats").insert({user_id:user.id,title:text.slice(0,65),model:selected}).select("id,title,model,updated_at").single();if(error)throw Error(error.message);chatId=data.id;activeChat=chatId;chats.unshift(data);$("chatTitle").textContent=data.title;renderHistory();}
const {error:writeErr}=await supabase.from("homehub_messages").insert({chat_id:chatId,user_id:user.id,role:"user",content:text});if(writeErr)throw Error(writeErr.message);
messages.push({role:"user",content:text});renderMessages();
const {data:sessionData}=await supabase.auth.getSession();const token=sessionData.session?.access_token;if(!token)throw Error("Sua sessão expirou. Entre novamente.");
$("chatNote").textContent="Consultando inteligência artificial...";
const payload=messages.filter(m=>["user","assistant"].includes(m.role)).slice(-12).map(m=>({role:m.role,content:m.content}));
const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({model:selected,messages:payload})});
const answer=await res.json().catch(()=>({error:"Resposta inválida do servidor"}));if(!res.ok)throw Error(answer.error||"Não foi possível obter resposta");
const reply=String(answer.content||"").trim();if(!reply)throw Error("A IA não retornou conteúdo.");
const {error:saveErr}=await supabase.from("homehub_messages").insert({chat_id:chatId,user_id:user.id,role:"assistant",content:reply,model:answer.model||selected});if(saveErr)notify("Resposta recebida, mas não foi possível salvá-la: "+saveErr.message);
messages.push({role:"assistant",content:reply});renderMessages();recordUsage(answer.usage);$("chatNote").textContent="Respondido por "+(modelNames[answer.modelKey]||"Cloudflare")+" · Workers Free"+(answer.fallback?" · alternativa automática":"")+". O consumo informado é apenas o registrado neste navegador.";await supabase.from("homehub_chats").update({updated_at:new Date().toISOString()}).eq("id",chatId);await loadChats();
}catch(e){const message=e?.message||"Erro ao enviar mensagem.";notify(message);messages.push({role:"notice",content:"Não foi possível responder: "+message});renderMessages();$("chatNote").textContent="A resposta não foi gerada. Confira a configuração indicada acima.";}finally{busy=false;$("sendButton").disabled=false;if($("chatNote").textContent==="Consultando inteligência artificial...")$("chatNote").textContent="Seus dados são vinculados à sua conta.";}}

async function registerWebDevice(){
  if(!supabase||!user)return;
  let clientId;try{clientId=localStorage.getItem("homehub:web-device-id");if(!clientId){clientId=crypto.randomUUID();localStorage.setItem("homehub:web-device-id",clientId);}}catch{return;}
  const {error}=await supabase.from("home_devices").upsert({user_id:user.id,client_id:clientId,platform:"web",display_name:"Home Hub Web",last_seen_at:new Date().toISOString()},{onConflict:"user_id,client_id"});
  if(error)console.warn("Falha ao vincular navegador:",error.message);
}
async function loadModelPreference(){
  if(!supabase||!user)return;
  const {data}=await supabase.from("home_preferences").select("preferred_model").eq("user_id",user.id).maybeSingle();
  const key=data?.preferred_model||"auto";
  if(!activeChat&&$("modelSelect").querySelector('option[value="'+key+'"]'))$("modelSelect").value=key;
}
async function loadVoiceProfileStatus(){
  const host=$("accountVoiceStatus");
  if(!supabase||!user){host.textContent="Entre na Conta HOME para consultar o perfil.";return;}
  const {data,error}=await supabase.from("home_voice_profiles")
    .select("sync_enabled,settings,updated_at").eq("user_id",user.id).maybeSingle();
  if(error){host.textContent="Não foi possível consultar o perfil: "+error.message;return;}
  if(!data){host.textContent="Nenhum perfil de voz foi salvo na nuvem.";return;}
  const platforms=Object.keys(data.settings||{}).filter(x=>["android","windows"].includes(x));
  host.textContent=(data.sync_enabled?"Sincronização autorizada":"Sincronização desativada")+
    " · Perfil salvo: "+(platforms.length?platforms.join(", "):"nenhum dispositivo")+
    " · Última atualização: "+(data.updated_at?new Date(data.updated_at).toLocaleString("pt-BR"):"não informada");
}
async function disableVoiceSync(){
  if(!supabase||!user){openAuth();return;}
  const {error}=await supabase.from("home_voice_profiles").update({sync_enabled:false})
    .eq("user_id",user.id);
  if(error)notify("Falha ao desativar: "+error.message);else notify("Sincronização de voz desativada.");
  await loadVoiceProfileStatus();
}
async function deleteVoiceProfile(){
  if(!supabase||!user){openAuth();return;}
  if(!confirm("Apagar da Conta HOME o perfil de voz salvo? As cópias locais permanecerão nos dispositivos."))return;
  const {error}=await supabase.from("home_voice_profiles").delete().eq("user_id",user.id);
  if(error)notify("Falha ao apagar: "+error.message);else notify("Perfil de voz na nuvem apagado.");
  await loadVoiceProfileStatus();
}
async function loadHomeAccount(){
  if(!supabase||!user){$("accountIdentity").textContent="Entre na sua conta HOME para gerenciar os dispositivos."; $("accountDevices").textContent="Entre para consultar os dispositivos.";return;}
  $("accountIdentity").textContent="Conectado: "+(user.email||"Sua conta HOME");
  loadVoiceProfileStatus();
  const [{data:preferences,error:prefError},{data:devices,error:devError}]=await Promise.all([
    supabase.from("home_preferences").select("*").eq("user_id",user.id).maybeSingle(),
    supabase.from("home_devices").select("id,display_name,platform,last_seen_at").order("last_seen_at",{ascending:false}).limit(100)
  ]);
  if(prefError)notify("Preferências: "+prefError.message);
  const p=preferences||{};
  $("accountStyle").value=p.response_style||"equilibrado";
  $("accountModel").value=p.preferred_model||"auto";
  $("accountSyncChats").checked=p.sync_chats===true;
  $("accountSyncEmotions").checked=p.sync_emotions===true;
  if(devError){$("accountDevices").textContent="Não foi possível consultar dispositivos: "+devError.message;return;}
  const host=$("accountDevices");host.replaceChildren();
  if(!devices?.length){host.textContent="Nenhum dispositivo vinculado ainda.";return;}
  devices.forEach(d=>{
    const line=document.createElement("div");line.className="device-item";
    const title=document.createElement("div");
    const name=document.createElement("strong");name.textContent=(d.platform==="android"?"📱 ":d.platform==="windows"?"💻 ":"🌐 ")+d.display_name;
    const note=document.createElement("small");note.textContent="Última conexão: "+new Date(d.last_seen_at).toLocaleString("pt-BR");
    title.append(name,note);
    const remove=document.createElement("button");remove.className="outline small";remove.textContent="Desvincular";
    remove.onclick=async()=>{
      if(!confirm("Desvincular este dispositivo? Para encerrar uma sessão ainda ativa, saia da conta nesse aparelho."))return;
      const {error}=await supabase.from("home_devices").delete().eq("id",d.id).eq("user_id",user.id);
      if(error)notify(error.message);else{notify("Vínculo removido.");loadHomeAccount();}
    };
    line.append(title,remove);host.append(line);
  });
}
async function saveHomeAccount(){
  if(!supabase||!user){openAuth();return;}
  const data={user_id:user.id,response_style:$("accountStyle").value,preferred_model:$("accountModel").value,sync_chats:$("accountSyncChats").checked,sync_emotions:$("accountSyncEmotions").checked,updated_at:new Date().toISOString()};
  const {error}=await supabase.from("home_preferences").upsert(data,{onConflict:"user_id"});
  notify(error?"Não foi possível salvar: "+error.message:"Preferências da conta HOME salvas.");
}
async function init(){updateUsage();try{const res=await fetch("/api/config");const c=await res.json();if(!res.ok||!c.supabaseUrl||!c.supabasePublishableKey)throw Error("Configuração do Supabase ausente");supabase=createClient(c.supabaseUrl,c.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});configured=true;const {data}=await supabase.auth.getUser();user=data?.user||null;refreshAuth();if(user){await registerWebDevice();await loadChats();await loadModelPreference();}supabase.auth.onAuthStateChange((_event,session)=>{const before=user?.id;user=session?.user||null;refreshAuth();if(user&&user.id!==before){registerWebDevice();loadChats();loadModelPreference();if(location.hash==="#conta")loadHomeAccount();}if(!user){chats=[];messages=[];activeChat=null;renderHistory();renderMessages()}});$("chatNote").textContent=c.aiConfigured?"Pronto para conversar com os modelos Cloudflare.":"IA indisponível: "+(c.aiStatus||"configure o Workers AI na Vercel"); }catch(e){setConnection("Indisponível",false);notify(e.message)}showPage()}
$("authForm").addEventListener("submit",async e=>{e.preventDefault();if(!supabase){$("authStatus").textContent="Configuração indisponível.";return}const email=$("email").value.trim(),password=$("password").value;$("authSubmit").disabled=true;$("authStatus").textContent="Processando...";try{const {error,data}=authMode==="login"?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password});if(error)throw Error(error.message);if(authMode==="register"&&!data.session){$("authStatus").textContent="Cadastro enviado! Confirme seu e-mail para acessar.";return}user=data.user||data.session?.user;refreshAuth();await registerWebDevice();await loadChats();await loadModelPreference();closeAuth();if(location.hash==="#conta")loadHomeAccount();notify("Bem-vindo ao Home Hub!");}catch(err){$("authStatus").textContent=err.message}finally{$("authSubmit").disabled=false}});
$("authSwitch").addEventListener("click",()=>{authMode=authMode==="login"?"register":"login";$("authTitle").textContent=authMode==="login"?"Entre no Home Hub":"Crie sua conta";$("authSubmit").textContent=authMode==="login"?"Entrar":"Criar conta";$("authSwitch").textContent=authMode==="login"?"Não tem conta? Criar conta":"Já tem conta? Entrar";$("authStatus").textContent=""});
$("accountButton").addEventListener("click",openAuth);$("disableVoiceSync").addEventListener("click",disableVoiceSync);$("deleteVoiceProfile").addEventListener("click",deleteVoiceProfile);$("saveAccount").addEventListener("click",saveHomeAccount);$("reloadDevices").addEventListener("click",loadHomeAccount);$("closeModal").addEventListener("click",closeAuth);$("authModal").addEventListener("click",e=>{if(e.target===$("authModal"))closeAuth()});$("startChat").addEventListener("click",()=>location.hash="chat");$("newChat").addEventListener("click",startNew);$("deleteAllChats").addEventListener("click",()=>deleteChats(chats.map(c=>c.id),true));$("mobileHistory").addEventListener("click",()=>$("chatPage").querySelector(".sidebar").classList.toggle("open"));$("chatForm").addEventListener("submit",submitMessage);$("modelSelect").addEventListener("change",async()=>{if(!activeChat||!user||!supabase)return;const selected=$("modelSelect").value;const {error}=await supabase.from("homehub_chats").update({model:selected}).eq("id",activeChat);if(error)notify("Não foi possível salvar a seleção de modelo.");else{const chat=chats.find(c=>c.id===activeChat);if(chat)chat.model=selected;}});$("chatInput").addEventListener("input",resize);$("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();$("chatForm").requestSubmit()}});window.addEventListener("hashchange",showPage);document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAuth()});init();