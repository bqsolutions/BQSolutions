// BQ Solutions — Main Scripts
// Includes: GSAP ScrollTrigger + Motion (Framer) spring animations
// Laptop animation: CSS/SVG scroll-driven (no GLB dependency)

gsap.registerPlugin(ScrollTrigger);

// ── CURSOR ──
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  gsap.to(cursor, { left: e.clientX, top: e.clientY, duration: .12, ease: 'power2.out' });
});
document.querySelectorAll('a, button, .svc-item, .process-item, .price-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('big'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
});

// ── ELEMENTS ──
const lid          = document.getElementById('lid');
const lidInner     = document.getElementById('lidInner');
const screenGlow   = document.getElementById('screenGlow');
const handLeft     = document.getElementById('handLeft');
const handRight    = document.getElementById('handRight');
const handsContainer = document.getElementById('handsContainer');
const labelText    = document.getElementById('screenLabelText');
const keys         = document.querySelectorAll('.key');
const scene        = document.getElementById('laptopScene');

// Screen states
const states = {
  boot:  document.getElementById('stateBoot'),
  code:  document.getElementById('stateCode'),
  site:  document.getElementById('stateSite'),
  dash:  document.getElementById('stateDash'),
  live:    document.getElementById('stateLive'),
  contact: document.getElementById('stateContact'),
};

let activeState = 'boot';
let typingInterval = null;
let typingActive = false;

function showState(name) {
  if(activeState === name) return;
  const prevEl = states[activeState];
  const nextEl = states[name];
  activeState = name;

  // Flip out current state (rotateY 0→90, fade out)
  if(prevEl && prevEl.classList.contains('active')) {
    gsap.to(prevEl, {
      rotationY: 80, opacity: 0, duration: 0.2, ease: 'power2.in',
      transformPerspective: 700,
      onComplete: () => {
        prevEl.classList.remove('active');
        gsap.set(prevEl, { rotationY: 0 });
      }
    });
  }

  // Flip in next state (rotateY -90→0, fade in)
  if(nextEl) {
    nextEl.classList.add('active');
    gsap.fromTo(nextEl,
      { rotationY: -80, opacity: 0, transformPerspective: 700 },
      { rotationY: 0, opacity: 1, duration: 0.28, ease: 'power2.out', delay: 0.16 }
    );
  }

  labelText.textContent = {
    boot: 'Laptop closed',
    code: 'Writing code...',
    site: 'Website preview',
    dash: 'Analytics dashboard',
    live: 'Site is live ✓',
    contact: 'Start your project',
  }[name] || '';
}

// ── TYPING ANIMATION ──
const codeLines = [
  { el: 'codeLine1', text: 'const website = {', color: '#569CD6' },
  { el: 'codeLine2', text: '  name: "Your Business",', color: '#CE9178' },
  { el: 'codeLine3', text: '  // No templates. Ever.', color: '#6A9955' },
  { el: 'codeLine4', text: '  animations: true,', color: '#9CDCFE' },
  { el: 'codeLine5', text: '  mobile: "first",', color: '#CE9178' },
  { el: 'codeLine6', text: '  owner: YOU,', color: '#C8F135' },
  { el: 'codeLine7', text: '};', color: 'rgba(255,255,255,.6)' },
];

function startTyping() {
  if(typingActive) return;
  typingActive = true;
  let lineIdx = 0;
  let charIdx = 0;
  // Reset all lines
  codeLines.forEach(l => {
    const el = document.getElementById(l.el);
    if(el) { el.style.width = '0'; el.textContent = ''; }
  });

  function typeNext() {
    if(lineIdx >= codeLines.length) {
      typingActive = false;
      return;
    }
    const lineData = codeLines[lineIdx];
    const el = document.getElementById(lineData.el);
    if(!el) { lineIdx++; typeNext(); return; }
    if(charIdx === 0) {
      el.style.width = 'auto';
      el.textContent = '';
    }
    if(charIdx < lineData.text.length) {
      el.textContent += lineData.text[charIdx];
      charIdx++;
      // Random typing speed — feels human
      const delay = lineData.text[charIdx-1] === ' ' ? 40 : Math.random() * 60 + 30;
      typingInterval = setTimeout(typeNext, delay);
    } else {
      charIdx = 0;
      lineIdx++;
      typingInterval = setTimeout(typeNext, 120);
    }
  }
  typeNext();
}

function stopTyping() {
  typingActive = false;
  if(typingInterval) clearTimeout(typingInterval);
}

// ── KEY PRESS ANIMATION ──
let keyPressInterval = null;
function startKeyPresses() {
  if(keyPressInterval) return;
  const keyList = [...keys];
  keyPressInterval = setInterval(() => {
    const randomKey = keyList[Math.floor(Math.random() * keyList.length)];
    randomKey.classList.add('pressed');
    setTimeout(() => randomKey.classList.remove('pressed'), 80);
  }, 120);
}
function stopKeyPresses() {
  if(keyPressInterval) { clearInterval(keyPressInterval); keyPressInterval = null; }
  keys.forEach(k => k.classList.remove('pressed'));
}

