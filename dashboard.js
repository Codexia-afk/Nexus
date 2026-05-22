/* ============================================
   NEXUS — Dashboard Script
   Auth Guard · Profile · Permissions · Activity
   Session · Security · Integrations
   ============================================ */

'use strict';

// ============================================
// AUTH GUARD — Verify session on load
// ============================================
const authGuard = document.getElementById('authGuard');

function checkAuth() {
  const userData = sessionStorage.getItem('nexus_user');
  const authTime = sessionStorage.getItem('nexus_auth_time');

  if (!userData) {
    // No session — redirect to landing
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
    return null;
  }

  // Check session age (1 hour max)
  const elapsed = Date.now() - parseInt(authTime || '0');
  if (elapsed > 3600000) {
    sessionStorage.clear();
    window.location.href = 'index.html';
    return null;
  }

  try {
    return JSON.parse(userData);
  } catch {
    sessionStorage.clear();
    window.location.href = 'index.html';
    return null;
  }
}

// ============================================
// INITIALIZE DASHBOARD
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  // Small delay for auth guard animation
  setTimeout(() => {
    const user = checkAuth();
    if (!user) return;

    // Hide auth guard
    authGuard.classList.add('hidden');
    setTimeout(() => authGuard.remove(), 400);

    // Populate all sections
    populateNav(user);
    populateOverview(user);
    populateProfile(user);
    populatePermissions(user);
    populateActivity(user);
    populateSecurity(user);
    populateIntegrations();

    // Init navigation
    initNavigation();
    initSidebar();
    initSignOut();
    initExport(user);
    initFilterBtns();

  }, 900);
});

// ============================================
// POPULATE NAV / SIDEBAR USER
// ============================================
function populateNav(user) {
  document.getElementById('suName').textContent = user.given_name || user.name;
  document.getElementById('suEmail').textContent = user.email;
  document.getElementById('suAvatarImg').src = user.picture;
  document.getElementById('topbarAvatarImg').src = user.picture;
  document.getElementById('greetName').textContent = user.given_name || user.name.split(' ')[0];
}

// ============================================
// OVERVIEW PAGE
// ============================================
function populateOverview(user) {
  // KPI values
  animateKPI('kpiProjects', 12);
  animateKPI('kpiTeam', 24);
  animateKPI('kpiTasks', 187);
  animateKPI('kpiVelocity', 94);

  // Activity feed
  const activities = [
    { icon: '🔐', color: 'var(--blue-glow)', title: 'Signed in via Google OAuth', time: 'Just now' },
    { icon: '✅', color: 'var(--green-glow)', title: 'Task "API Integration" marked complete', time: '2 min ago' },
    { icon: '💬', color: 'var(--orange-glow)', title: 'New comment on "Q3 Roadmap"', time: '14 min ago' },
    { icon: '🔗', color: 'var(--purple-glow)', title: 'GitHub integration synced', time: '1 hr ago' },
    { icon: '📊', color: 'var(--blue-glow)', title: 'Sprint report generated', time: '3 hrs ago' },
    { icon: '👤', color: 'var(--green-glow)', title: 'Team member "Jordan Lee" joined', time: 'Yesterday' },
  ];

  const list = document.getElementById('activityList');
  list.innerHTML = activities.map(a => `
    <div class="activity-item">
      <div class="ai-icon" style="background:${a.color}">${a.icon}</div>
      <div class="ai-content">
        <div class="ai-title">${a.title}</div>
        <div class="ai-time">${a.time}</div>
      </div>
    </div>
  `).join('');

  // Profile summary
  const summary = document.getElementById('profileSummary');
  summary.innerHTML = `
    <div class="ps-row"><span class="ps-key">Name</span><span class="ps-val">${user.name}</span></div>
    <div class="ps-row"><span class="ps-key">Email</span><span class="ps-val">${user.email}</span></div>
    <div class="ps-row"><span class="ps-key">Provider</span><span class="ps-val">Google OAuth 2.0</span></div>
    <div class="ps-row"><span class="ps-key">Verified</span><span class="ps-val" style="color:var(--green)">✓ Yes</span></div>
    <div class="ps-row"><span class="ps-key">Session ID</span><span class="ps-val" style="font-family:monospace;font-size:0.75rem">${user.session_id}</span></div>
    <div class="ps-row"><span class="ps-key">Plan</span><span class="ps-val"><span style="color:var(--orange-light);font-weight:600">Pro</span></span></div>
  `;
}

