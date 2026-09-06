// Shared behaviour for all TPCH Owners Hub pages.

// Nav: transparent over a cinematic hero, solid once scrolled.
// On inner pages (no .hero) it stays solid from the top.
(function(){
  var nav = document.getElementById('nav');
  if(!nav) return;
  var hero = document.querySelector('.hero');
  if(hero){
    var onScroll = function(){
      nav.classList.toggle('solid', window.scrollY > window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  } else {
    nav.classList.add('solid');
  }
})();

// Scroll reveal
(function(){
  var els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window) || !els.length){
    els.forEach(function(el){ el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:0.14, rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(el){ io.observe(el); });
})();

// Members-only documents + registry gate. Once a visitor signs in with Google we learn one of
// three states, cached per-browser and reflected on EVERY page:
//   member    — registered owner: unlock <a data-mdoc> Drive links + show benefits, hide registry links
//   nonmember — signed in but not in the registry: reveal the "Add your flat" registry link
//   anon      — not signed in: show only "Check if you're registered" (registry links stay hidden)
// Elements opt in with data-when="anon" | "nonmember" | "member" (space-separated to match several).
// This stops already-registered owners from ever seeing an "Add to Registry" link and re-filling it.
(function(){
  var LABELS = { newsletter:'Open newsletter ↗', ec:'Open EC ↗', archive:'Open archive ↗' };
  var MEMBER_KEY = 'tpch_mdocs', REG_KEY = 'tpch_reg';
  function apply(docs){
    if(!docs) return;
    document.querySelectorAll('a[data-mdoc]').forEach(function(a){
      var key = a.getAttribute('data-mdoc'), url = docs[key];
      if(url){
        a.setAttribute('href', url);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
        a.textContent = LABELS[key] || 'View ↗';
        a.setAttribute('data-unlocked', '1');
      }
    });
  }
  function nonmemberValid(){
    try { var r = JSON.parse(localStorage.getItem(REG_KEY) || 'null'); return !!(r && r.exp > Date.now()); }
    catch(e){ return false; }
  }
  function state(){
    if(window.__tpchMember) return 'member';
    if(nonmemberValid()) return 'nonmember';
    return 'anon';
  }
  function applyGate(){
    var st = state();
    window.__tpchState = st;
    document.querySelectorAll('[data-when]').forEach(function(el){
      var want = el.getAttribute('data-when').split(/\s+/);
      el.style.display = (want.indexOf(st) >= 0) ? '' : 'none';
    });
  }
  window.tpchApplyGate = applyGate;

  var m = null;
  try {
    var raw = localStorage.getItem(MEMBER_KEY);
    if(raw){ var o = JSON.parse(raw); if(o && o.m && o.m.docs && o.exp > Date.now()) m = o.m; }
  } catch(e){}
  window.__tpchMember = m;                    // { docs, list, name } or null
  window.__tpchMemberDocs = m ? m.docs : null;
  if(m) apply(m.docs);

  // Called with the full member payload { member, docs, list, name } after a verified sign-in.
  window.tpchUnlockDocs = function(mem){
    if(!mem || !mem.docs) return;
    try {
      localStorage.setItem(MEMBER_KEY, JSON.stringify({ m: mem, exp: Date.now() + 12*3600*1000 }));
      localStorage.removeItem(REG_KEY);       // promoted to member — drop any stale "not registered" flag
    } catch(e){}
    window.__tpchMember = mem;
    window.__tpchMemberDocs = mem.docs;
    apply(mem.docs);
    applyGate();
  };
  // Called after a verified sign-in whose email is NOT in the registry. Cached briefly (60 min) so
  // browsing stays smooth, then re-verifies — short by design so someone who registers right after
  // isn't stuck on "not registered".
  window.tpchSetNonMember = function(){
    try { localStorage.setItem(REG_KEY, JSON.stringify({ exp: Date.now() + 60*60*1000 })); } catch(e){}
    applyGate();
  };
  applyGate();
})();
