// ── HOME: PARALLAX PHOTO BANDS ───────────────────────────────────────────────
(function () {
  if (window.matchMedia('(max-width: 700px)').matches) return;

  const topBand    = document.querySelector('.photo-band--top');
  const bottomBand = document.querySelector('.photo-band--bottom');
  if (!topBand && !bottomBand) return;

  const FACTOR = 0.22;

  function onScroll() {
    const scrollY = window.scrollY;

    if (topBand) {
      // Image starts at top; drifts up slower than the scroll
      topBand.style.backgroundPositionY = `${-scrollY * FACTOR}px`;
    }

    if (bottomBand) {
      // Image starts at bottom; rises slightly as user scrolls down to it
      bottomBand.style.backgroundPositionY = `calc(100% - ${scrollY * 0.1}px)`;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── WRITINGS: PARALLAX OCEAN BACKGROUND ──────────────────────────────────────
(function () {
  if (window.matchMedia('(max-width: 700px)').matches) return;

  const page = document.querySelector('.page-writings');
  if (!page) return;

  const FACTOR = 0.3;

  function onScroll() {
    page.style.backgroundPositionY = `${-window.scrollY * FACTOR}px`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── EXPLORING: PARALLAX PHOTO CELLS ──────────────────────────────────────────
(function () {
  if (window.matchMedia('(max-width: 700px)').matches) return;

  const photoCells = document.querySelectorAll('.explore-cell--photo');
  if (!photoCells.length) return;

  // Fractional y base positions matching nth-child mosaic CSS (cells 1,3,5,7,9)
  const baseYFrac = [0, 0, 0.5, 1, 1];
  const FACTOR = 0.08;

  function onScroll() {
    const scrollY = window.scrollY;
    photoCells.forEach((cell, i) => {
      const cellH  = cell.offsetHeight || 300;
      const imgH   = cellH * 3; // background-size: 300%
      const initial = (cellH - imgH) * baseYFrac[i]; // pixel start position
      const newY   = initial - scrollY * FACTOR;
      // clamp so image never exposes background-color at top or bottom
      const clamped = Math.min(0, Math.max(cellH - imgH, newY));
      cell.style.backgroundPositionY = `${clamped}px`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── STAGGERED CARD ANIMATIONS ────────────────────────────────────────────────
(function () {
  const cards = document.querySelectorAll('.card-animate');
  if (!cards.length) return;

  cards.forEach((card, i) => card.style.setProperty('--i', i));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  cards.forEach(card => observer.observe(card));
})();

// ── NAV: mark active page ────────────────────────────────────────────────────
(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
})();

// ── AUDIO GREETING ───────────────────────────────────────────────────────────
const LANG_LABELS = {
  english:    'English',
  portuguese: 'Portuguese',
  spanish:    'Spanish',
  punjabi:    'Panjabi',
  hindi:      'Hindi',
};

/*
  TO INTEGRATE 11LABS:
  Replace this function with a fetch() to your serverless function that calls
  the ElevenLabs TTS API and returns an audio blob/URL.

  Example when you're ready:
    async function fetchGreeting(lang) {
      const res = await fetch('/api/greet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      });
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
*/
async function fetchGreeting(lang) {
  // Placeholder: returns null until 11labs is wired up
  return null;
}

(function () {
  const langBtns = document.querySelectorAll('.lang-btn');
  if (!langBtns.length) return;

  const player    = document.getElementById('audioPlayer');
  const audioEl   = document.getElementById('audioEl');
  const playBtn   = document.getElementById('playPauseBtn');
  const playIcon  = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const langLabel = document.getElementById('audioLangLabel');
  const statusEl  = document.getElementById('audioStatus');

  let activeLang  = null;
  let audioUrl    = null;

  function setPlayState(playing) {
    playIcon.style.display  = playing ? 'none' : '';
    pauseIcon.style.display = playing ? '' : 'none';
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  audioEl.addEventListener('play',  () => setPlayState(true));
  audioEl.addEventListener('pause', () => setPlayState(false));
  audioEl.addEventListener('ended', () => { setPlayState(false); setStatus('Finished'); });

  playBtn.addEventListener('click', () => {
    if (!audioUrl) return;
    if (audioEl.paused) {
      audioEl.play();
    } else {
      audioEl.pause();
    }
  });

  langBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.lang;

      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      langLabel.textContent = LANG_LABELS[lang] || lang;
      setStatus('Loading…');
      player.classList.add('visible');
      setPlayState(false);

      audioEl.pause();
      audioEl.src = '';
      audioUrl = null;

      if (lang === activeLang && audioUrl) {
        audioEl.play();
        return;
      }

      activeLang = lang;

      const url = await fetchGreeting(lang);

      if (!url) {
        // Placeholder state until 11labs is connected
        setStatus('Audio coming soon');
        return;
      }

      audioUrl = url;
      audioEl.src = url;
      audioEl.play();
    });
  });
})();

// ── ACCORDION ────────────────────────────────────────────────────────────────
(function () {
  const trigger = document.getElementById('accordionTrigger');
  const body    = document.getElementById('accordionBody');
  if (!trigger || !body) return;

  trigger.addEventListener('click', () => {
    const open = body.classList.toggle('open');
    trigger.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', String(open));
  });
})();

// ── CONTACT FORM ─────────────────────────────────────────────────────────────
(function () {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.submit-btn');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (res.ok) {
        form.reset();
        success.style.display = 'block';
        btn.textContent = 'Sent!';
      } else {
        btn.textContent = 'Send message';
        btn.disabled = false;
        alert('Something went wrong. Please email me directly.');
      }
    } catch {
      btn.textContent = 'Send message';
      btn.disabled = false;
      alert('Something went wrong. Please email me directly.');
    }
  });
})();
