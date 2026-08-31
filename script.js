const REPO_OWNER = 'bygrimm';
const REPO_NAME = 'where-is-grimm';
const DATA_PATH = 'data.json';
const BRANCH = 'main';

const app = document.getElementById('app');
const adminToggle = document.getElementById('adminToggle');
const blogList = document.getElementById('blogList');
const currentBlogs = document.getElementById('currentBlogs');
const dateDisplay = document.getElementById('dateDisplay');
const dateInput = document.getElementById('dateInput');
const saveBtn = document.getElementById('saveBtn');
const statusMsg = document.getElementById('statusMsg');

const labelDisplay = document.getElementById('labelDisplay');
const listLabelDisplay = document.getElementById('listLabelDisplay');
const taglineDisplay = document.getElementById('taglineDisplay');
const noteDisplay = document.getElementById('noteDisplay');
const blogEditor = document.getElementById('blogEditor');
const labelInput = document.getElementById('labelInput');
const listLabelInput = document.getElementById('listLabelInput');
const taglineInput = document.getElementById('taglineInput');
const noteInput = document.getElementById('noteInput');

const designFields = [
  { id: 'bgColor', textId: 'bgColorText', prop: '--bg', key: 'bg_color' },
  { id: 'cardBg', textId: 'cardBgText', prop: '--card-bg', key: 'card_bg' },
  { id: 'cardBorder', textId: 'cardBorderText', prop: '--card-border', key: 'card_border' },
  { id: 'accentColor', textId: 'accentColorText', prop: '--accent', key: 'accent_color' },
  { id: 'textColor', textId: 'textColorText', prop: '--text', key: 'text_color' },
  { id: 'mutedColor', textId: 'mutedColorText', prop: '--text-muted', key: 'text_muted' },
  { id: 'dimColor', textId: 'dimColorText', prop: '--text-dim', key: 'text_dim' },
  { id: 'gradStart', textId: 'gradStartText', prop: '--grad-start', key: 'active_gradient_start' },
  { id: 'gradEnd', textId: 'gradEndText', prop: '--grad-end', key: 'active_gradient_end' },
  { id: 'stActive', textId: 'stActiveText', prop: '--status-active', key: 'status_active' },
  { id: 'stHigh', textId: 'stHighText', prop: '--status-high', key: 'status_high' },
  { id: 'stBuilding', textId: 'stBuildingText', prop: '--status-building', key: 'status_building' },
  { id: 'stSporadic', textId: 'stSporadicText', prop: '--status-sporadic', key: 'status_sporadic' },
  { id: 'stInactive', textId: 'stInactiveText', prop: '--status-inactive', key: 'status_inactive' },
];

const bodyFont = document.getElementById('bodyFont');
const monoFont = document.getElementById('monoFont');
const hdrSize = document.getElementById('hdrSize');
const bodySize = document.getElementById('bodySize');
const smallSize = document.getElementById('smallSize');
const cardWidth = document.getElementById('cardWidth');

let state = null;
let editMode = false;

const savedToken = localStorage.getItem('gh_token');
let ghToken = savedToken || '';

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

function fillDesignFields(t) {
  designFields.forEach(f => {
    const picker = document.getElementById(f.id);
    const text = document.getElementById(f.textId);
    const val = t[f.key];
    if (picker) picker.value = val;
    if (text) text.value = val;
  });
  bodyFont.value = t.body_font;
  monoFont.value = t.mono_font;
  hdrSize.value = t.header_size;
  bodySize.value = t.body_size;
  smallSize.value = t.small_size;
  cardWidth.value = t.card_width;
}

