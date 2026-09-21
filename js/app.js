const SCENES = [
  { key: 'all', label: '全部', icon: '✨' },
  { key: '朋友圈', label: '朋友圈', icon: '📱' },
  { key: '个性签名', label: '个性签名', icon: '✍️' },
  { key: '抖音/快手', label: '抖音/快手', icon: '🎵' },
  { key: '小红书', label: '小红书', icon: '📕' },
  { key: '微博', label: '微博', icon: '📢' },
  { key: '作文素材', label: '作文素材', icon: '📝' },
  { key: '节日祝福', label: '节日祝福', icon: '🎉' },
  { key: '情感语录', label: '情感语录', icon: '💝' },
  { key: '早安晚安', label: '早安晚安', icon: '🌅' },
  { key: '励志', label: '励志', icon: '💪' }
];

const TYPES = [
  { key: 'all', label: '全部类型' },
  { key: 'short', label: '短句' },
  { key: 'paragraph', label: '段落' },
  { key: 'title', label: '标题' },
  { key: 'copy', label: '文案' }
];

const TYPE_LABELS = {
  short: '短句',
  paragraph: '段落',
  title: '标题',
  copy: '文案'
};

const GRADIENTS_COUNT = 15;

const state = {
  allData: [],
  filteredData: [],
  currentScene: 'all',
  currentType: 'all',
  currentSort: 'newest',
  searchQuery: '',
  favorites: new Set(),
  showFavorites: false,
  likedIds: new Set(),
  currentModalItem: null
};

let searchDebounceTimer = null;

function resolveDataPath() {
  const base = document.querySelector('base')?.href || '';
  const candidates = [
    new URL('./data/data.json', window.location.href).href,
    base + 'data/data.json',
    window.location.pathname.replace(/\/[^/]*$/, '/') + 'data/data.json'
  ];
  for (const url of candidates) {
    try {
      new URL(url);
      return url;
    } catch {}
  }
  return 'data/data.json';
}

function debounce(fn, delay) {
  return function(...args) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function formatNumber(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return String(num);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function showToast(message, duration = 2000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.classList.remove('show'), duration);
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    showToast('📋 复制成功！');
  } catch {
    showToast('❌ 复制失败，请手动复制');
  }
}

function shareContent(item) {
  const text = `${item.content}\n—— ${item.author}《${item.source}》`;
  if (navigator.share) {
    navigator.share({
      title: '精彩文案分享',
      text: text,
      url: window.location.href
    }).catch(() => {});
  } else {
    copyToClipboard(text);
  }
}

function saveFavorites() {
  try {
    localStorage.setItem('copywriting_favorites', JSON.stringify([...state.favorites]));
  } catch {}
}

function loadFavorites() {
  try {
    const saved = localStorage.getItem('copywriting_favorites');
    if (saved) state.favorites = new Set(JSON.parse(saved));
  } catch {}
  updateFavoritesCount();
}

function saveLikedIds() {
  try {
    localStorage.setItem('copywriting_liked', JSON.stringify([...state.likedIds]));
  } catch {}
}

function loadLikedIds() {
  try {
    const saved = localStorage.getItem('copywriting_liked');
    if (saved) state.likedIds = new Set(JSON.parse(saved));
  } catch {}
}

function saveTheme(theme) {
  try {
    localStorage.setItem('copywriting_theme', theme);
  } catch {}
}