// ── MOUSE PARALLAX on laptop — enhanced depth + spring feel ──
document.addEventListener('mousemove', e => {
  const mx = (e.clientX / window.innerWidth - .5) * 2;
  const my = (e.clientY / window.innerHeight - .5) * 2;

  // Scene rotation — wider range, longer tail for spring-like settle
  gsap.to(scene, {
    rotationY: mx * 14,
    rotationX: 4 + my * -5,
    duration: 1.3,
    ease: 'power3.out',
    transformPerspective: 900,
    overwrite: false,
  });

  // Lid/screen shifts slightly MORE than scene (closer to camera = more parallax)
  gsap.to(lidInner, {
    x: mx * 10,
    y: my * 5,
    duration: 1.6,
    ease: 'power3.out',
    overwrite: 'auto',
  });

  // Screen glow drifts with mouse — looks like an internal light source
  gsap.to(screenGlow, {
    xPercent: mx * 10,
    yPercent: my * 6,
    duration: 1.8,
    ease: 'power3.out',
    overwrite: 'auto',
  });
});

// ══════════════════════════════════════════
// MASTER SCROLL TIMELINE
// Pin the laptop section and scrub through
// the full animation as content scrolls
// ══════════════════════════════════════════

const masterTL = gsap.timeline({ paused: true });

// ── ACT 1 (0–15%): HANDS APPROACH ──
// Hands slide up from below, hovering over keyboard
masterTL
  .to([handLeft, handRight], {
    opacity: 1, y: 0, duration: 1, stagger: .1, ease: 'power3.out'
  }, 0)
  // Subtle hover — hands float above keys
  .to(handLeft, { y: -8, duration: .5, ease: 'power2.inOut' }, .6)
  .to(handRight, { y: -6, duration: .5, ease: 'power2.inOut' }, .65);

// ── ACT 2 (15–35%): LID OPENS ──
// Lid rotates from closed (-102°) to open (-10°)
masterTL
  .to(lid, {
    rotationX: -10,
    duration: 2,
    ease: 'power2.inOut',
    onStart: () => {
      showState('boot');
      labelText.textContent = 'Opening laptop...';
    },
    onComplete: () => {
      lidInner.classList.add('lit');
      gsap.to(screenGlow, { boxShadow: 'inset 0 0 40px rgba(200,241,53,.1)', duration: .5 });
    }
  }, .8)
  // Screen glow increases as lid opens
  .to({}, { duration: 1,
    onUpdate: function() {
      const p = this.progress();
      screenGlow.style.boxShadow = `inset 0 0 ${p * 40}px rgba(200,241,53,${p * 0.1})`;
    }
  }, .8);

// ── ACT 3 (35–55%): TYPING ──
// Hands bounce, keys press, code appears on screen
masterTL
  .call(() => {
    showState('code');
    startTyping();
    startKeyPresses();
    handLeft.classList.add('typing');
    handRight.classList.add('typing');
    labelText.textContent = 'Writing code...';
  }, null, 2.2)
  .to({}, { duration: 2.5 }, 2.2); // hold for typing duration

// ── ACT 4 (55–70%): WEBSITE PREVIEW ──
masterTL
  .call(() => {
    showState('site');
    stopKeyPresses();
    stopTyping();
    handLeft.classList.remove('typing');
    handRight.classList.remove('typing');
    // Hands move slightly back — leaning back to review
    gsap.to([handLeft, handRight], { y: 15, duration: .6, ease: 'power2.out' });
    labelText.textContent = 'Reviewing website...';
    // Animate dashboard bars
    document.querySelectorAll('.dash-bar-fill').forEach(b => b.classList.add('animated'));
  }, null, 4.7);

// ── ACT 5 (70–85%): DASHBOARD ──
masterTL
  .call(() => {
    showState('dash');
    labelText.textContent = 'Analytics dashboard';
  }, null, 5.5)
  // Right hand moves to trackpad area
  .to(handRight, { x: -20, y: 20, duration: .5, ease: 'power2.out' }, 5.5);

// ── PARTICLE BURST — fires at go-live moment ──
function spawnParticles() {
  const rect = screenGlow.getBoundingClientRect();
  const cx = rect.left + rect.width  * 0.5;
  const cy = rect.top  + rect.height * 0.45;
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:350;overflow:hidden';
  document.body.appendChild(container);

  const count = 32;
  for(let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size    = Math.random() * 7 + 3;
    const isLime  = Math.random() > 0.35;
    const color   = isLime ? '#C8F135' : '#FAFAFA';
    const glowClr = isLime ? 'rgba(200,241,53,0.9)' : 'rgba(255,255,255,0.8)';
    p.style.cssText = [
      'position:absolute',
      `width:${size}px`,
      `height:${size}px`,
      `background:${color}`,
      'border-radius:50%',
      `left:${cx}px`,
      `top:${cy}px`,
      'transform:translate(-50%,-50%)',
      `box-shadow:0 0 ${size * 2}px ${glowClr}`,
    ].join(';');
    container.appendChild(p);

    const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.6;
    const dist  = Math.random() * 220 + 80;
    gsap.to(p, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      opacity: 0,
      scale: Math.random() * 0.4 + 0.1,
      duration: Math.random() * 0.7 + 0.5,
      ease: 'power2.out',
      delay: Math.random() * 0.18,
      onComplete: () => p.remove(),
    });
  }
  setTimeout(() => { try { container.remove(); } catch(e) {} }, 2200);
}

