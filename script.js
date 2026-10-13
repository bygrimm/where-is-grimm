const DATA_PATH = 'data.json';

// Fallback tier labels — data.json.status_labels overrides these.
const STATUS_LABELS = {
  high: 'HIGH ACTIVITY',
  building: 'BUILDING ACTIVITY',
  sporadic: 'SPORADIC ACTIVITY',
  slow: 'SLOW ACTIVITY',
  'semi-hiatus': 'SEMI - HIATUS',
  hiatus: 'HIATUS',
  'in-progress': 'IN PROGRESS'
};

const app = document.getElementById('app');
const blogList = document.getElementById('blogList');
const dormantSlot = document.getElementById('dormantSlot');
const currentBlogs = document.getElementById('currentBlogs');
const dateDisplay = document.getElementById('dateDisplay');
const labelDisplay = document.getElementById('labelDisplay');
const listLabelDisplay = document.getElementById('listLabelDisplay');
const taglineDisplay = document.getElementById('taglineDisplay');
const noteDisplay = document.getElementById('noteDisplay');

let state = null;

function applyTheme(t) {
  const r = document.documentElement.style;
  r.setProperty('--bg', t.bg_color);
  r.setProperty('--card-bg', t.card_bg);
  r.setProperty('--card-border', t.card_border);
  r.setProperty('--accent', t.accent_color);
  r.setProperty('--text', t.text_color);
  r.setProperty('--text-muted', t.text_muted);
  r.setProperty('--text-dim', t.text_dim);
  r.setProperty('--grad-start', t.active_gradient_start);
  r.setProperty('--grad-end', t.active_gradient_end);
  r.setProperty('--status-active', t.status_active);
  r.setProperty('--status-high', t.status_high);
  r.setProperty('--status-building', t.status_building);
  r.setProperty('--status-sporadic', t.status_sporadic);
  if (t.status_slow) r.setProperty('--status-slow', t.status_slow);
  if (t.status_hiatus) r.setProperty('--status-hiatus', t.status_hiatus);
  r.setProperty('--status-inactive', t.status_inactive);
  r.setProperty('--body-font', `'${t.body_font}', sans-serif`);
  r.setProperty('--mono-font', `'${t.mono_font}', monospace`);
  r.setProperty('--hdr-size', t.header_size);
  r.setProperty('--body-size', t.body_size);
  r.setProperty('--small-size', t.small_size);
  r.setProperty('--card-w', t.card_width + 'px');
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const then = new Date(dateStr + 'T00:00:00');
  if (isNaN(then)) return '';
  const ms = new Date() - then;
  const days = Math.floor(ms / 86400000);
  if (days < 0) return '0 days';
  if (days === 0) return 'today';
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

function statusLabelFor(blog) {
  const map = (state && state.status_labels) || {};
  return map[blog.status] || STATUS_LABELS[blog.status] || blog.status;
}

function badgeFor(blog, isActive) {
  // a relocated muse reports where it went instead of its tier badge
  if (blog.found_at) {
    const dest = blog.found_url
      ? `<a class="badge-link" href="${blog.found_url}" target="_blank" rel="noopener">${blog.found_at}</a>`
      : blog.found_at;
    return `<span class="status-badge moved">${statusLabelFor(blog)} → found @ ${dest}</span>`;
  }
  const statusClass = isActive ? 'active' : blog.status;
  const label = isActive ? '● today' : statusLabelFor(blog);
  return `<span class="status-badge ${statusClass}">${label}</span>`;
}

function rowHtml(blog, index) {
  const isActive = state.active.includes(blog.id);
  const lastActive = isActive ? 'today' : timeAgo(blog.last_active);
  const showLast = isActive || !!blog.last_active;

  const inner = `
      <div class="url-text"><span class="accent">${blog.url.charAt(0)}</span>${blog.url.slice(1)}</div>
      <div class="muse-text">${blog.muse}</div>
      ${showLast ? `<div class="last-active">❀˖  last active <b>${lastActive}</b></div>` : ''}`;

  // a blog with no url yet (coming soon) renders unlinked
  const block = blog.link
    ? `<a href="${blog.link}" target="_blank" rel="noopener" class="url-link">${inner}</a>`
    : inner;

  return `<li class="blog-item${isActive ? ' active' : ''}" style="--i:${index}">
      <div class="url-block${blog.link ? '' : ' plain'}">${block}</div>
      ${badgeFor(blog, isActive)}
      ${isActive ? '<span class="star">★</span>' : ''}
    </li>`;
}

// dormant shelves: one dashed panel per group id, in data.json.groups order
function renderShelves(blogs) {
  const groups = state.groups || [];
  const known = groups.map(g => g.id);
  const out = [];

  groups.forEach(group => {
    const members = blogs.filter(b => b.group === group.id);
    if (!members.length) return;
    out.push(`<div class="dormant-panel">
      <div class="panel-head">${group.label}</div>
      <ul class="blog-list">${members.map((b, i) => rowHtml(b, i)).join('')}</ul>
    </div>`);
  });

  // safety net: a blog in a group nobody declared still gets rendered
  const orphans = blogs.filter(b => known.indexOf(b.group) === -1);
  if (orphans.length) {
    out.push(`<div class="dormant-panel">
      <div class="panel-head">—</div>
      <ul class="blog-list">${orphans.map((b, i) => rowHtml(b, i)).join('')}</ul>
    </div>`);
  }

  return out.join('');
}

function render() {
  if (!state) return;

  // active blogs header
  currentBlogs.innerHTML = '';
  state.active.forEach((id, i) => {
    if (i > 0) {
      const amp = document.createElement('span');
      amp.className = 'ampersand';
      amp.textContent = '&';
      currentBlogs.appendChild(amp);
    }
    const blog = state.blogs.find(b => b.id === id);
    if (!blog) return;
    const display = blog.header_name || blog.muse.split(/[\s-]+/)[0];
    const span = document.createElement('span');
    span.className = 'current-blog-item';
    span.innerHTML = `<span class="accent">${display.charAt(0)}</span><span class="rest">${display.slice(1)}</span>`;
    currentBlogs.appendChild(span);
  });

  dateDisplay.textContent = state.date;

  const t = state.theme;
  labelDisplay.textContent = t.today_label || '— today i\'m on —';
  listLabelDisplay.textContent = state.blog_list_label || 'BLOGS';
  taglineDisplay.innerHTML = `<span class="accent">${state.footer_tagline.charAt(0)}</span>${state.footer_tagline.slice(1)}`;
  noteDisplay.textContent = state.footer_note;

  // blog list display — main board first, then the dormant shelves
  const visible = state.blogs.filter(blog => !blog.hidden);
  const main = visible.filter(blog => (blog.group || 'main') === 'main');
  const shelved = visible.filter(blog => (blog.group || 'main') !== 'main');

  blogList.innerHTML = main.map((blog, index) => rowHtml(blog, index)).join('');
  dormantSlot.innerHTML = renderShelves(shelved);
}

async function loadData() {
  try {
    const url = `${DATA_PATH}?v=${Date.now()}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to load data');
    state = await resp.json();
    if (!state.theme.today_label) state.theme.today_label = '— today i\'m on —';
    applyTheme(state.theme);
    render();
  } catch (e) {
    blogList.innerHTML = `<li class="blog-item">couldn't load — ${e.message}</li>`;
  }
}

// Load the GoatCounter view count into the badge
async function loadCount() {
  const el = document.getElementById('gcCount');
  if (!el) return;
  try {
    const resp = await fetch(`count.json?v=${Date.now()}`);
    if (!resp.ok) throw new Error('no count');
    const data = await resp.json();
    const total = Number(data.total) || 0;
    el.textContent = total.toLocaleString('en-US');
  } catch (e) {
    el.textContent = '0';
  }
}

loadData();
loadCount();
