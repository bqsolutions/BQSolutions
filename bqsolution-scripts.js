/* ══════════════════════════════════════════
   BQ Solution — Website Design Agency
   bdsolution-scripts.js
   ══════════════════════════════════════════ */

function showPage(id) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    a.classList.toggle('active', a.dataset.page === id);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('navLinks').classList.remove('open');
  setTimeout(initScrollAnimations, 80);
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

function submitContact() {
  var name  = document.getElementById('c-name').value.trim();
  var email = document.getElementById('c-email').value.trim();
  var msg   = document.getElementById('c-message').value.trim();
  if (!name || !email || !msg) { alert('Please fill in all required fields.'); return; }
  document.getElementById('contact-success').style.display = 'block';
  ['c-name','c-email','c-phone','c-message'].forEach(function(id) { document.getElementById(id).value = ''; });
  document.getElementById('c-subject').selectedIndex = 0;
}

function submitRequest() {
  var name    = document.getElementById('r-name').value.trim();
  var email   = document.getElementById('r-email').value.trim();
  var service = document.getElementById('r-service').value;
  if (!name || !email || !service) { alert('Please fill in the required fields.'); return; }
  document.getElementById('request-success').style.display = 'block';
  ['r-name','r-email','r-phone','r-business','r-notes'].forEach(function(id) { document.getElementById(id).value = ''; });
  ['r-service','r-budget','r-timeline'].forEach(function(id) { document.getElementById(id).selectedIndex = 0; });
}

// Scroll-triggered animations
function initScrollAnimations() {
  var els = document.querySelectorAll(
    '.service-card, .why-card, .process-step, .review-card, .price-card, .tech-item, .av-row, .full-service-item'
  );
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(function(el, i) {
    if (el.style.opacity === '1') return; // skip already animated
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity 0.5s ease ' + (i * 0.06) + 's, transform 0.5s ease ' + (i * 0.06) + 's';
    observer.observe(el);
  });
}

// Animated counter for stats
function animateCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach(function(el) {
    var target = parseInt(el.dataset.target);
    var suffix = el.dataset.suffix || '';
    var start  = 0;
    var step   = Math.ceil(target / 40);
    var timer  = setInterval(function() {
      start += step;
      if (start >= target) { start = target; clearInterval(timer); }
      el.querySelector('.count').textContent = start + suffix;
    }, 40);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var dateInput = document.getElementById('r-date');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
  initScrollAnimations();
  setTimeout(animateCounters, 400);
});