// ── ACT 6 (85–100%): GO LIVE ──
masterTL
  .call(() => {
    showState('live');
    labelText.textContent = 'Site is live ✓';
    // Fingertip glow — lime highlight on fingertips
    gsap.to(['#tip-l1','#tip-l2','#tip-l3','#tip-l4','#tip-r1','#tip-r2','#tip-r3','#tip-r4'], {
      attr: { fill: 'rgba(200,241,53,0.8)' },
      duration: .4, stagger: .05,
    });
    // Lime glow on screen
    gsap.to(screenGlow, {
      boxShadow: 'inset 0 0 60px rgba(200,241,53,.2), 0 0 80px rgba(200,241,53,.15)',
      duration: .6
    });
    // Hands lift slightly — done!
    gsap.to([handLeft, handRight], { y: -15, opacity: .6, duration: .8, ease: 'power2.out' });
    // Particle burst at the go-live moment
    spawnParticles();
    // Hint fades in — cue for user to click
    gsap.to('#laptopHint', { opacity: 1, duration: .8, delay: .4 });
  }, null, 6.8);

// ── SCRUB MASTER TIMELINE TO SCROLL ──
ScrollTrigger.create({
  trigger: '.content-col',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 2,
  onUpdate: self => {
    masterTL.progress(self.progress);
  }
});

// ── AMBIENT FLOAT — laptop breathes while idle ──
let floatTween = null;
function startFloat() {
  floatTween = gsap.to(scene, {
    y: -10,
    duration: 3.8,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    overwrite: false,
  });
}
startFloat();

// ── CONTENT SECTION ANIMATIONS ──
function animSection(id) {
  const el = document.querySelector(id);
  if(!el) return;
  const tl = gsap.timeline({ scrollTrigger: { trigger: id, start: 'top 72%' } });
  const label = el.querySelector('.s-label');
  const h = el.querySelector('h2');
  const bodies = el.querySelectorAll('.s-body');
  const stats = el.querySelector('.stat-row');
  const svc = el.querySelector('.svc-list');
  const proc = el.querySelector('.process-list');
  const price = el.querySelector('.price-grid');
  const fields = el.querySelectorAll('.form-field');

  if(label) tl.to(label, { opacity: 1, duration: .5 });
  if(h) tl.to(h, { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, '-=.2');
  if(bodies.length) tl.to(bodies, { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: .8, stagger: .1, ease: 'power3.out' }, '-=.4');
  if(stats) tl.to(stats, { opacity: 1, duration: .5 }, '-=.3');
  if(svc) tl.to(svc, { opacity: 1, duration: .4 }, '-=.3');
  if(proc) tl.to(proc, { opacity: 1, duration: .4 }, '-=.3');
  if(price) tl.to(price, { opacity: 1, duration: .4 }, '-=.3');
  if(fields.length) tl.to(fields, { opacity: 1, y: 0, duration: .35, stagger: .06 }, '-=.2');
}

['#s-hero','#s-about','#s-work','#s-services','#s-process','#s-pricing','#s-contact']
  .forEach(animSection);

// ── STAT COUNTERS ──
document.querySelectorAll('.stat-n').forEach(el => {
  const text = el.innerHTML;
  const match = text.match(/([\d.]+)/);
  if(!match) return;
  const target = parseFloat(match[1]);
  const suffix = el.innerHTML.replace(match[1], '');
  const obj = { val: 0 };
  ScrollTrigger.create({
    trigger: el, start: 'top 85%', once: true,
    onEnter: () => gsap.to(obj, {
      val: target, duration: 1.6, ease: 'power2.out',
      onUpdate: () => {
        el.innerHTML = (target >= 100 ? Math.round(obj.val).toString()
          : target < 10 ? obj.val.toFixed(1)
          : Math.round(obj.val).toString()) + suffix;
      }
    })
  });
});

// ── EMAILJS CONFIG ──
var EMAILJS_PUBLIC_KEY       = 'nP1zVzVIFALnWGFAD';
var EMAILJS_SERVICE_ID       = 'service_igi9jtq';
var EMAILJS_CONTACT_TEMPLATE = 'template_g6bcn2f';

window.addEventListener('load', function() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } else {
    console.warn('// EmailJS failed to load');
  }
});

// ── MARQUEE SPEED ON SCROLL (GSAP) ──
let lastY = 0;
const mInner = document.querySelector('.marquee-inner');
window.addEventListener('scroll', () => {
  const speed = Math.abs(window.scrollY - lastY);
  if(mInner) mInner.style.animationDuration = Math.max(8, 22 - speed * .4) + 's';
  lastY = window.scrollY;
}, { passive: true });

// ══════════════════════════════════════════
// MOTION (Framer Motion) VANILLA JS
// Spring physics + gesture micro-interactions
// Applied on top of GSAP scroll animations
// ══════════════════════════════════════════

