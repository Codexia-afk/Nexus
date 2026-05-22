/* ============================================
   NEXUS — Main Script
   Cursor · Nav · Carousel · Scroll Animations
   Stats Counter · Pricing Toggle · OAuth
   ============================================ */

'use strict';

// ============================================
// CUSTOM CURSOR
// ============================================
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
  cursor.style.opacity = '0';
  cursorTrail.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  cursor.style.opacity = '1';
  cursorTrail.style.opacity = '1';
});

// ============================================
// NAVIGATION — Scroll + Mobile
// ============================================
const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}, { passive: true });

hamburger.addEventListener('click', () => {
  navMobile.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (navMobile.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close mobile nav on link click
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity = '';
    });
  });
});

// ============================================
// SCROLL REVEAL
// ============================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Animate intel bars when visible
      const fills = entry.target.querySelectorAll('.ib-fill');
      fills.forEach(fill => {
        const width = fill.style.width;
        fill.style.width = '0';
        setTimeout(() => { fill.style.width = width; }, 100);
      });
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ============================================
// STATS COUNTER ANIMATION
// ============================================
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);

    if (target >= 1000) {
      el.textContent = prefix + current.toLocaleString() + suffix;
    } else {
      el.textContent = prefix + current + suffix;
    }

    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = prefix + target.toLocaleString() + suffix;
  }

  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => statsObserver.observe(el));

// ============================================
// TESTIMONIAL CAROUSEL
// ============================================
const track = document.getElementById('tcTrack');
const prevBtn = document.getElementById('tcPrev');
const nextBtn = document.getElementById('tcNext');
const dotsContainer = document.getElementById('tcDots');

let currentSlide = 0;
let autoplayTimer;
const cards = track.querySelectorAll('.testimonial-card');
const totalSlides = cards.length;

// Determine visible cards based on viewport
function getVisibleCount() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

// Build dots
function buildDots() {
  dotsContainer.innerHTML = '';
  const visible = getVisibleCount();
  const dotCount = Math.ceil(totalSlides / visible);
  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement('button');
    dot.className = 'tc-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

function updateDots() {
  const visible = getVisibleCount();
  const dotIndex = Math.floor(currentSlide / visible);
  dotsContainer.querySelectorAll('.tc-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === dotIndex);
  });
}

function goToSlide(index) {
  const visible = getVisibleCount();
  const maxSlide = Math.max(0, totalSlides - visible);
  currentSlide = Math.min(index * visible, maxSlide);
  const cardWidth = cards[0].offsetWidth + 24; // gap
  track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
  updateDots();
  resetAutoplay();
}

function nextSlide() {
  const visible = getVisibleCount();
  const maxSlide = Math.max(0, totalSlides - visible);
  if (currentSlide >= maxSlide) {
    currentSlide = 0;
  } else {
    currentSlide = Math.min(currentSlide + 1, maxSlide);
  }
  const cardWidth = cards[0].offsetWidth + 24;
  track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
  updateDots();
}

function prevSlide() {
  const visible = getVisibleCount();
  const maxSlide = Math.max(0, totalSlides - visible);
  if (currentSlide <= 0) {
    currentSlide = maxSlide;
  } else {
    currentSlide = Math.max(currentSlide - 1, 0);
  }
  const cardWidth = cards[0].offsetWidth + 24;
  track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
  updateDots();
}

function resetAutoplay() {
  clearInterval(autoplayTimer);
  autoplayTimer = setInterval(nextSlide, 4500);
}

prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });

// Touch/swipe support
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) nextSlide();
    else prevSlide();
    resetAutoplay();
  }
});

// Pause on hover
track.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
track.addEventListener('mouseleave', resetAutoplay);

// Init
buildDots();
resetAutoplay();

// Rebuild on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    currentSlide = 0;
    track.style.transform = 'translateX(0)';
    buildDots();
  }, 200);
});

// ============================================
// PRICING TOGGLE
// ============================================
const pricingToggle = document.getElementById('pricingToggle');
let isAnnual = false;

