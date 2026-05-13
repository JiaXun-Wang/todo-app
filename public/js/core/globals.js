// ==================== SHARED GLOBALS & UTILITIES ====================

const API_BASE = 'https://wjxblog.online';

let authToken = null;
let currentUser = null;

let loginAttempts = 0, lockoutUntil = 0;

let syncTimeout = null;

let modalSubtasks = [];

let gameCorrectCount = 0;
let gameDrawCount = 0;

let announceId = null;

const STORAGE_KEY = 'todo_app_data';
let todos = [];
let categories = [];
let editingId = null;
let selectedIds = new Set();
let dragSrcIndex = null;

async function apiCall(path, body) {
  body = body || null;
  var opts = {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  if (authToken) opts.headers['Authorization'] = 'Bearer ' + authToken;
  var res = await fetch(API_BASE + path, opts);
  return res.json();
}

function updateLockoutTimer() {
  var el = document.getElementById('lockoutTimer');
  if (!el || el.style.display === 'none') return;
  var remain = Math.ceil((lockoutUntil - Date.now()) / 1000);
  if (remain <= 0) { el.style.display = 'none'; loginAttempts = 0; return; }
  el.textContent = '登录已锁定，请 ' + remain + ' 秒后重试';
  setTimeout(updateLockoutTimer, 1000);
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(msg) {
  var existing = document.querySelector('.toast');
  if (existing) existing.remove();
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 2000);
}