function readDesignFields() {
  const d = {};
  designFields.forEach(f => {
    const text = document.getElementById(f.textId);
    d[f.key] = text.value;
  });
  d.body_font = bodyFont.value;
  d.mono_font = monoFont.value;
  d.header_size = hdrSize.value;
  d.body_size = bodySize.value;
  d.small_size = smallSize.value;
  d.card_width = parseInt(cardWidth.value) || 520;
  return d;
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
  dateInput.value = state.date;

  const t = state.theme;
  labelDisplay.textContent = t.today_label || '— today on —';
  listLabelDisplay.textContent = state.blog_list_label || 'BLOGS';
  taglineDisplay.innerHTML = `<span class="accent">${state.footer_tagline.charAt(0)}</span>${state.footer_tagline.slice(1)}`;
  noteDisplay.textContent = state.footer_note;
  labelInput.value = t.today_label || '— today on —';
  listLabelInput.value = state.blog_list_label || 'BLOGS';
  taglineInput.value = state.footer_tagline;
  noteInput.value = state.footer_note;

  // blog editor
  blogEditor.innerHTML = '';
  state.blogs.forEach((b, i) => {
    const div = document.createElement('div');
    div.className = 'blog-edit-item';
    div.innerHTML = `
      <div class="blog-edit-row">
        <input type="text" class="url-field" value="${b.url}" data-idx="${i}" data-field="url" placeholder="URL">
        <input type="text" class="muse-field" value="${b.muse}" data-idx="${i}" data-field="muse" placeholder="muse">
      </div>
      <div class="blog-edit-row">
        <input type="text" value="${b.status}" data-idx="${i}" data-field="status" placeholder="status" style="flex:1;margin-bottom:0;">
        <select data-idx="${i}" data-field="status_color" style="flex:0 0 6rem;margin-bottom:0;">
          <option value="active" ${b.status_color === 'active' ? 'selected' : ''}>active</option>
          <option value="high" ${b.status_color === 'high' ? 'selected' : ''}>high</option>
          <option value="building" ${b.status_color === 'building' ? 'selected' : ''}>building</option>
          <option value="sporadic" ${b.status_color === 'sporadic' ? 'selected' : ''}>sporadic</option>
          <option value="inactive" ${b.status_color === 'inactive' ? 'selected' : ''}>inactive</option>
          <option value="main" ${b.status_color === 'main' ? 'selected' : ''}>main</option>
        </select>
        <label class="check"><input type="checkbox" ${b.star ? 'checked' : ''} data-idx="${i}" data-field="star"> ★</label>
      </div>
    `;
    blogEditor.appendChild(div);
  });

  blogEditor.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', () => {
      const idx = parseInt(el.dataset.idx);
      const field = el.dataset.field;
      const blog = state.blogs[idx];
      if (field === 'star') blog[field] = el.checked;
      else if (field === 'status_color') blog[field] = el.value;
      else blog[field] = el.value;
      render();
    });
    el.addEventListener('input', () => {
      const idx = parseInt(el.dataset.idx);
      const field = el.dataset.field;
      if (field === 'star' || field === 'status_color') return;
      state.blogs[idx][field] = el.value;
      render();
    });
  });

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
        ${editMode
          ? `<span class="url-link"><div class="url-text"><span class="accent">${blog.url.charAt(0)}</span>${blog.url.slice(1)}</div><div class="muse-text">${blog.muse}</div><div class="last-active">❀˖  last active <b>${lastActive}</b></div></span>`
          : `<a href="${blog.link}" target="_blank" rel="noopener" class="url-link"><div class="url-text"><span class="accent">${blog.url.charAt(0)}</span>${blog.url.slice(1)}</div><div class="muse-text">${blog.muse}</div><div class="last-active">❀˖  last active <b>${lastActive}</b></div></a>`
        }
      </div>
      <span class="status-badge ${statusClass}">${statusLabel}</span>
      ${isActive ? '<span class="star">★</span>' : ''}
    `;

    if (editMode) {
      li.addEventListener('click', () => toggleActive(blog.id));
    }

    blogList.appendChild(li);
  });
}

function toggleActive(id) {
  const idx = state.active.indexOf(id);
  if (idx >= 0) {
    state.active.splice(idx, 1);
  } else {
    state.active.push(id);
  }
  render();
}

async function loadData() {
  try {
    const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${DATA_PATH}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to load data');
    state = await resp.json();
    // ensure today_label fallback
    if (!state.theme.today_label) state.theme.today_label = '— today on —';
    applyTheme(state.theme);
    fillDesignFields(state.theme);
    render();
  } catch (e) {
    statusMsg.textContent = '⚠ ' + e.message;
    statusMsg.className = 'status-msg err';
  }
}

function stampActivity() {
  if (!state) return;
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  // last_active stamp on each currently-active blog
  state.active.forEach(id => {
    const blog = state.blogs.find(b => b.id === id);
    if (blog) blog.last_active = iso;
  });
  // stats tracking
  if (!state.stats) {
    state.stats = {
      total_days_recorded: 0,
      blog_active_days: {},
      history: {}
    };
    state.blogs.forEach(b => { state.stats.blog_active_days[b.id] = 0; });
  }
  if (!state.stats.history[iso]) {
    state.stats.history[iso] = [];
    state.stats.total_days_recorded += 1;
    state.active.forEach(id => { state.stats.blog_active_days[id] = (state.stats.blog_active_days[id] || 0) + 1; });
  }
  state.stats.history[iso] = state.active.slice();
  // build a running totals map in case counts got out of sync
  state.stats.blog_active_days = {};
  state.blogs.forEach(b => { state.stats.blog_active_days[b.id] = 0; });
  Object.values(state.stats.history).forEach(day => {
    day.forEach(id => { state.stats.blog_active_days[id] += 1; });
  });
}

async function saveToGitHub() {
  if (!ghToken) {
    ghToken = prompt('Enter your GitHub token (repo scope):');
    if (!ghToken) return;
    localStorage.setItem('gh_token', ghToken);
  }

  state.date = dateInput.value.trim();
  state.blog_list_label = listLabelInput.value.trim();
  state.theme.today_label = labelInput.value.trim();
  state.footer_tagline = taglineInput.value.trim();
  state.footer_note = noteInput.value.trim();

  // stamp last-active + stats history for whatever blogs are active today
  stampActivity();

  const design = readDesignFields();
  Object.assign(state.theme, design);

  saveBtn.disabled = true;
  statusMsg.textContent = '⟳ saving...';
  statusMsg.className = 'status-msg loading';

  try {
    const getResp = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`, {
      headers: {
        'Authorization': `Bearer ${ghToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'where-is-grimm'
      }
    });
    if (!getResp.ok) {
      const errData = await getResp.json();
      throw new Error(errData.message || 'Failed to get file info');
    }
    const fileInfo = await getResp.json();
    const sha = fileInfo.sha;

    const content = JSON.stringify(state, null, 2);
    const encoded = btoa(unescape(encodeURIComponent(content)));

    const putResp = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ghToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'where-is-grimm'
      },
      body: JSON.stringify({
        message: `update status: ${state.active.join(', ')}`,
        content: encoded,
        sha: sha,
        branch: BRANCH
      })
    });
    if (!putResp.ok) {
      const errData = await putResp.json();
      throw new Error(errData.message || 'Failed to save');
    }

    statusMsg.textContent = '✓ saved! page updates in ~1 min';
    statusMsg.className = 'status-msg ok';
  } catch (e) {
    statusMsg.textContent = '⚠ ' + e.message;
    statusMsg.className = 'status-msg err';
  } finally {
    saveBtn.disabled = false;
  }
}

// admin toggle
adminToggle.addEventListener('click', () => {
  editMode = !editMode;
  app.classList.toggle('edit-mode', editMode);
  adminToggle.classList.toggle('active', editMode);
  render();
});

// tabs
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    const id = 'tab' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1);
    document.getElementById(id).classList.add('active');
  });
});

// live design preview
designFields.forEach(f => {
  const picker = document.getElementById(f.id);
  const text = document.getElementById(f.textId);
  if (picker && text) {
    picker.addEventListener('input', () => {
      text.value = picker.value;
      document.documentElement.style.setProperty(f.prop, picker.value);
    });
    text.addEventListener('input', () => {
      if (/^#[0-9a-f]{6}$/i.test(text.value)) {
        picker.value = text.value;
        document.documentElement.style.setProperty(f.prop, text.value);
      }
    });
  }
});

bodyFont.addEventListener('change', () => {
  document.documentElement.style.setProperty('--body-font', `'${bodyFont.value}', sans-serif`);
});
monoFont.addEventListener('change', () => {
  document.documentElement.style.setProperty('--mono-font', `'${monoFont.value}', monospace`);
});
hdrSize.addEventListener('input', () => {
  document.documentElement.style.setProperty('--hdr-size', hdrSize.value);
});
bodySize.addEventListener('input', () => {
  document.documentElement.style.setProperty('--body-size', bodySize.value);
});
smallSize.addEventListener('input', () => {
  document.documentElement.style.setProperty('--small-size', smallSize.value);
});
cardWidth.addEventListener('input', () => {
  document.documentElement.style.setProperty('--card-w', cardWidth.value + 'px');
});

// text content live preview
labelInput.addEventListener('input', () => { labelDisplay.textContent = labelInput.value; });
listLabelInput.addEventListener('input', () => { listLabelDisplay.textContent = listLabelInput.value; });
taglineInput.addEventListener('input', () => {
  taglineDisplay.innerHTML = `<span class="accent">${taglineInput.value.charAt(0)}</span>${taglineInput.value.slice(1)}`;
});
noteInput.addEventListener('input', () => { noteDisplay.textContent = noteInput.value; });

document.getElementById('tokenBtn').addEventListener('click', () => {
  const t = prompt('Enter GitHub token (repo scope):');
  if (t) { ghToken = t; localStorage.setItem('gh_token', t); statusMsg.textContent = '✓ token saved'; statusMsg.className = 'status-msg ok'; }
});

saveBtn.addEventListener('click', saveToGitHub);

loadData();