pricingToggle.addEventListener('click', () => {
  isAnnual = !isAnnual;
  pricingToggle.classList.toggle('active', isAnnual);
  pricingToggle.setAttribute('aria-checked', isAnnual);

  document.querySelectorAll('.pc-amount[data-monthly]').forEach(el => {
    const monthly = el.dataset.monthly;
    const annual = el.dataset.annual;
    const target = isAnnual ? parseInt(annual) : parseInt(monthly);

    // Animate price change
    el.style.transform = 'translateY(-8px)';
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = target;
      el.style.transform = 'translateY(8px)';
      setTimeout(() => {
        el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      }, 50);
    }, 150);
  });

  // Update toggle labels
  document.getElementById('toggleMonthly').style.color = isAnnual ? 'var(--text-muted)' : 'var(--text-primary)';
  document.getElementById('toggleAnnual').style.color = isAnnual ? 'var(--text-primary)' : 'var(--text-muted)';
});

// ============================================
// GOOGLE OAUTH MODAL
// ============================================
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const googleSignInBtn = document.getElementById('googleSignInBtn');

function handleGoogleSignIn() {
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Close modal
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Google OAuth Sign-In
googleSignInBtn.addEventListener('click', () => {
  // Google OAuth 2.0 configuration
  const CLIENT_ID = '73627502647-ampj1lp65j99o2h9kso5s9prgrv4kr6l.apps.googleusercontent.com'; // Replace with real Client ID
  const REDIRECT_URI = window.location.origin + '/saas/dashboard.html';
  const SCOPE = [
    'openid',
    'email',
    'profile'
  ].join(' ');

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'token id_token',
    scope: SCOPE,
    include_granted_scopes: 'true',
    nonce: generateNonce(),
    state: generateState(),
    prompt: 'select_account'
  });

  // Store state for CSRF protection
  sessionStorage.setItem('oauth_state', params.get('state'));

  // For demo: simulate OAuth with mock data
  if (CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
    simulateOAuthFlow();
    return;
  }

  // Real OAuth redirect
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
});

function generateNonce() {
  const array = new Uint32Array(4);
  crypto.getRandomValues(array);
  return Array.from(array, n => n.toString(16)).join('');
}

function generateState() {
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);
  return Array.from(array, n => n.toString(16)).join('');
}

// Demo simulation — creates mock user and redirects to dashboard
function simulateOAuthFlow() {
  googleSignInBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="animation: spin 0.8s linear infinite">
      <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.2)" stroke-width="3"/>
      <path d="M12 2a10 10 0 0110 10" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
    </svg>
    Signing you in...
  `;
  googleSignInBtn.disabled = true;

  // Add spin animation
  const style = document.createElement('style');
  style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
  document.head.appendChild(style);

  // Mock user profile
  const mockUser = {
    id: 'usr_' + Math.random().toString(36).substr(2, 9),
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    picture: 'https://i.pravatar.cc/96?img=12',
    given_name: 'Alex',
    family_name: 'Morgan',
    locale: 'en',
    verified_email: true,
    hd: 'example.com',
    granted_scopes: ['openid', 'email', 'profile'],
    token_type: 'Bearer',
    expires_in: 3599,
    issued_at: new Date().toISOString(),
    provider: 'google',
    auth_method: 'OAuth 2.0',
    session_id: 'sess_' + generateNonce().substr(0, 12)
  };

  // Securely store in sessionStorage (cleared on tab close)
  sessionStorage.setItem('nexus_user', JSON.stringify(mockUser));
  sessionStorage.setItem('nexus_auth_time', Date.now().toString());

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1400);
}

// ============================================
// HERO DASHBOARD PREVIEW — Animated bars
// ============================================
function animatePreviewBars() {
  const bars = document.querySelectorAll('.chart-bar');
  bars.forEach(bar => {
    const targetHeight = bar.style.height;
    bar.style.height = '0%';
    setTimeout(() => {
      bar.style.transition = 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      bar.style.height = targetHeight;
    }, 300 + Math.random() * 400);
  });
}

// Run after page load
window.addEventListener('load', () => {
  animatePreviewBars();

  // Trigger hero reveals immediately
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 100);
  });
});

// ============================================
// SMOOTH SCROLL for anchor links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============================================
// PARALLAX — subtle hero grid movement
// ============================================
const heroGrid = document.querySelector('.hero-grid-bg');
if (heroGrid) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    heroGrid.style.transform = `translateY(${scrolled * 0.3}px)`;
  }, { passive: true });
}

// ============================================
// EXPOSE handleGoogleSignIn globally
// ============================================
window.handleGoogleSignIn = handleGoogleSignIn;