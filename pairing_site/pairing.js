
// pairing.js - client-only pairing demo
(function(){
  const phoneInput = document.getElementById('phone');
  const genBtn = document.getElementById('generate');
  const result = document.getElementById('result');
  const codeDisplay = document.getElementById('codeDisplay');
  const copyBtn = document.getElementById('copy');
  const finishBtn = document.getElementById('finish');
  const listEl = document.getElementById('list');
  const status = document.getElementById('pairingStatus');

  function validPhone(v){
    // simple validation: starts with + and digits, length between 8 and 15 digits (excluding +)
    return /^\+[0-9]{8,15}$/.test(v.trim());
  }

  function genCode(){
    return Math.floor(100000 + Math.random()*900000).toString();
  }

  function savePair(phone, code){
    // send to backend
    fetch('http://localhost:3000/pair', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({phone, code})
    }).then(r=>r.json()).then(res=>{
      console.log('Saved to server', res);
    }).catch(err=>console.error('Server save failed', err));

    const key = 'pairings_v1';
    const store = JSON.parse(localStorage.getItem(key) || '[]');
    const now = new Date().toISOString();
    store.push({phone, code, paired:false, created:now});
    localStorage.setItem(key, JSON.stringify(store));
    renderList();
  }

  function renderList(){
    const key = 'pairings_v1';
    const store = JSON.parse(localStorage.getItem(key) || '[]');
    listEl.innerHTML = '';
    if(store.length === 0){ listEl.innerHTML = '<li class="small">No saved pairings</li>'; return; }
    store.slice().reverse().forEach((p, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<div><strong>${p.phone}</strong><div class="small">${p.code} • ${p.paired ? 'paired' : 'not paired'} • ${new Date(p.created).toLocaleString()}</div></div>
        <div>
          <button class="use" data-idx="${store.length-1-idx}">Use</button>
        </div>`;
      listEl.appendChild(li);
    });

    // attach use buttons
    listEl.querySelectorAll('button.use').forEach(btn => {
      btn.addEventListener('click', (e)=>{
        const i = Number(btn.getAttribute('data-idx'));
        const s = JSON.parse(localStorage.getItem('pairings_v1') || '[]');
        const p = s[i];
        if(p){
          codeDisplay.textContent = p.code;
          result.classList.remove('hidden');
          status.textContent = 'Loaded existing code. Press "I've paired" after completing pairing on your bot.';
        }
      });
    });
  }

  genBtn.addEventListener('click', ()=>{
    const phone = phoneInput.value.trim();
    if(!validPhone(phone)){
      alert('Enter number with country code, e.g. +2348012345678');
      phoneInput.focus();
      return;
    }
    const code = genCode();
    codeDisplay.textContent = code;
    result.classList.remove('hidden');
    status.textContent = 'Share this code to the bot pairing interface. Save the pairing locally?';
    savePair(phone, code);
  });

  copyBtn.addEventListener('click', ()=>{
    const text = codeDisplay.textContent;
    if(!text) return;
    navigator.clipboard?.writeText(text).then(()=>{
      alert('Code copied to clipboard');
    }).catch(()=>{ alert('Copy failed - select and copy manually'); });
  });

  finishBtn.addEventListener('click', ()=>{
    const code = codeDisplay.textContent.trim();
    if(code){
      fetch('http://localhost:3000/mark', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({code})
      }).then(r=>r.json()).then(res=>{
        console.log('Marked on server', res);
      }).catch(err=>console.error('Server mark failed', err));
    }

    // mark the most recent pairing for that phone as paired
    const key = 'pairings_v1';
    const store = JSON.parse(localStorage.getItem(key) || '[]');
    if(store.length === 0){ alert('No pairing to mark.'); return; }
    // find by displayed code
    const code = codeDisplay.textContent.trim();
    for(let i = store.length-1; i>=0; i--){
      if(store[i].code === code){
        store[i].paired = true;
        store[i].pairedAt = new Date().toISOString();
        break;
      }
    }
    localStorage.setItem(key, JSON.stringify(store));
    status.textContent = 'Marked as paired locally.';
    renderList();
  });

  // initial render
  renderList();

})();
