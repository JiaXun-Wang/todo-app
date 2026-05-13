// ==================== THEME ====================
function loadTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('darkModeToggle').checked = theme === 'dark';
  updateDarkModeUI(theme === 'dark');

  const accent = localStorage.getItem('accent') || 'blue';
  document.documentElement.setAttribute('data-accent', accent);
  document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('active'));
  const activeDot = document.querySelector('.accent-dot.' + accent);
  if (activeDot) activeDot.classList.add('active');

  const bg = localStorage.getItem('bg_image');
  if (bg) {
    document.body.style.backgroundImage = 'url(' + bg + ')';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
    document.getElementById('bgClearRow').style.display = 'flex';
    document.getElementById('bgImageUrl').value = bg;
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateDarkModeUI(!isDark);
}

function updateDarkModeUI(isDark) {
  document.getElementById('darkModeToggle').checked = isDark;
  document.getElementById('themeToggleBtn').textContent = isDark ? '☀️' : '🌙';
  const slider = document.getElementById('darkModeSlider');
  const knob = document.getElementById('darkModeKnob');
  if (isDark) {
    slider.style.background = 'var(--accent)';
    knob.style.left = '25px';
  } else {
    slider.style.background = 'var(--border)';
    knob.style.left = '3px';
  }
}

function setAccent(color) {
  document.documentElement.setAttribute('data-accent', color);
  localStorage.setItem('accent', color);
  document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('active'));
  const dot = document.querySelector('.accent-dot.' + color);
  if (dot) dot.classList.add('active');
}

function openThemeSettings() {
  document.getElementById('themeSettings').style.display = 'flex';
  document.getElementById('darkModeToggle').checked =
    document.documentElement.getAttribute('data-theme') === 'dark';
  updateDarkModeUI(document.getElementById('darkModeToggle').checked);
}

function closeThemeSettings() {
  document.getElementById('themeSettings').style.display = 'none';
}

function setBgImage() {
  const url = document.getElementById('bgImageUrl').value.trim();
  if (!url) { clearBgImage(); return; }
  localStorage.setItem('bg_image', url);
  document.body.style.backgroundImage = 'url(' + url + ')';
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundAttachment = 'fixed';
  document.getElementById('bgClearRow').style.display = 'flex';
}

function handleBgUpload() {
  const file = document.getElementById('bgImageFile').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    localStorage.setItem('bg_image', dataUrl);
    document.body.style.backgroundImage = 'url(' + dataUrl + ')';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
    document.getElementById('bgImageUrl').value = '[本地图片]';
    document.getElementById('bgClearRow').style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

function clearBgImage() {
  localStorage.removeItem('bg_image');
  document.body.style.backgroundImage = '';
  document.body.style.backgroundSize = '';
  document.body.style.backgroundAttachment = '';
  document.getElementById('bgImageUrl').value = '';
  document.getElementById('bgClearRow').style.display = 'none';
}


