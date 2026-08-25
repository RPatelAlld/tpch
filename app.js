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
