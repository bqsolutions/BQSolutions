/* ══════════════════════════════════════════
   BQ Solution — Website Design Agency
   bqsolution-scripts.js
   ══════════════════════════════════════════ */

var EMAILJS_PUBLIC_KEY       = "nP1zVzVIFALnWGFAD";
var EMAILJS_SERVICE_ID       = "service_igi9jtq";
var EMAILJS_CONTACT_TEMPLATE = "template_g6bcn2f";
var EMAILJS_QUOTE_TEMPLATE   = "template_q6tu7a8";
var BQ_EMAIL                 = "bqsolutions06@email.com";

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
  var name    = document.getElementById('c-name').value.trim();
  var email   = document.getElementById('c-email').value.trim();
  var phone   = document.getElementById('c-phone').value.trim();
  var subject = document.getElementById('c-subject').value;
  var message = document.getElementById('c-message').value.trim();

  if (!name || !email || !message) {
    alert('Please fill in all required fields.');
    return;
  }

  var btn = document.getElementById('contact-submit');
  if (btn) { btn.disabled = true; btn.textContent = '// Sending...'; }

  emailjs.send("service_igi9jtq", "template_g6bcn2f", {
    from_name:  name,
    from_email: email,
    phone:      phone || 'Not provided',
    subject:    subject || 'General Inquiry',
    message:    message,
    to_email:   "bqsolutions06@gmail.com",
    reply_to:   email
  }).then(function() {
    document.getElementById('contact-success').style.display = 'block';
    document.getElementById('contact-success').textContent =
      '// Message received. We\'ll reply within one business day.';
    ['c-name','c-email','c-phone','c-message'].forEach(function(id) {
      document.getElementById(id).value = '';
    });
    document.getElementById('c-subject').selectedIndex = 0;
    if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
  }).catch(function(error) {
    console.error('EmailJS error:', error);
    alert('Something went wrong. Please try again or email us directly.');
    if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
  });
}

function submitRequest() {
  var name     = document.getElementById('r-name').value.trim();
  var business = document.getElementById('r-business').value.trim();
  var email    = document.getElementById('r-email').value.trim();
  var phone    = document.getElementById('r-phone').value.trim();
  var service  = document.getElementById('r-service').value;
  var budget   = document.getElementById('r-budget').value;
  var timeline = document.getElementById('r-timeline').value;
  var notes    = document.getElementById('r-notes').value.trim();
  var date     = document.getElementById('r-date').value;

  if (!name || !email || !service) {
    alert('Please fill in the required fields.');
    return;
  }

  var btn = document.getElementById('request-submit');
  if (btn) { btn.disabled = true; btn.textContent = '// Sending...'; }

  emailjs.send("service_igi9jtq", "template_g6tu7a8", {
    from_name:     name,
    business_name: business  || 'Not provided',
    from_email:    email,
    phone:         phone     || 'Not provided',
    service:       service,
    budget:        budget    || 'Not specified',
    timeline:      timeline  || 'Not specified',
    start_date:    date      || 'Not specified',
    notes:         notes     || 'No additional details.',
    to_email:      "bqsolutions06@gmail.com",
    reply_to:      email
  }).then(function() {
    document.getElementById('request-success').style.display = 'block';
    document.getElementById('request-success').textContent =
      '// Quote request received. We\'ll send your quote within 24 hours.';
    ['r-name','r-business','r-email','r-phone','r-notes','r-date'].forEach(function(id) {
      document.getElementById(id).value = '';
    });
    ['r-service','r-budget','r-timeline'].forEach(function(id) {
      document.getElementById(id).selectedIndex = 0;
    });
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Quote Request'; }
  }).catch(function(error) {
    console.error('EmailJS error:', error);
    alert('Something went wrong. Please try again or email us directly.');
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Quote Request'; }
  });
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

// ── Init EmailJS after SDK loads ──

window.addEventListener('load', function() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init("nP1zVzVIFALnWGFAD");
    console.log('// EmailJS initialised');
  } else {
    console.warn('// EmailJS failed to load');
  }
});
console.log('// EmailJS initialised');

document.addEventListener('DOMContentLoaded', function() {

  // ── Wire contact form submit button ──
  var cBtn = document.querySelector('#page-contact .form-submit');
  if (cBtn) {
    cBtn.id = 'contact-submit';
    cBtn.onclick = submitContact;
  }

  // ── Wire quote form submit button ──
  var rBtn = document.querySelector('#page-request .form-submit');
  if (rBtn) {
    rBtn.id = 'request-submit';
    rBtn.onclick = submitRequest;
  }

  // ── Date picker minimum ──
  var dateInput = document.getElementById('r-date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  // ── Kick off scroll animations ──
  initScrollAnimations();
  setTimeout(animateCounters, 400);

});