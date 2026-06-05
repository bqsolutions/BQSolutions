/* ══════════════════════════════════════════
   BQ Solution — Website Design Agency
   bqsolution-scripts.js
   ══════════════════════════════════════════ */

var EMAILJS_PUBLIC_KEY       = "nP1zVzVIFALnWGFAD";
var EMAILJS_SERVICE_ID       = "service_igi9jtq";
var EMAILJS_CONTACT_TEMPLATE = "template_g6bcn2f";

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

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE, {
    from_name:  name,
    from_email: email,
    phone:      phone   || 'Not provided',
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

// ── Init EmailJS after SDK loads ──
window.addEventListener('load', function() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('// EmailJS initialised');
  } else {
    console.warn('// EmailJS failed to load');
  }
});

// Close hamburger menu when any nav link is clicked
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    link.addEventListener('click', function() {
      document.getElementById('navLinks').classList.remove('open');
    });
  });

  // Fade in earth model only after it has fully loaded and started rotating
  var earthContainer = document.querySelector('.hero-3d');
  var earthViewer    = document.querySelector('.hero-3d model-viewer');
  if (earthViewer && earthContainer) {
    earthViewer.addEventListener('load', function() {
      // Small delay lets the first animation frame render before reveal
      setTimeout(function() {
        earthContainer.classList.add('loaded');
      }, 120);
    });
  }

  initFullPageScroll();
  initSnapAnimations();
  initScrollAnimations();
  setTimeout(animateCounters, 400);
});

// Full-page locked scroll — one section at a time with cooldown
function initFullPageScroll() {
  var sections   = Array.from(document.querySelectorAll(
    '#home, .services-section, .process-section, .pricing-section, .why-section, .contact-home, footer'
  ));
  var current    = 0;
  var locked     = false;
  var DELAY      = 900;
  var ANIM_DUR   = 2800;
  var isMobile   = window.matchMedia('(max-width: 768px)').matches;

  var whyIdx     = sections.findIndex(function(s) { return s.classList.contains('why-section'); });
  var contactIdx = sections.findIndex(function(s) { return s.classList.contains('contact-home'); });

  function scrollTo(idx) {
    var section = sections[idx];
    var top = section.getBoundingClientRect().top + window.pageYOffset - 78;
    if (section.classList.contains('pricing-section')) top += 50;
    if (section.classList.contains('why-section'))     top -= 80;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function showInterstitial(onDone) {
    var overlay = document.getElementById('cta-interstitial');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('playing');
    setTimeout(function() {
      overlay.classList.remove('playing');
      overlay.setAttribute('aria-hidden', 'true');
      onDone();
    }, ANIM_DUR);
  }

  // ── MOBILE: free native scrolling + interstitial via IntersectionObserver ──
  if (isMobile) {
    var lastSeen  = null;
    var triggered = false;

    // Track which section the user most recently scrolled through
    var tracker = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) lastSeen = e.target; });
    }, { threshold: 0.4 });
    sections.forEach(function(s) { tracker.observe(s); });

    // When contact enters view after why-section, fire interstitial
    var contactWatcher = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && lastSeen === sections[whyIdx] && !triggered) {
          triggered = true;
          document.documentElement.style.overflow = 'hidden';
          showInterstitial(function() {
            document.documentElement.style.overflow = '';
            sections[contactIdx].scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(function() { triggered = false; }, 3000);
          });
        }
      });
    }, { threshold: 0.15 });
    contactWatcher.observe(sections[contactIdx]);
    return; // skip desktop handlers below
  }

  // ── DESKTOP: full locked scroll, one section at a time ──

  function goTo(idx) {
    if (idx < 0 || idx >= sections.length || locked) return;

    // Special transition: why-section → contact
    if (current === whyIdx && idx === contactIdx) {
      locked = true;
      showInterstitial(function() {
        current = contactIdx;
        scrollTo(contactIdx);
        setTimeout(function() { locked = false; }, DELAY);
      });
      return;
    }

    current = idx;
    locked  = true;
    scrollTo(idx);
    setTimeout(function() { locked = false; }, DELAY);
  }

  // Sync current index after anchor-link nav clicks
  window.addEventListener('scroll', function() {
    if (locked) return;
    sections.forEach(function(sec, i) {
      var rect = sec.getBoundingClientRect();
      if (rect.top <= 80 && rect.bottom > 80) current = i;
    });
  }, { passive: true });

  // Mouse wheel — one tick = one section
  window.addEventListener('wheel', function(e) {
    e.preventDefault();
    if (locked) return;
    goTo(e.deltaY > 0 ? current + 1 : current - 1);
  }, { passive: false });

  // Touch (desktop touch screens)
  var touchStartY = 0;
  window.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', function(e) {
    if (locked) return;
    var diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });

  // Keyboard arrows / page keys
  window.addEventListener('keydown', function(e) {
    if (locked) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(current - 1); }
  });
}

// Section entrance animations (fires when section scrolls into view)
function initSnapAnimations() {
  var sections = document.querySelectorAll(
    '.stats-bar, .services-section, .process-section, .pricing-section, .why-section, .cta-band, .contact-home, footer'
  );

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(function(el) {
    el.classList.add('section-enter');
    observer.observe(el);
  });
}

// Scroll-triggered fade-up animations
function initScrollAnimations() {
  var els = document.querySelectorAll(
    '.service-card, .why-card, .process-step, .price-card, .contact-item'
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

  var BASE_DELAY = 0.35;
  els.forEach(function(el, i) {
    if (el.style.opacity === '1') return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    var delay = BASE_DELAY + (i * 0.06);
    el.style.transition = 'opacity 0.5s ease ' + delay + 's, transform 0.5s ease ' + delay + 's';
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