function animateKPI(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = target / 40;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString();
    if (current >= target) clearInterval(timer);
  }, 30);
}

// ============================================
// PROFILE PAGE
// ============================================
function populateProfile(user) {
  // Avatar + name
  document.getElementById('profileAvatar').src = user.picture;
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileEmail').textContent = user.email;

  // Profile data table
  const fields = [
    { field: 'sub / User ID',      value: user.id,             source: 'Google',  status: 'verified' },
    { field: 'name',               value: user.name,           source: 'Google',  status: 'verified' },
    { field: 'given_name',         value: user.given_name,     source: 'Google',  status: 'verified' },
    { field: 'family_name',        value: user.family_name,    source: 'Google',  status: 'verified' },
    { field: 'email',              value: user.email,          source: 'Google',  status: 'verified' },
    { field: 'email_verified',     value: String(user.verified_email), source: 'Google', status: 'verified' },
    { field: 'picture',            value: user.picture,        source: 'Google',  status: 'verified' },
    { field: 'locale',             value: user.locale || 'en', source: 'Google',  status: 'verified' },
    { field: 'hd (hosted domain)', value: user.hd || 'N/A',   source: 'Google',  status: user.hd ? 'verified' : 'n/a' },
    { field: 'auth_method',        value: user.auth_method,    source: 'Nexus',   status: 'active' },
    { field: 'token_type',         value: user.token_type,     source: 'OAuth',   status: 'active' },
    { field: 'issued_at',          value: formatDate(user.issued_at), source: 'Nexus', status: 'active' },
    { field: 'session_id',         value: user.session_id,     source: 'Nexus',   status: 'active' },
  ];

  const tbody = document.getElementById('profileTableBody');
  tbody.innerHTML = fields.map(f => `
    <tr>
      <td><span class="td-mono">${escHtml(f.field)}</span></td>
      <td class="td-primary">${escHtml(String(f.value || '—'))}</td>
      <td><span class="badge ${f.source === 'Google' ? 'badge-blue' : 'badge-gray'}">${f.source}</span></td>
      <td>${statusBadge(f.status)}</td>
    </tr>
  `).join('');

  // Session details
  const sessionGrid = document.getElementById('sessionGrid');
  sessionGrid.innerHTML = `
    <div class="session-item">
      <div class="si-label">Session ID</div>
      <div class="si-value">${user.session_id}</div>
    </div>
    <div class="session-item">
      <div class="si-label">Auth Time</div>
      <div class="si-value green">${formatDate(user.issued_at)}</div>
    </div>
    <div class="session-item">
      <div class="si-label">Token Expires</div>
      <div class="si-value orange">${getExpiryTime(user.issued_at, user.expires_in)}</div>
    </div>
    <div class="session-item">
      <div class="si-label">Provider</div>
      <div class="si-value">Google OAuth 2.0</div>
    </div>
  `;
}

// ============================================
// PERMISSIONS PAGE
// ============================================
function populatePermissions(user) {
  const allScopes = [
    {
      scope: 'openid',
      description: 'Authenticate using OpenID Connect and receive a unique user identifier',
      category: 'Identity',
      risk: 'low',
      status: 'active',
      granted: user.issued_at
    },
    {
      scope: 'email',
      description: 'Read the user\'s primary Google Account email address',
      category: 'Contact',
      risk: 'low',
      status: 'active',
      granted: user.issued_at
    },
    {
      scope: 'profile',
      description: 'View basic profile info including name, profile picture, and locale',
      category: 'Identity',
      risk: 'low',
      status: 'active',
      granted: user.issued_at
    },
    {
      scope: 'userinfo.email',
      description: 'See your primary Google Account email address',
      category: 'Contact',
      risk: 'low',
      status: 'active',
      granted: user.issued_at
    },
    {
      scope: 'userinfo.profile',
      description: 'See your personal info, including any personal info you\'ve made publicly available',
      category: 'Identity',
      risk: 'medium',
      status: 'active',
      granted: user.issued_at
    },
  ];

  // Update summary counts
  document.getElementById('psGranted').textContent = allScopes.length;
  document.getElementById('psActive').textContent = allScopes.filter(s => s.status === 'active').length;
  document.getElementById('psPending').textContent = 0;
  document.getElementById('psProvider').textContent = 'Google';

  renderPermissionsTable(allScopes);

  // Store for filtering
  window._allScopes = allScopes;
}

