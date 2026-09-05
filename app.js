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

// Members-only documents: once a registered owner verifies (via Sign in with Google on the
// Documents page), cache the returned Drive links per-browser (12h) and unlock every
// <a data-mdoc="..."> across ALL pages — homepage tile, construction card, doc library.
(function(){
  var LABELS = { newsletter:'Open newsletter ↗', ec:'Open EC ↗', archive:'Open archive ↗' };
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
  var cached = null;
  try {
    var raw = localStorage.getItem('tpch_mdocs');
    if(raw){ var o = JSON.parse(raw); if(o && o.docs && o.exp > Date.now()) cached = o.docs; }
  } catch(e){}
  window.__tpchMemberDocs = cached;
  if(cached) apply(cached);
  window.tpchUnlockDocs = function(docs){
    if(!docs) return;
    try { localStorage.setItem('tpch_mdocs', JSON.stringify({ docs: docs, exp: Date.now() + 12*3600*1000 })); } catch(e){}
    window.__tpchMemberDocs = docs;
    apply(docs);
  };
})();