// Wait for Motion to load
window.addEventListener('load', () => {
  if(typeof Motion === 'undefined') {
    console.warn('Motion not loaded — falling back to CSS transitions');
    return;
  }

  const { animate, spring, stagger, inView } = Motion;

  // ── SPRING CURSOR ──
  // Dot follows mouse instantly, ring follows with spring lag
  const cursorDot = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Dot: instant
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  // Ring follows with spring inertia using requestAnimationFrame
  let ringVX = 0, ringVY = 0;
  const SPRING_STIFFNESS = 0.12;
  const SPRING_DAMPING    = 0.78;

  function updateRing() {
    const dx = mouseX - ringX;
    const dy = mouseY - ringY;
    ringVX = ringVX * SPRING_DAMPING + dx * SPRING_STIFFNESS;
    ringVY = ringVY * SPRING_DAMPING + dy * SPRING_STIFFNESS;
    ringX += ringVX;
    ringY += ringVY;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(updateRing);
  }
  updateRing();

  // Cursor states
  document.querySelectorAll('a, button, .svc-item, .process-item, .price-card, .key').forEach(el => {
    el.addEventListener('mouseenter', () => {
      animate(cursorDot, { scale: 4, opacity: 0.4 },
        { type: spring, stiffness: 400, damping: 25 });
      animate(cursorRing, { scale: 0.4, opacity: 0 },
        { type: spring, stiffness: 300, damping: 20 });
    });
    el.addEventListener('mouseleave', () => {
      animate(cursorDot, { scale: 1, opacity: 1 },
        { type: spring, stiffness: 300, damping: 22 });
      animate(cursorRing, { scale: 1, opacity: 1 },
        { type: spring, stiffness: 300, damping: 22 });
    });
    el.addEventListener('mousedown', () => {
      animate(cursorDot, { scale: 0.7 },
        { type: spring, stiffness: 600, damping: 30 });
    });
    el.addEventListener('mouseup', () => {
      animate(cursorDot, { scale: 1 },
        { type: spring, stiffness: 400, damping: 20 });
    });
  });

  // ── SPRING NAV ──
  // Nav links spring on hover
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('mouseenter', () => {
      animate(link, { y: -2, color: '#FAFAFA' },
        { type: spring, stiffness: 500, damping: 28 });
    });
    link.addEventListener('mouseleave', () => {
      animate(link, { y: 0, color: 'rgba(255,255,255,0.4)' },
        { type: spring, stiffness: 400, damping: 30 });
    });
  });

  // CTA button — spring scale + glow
  const navCta = document.querySelector('.nav-cta');
  if(navCta) {
    navCta.addEventListener('mouseenter', () => {
      animate(navCta, { scale: 1.04, y: -1 },
        { type: spring, stiffness: 500, damping: 25 });
    });
    navCta.addEventListener('mouseleave', () => {
      animate(navCta, { scale: 1, y: 0 },
        { type: spring, stiffness: 400, damping: 28 });
    });
    navCta.addEventListener('mousedown', () => {
      animate(navCta, { scale: 0.96 },
        { type: spring, stiffness: 600, damping: 30 });
    });
    navCta.addEventListener('mouseup', () => {
      animate(navCta, { scale: 1.04 },
        { type: spring, stiffness: 400, damping: 20 });
    });
  }

  // ── MAGNETIC BUTTONS ──
  // Buttons magnetically attract cursor
  document.querySelectorAll('.btn-lime, .form-submit, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      animate(btn, { x: dx, y: dy },
        { type: spring, stiffness: 350, damping: 22 });
    });
    btn.addEventListener('mouseleave', () => {
      animate(btn, { x: 0, y: 0 },
        { type: spring, stiffness: 300, damping: 18, bounce: 0.35 });
    });
  });

  // ── SPRING CARD TILT ──
  // Service items and price cards tilt toward cursor
  document.querySelectorAll('.svc-item, .price-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      animate(card, {
        rotateX: -y * 6,
        rotateY:  x * 8,
        scale: 1.015,
        transformPerspective: 800
      }, { type: spring, stiffness: 300, damping: 28 });
    });
    card.addEventListener('mouseleave', () => {
      animate(card, { rotateX: 0, rotateY: 0, scale: 1 },
        { type: spring, stiffness: 250, damping: 24, bounce: 0.2 });
    });
  });

  // ── PROCESS ITEM SPRING REVEAL ──
  document.querySelectorAll('.process-item').forEach((item, i) => {
    item.addEventListener('mouseenter', () => {
      const num = item.querySelector('.p-num');
      if(num) animate(num, { scale: 1.1, rotate: 3 },
        { type: spring, stiffness: 500, damping: 25 });
    });
    item.addEventListener('mouseleave', () => {
      const num = item.querySelector('.p-num');
      if(num) animate(num, { scale: 1, rotate: 0 },
        { type: spring, stiffness: 400, damping: 28 });
    });
  });

  // ── SMOOTH SECTION LABEL REVEAL ──
  // Replace GSAP opacity-only with Motion spring slide
  document.querySelectorAll('.s-label').forEach(label => {
    inView(label, () => {
      animate(label,
        { opacity: [0, 1], x: [-20, 0] },
        { type: spring, stiffness: 200, damping: 24, delay: 0.1 }
      );
    }, { amount: 0.8 });
  });

  // ── HERO ENTRANCE — Motion orchestrated sequence ──
  // Runs once on page load — smooth spring cascade
  const heroSection = document.querySelector('#s-hero');
  if(heroSection) {
    const label  = heroSection.querySelector('.s-label');
    const h2     = heroSection.querySelector('h2');
    const body   = heroSection.querySelector('.s-body');
    const stats  = heroSection.querySelector('.stat-row');

    // Stagger in with springs
    if(label) animate(label, { opacity:[0,1], y:[16,0] },
      { type:spring, stiffness:200, damping:24, delay:0.3 });
    if(h2) animate(h2, { opacity:[0,1], y:[32,0] },
      { type:spring, stiffness:180, damping:22, delay:0.45 });
    if(body) animate(body, { opacity:[0,1] },
      { duration:0.7, delay:0.7 });
    if(stats) animate(stats, { opacity:[0,1], y:[12,0] },
      { type:spring, stiffness:200, damping:26, delay:0.85 });
  }

  // ── SPRING SCROLL REVEAL for remaining sections ──
  // Applied on top of GSAP — adds spring physics to the reveal
  document.querySelectorAll('.svc-item').forEach((item, i) => {
    inView(item, () => {
      animate(item,
        { opacity:[0,1], x:[-28,0] },
        { type:spring, stiffness:220, damping:26, delay: i * 0.07 }
      );
    }, { amount: 0.5, once: true });
  });

  document.querySelectorAll('.process-item').forEach((item, i) => {
    inView(item, () => {
      animate(item,
        { opacity:[0,1], x:[30,0] },
        { type:spring, stiffness:200, damping:24, delay: i * 0.09 }
      );
    }, { amount: 0.5, once: true });
  });

  document.querySelectorAll('.price-card').forEach((card, i) => {
    inView(card, () => {
      animate(card,
        { opacity:[0,1], y:[24,0], scale:[0.97,1] },
        { type:spring, stiffness:220, damping:26, delay: i * 0.1 }
      );
    }, { amount: 0.4, once: true });
  });

  document.querySelectorAll('.form-field').forEach((field, i) => {
    inView(field, () => {
      animate(field,
        { opacity:[0,1], y:[12,0] },
        { type:spring, stiffness:280, damping:28, delay: i * 0.06 }
      );
    }, { amount: 0.8, once: true });
  });

  // ── FORM INPUT SPRING FOCUS ──
  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
      animate(input.parentElement, { scale: 1.01 },
        { type:spring, stiffness:400, damping:28 });
    });
    input.addEventListener('blur', () => {
      animate(input.parentElement, { scale: 1 },
        { type:spring, stiffness:300, damping:24 });
    });
  });

  // ── FORM SUBMIT SPRING ──
  const submitBtn = document.getElementById('scSubmit') /* fixed */;
  if(submitBtn) {
    submitBtn.addEventListener('mousedown', () => {
      animate(submitBtn, { scale:0.97, y:1 },
        { type:spring, stiffness:600, damping:30 });
    });
    submitBtn.addEventListener('mouseup', () => {
      animate(submitBtn, { scale:1, y:0 },
        { type:spring, stiffness:400, damping:20, bounce:0.4 });
    });
  }

  // ── STATS SPRING ENTRANCE ──
  document.querySelectorAll('.stat-item').forEach((item, i) => {
    inView(item, () => {
      animate(item,
        { opacity:[0,1], y:[20,0] },
        { type:spring, stiffness:250, damping:24, delay: i * 0.12 }
      );
    }, { amount: 0.6, once: true });
  });

  // ── LAPTOP SCENE ENTRANCE ──
  // Spring float in when page loads
  const laptopScene = document.getElementById('laptopScene');
  if(laptopScene) {
    animate(laptopScene,
      { opacity:[0,1], y:[40,0] },
      { type:spring, stiffness:120, damping:20, delay:0.5 }
    );
  }

  // ── SCREEN LABEL SPRING ──
  const screenLabel = document.querySelector('.screen-label');
  if(screenLabel) {
    animate(screenLabel,
      { opacity:[0,1] },
      { duration:0.6, delay:1.2 }
    );
  }

  // ── FOOTER STAGGER ──
  document.querySelectorAll('.footer-links a').forEach((link, i) => {
    inView(link, () => {
      animate(link,
        { opacity:[0,1], x:[-10,0] },
        { type:spring, stiffness:300, damping:28, delay: i * 0.04 }
      );
    }, { amount: 0.8, once: true });
    link.addEventListener('mouseenter', () => {
      animate(link, { x: 4, color:'#C8F135' },
        { type:spring, stiffness:500, damping:28 });
    });
    link.addEventListener('mouseleave', () => {
      animate(link, { x: 0, color:'rgba(255,255,255,0.38)' },
        { type:spring, stiffness:400, damping:30 });
    });
  });

  // ── MARQUEE SPRING HOVER ──
  const marqueeWrap = document.querySelector('.marquee-wrap');
  if(marqueeWrap) {
    marqueeWrap.addEventListener('mouseenter', () => {
      animate(marqueeWrap, { scaleY: 1.04 },
        { type:spring, stiffness:400, damping:28 });
    });
    marqueeWrap.addEventListener('mouseleave', () => {
      animate(marqueeWrap, { scaleY: 1 },
        { type:spring, stiffness:300, damping:22 });
    });
  }

  // ── NAV DOT PULSE ──
  // Replace CSS animation with Motion spring pulse
  const navDot = document.querySelector('.nav-dot');
  if(navDot) {
    function pulseDot() {
      animate(navDot,
        { scale:[1, 1.5, 1], opacity:[1, 0.6, 1] },
        { duration:2.5, ease:'ease-in-out',
          onComplete: pulseDot }
      );
    }
    pulseDot();
  }

  // ── SMOOTH NAV SCROLL HIDE ──
  // Nav shrinks and becomes more opaque on scroll
  let lastScrollY = 0;
  const navEl = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const goingDown = currentY > lastScrollY && currentY > 80;
    animate(navEl,
      { y: goingDown ? -4 : 0, opacity: goingDown ? 0.85 : 1 },
      { type:spring, stiffness:200, damping:28 }
    );
    lastScrollY = currentY;
  }, { passive:true });

  console.log('Motion animations loaded — spring physics active');
});

