const REPO_OWNER = 'bygrimm';
const REPO_NAME = 'where-is-grimm';
const DATA_PATH = 'data.json';
const BRANCH = 'main';

const app = document.getElementById('app');
const blogList = document.getElementById('blogList');
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
  const now = new Date();
  const ms = now - then;
  const days = Math.floor(ms / 86400000);
  if (days < 0) return '0 days';
  if (days === 0) return 'today';
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.floor(days / 7);
  if (days < 30) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
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
    const firstName = blog.muse.split(/[\s-]+/)[0];
    const span = document.createElement('span');
    span.className = 'current-blog-item';
    span.innerHTML = `<span class="accent">${firstName.charAt(0)}</span><span class="rest">${firstName.slice(1)}</span>`;
    currentBlogs.appendChild(span);
  });

  dateDisplay.textContent = state.date;

  const t = state.theme;
  labelDisplay.textContent = t.today_label || '— today i\'m on —';
  listLabelDisplay.textContent = state.blog_list_label || 'BLOGS';
  taglineDisplay.innerHTML = `<span class="accent">${state.footer_tagline.charAt(0)}</span>${state.footer_tagline.slice(1)}`;
  noteDisplay.textContent = state.footer_note;

  // blog list display
  blogList.innerHTML = '';
  state.blogs.forEach((blog, index) => {
    const isActive = state.active.includes(blog.id);
    const li = document.createElement('li');
    li.className = 'blog-item' + (isActive ? ' active' : '');
    li.dataset.id = blog.id;
    li.style.setProperty('--i', index);

    const statusClass = isActive ? 'active' : blog.status;
    const statusLabel = isActive ? '● today' : blog.status;
    const lastActive = isActive ? 'today' : timeAgo(blog.last_active);

    li.innerHTML = `
      <div class="url-block">
        <a href="${blog.link}" target="_blank" rel="noopener" class="url-link"><div class="url-text"><span class="accent">${blog.url.charAt(0)}</span>${blog.url.slice(1)}</div><div class="muse-text">${blog.muse}</div><div class="last-active">❀˖  last active <b>${lastActive}</b></div></a>
      </div>
      <span class="status-badge ${statusClass}">${statusLabel}</span>
      ${isActive ? '<span class="star">★</span>' : ''}
    `;

    blogList.appendChild(li);
  });
}

async function loadData() {
  try {
    const cacheBust = `_=${Date.now()}`;
    const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${DATA_PATH}?${cacheBust}`;
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

loadData();