function renderPermissionsTable(scopes) {
  const tbody = document.getElementById('permissionsTableBody');
  tbody.innerHTML = scopes.map(s => `
    <tr data-status="${s.status}" data-risk="${s.risk}">
      <td><span class="td-mono">https://www.googleapis.com/auth/${escHtml(s.scope)}</span></td>
      <td style="max-width:280px;color:var(--text-secondary);font-size:0.82rem">${escHtml(s.description)}</td>
      <td><span class="badge badge-gray">${escHtml(s.category)}</span></td>
      <td>${riskBadge(s.risk)}</td>
      <td>${statusBadge(s.status)}</td>
      <td style="font-size:0.78rem;color:var(--text-muted)">${formatDate(s.granted)}</td>
    </tr>
  `).join('');
}

// ============================================
// ACTIVITY PAGE
// ============================================
function populateActivity(user) {
  const events = [
    { event: 'OAuth Sign-In',         type: 'auth',     ip: '192.168.1.42',  device: 'Chrome / macOS',   location: 'San Francisco, US', time: 'Just now',    status: 'success' },
    { event: 'Profile Data Fetched',  type: 'api',      ip: '192.168.1.42',  device: 'Chrome / macOS',   location: 'San Francisco, US', time: '1 min ago',   status: 'success' },
    { event: 'Dashboard Accessed',    type: 'access',   ip: '192.168.1.42',  device: 'Chrome / macOS',   location: 'San Francisco, US', time: '1 min ago',   status: 'success' },
    { event: 'Permissions Reviewed',  type: 'access',   ip: '192.168.1.42',  device: 'Chrome / macOS',   location: 'San Francisco, US', time: '2 min ago',   status: 'success' },
    { event: 'Token Refresh',         type: 'auth',     ip: '192.168.1.42',  device: 'Chrome / macOS',   location: 'San Francisco, US', time: '30 min ago',  status: 'success' },
    { event: 'Failed Sign-In Attempt',type: 'auth',     ip: '203.0.113.99',  device: 'Firefox / Windows', location: 'Unknown',          time: '2 hrs ago',   status: 'blocked' },
    { event: 'Integration Sync',      type: 'api',      ip: '10.0.0.1',      device: 'API Client',        location: 'N/A',              time: '3 hrs ago',   status: 'success' },
    { event: 'Settings Updated',      type: 'mutation', ip: '192.168.1.42',  device: 'Chrome / macOS',   location: 'San Francisco, US', time: 'Yesterday',   status: 'success' },
    { event: 'OAuth Sign-In',         type: 'auth',     ip: '192.168.1.42',  device: 'Safari / iOS',     location: 'San Francisco, US', time: '2 days ago',  status: 'success' },
    { event: 'Export Data',           type: 'access',   ip: '192.168.1.42',  device: 'Chrome / macOS',   location: 'San Francisco, US', time: '3 days ago',  status: 'success' },
  ];

  const tbody = document.getElementById('activityTableBody');
  tbody.innerHTML = events.map(e => `
    <tr>
      <td class="td-primary">${escHtml(e.event)}</td>
      <td><span class="badge ${typeColor(e.type)}">${escHtml(e.type)}</span></td>
      <td><span class="td-mono">${escHtml(e.ip)}</span></td>
      <td style="font-size:0.82rem;color:var(--text-secondary)">${escHtml(e.device)}</td>
      <td style="font-size:0.82rem;color:var(--text-secondary)">${escHtml(e.location)}</td>
      <td style="font-size:0.78rem;color:var(--text-muted)">${escHtml(e.time)}</td>
      <td>${statusBadge(e.status)}</td>
    </tr>
  `).join('');
}

