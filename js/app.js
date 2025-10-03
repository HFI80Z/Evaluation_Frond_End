const API_URL = 'https://gabistam.github.io/Demo_API/data/projects.json';

const grid = document.getElementById('grid');
const filters = document.getElementById('filters');
const loader = document.getElementById('loader');
const errorEl = document.getElementById('error');
const emptyEl = document.getElementById('empty');
const dialog = document.getElementById('projectDialog');
const dialogContent = document.getElementById('dialogContent');
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

let DATA = { projects: [], technologies: [] };
let active = 'Tous';

const el = (t, a={}, c=[]) => { const n = document.createElement(t); for(const k in a){ if(k==='class') n.className=a[k]; else if(k.startsWith('on')) n.addEventListener(k.slice(2), a[k]); else n.setAttribute(k,a[k]); } c.forEach(x=>n.append(x)); return n; };
const show = e => e.hidden = false;
const hide = e => e.hidden = true;

function renderFilters(){
  filters.innerHTML = '';
  const items = ['Tous', ...DATA.technologies.filter(Boolean)];
  items.forEach(tech => {
    const btn = el('button', {
      type: 'button',
      'aria-pressed': String(tech===active),
      onclick: () => {
        active = tech;
        document.querySelectorAll('#filters button').forEach(b => b.setAttribute('aria-pressed','false'));
        btn.setAttribute('aria-pressed','true');
        renderGrid();
      }
    }, [tech]);
    filters.append(btn);
  });
}

function card(p){
  const img = el('img', { class:'thumb', src: p.image || 'https://picsum.photos/640/400?blur=1', alt:`Aperçu du projet « ${p.title} »` });
  const techs = el('div', { class:'badges' }, (p.technologies||[]).map(t => el('span',{class:'badge'},[t])));
  const btn = el('button',{class:'btn',type:'button',onclick:()=>openDialog(p)},['Voir détails']);
  const body = el('div',{class:'card-body'},[
    el('h3',{},[p.title]),
    el('p',{class:'muted'},[`Client : ${p.client || '—'}`]),
    techs,
    btn
  ]);
  const card = el('article', { class:'card glass', role:'listitem' }, [img, el('div',{class:'gradient-edge'}), body]);
  return card;
}

function renderGrid(){
  grid.innerHTML='';
  const list = active==='Tous' ? DATA.projects : DATA.projects.filter(p => (p.technologies||[]).includes(active));
  if(list.length===0){ show(emptyEl); } else { hide(emptyEl); }
  const frag = document.createDocumentFragment();
  list.forEach(p => frag.append(card(p)));
  grid.append(frag);
}

function openDialog(p){
  dialogContent.querySelectorAll('*:not(#dialog-title)').forEach(n=>n.remove());
  const features = Array.isArray(p.features)&&p.features.length ? el('ul',{}, p.features.map(f=>el('li',{},[f]))) : el('p',{},['—']);
  const link = p.url ? el('p',{},[el('a',{href:p.url,target:'_blank',rel:'noopener noreferrer'},['Visiter le site (simulation)'])]) : el('p',{},['Lien non fourni.']);
  dialogContent.append(
    (document.getElementById('dialog-title').textContent = p.title),
    el('p',{},[`Client : ${p.client || '—'}`]),
    el('p',{},[`Catégorie : ${p.category || '—'}`]),
    el('p',{},[`Année : ${p.year || '—'} · Durée : ${p.duration || '—'}`]),
    el('h4',{},['Description']),
    el('p',{},[p.description || '—']),
    el('h4',{},['Fonctionnalités']),
    features,
    link
  );
  if(dialog.showModal) dialog.showModal(); else dialog.setAttribute('open','');
}

async function load(){
  hide(errorEl); hide(emptyEl); show(loader);
  try{
    const res = await fetch(API_URL);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    DATA = await res.json();
    renderFilters();
    renderGrid();
  }catch(err){
    console.error(err);
    errorEl.textContent = "Impossible de charger les projets. Réessayez plus tard.";
    show(errorEl);
  }finally{
    hide(loader);
  }
}
document.addEventListener('DOMContentLoaded', load);



(function(){
  if(!window || !document) return;
  const dlg = document.getElementById('projectDialog');
  if(!dlg) return;
  let lastFocused = null;

  function getFocusable(){
    return dlg.querySelectorAll('button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])');
  }
  function trapTab(e){
    if(e.key !== 'Tab') return;
    const f = getFocusable();
    if(!f.length) return;
    const first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  dlg.addEventListener('close', ()=>{
    dlg.removeAttribute('aria-modal');
    dlg.removeEventListener('keydown', trapTab);
    if(lastFocused && lastFocused.focus) lastFocused.focus();
  });

  dlg.addEventListener('cancel', (e)=>{
    e.preventDefault(); 
    dlg.close();
  });

  if(typeof openDialog === 'function'){
    const _open = openDialog;
    window.openDialog = function(p){
      lastFocused = document.activeElement;
      _open(p);
      dlg.setAttribute('aria-modal','true');
      const f = getFocusable();
      if(f.length) f[0].focus();
      dlg.addEventListener('keydown', trapTab);
      dlg.addEventListener('click', (ev)=>{
        const rect = dlg.getBoundingClientRect();
        const inDialog = ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom;
        if(!inDialog){ try{ dlg.close(); }catch{} }
      }, { once: true });
    };
  }
})();
