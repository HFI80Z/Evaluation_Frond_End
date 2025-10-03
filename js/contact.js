const yearEl2 = document.getElementById('year');
if (yearEl2) yearEl2.textContent = new Date().getFullYear();

const form = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');

const show = e => e.hidden=false;
const hide = e => e.hidden=true;
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const message = document.getElementById('message');
  const errName = document.getElementById('err-name');
  const errEmail = document.getElementById('err-email');
  const errMessage = document.getElementById('err-message');

  let ok = true;
  if(!name.value.trim()){ show(errName); name.setAttribute('aria-invalid','true'); ok=false; } else { hide(errName); name.removeAttribute('aria-invalid'); }
  if(!validEmail(email.value)){ show(errEmail); email.setAttribute('aria-invalid','true'); ok=false; } else { hide(errEmail); email.removeAttribute('aria-invalid'); }
  if(!message.value.trim()){ show(errMessage); message.setAttribute('aria-invalid','true'); ok=false; } else { hide(errMessage); message.removeAttribute('aria-invalid'); }

  if(!ok) return;
  form.reset();
  show(success);
  setTimeout(()=>hide(success), 3000);
});



// === Progressive enhancement: live validation and a11y niceties ===
(function(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const message = document.getElementById('message');
  const errName = document.getElementById('err-name');
  const errEmail = document.getElementById('err-email');
  const errMessage = document.getElementById('err-message');

  function setError(input, errEl, msg){
    if(errEl){ errEl.hidden = false; errEl.textContent = msg; }
    input.setAttribute('aria-invalid','true');
    input.setAttribute('aria-describedby', errEl ? errEl.id : '');
  }
  function clearError(input, errEl){
    if(errEl) errEl.hidden = true;
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }
  function emailOK(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); }

  function validateField(input){
    if(input === name){
      if(!name.value.trim()) return setError(name, errName, 'Le nom est requis.'), false;
      clearError(name, errName); return true;
    }
    if(input === email){
      if(!emailOK(email.value)) return setError(email, errEmail, 'Adresse e‑mail invalide.'), false;
      clearError(email, errEmail); return true;
    }
    if(input === message){
      if(!message.value.trim()) return setError(message, errMessage, 'Le message est requis.'), false;
      clearError(message, errMessage); return true;
    }
    return true;
  }

  [name, email, message].forEach(el=>{
    el.addEventListener('input', ()=>validateField(el));
    el.addEventListener('blur', ()=>validateField(el));
  });

  form.addEventListener('submit', (e)=>{
    const ok = [name,email,message].map(validateField).every(Boolean);
    if(!ok){ e.preventDefault(); (name.value? (email.value? message:email):name).focus(); return; }
  });
})();