// ============================================
// SECURITY PAGE
// ============================================
function populateSecurity(user) {
  // Session expiry countdown
  const expiryEl = document.getElementById('sessionExpiry');
  if (expiryEl && user.issued_at) {
    const issued = new Date(user.issued_at).getTime();
    const expiresAt = issued + (user.expires_in * 1000);
    const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 60000));
    expiryEl.textContent = `Token expires in ${remaining} minute${remaining !== 1 ? 's' : ''}. Auto-refresh enabled.`;
  }

  // Active sessions table
  const sessions = [
    { device: '💻 MacBook Pro', browser: 'Chrome 124', ip: '192.168.1.42', location: 'San Francisco, US', lastActive: 'Now', current: true },
    { device: '📱 iPhone 15',   browser: 'Safari 17',  ip: '192.168.1.55', location: 'San Francisco, US', lastActive: '2 hrs ago', current: false },
  ];

  const tbody = document.getElementById('sessionsTableBody');
  tbody.innerHTML = sessions.map(s => `
    <tr>
      <td class="td-primary">${s.device} ${s.current ? '<span class="badge badge-green" style="margin-left:6px">Current</span>' : ''}</td>
      <td style="font-size:0.82rem;color:var(--text-secondary)">${escHtml(s.browser)}</td>
      <td><span class="td-mono">${escHtml(s.ip)}</span></td>
      <td style="font-size:0.82rem;color:var(--text-secondary)">${escHtml(s.location)}</td>
      <td style="font-size:0.78rem;color:var(--text-muted)">${escHtml(s.lastActive)}</td>
      <td>
        ${s.current
          ? '<span style="font-size:0.78rem;color:var(--text-muted)">—</span>'
          : '<button onclick="revokeSession(this)" style="font-family:var(--font-display);font-size:0.75rem;color:var(--red);padding:4px 10px;border:1px solid rgba(255,71,87,0.2);border-radius:6px;background:var(--red-glow);cursor:pointer">Revoke</button>'
        }
      </td>
    </tr>
  `).join('');
}

function revokeSession(btn) {
  const row = btn.closest('tr');
  row.style.opacity = '0.4';
  btn.textContent = 'Revoked';
  btn.disabled = true;
  btn.style.color = 'var(--text-muted)';
}

// ============================================
// INTEGRATIONS PAGE
// ============================================
function populateIntegrations() {
  const integrations = [
    { icon: '🐙', name: 'GitHub',     desc: 'Sync repos, PRs, and issues',       on: true  },
    { icon: '💬', name: 'Slack',      desc: 'Send notifications and updates',     on: true  },
    { icon: '🎨', name: 'Figma',      desc: 'Link design files to tasks',         on: false },
    { icon: '📋', name: 'Jira',       desc: 'Bi-directional issue sync',          on: false },
    { icon: '📝', name: 'Notion',     desc: 'Embed docs and wikis',               on: true  },
    { icon: '🔷', name: 'Linear',     desc: 'Sync engineering issues',            on: false },
    { icon: '📹', name: 'Loom',       desc: 'Attach video updates to tasks',      on: false },
    { icon: '🗄️', name: 'Supabase',  desc: 'Database and auth integration',      on: false },
    { icon: '▲',  name: 'Vercel',     desc: 'Deploy previews on task completion', on: true  },
  ];

  const grid = document.getElementById('integrationsGrid');
  grid.innerHTML = integrations.map((int, i) => `
    <div class="integration-card">
      <div class="int-icon">${int.icon}</div>
      <div class="int-info">
        <div class="int-name">${escHtml(int.name)}</div>
        <div class="int-desc">${escHtml(int.desc)}</div>
      </div>
      <button class="int-toggle ${int.on ? 'on' : ''}" data-index="${i}" aria-label="Toggle ${int.name}"></button>
    </div>
  `).join('');

  // Toggle handlers
  grid.querySelectorAll('.int-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('on');
    });
  });
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
  const links = document.querySelectorAll('.sidebar-link');
  const breadcrumb = document.getElementById('breadcrumbPage');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      switchPage(page);

      // Update active link
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Update breadcrumb
      breadcrumb.textContent = link.querySelector('span').textContent;

      // Close mobile sidebar
      document.getElementById('sidebar').classList.remove('mobile-open');
    });
  });
}

