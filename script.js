/* ============================================================
   Udit Bisen — Portfolio interactions
   Vanilla JS, rAF-throttled, no layout thrash
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Lucide icons ---------- */
  function icons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
  icons();
  // Retry once in case the CDN script lands after this file.
  window.addEventListener('load', icons);

  /* ============================================================
     1. SMOOTH SCROLL
     ============================================================ */
  const NAV_OFFSET = 84;

  function smoothTo(targetY) {
    const y = Math.max(0, Math.min(targetY, document.body.scrollHeight - window.innerHeight));
    window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  document.querySelectorAll('[data-scroll]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobileMenu();
      const top = target.getBoundingClientRect().top + window.pageYOffset - (id === '#hero' ? 0 : NAV_OFFSET);
      smoothTo(top);
      history.replaceState(null, '', id);
    });
  });

  const viewWorkBtn = document.getElementById('viewWorkBtn');
  if (viewWorkBtn) {
    viewWorkBtn.addEventListener('click', () => {
      const target = document.getElementById('work');
      if (!target) return;
      smoothTo(target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET);
    });
  }

  /* ============================================================
     2. NAV / PROGRESS / BACK TO TOP  (single rAF scroll handler)
     ============================================================ */
  const nav = document.getElementById('nav');
  const progressBar = document.getElementById('progressBar');
  const toTop = document.getElementById('toTop');
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  const timelineFill = document.getElementById('timelineFill');
  const timeline = document.getElementById('timeline');

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.pageYOffset;
      const docH = document.documentElement.scrollHeight - window.innerHeight;

      if (nav) nav.classList.toggle('scrolled', y > 24);
      if (progressBar) progressBar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
      if (toTop) toTop.classList.toggle('show', y > 520);

      // Active nav link
      const probe = y + NAV_OFFSET + 60;
      let current = '';
      sections.forEach((s) => {
        if (s.offsetTop <= probe) current = s.id;
      });
      navLinks.forEach((a) => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });

      // Timeline fill
      if (timeline && timelineFill) {
        const r = timeline.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = r.height;
        const passed = Math.min(total, Math.max(0, vh * 0.72 - r.top));
        timelineFill.style.height = total > 0 ? (passed / total) * 100 + '%' : '0%';
      }

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () => smoothTo(0));
  }

  /* ============================================================
     3. MOBILE MENU
     ============================================================ */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
      icons();
    });
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('open') &&
          !mobileMenu.contains(e.target) && !navToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  /* ============================================================
     4. TYPING EFFECT
     ============================================================ */
  const typingEl = document.getElementById('typingText');
  const SKILLS = ['Power BI', 'SQL', 'Market Research', 'Dashboard Design', 'Data Storytelling'];
  let sIdx = 0, cIdx = 0, deleting = false;

  function typeLoop() {
    if (!typingEl) return;
    const word = SKILLS[sIdx];

    if (!deleting) {
      cIdx++;
      typingEl.textContent = word.slice(0, cIdx);
      if (cIdx === word.length) {
        deleting = true;
        return setTimeout(typeLoop, 1500);
      }
      return setTimeout(typeLoop, 78);
    }

    cIdx--;
    typingEl.textContent = word.slice(0, cIdx);
    if (cIdx === 0) {
      deleting = false;
      sIdx = (sIdx + 1) % SKILLS.length;
      return setTimeout(typeLoop, 320);
    }
    return setTimeout(typeLoop, 38);
  }

  if (typingEl) {
    if (reduceMotion) {
      typingEl.textContent = SKILLS[0];
    } else {
      setTimeout(typeLoop, 900);
    }
  }

  /* ============================================================
     5. REVEAL ON SCROLL + STAGGER
     ============================================================ */
  // Give each chip a stagger index inside its list
  document.querySelectorAll('[data-stagger]').forEach((list) => {
    Array.from(list.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
    });
  });

  const revealEls = document.querySelectorAll('.reveal, .chips');

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('in'), delay);
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // Bars in the dashboard chart need an index for stagger
  document.querySelectorAll('.chart .bar').forEach((bar, i) => {
    const fill = bar.querySelector('.bar-fill');
    if (fill) fill.style.setProperty('--i', i);
  });

  /* ============================================================
     6. COUNT-UP NUMBERS
     ============================================================ */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();

    if (reduceMotion) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }

    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        co.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  /* ============================================================
     7. MAGNETIC BUTTONS
     ============================================================ */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = 0.28;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.style.animationPlayState = 'paused';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.animationPlayState = '';
      });
    });
  }

  /* ============================================================
     8. CURSOR GLOW + CARD SPOTLIGHT
     ============================================================ */
  const glow = document.getElementById('cursorGlow');

  if (glow && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    let cx = gx, cy = gy, raf = null;

    function loop() {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = (Math.abs(gx - cx) > 0.4 || Math.abs(gy - cy) > 0.4) ? requestAnimationFrame(loop) : null;
    }

    document.addEventListener('mousemove', (e) => {
      gx = e.clientX; gy = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  } else if (glow) {
    glow.style.display = 'none';
  }

  document.querySelectorAll('.matrix-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });

  /* ============================================================
     9. 3D TILT
     ============================================================ */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ============================================================
     10. COPY EMAIL
     ============================================================ */
  const copyBtn = document.getElementById('copyEmailBtn');
  const copyToast = document.getElementById('copyToast');
  const EMAIL = 'udit0695@gmail.com';

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      let ok = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(EMAIL);
          ok = true;
        }
      } catch (err) { ok = false; }

      if (!ok) {
        const ta = document.createElement('textarea');
        ta.value = EMAIL;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); ok = true; } catch (err) { ok = false; }
        document.body.removeChild(ta);
      }

      if (copyToast) {
        copyToast.textContent = ok ? 'Email copied to clipboard ✓' : 'Copy failed — email: ' + EMAIL;
        copyToast.classList.add('show');
        clearTimeout(copyToast._t);
        copyToast._t = setTimeout(() => copyToast.classList.remove('show'), 2400);
      }
    });
  }

  /* ============================================================
     11. DASHBOARD SIDE TABS (cosmetic micro-interaction)
     ============================================================ */
  document.querySelectorAll('.side-item').forEach((item) => {
    item.addEventListener('click', () => {
      item.parentElement.querySelectorAll('.side-item').forEach((s) => s.classList.remove('active'));
      item.classList.add('active');
    });
  });

  /* ============================================================
     12. YEAR
     ============================================================ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