function loadTheme() {
  try {
    const saved = localStorage.getItem('copywriting_theme');
    if (saved) return saved;
  } catch {}
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  saveTheme(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function updateFavoritesCount() {
  const count = state.favorites.size;
  const countEl = document.querySelector('.favorites-count');
  const toggleBtn = document.querySelector('.favorites-toggle');
  if (countEl) {
    countEl.textContent = count;
    countEl.style.display = count > 0 ? 'block' : 'none';
  }
  if (toggleBtn) {
    toggleBtn.classList.toggle('active', state.showFavorites);
  }
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    showToast('🔖 已取消收藏');
  } else {
    state.favorites.add(id);
    showToast('⭐ 已加入收藏夹');
  }
  saveFavorites();
  updateFavoritesCount();
  renderCards();
  if (state.currentModalItem && state.currentModalItem.id === id) {
    renderModal(state.currentModalItem);
  }
}

function toggleLike(id) {
  const item = state.allData.find(d => d.id === id);
  if (!item) return;
  if (state.likedIds.has(id)) {
    state.likedIds.delete(id);
    item.likes = Math.max(0, item.likes - 1);
  } else {
    state.likedIds.add(id);
    item.likes += 1;
  }
  saveLikedIds();
  renderCards();
  if (state.currentModalItem && state.currentModalItem.id === id) {
    renderModal(state.currentModalItem);
  }
}

async function loadData() {
  const grid = document.querySelector('.cards-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="status-container" style="grid-column: 1 / -1;">
        <div class="loading-spinner"></div>
        <div class="status-text">正在加载文案数据...</div>
      </div>
    `;
  }
  try {
    const path = resolveDataPath();
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.allData = await res.json();
    if (!Array.isArray(state.allData) || state.allData.length === 0) {
      throw new Error('数据为空');
    }
    applyFilters();
  } catch (err) {
    console.error('加载数据失败:', err);
    if (grid) {
      grid.innerHTML = `
        <div class="status-container" style="grid-column: 1 / -1;">
          <div class="status-icon">❌</div>
          <div class="status-text">加载失败</div>
          <div class="status-subtext">${err.message}，请检查 data/data.json 文件是否存在</div>
        </div>
      `;
    }
  }
}

function applyFilters() {
  let data = [...state.allData];

  if (state.showFavorites) {
    data = data.filter(item => state.favorites.has(item.id));
  }

  if (state.currentScene !== 'all') {
    data = data.filter(item => item.scenes?.includes(state.currentScene));
  }

  if (state.currentType !== 'all') {
    data = data.filter(item => item.type === state.currentType);
  }

  if (state.searchQuery.trim()) {
    const q = state.searchQuery.trim().toLowerCase();
    data = data.filter(item =>
      (item.content && item.content.toLowerCase().includes(q)) ||
      (item.author && item.author.toLowerCase().includes(q)) ||
      (item.source && item.source.toLowerCase().includes(q)) ||
      (item.scenes && item.scenes.some(s => s.toLowerCase().includes(q)))
    );
  }

  switch (state.currentSort) {
    case 'newest':
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'hottest':
      data.sort((a, b) => b.likes - a.likes);
      break;
    case 'shortest':
      data.sort((a, b) => a.wordCount - b.wordCount);
      break;
  }

  state.filteredData = data;
  renderCards();
  updateContentHeader();
}

function updateContentHeader() {
  const titleEl = document.querySelector('.content-title');
  const countEl = document.querySelector('.content-count');
  if (titleEl) {
    if (state.showFavorites) {
      titleEl.textContent = '⭐ 我的收藏';
    } else {
      const scene = SCENES.find(s => s.key === state.currentScene);
      titleEl.textContent = `${scene?.icon || ''} ${scene?.label || '文案'}`;
    }
  }
  if (countEl) {
    countEl.textContent = `共 ${state.filteredData.length} 条`;
  }
}

function renderCards() {
  const grid = document.querySelector('.cards-grid');
  if (!grid) return;

  if (state.filteredData.length === 0) {
    let icon = '📭';
    let text = '暂无数据';
    let subtext = '换个筛选条件试试吧';
    if (state.showFavorites) {
      icon = '🔖';
      text = '收藏夹是空的';
      subtext = '快去收藏喜欢的文案吧~';
    } else if (state.searchQuery.trim()) {
      icon = '🔍';
      text = '没有找到匹配的文案';
      subtext = `试试搜索其他关键词："${state.searchQuery}"`;
    }
    grid.innerHTML = `
      <div class="status-container favorites-empty">
        <div class="status-icon">${icon}</div>
        <div class="status-text">${text}</div>
        <div class="status-subtext">${subtext}</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.filteredData.map((item, idx) => renderCard(item, idx)).join('');

  grid.querySelectorAll('.card').forEach(card => {
    const id = Number(card.dataset.id);
    const item = state.allData.find(d => d.id === id);
    if (!item) return;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-btn')) return;
      openModal(item);
    });

    const likeBtn = card.querySelector('.btn-like');
    if (likeBtn) {
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLike(id);
      });
    }

    const copyBtn = card.querySelector('.btn-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(item.content);
      });
    }

    const saveBtn = card.querySelector('.btn-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(id);
      });
    }
  });
}