function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  // Update sidebar active state
  document.querySelectorAll('.sidebar-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === pageId);
  });

  // Update breadcrumb
  const link = document.querySelector(`.sidebar-link[data-page="${pageId}"] span`);
  if (link) document.getElementById('breadcrumbPage').textContent = link.textContent;
}

// Expose globally for inline onclick
window.switchPage = switchPage;

// ============================================
// SIDEBAR COLLAPSE / MOBILE
// ============================================
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const topbarMenu = document.getElementById('topbarMenu');
  const collapseBtn = document.getElementById('sidebarCollapse');

  // Mobile toggle
  topbarMenu.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
  });

  // Collapse (desktop)
  collapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const main = document.getElementById('main');
    if (sidebar.classList.contains('collapsed')) {
      sidebar.style.width = '60px';
      main.style.marginLeft = '60px';
      sidebar.querySelectorAll('.sidebar-link span, .nav-section-label, .su-info, .logo-text').forEach(el => {
        el.style.display = 'none';
      });
    } else {
      sidebar.style.width = 'var(--sidebar-width)';
      main.style.marginLeft = 'var(--sidebar-width)';
      sidebar.querySelectorAll('.sidebar-link span, .nav-section-label, .su-info, .logo-text').forEach(el => {
        el.style.display = '';
      });
    }
  });

  // Close mobile sidebar on outside click
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !topbarMenu.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  });
}

// ============================================
// SIGN OUT
// ============================================
function initSignOut() {
  document.getElementById('signOutBtn').addEventListener('click', () => {
    if (confirm('Sign out of Nexus?')) {
      sessionStorage.clear();
      window.location.href = 'index.html';
    }
  });
}

// ============================================
// EXPORT PERMISSIONS
// ============================================
function initExport(user) {
  const btn = document.getElementById('exportPermsBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const scopes = window._allScopes || [];
    const rows = [
      ['Scope', 'Description', 'Category', 'Risk Level', 'Status', 'Granted At'],
      ...scopes.map(s => [
        `https://www.googleapis.com/auth/${s.scope}`,
        s.description,
        s.category,
        s.risk,
        s.status,
        formatDate(s.granted)
      ])
    ];

    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-permissions-${user.email}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ============================================
// TABLE FILTERS
// ============================================
function initFilterBtns() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.card-header');
      parent.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const scopes = window._allScopes || [];

      if (filter === 'all') {
        renderPermissionsTable(scopes);
      } else if (filter === 'active') {
        renderPermissionsTable(scopes.filter(s => s.status === 'active'));
      } else if (filter === 'sensitive') {
        renderPermissionsTable(scopes.filter(s => s.risk === 'medium' || s.risk === 'high'));
      }
    });
  });
}

// ============================================
// HELPERS
// ============================================
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return isoString; }
}

function getExpiryTime(issuedAt, expiresIn) {
  try {
    const issued = new Date(issuedAt).getTime();
    const expiresAt = new Date(issued + (expiresIn * 1000));
    return expiresAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
}

function statusBadge(status) {
  const map = {
    'verified': '<span class="badge badge-green">Verified</span>',
    'active':   '<span class="badge badge-green">Active</span>',
    'success':  '<span class="badge badge-green">Success</span>',
    'blocked':  '<span class="badge badge-red">Blocked</span>',
    'pending':  '<span class="badge badge-orange">Pending</span>',
    'revoked':  '<span class="badge badge-red">Revoked</span>',
    'n/a':      '<span class="badge badge-gray">N/A</span>',
  };
  return map[status] || `<span class="badge badge-gray">${escHtml(status)}</span>`;
}

function riskBadge(risk) {
  const map = {
    low:    '<span class="badge badge-green">Low</span>',
    medium: '<span class="badge badge-orange">Medium</span>',
    high:   '<span class="badge badge-red">High</span>',
  };
  return map[risk] || `<span class="badge badge-gray">${escHtml(risk)}</span>`;
}

function typeColor(type) {
  const map = {
    auth:     'badge-blue',
    api:      'badge-orange',
    access:   'badge-gray',
    mutation: 'badge-purple',
  };
  return map[type] || 'badge-gray';
}