// ══════════════════════════════════════════
// LAPTOP TAKEOVER — Cinematic zoom-through
// ══════════════════════════════════════════
(function() {

  const laptopColEl   = document.querySelector('.laptop-col');
  const laptopSceneEl = document.getElementById('laptopScene');
  const contentColEl  = document.querySelector('.content-col');
  const contactSection = document.getElementById('s-contact');

  if(!laptopColEl || !contactSection) return;
  if(window.innerWidth <= 1024) return;

  let triggered = false;

  // ── BUILD FULL-PAGE CONTACT OVERLAY ──
  const overlay = document.createElement('div');
  overlay.id = 'contact-overlay';
  overlay.innerHTML = `
    <div class="co-inner">
      <div class="co-left">
        <div class="co-eyebrow">Let's Work Together</div>
        <h2 class="co-headline">Start Your<br><em>Project.</em></h2>
        <p class="co-sub">Tell us about your business. We respond same day with a flat-rate proposal — no fluff, no obligation.</p>
        <div class="co-details">
          <div class="co-detail-item">
            <span class="co-detail-label">Phone / Text</span>
            <span class="co-detail-value">(252) 698-9543</span>
          </div>
          <div class="co-detail-item">
            <span class="co-detail-label">Email</span>
            <span class="co-detail-value">info@bqwebsolutions.com</span>
          </div>
          <div class="co-detail-item">
            <span class="co-detail-label">Hours</span>
            <span class="co-detail-value">Mon–Fri · 9am–6pm EST</span>
          </div>
        </div>
        <button class="co-back" id="coBack">← Back to site</button>
      </div>
      <div class="co-right">
        <div class="co-form" id="coForm">
          <div class="co-form-row">
            <div class="co-field">
              <label class="co-label" for="co-fname">First Name</label>
              <input class="co-input" type="text" id="co-fname" placeholder="John" autocomplete="given-name">
            </div>
            <div class="co-field">
              <label class="co-label" for="co-lname">Last Name</label>
              <input class="co-input" type="text" id="co-lname" placeholder="Smith" autocomplete="family-name">
            </div>
          </div>
          <div class="co-field">
            <label class="co-label" for="co-email">Email</label>
            <input class="co-input" type="email" id="co-email" placeholder="john@email.com" autocomplete="email">
          </div>
          <div class="co-field">
            <label class="co-label" for="co-btype">Business Type</label>
            <select class="co-input" id="co-btype">
              <option value="">Select your industry...</option>
              <option>Law Firm / Attorney</option>
              <option>Medical / Healthcare</option>
              <option>Restaurant / Food</option>
              <option>Real Estate</option>
              <option>Contractor / Trades</option>
              <option>Other</option>
            </select>
          </div>
          <div class="co-field">
            <label class="co-label" for="co-budget">Budget Range</label>
            <select class="co-input" id="co-budget">
              <option value="">Select a range...</option>
              <option>$497 — Starter (1 page)</option>
              <option>$797 — Standard (4 pages)</option>
              <option>Premium — Custom quote</option>
              <option>Not sure yet</option>
            </select>
          </div>
          <div class="co-field">
            <label class="co-label" for="co-msg">Tell Us About Your Project</label>
            <textarea class="co-input co-textarea" id="co-msg" placeholder="What does your business do and what do you need?"></textarea>
          </div>
          <button type="button" class="co-submit" id="coSubmit">Send Message →</button>
          <p class="co-disclaimer">We respond same day · Mon–Fri · No spam, ever</p>
        </div>
        <div class="co-success" id="coSuccess">
          <div class="co-success-icon">✓</div>
          <div class="co-success-title">Message Received.</div>
          <div class="co-success-sub">We will be in touch today.</div>
          <button class="co-back co-back-success" id="coBackSuccess">← Back to site</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // ── ZOOM-THROUGH ANIMATION ──
  function zoomThrough() {
    if(triggered) return;
    triggered = true;
    // Stop float so it doesn't wobble during the cinematic zoom
    if(typeof floatTween !== 'undefined' && floatTween) floatTween.kill();
    gsap.set('#laptopHint', { opacity: 0 });

    document.body.style.overflow = 'hidden';

    const r = laptopColEl.getBoundingClientRect();
    gsap.set(laptopColEl, {
      position: 'fixed',
      top: r.top, left: r.left,
      width: r.width, height: r.height,
      zIndex: 300,
      overflow: 'hidden',
    });

    const tl = gsap.timeline();

    tl.to(contentColEl, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
    tl.to('nav', { opacity: 0, duration: 0.25 }, 0);

    tl.to(laptopColEl, {
      top: 0, left: 0, width: '100vw', height: window.innerHeight + 'px',
      overflow: 'hidden',
      duration: 0.55, ease: 'power3.in',
    }, 0.1);
    tl.to(laptopSceneEl, {
      scale: 4,
      duration: 0.6, ease: 'power3.in',
    }, 0.1);

    tl.to('#screenGlow', {
      boxShadow: 'inset 0 0 200px rgba(200,241,53,1), 0 0 400px rgba(200,241,53,1)',
      duration: 0.3,
    }, 0.35);

    tl.to(laptopColEl, {
      backgroundColor: '#C8F135',
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
    }, 0.55);

    tl.call(() => {
      overlay.classList.add('active');
      gsap.from('.co-left > *', { opacity: 0, x: -30, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.1 });
      gsap.from('.co-field',    { opacity: 0, y: 16,  duration: 0.5, stagger: 0.07, ease: 'power3.out', delay: 0.2 });
      gsap.from('.co-submit',   { opacity: 0, y: 10,  duration: 0.5, ease: 'power2.out', delay: 0.7 });
    }, null, 0.75);
  }

  // ── CLOSE OVERLAY ──
  function closeOverlay() {
    gsap.to(overlay, {
      opacity: 0, duration: 0.4, ease: 'power2.in',
      onComplete: () => {
        overlay.classList.remove('active');
        gsap.set(overlay, { opacity: 1 });
        gsap.set(laptopColEl, { clearProps: 'all' });
        gsap.set(laptopSceneEl, { clearProps: 'all' });
        document.body.style.overflow = '';
        gsap.to(contentColEl, { opacity: 1, duration: 0.6, ease: 'power2.out' });
        gsap.to('nav', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        // Restore hint so user can click again
        gsap.to('#laptopHint', { opacity: 1, duration: 0.5, delay: 0.4 });
        // Restart ambient float (killed by zoom's clearProps)
        if(typeof startFloat === 'function') startFloat();
      }
    });
  }

  // ── SCROLL TRIGGER ──
  // Fires zoom when user scrolls to the contact section.
  // On refresh: only fires if the section top is still inside the viewport
  // (blocks auto-zoom when the browser restores a scroll position past the section).
  let scrolledByUser = false;
  window.addEventListener('scroll', () => { scrolledByUser = true; }, { once: true, passive: true });

  ScrollTrigger.create({
    trigger: '#s-contact',
    start: 'top 50%',
    onEnter: () => {
      if (!scrolledByUser) {
        // Page just loaded — only zoom if section top is still in the viewport
        if (contactSection.getBoundingClientRect().top < 0) return;
      }
      setTimeout(zoomThrough, 100);
    },
  });

  // ── CLICK LAPTOP TO OPEN CONTACT ──
  laptopColEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if(overlay.classList.contains('active')) return;
    if(!triggered) {
      // Zoom hasn't played yet — run the full cinematic zoom
      zoomThrough();
    } else {
      // Scroll already triggered the zoom; open overlay directly
      gsap.set('#laptopHint', { opacity: 0 });
      document.body.style.overflow = 'hidden';
      overlay.classList.add('active');
      gsap.from('.co-left > *', { opacity: 0, x: -30, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.1 });
      gsap.from('.co-field',    { opacity: 0, y: 16,  duration: 0.5, stagger: 0.07, ease: 'power3.out', delay: 0.2 });
      gsap.from('.co-submit',   { opacity: 0, y: 10,  duration: 0.5, ease: 'power2.out', delay: 0.7 });
    }
  });
  laptopColEl.addEventListener('mouseenter', () => cursor.classList.add('big'));
  laptopColEl.addEventListener('mouseleave', () => cursor.classList.remove('big'));

  // ── BACK BUTTONS & ESC ──
  document.getElementById('coBack').addEventListener('click', closeOverlay);
  document.getElementById('coBackSuccess').addEventListener('click', closeOverlay);
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && overlay.classList.contains('active')) closeOverlay();
  });

  // ── FORM SUBMIT ──
  document.getElementById('coSubmit').addEventListener('click', function() {
    const fname = document.getElementById('co-fname').value.trim();
    const email = document.getElementById('co-email').value.trim();

    if(!fname || !email) {
      gsap.to(this, { x: -7, duration: .07, yoyo: true, repeat: 5 });
      if(!fname) { const f = document.getElementById('co-fname'); f.style.borderColor='rgba(255,80,80,.7)'; setTimeout(()=>f.style.borderColor='',2000); }
      if(!email) { const f = document.getElementById('co-email'); f.style.borderColor='rgba(255,80,80,.7)'; setTimeout(()=>f.style.borderColor='',2000); }
      return;
    }

    const lname   = document.getElementById('co-lname').value.trim();
    const btype   = document.getElementById('co-btype').value.trim();
    const budget  = document.getElementById('co-budget').value.trim();
    const message = document.getElementById('co-msg').value.trim();

    const btn = this;
    btn.disabled = true;
    btn.textContent = '// Sending...';

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE, {
      from_name:  fname + (lname ? ' ' + lname : ''),
      from_email: email,
      subject:    btype   || 'General Inquiry',
      message:    message + (budget ? '\n\nBudget: ' + budget : ''),
      to_email:   'info@bqwebsolutions.com',
      reply_to:   email,
    }).then(function() {
      gsap.to('#coForm', {
        opacity: 0, y: -12, duration: 0.35,
        onComplete: () => {
          document.getElementById('coForm').style.display = 'none';
          document.getElementById('coSuccess').classList.add('visible');
        }
      });
    }).catch(function(err) {
      console.error('EmailJS error:', err);
      alert('Something went wrong. Please try again or email us directly.');
      btn.disabled = false;
      btn.textContent = 'Send Message →';
    });
  });

})();

// ── MOBILE CONTACT FORM ──
(function() {
  const btn = document.getElementById('cmSubmit');
  if(!btn) return;
  btn.addEventListener('click', function() {
    const fname = document.getElementById('cm-fname').value.trim();
    const email = document.getElementById('cm-email').value.trim();
    if(!fname || !email) {
      gsap.to(btn, { x: -7, duration: .07, yoyo: true, repeat: 5 });
      if(!fname) { const f = document.getElementById('cm-fname'); f.style.borderColor='rgba(255,80,80,.7)'; setTimeout(()=>f.style.borderColor='',2000); }
      if(!email) { const f = document.getElementById('cm-email'); f.style.borderColor='rgba(255,80,80,.7)'; setTimeout(()=>f.style.borderColor='',2000); }
      return;
    }
    const lname   = document.getElementById('cm-lname').value.trim();
    const btype   = document.getElementById('cm-btype').value.trim();
    const budget  = document.getElementById('cm-budget').value.trim();
    const message = document.getElementById('cm-msg').value.trim();
    const self = this;
    self.disabled = true;
    self.textContent = '// Sending...';
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE, {
      from_name:  fname + (lname ? ' ' + lname : ''),
      from_email: email,
      subject:    btype   || 'General Inquiry',
      message:    message + (budget ? '\n\nBudget: ' + budget : ''),
      to_email:   'info@bqwebsolutions.com',
      reply_to:   email,
    }).then(function() {
      gsap.to('#coFormMobile', {
        opacity: 0, y: -12, duration: 0.35,
        onComplete: () => {
          document.getElementById('coFormMobile').style.display = 'none';
          document.getElementById('cmSuccess').classList.add('visible');
        }
      });
    }).catch(function(err) {
      console.error('EmailJS error:', err);
      alert('Something went wrong. Please try again or email us directly.');
      self.disabled = false;
      self.textContent = 'Send Message →';
    });
  });
})();

// ── MOBILE TOUCH GLITCH CURSOR ──
(function() {
  if(!('ontouchstart' in window)) return;
  const dot = document.getElementById('cursor');
  if(!dot) return;

  let tl = null;

  document.addEventListener('touchstart', function(e) {
    const t = e.touches[0];
    if(tl) tl.kill();

    // ── Green particle burst at tap point ──
    const cx = t.clientX, cy = t.clientY;
    const count = 14;
    for(let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 6 + 3;
      p.style.cssText = [
        'position:fixed',
        `width:${size}px`,
        `height:${size}px`,
        'background:#C8F135',
        'border-radius:50%',
        `left:${cx}px`,
        `top:${cy}px`,
        'transform:translate(-50%,-50%)',
        'pointer-events:none',
        `box-shadow:0 0 ${size * 2}px rgba(200,241,53,0.9)`,
        'z-index:9999',
      ].join(';');
      document.body.appendChild(p);
      const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.8;
      const dist  = Math.random() * 55 + 20;
      gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: Math.random() * 0.3 + 0.1,
        duration: Math.random() * 0.35 + 0.3,
        ease: 'power2.out',
        delay: Math.random() * 0.06,
        onComplete: () => p.remove(),
      });
    }

    // Snap to touch point, reset any prior glitch state
    gsap.set(dot, {
      left: t.clientX, top: t.clientY,
      x: 0, y: 0, scale: 1,
      opacity: 1, boxShadow: 'none',
    });

    tl = gsap.timeline()
      // Burst outward
      .to(dot, { scale: 4.5, duration: .07, ease: 'power3.out' })
      // Chromatic glitch frames
      .to(dot, { scale: .7, x: 9,  y: -5, duration: .05 })
      .to(dot, { scale: 2.8, x: -7, y:  4, boxShadow: '6px 0 0 #ff0044,-6px 0 0 #00ffff', duration: .06 })
      .to(dot, { scale: .9, x:  6,  y: -3, boxShadow: '-4px 0 0 #ff0044, 4px 0 0 #00ffff', duration: .05 })
      .to(dot, { scale: 2,  x:  0,  y:  0, boxShadow: 'none', duration: .07 })
      .to(dot, { scale: 1.1, x: -4, y:  3, duration: .06, delay: .06 })
      .to(dot, { scale: 1.4, x:  3, y: -1, duration: .05 })
      .to(dot, { scale: 1,  x:  0,  y:  0, duration: .1  })
      // Fade out — total ~1.5s
      .to(dot, { opacity: 0, scale: .2, duration: .35, delay: .65, ease: 'power2.in' });
  }, { passive: true });
})();

// ── DESKTOP CLICK PARTICLES ──
(function() {
  if('ontouchstart' in window) return; // mobile handled separately
  document.addEventListener('click', function(e) {
    const cx = e.clientX, cy = e.clientY;
    const count = 14;
    for(let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 6 + 3;
      p.style.cssText = [
        'position:fixed',
        `width:${size}px`,
        `height:${size}px`,
        'background:#C8F135',
        'border-radius:50%',
        `left:${cx}px`,
        `top:${cy}px`,
        'transform:translate(-50%,-50%)',
        'pointer-events:none',
        `box-shadow:0 0 ${size * 2}px rgba(200,241,53,0.9)`,
        'z-index:9999',
      ].join(';');
      document.body.appendChild(p);
      const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.8;
      const dist  = Math.random() * 55 + 20;
      gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: Math.random() * 0.3 + 0.1,
        duration: Math.random() * 0.35 + 0.3,
        ease: 'power2.out',
        delay: Math.random() * 0.06,
        onComplete: () => p.remove(),
      });
    }
  });
})();

// ── BACK TO TOP BUTTON ──
(function() {
  const btn = document.getElementById('back-to-top');
  if(!btn) return;

  // Show after scrolling past hero (~100vh)
  window.addEventListener('scroll', () => {
    const past = window.scrollY > window.innerHeight * 0.8;
    btn.classList.toggle('visible', past);
  }, { passive: true });

  // Click — smooth scroll to top
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Spring scale on hover via Motion if available
  btn.addEventListener('mouseenter', () => {
    if(typeof Motion !== 'undefined') {
      Motion.animate(btn, { scale: 1.12 },
        { type: Motion.spring, stiffness: 500, damping: 25 });
    }
  });
  btn.addEventListener('mouseleave', () => {
    if(typeof Motion !== 'undefined') {
      Motion.animate(btn, { scale: 1 },
        { type: Motion.spring, stiffness: 400, damping: 28 });
    }
  });
})();