function renderCard(item, idx) {
  const gi = item.gradientIndex ?? (item.id % GRADIENTS_COUNT);
  const liked = state.likedIds.has(item.id);
  const saved = state.favorites.has(item.id);
  const stagger = `stagger-${idx % 10}`;
  const hotClass = item.isHot ? ' hot' : '';
  const typeLabel = TYPE_LABELS[item.type] || '文案';
  const sceneTags = (item.scenes || []).slice(0, 2).map(s =>
    `<span class="card-tag">#${s}</span>`
  ).join('');

  return `
    <div class="card gradient-${gi}${hotClass} fade-in ${stagger}" data-id="${item.id}">
      <div class="card-content">
        <div class="card-text">${escapeHtml(item.content)}</div>
        <div class="card-footer">
          <div class="card-meta">
            <span class="card-tag">${typeLabel}</span>
            ${sceneTags}
          </div>
          <div class="card-actions">
            <div class="card-stats">
              <span>📝 ${item.wordCount}字</span>
              <span>❤ ${formatNumber(item.likes)}</span>
            </div>
            <div class="card-buttons">
              <button class="card-btn btn-like${liked ? ' liked' : ''}" title="${liked ? '取消点赞' : '点赞'}">
                ${liked ? '❤️' : '🤍'}
              </button>
              <button class="card-btn btn-copy" title="复制">📋</button>
              <button class="card-btn btn-save${saved ? ' saved' : ''}" title="${saved ? '取消收藏' : '收藏'}">
                ${saved ? '🔖' : '📑'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function openModal(item) {
  state.currentModalItem = item;
  renderModal(item);
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  state.currentModalItem = null;
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function renderModal(item) {
  const overlay = document.querySelector('.modal-overlay');
  if (!overlay) return;
  const gi = item.gradientIndex ?? (item.id % GRADIENTS_COUNT);
  const liked = state.likedIds.has(item.id);
  const saved = state.favorites.has(item.id);
  const typeLabel = TYPE_LABELS[item.type] || '文案';
  const sceneTags = (item.scenes || []).map(s =>
    `<span class="modal-scene-tag">#${s}</span>`
  ).join('');
  const hotLabel = item.isHot ? '<span style="background:rgba(255,255,255,0.25);padding:2px 8px;border-radius:12px;font-size:0.75rem;backdrop-filter:blur(8px);">🔥 HOT</span>' : '';

  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-header gradient-${gi}">
        <button class="modal-close" aria-label="关闭">✕</button>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
          <span style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:0.8rem;backdrop-filter:blur(8px);">${typeLabel}</span>
          ${hotLabel}
        </div>
      </div>
      <div class="modal-body">
        <div class="modal-content-text">${escapeHtml(item.content)}</div>
        <div class="modal-info">
          <div class="modal-info-item">
            <div class="modal-info-label">✍️ 作者</div>
            <div class="modal-info-value">${escapeHtml(item.author || '佚名')}</div>
          </div>
          <div class="modal-info-item">
            <div class="modal-info-label">📚 来源</div>
            <div class="modal-info-value">${escapeHtml(item.source || '网络收集')}</div>
          </div>
          <div class="modal-info-item">
            <div class="modal-info-label">📝 字数</div>
            <div class="modal-info-value">${item.wordCount} 字</div>
          </div>
          <div class="modal-info-item">
            <div class="modal-info-label">❤ 点赞</div>
            <div class="modal-info-value">${formatNumber(item.likes)} 次</div>
          </div>
        </div>
        <div class="modal-scenes">
          <div class="modal-scenes-title">🎯 使用场景</div>
          <div class="modal-scenes-list">${sceneTags || '<span style="color:var(--text-muted);font-size:0.85rem;">暂无标签</span>'}</div>
        </div>
        <div class="modal-actions">
          <button class="modal-action-btn btn-copy-modal">
            📋 复制
          </button>
          <button class="modal-action-btn${saved ? ' primary' : ''} btn-save-modal">
            ${saved ? '⭐ 已收藏' : '🔖 收藏'}
          </button>
          <button class="modal-action-btn btn-share-modal">
            📤 分享
          </button>
        </div>
      </div>
    </div>
  `;

  const closeBtn = overlay.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  const copyBtn = overlay.querySelector('.btn-copy-modal');
  if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(item.content));

  const saveBtn = overlay.querySelector('.btn-save-modal');
  if (saveBtn) saveBtn.addEventListener('click', () => toggleFavorite(item.id));

  const shareBtn = overlay.querySelector('.btn-share-modal');
  if (shareBtn) shareBtn.addEventListener('click', () => shareContent(item));
}

function setupTabs() {
  const mainTabsContainer = document.querySelector('.main-tabs');
  if (mainTabsContainer) {
    mainTabsContainer.innerHTML = SCENES.map(scene => `
      <button class="main-tab${state.currentScene === scene.key ? ' active' : ''}" data-scene="${scene.key}">
        ${scene.icon} ${scene.label}
      </button>
    `).join('');
    mainTabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.main-tab');
      if (!btn) return;
      state.currentScene = btn.dataset.scene;
      state.showFavorites = false;
      updateFavoritesCount();
      mainTabsContainer.querySelectorAll('.main-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.scene === state.currentScene);
      });
      applyFilters();
    });
  }

  const typeTabsContainer = document.querySelector('.type-tabs');
  if (typeTabsContainer) {
    typeTabsContainer.innerHTML = TYPES.map(type => `
      <button class="type-tab${state.currentType === type.key ? ' active' : ''}" data-type="${type.key}">
        ${type.label}
      </button>
    `).join('');
    typeTabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.type-tab');
      if (!btn) return;
      state.currentType = btn.dataset.type;
      typeTabsContainer.querySelectorAll('.type-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.type === state.currentType);
      });
      applyFilters();
    });
  }
}

function setupSearch() {
  const input = document.querySelector('.search-box input');
  if (!input) return;
  input.value = state.searchQuery;
  const debouncedSearch = debounce(() => {
    state.searchQuery = input.value;
    applyFilters();
  }, 300);
  input.addEventListener('input', debouncedSearch);
}

function setupSort() {
  const select = document.querySelector('.sort-select');
  if (!select) return;
  select.value = state.currentSort;
  select.addEventListener('change', () => {
    state.currentSort = select.value;
    applyFilters();
  });
}

function setupThemeToggle() {
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.addEventListener('click', toggleTheme);
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('copywriting_theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

function setupFavoritesToggle() {
  const btn = document.querySelector('.favorites-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    state.showFavorites = !state.showFavorites;
    updateFavoritesCount();
    applyFilters();
  });
}

function setupModalKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.querySelector('.modal-overlay.show')) {
      closeModal();
    }
  });
}

function setupBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupGenerator() {
  const sceneSelect = document.querySelector('.generator-select[data-type="scene"]');
  const generateBtn = document.querySelector('.generator-btn');
  const resultEl = document.querySelector('.generator-result');

  if (sceneSelect) {
    const options = [
      { key: 'random', label: '🎲 随机场景' },
      ...SCENES.filter(s => s.key !== 'all').map(s => ({ key: s.key, label: `${s.icon} ${s.label}` }))
    ];
    sceneSelect.innerHTML = options.map(o =>
      `<option value="${o.key}">${o.label}</option>`
    ).join('');
  }

  if (generateBtn && resultEl) {
    generateBtn.addEventListener('click', () => {
      let pool = state.allData;
      if (sceneSelect && sceneSelect.value !== 'random') {
        const sceneKey = sceneSelect.value;
        pool = pool.filter(item => item.scenes?.includes(sceneKey));
      }
      if (pool.length === 0) {
        resultEl.textContent = '暂无该场景的文案，换个场景试试吧~';
        return;
      }
      const randomItem = pool[Math.floor(Math.random() * pool.length)];
      resultEl.textContent = randomItem.content;
      resultEl.dataset.id = randomItem.id;
      resultEl.style.cursor = 'pointer';
      resultEl.onclick = () => openModal(randomItem);
    });
    resultEl.textContent = '点击上方「🎲 生成随机文案」按钮，获取今日好运文案~';
  }
}

function setupTodayRecommend() {
  if (state.allData.length === 0) return;
  const hotItems = state.allData.filter(d => d.isHot);
  const pool = hotItems.length > 0 ? hotItems : state.allData;
  const item = pool[Math.floor(Math.random() * pool.length)];
  const gi = item.gradientIndex ?? (item.id % GRADIENTS_COUNT);
  const card = document.querySelector('.today-card');
  if (card) {
    card.className = `today-card gradient-${gi}`;
    card.innerHTML = `
      <div class="today-content">${escapeHtml(item.content.length > 60 ? item.content.slice(0, 60) + '...' : item.content)}</div>
      <div class="today-meta">
        <span>—— ${escapeHtml(item.author || '佚名')}</span>
        <span>📝 ${item.wordCount}字</span>
      </div>
    `;
    card.addEventListener('click', () => openModal(item));
  }
}

function setupLogo() {
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      state.currentScene = 'all';
      state.currentType = 'all';
      state.searchQuery = '';
      state.showFavorites = false;
      state.currentSort = 'newest';
      const searchInput = document.querySelector('.search-box input');
      if (searchInput) searchInput.value = '';
      const sortSelect = document.querySelector('.sort-select');
      if (sortSelect) sortSelect.value = 'newest';
      document.querySelectorAll('.main-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.scene === 'all');
      });
      document.querySelectorAll('.type-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.type === 'all');
      });
      updateFavoritesCount();
      applyFilters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  applyTheme(loadTheme());
  loadFavorites();
  loadLikedIds();
  setupTabs();
  setupSearch();
  setupSort();
  setupThemeToggle();
  setupFavoritesToggle();
  setupModalKeyboard();
  setupBackToTop();
  setupLogo();

  await loadData();

  setupGenerator();
  setupTodayRecommend();
});
