// ==================== AUTH ====================

function switchAuthCard(type) {
  document.getElementById('authCardLogin').style.display = type === 'login' ? 'block' : 'none';
  document.getElementById('authCardRegister').style.display = type === 'register' ? 'block' : 'none';
  document.getElementById('authCardPending').style.display = type === 'pending' ? 'block' : 'none';
  document.getElementById('authError').textContent = '';
  document.getElementById('regError').textContent = '';
  document.getElementById('regSuccess').textContent = '';
  document.getElementById('authSuccess').textContent = '';
}

function togglePassword(inputId, btn) {
  const el = document.getElementById(inputId);
  if (el.type === 'password') { el.type = 'text'; btn.textContent = '🙈'; }
  else { el.type = 'password'; btn.textContent = '👁'; }
}


async function handleLogin() {
  const errEl = document.getElementById('authError');
  errEl.textContent = '';
  document.getElementById('authSuccess').textContent = '';

  // Check lockout
  const now = Date.now();
  if (now < lockoutUntil) {
    const remain = Math.ceil((lockoutUntil - now) / 1000);
    document.getElementById('lockoutTimer').style.display = 'block';
    document.getElementById('lockoutTimer').textContent = '登录已锁定，请 ' + remain + ' 秒后重试';
    updateLockoutTimer();
    return;
  }
  document.getElementById('lockoutTimer').style.display = 'none';

  const name = document.getElementById('loginName').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!name || !password) { errEl.textContent = '请填写用户名和密码'; return; }
  const btn = document.querySelector('#authCardLogin .btn-auth');
  btn.disabled = true; btn.textContent = '登录中...';
  const res = await apiCall('/api/login', { name, password });
  btn.disabled = false; btn.textContent = '登 录';
  if (res.error) {
    errEl.textContent = res.error;
    loginAttempts++;
    if (loginAttempts >= 3) {
      lockoutUntil = Date.now() + 30000;
      document.getElementById('lockoutTimer').style.display = 'block';
      updateLockoutTimer();
      errEl.textContent = '密码错误次数过多，已锁定 30 秒';
    }
    return;
  }
  loginAttempts = 0; lockoutUntil = 0;
  document.getElementById('lockoutTimer').style.display = 'none';

  // Remember me: persist token for 7 days
  if (document.getElementById('rememberMe').checked) {
    localStorage.setItem('auth_token_persist', res.token);
    localStorage.setItem('auth_user_persist', JSON.stringify({ name: res.name, role: res.role }));
    localStorage.setItem('auth_expires', String(Date.now() + 7 * 24 * 3600 * 1000));
  }

  authToken = res.token;
  currentUser = { name: res.name, role: res.role };
  localStorage.setItem('auth_token', authToken);
  localStorage.setItem('auth_user', JSON.stringify(currentUser));
  document.getElementById('authOverlay').style.display = 'none';
  initApp();
}


async function handleRegister() {
  const name = document.getElementById('registerName').value.trim();
  const password = document.getElementById('registerPassword').value;
  const password2 = document.getElementById('registerPassword2').value;
  const errEl = document.getElementById('regError');
  const sucEl = document.getElementById('regSuccess');
  errEl.textContent = ''; sucEl.textContent = '';
  if (!name || !password) { errEl.textContent = '请填写用户名和密码'; return; }
  if (name.length < 2 || name.length > 20) { errEl.textContent = '用户名需2-20个字符'; return; }
  if (password.length < 4) { errEl.textContent = '密码至少4位'; return; }
  if (password !== password2) { errEl.textContent = '两次密码不一致'; return; }
  const btn = document.querySelector('#authCardRegister .btn-auth');
  btn.disabled = true; btn.textContent = '注册中...';
  const res = await apiCall('/api/register', { name, password });
  btn.disabled = false; btn.textContent = '注 册';
  if (res.error) { errEl.textContent = res.error; return; }
  // Show pending approval card
  switchAuthCard('pending');
  document.getElementById('registerName').value = '';
  document.getElementById('registerPassword').value = '';
  document.getElementById('registerPassword2').value = '';
}

async function verifyToken() {
  // Check persisted token first
  let token = localStorage.getItem('auth_token');
  let user = localStorage.getItem('auth_user');
  const persistToken = localStorage.getItem('auth_token_persist');
  const persistUser = localStorage.getItem('auth_user_persist');
  const expires = localStorage.getItem('auth_expires');

  if (!token && persistToken && expires && Date.now() < parseInt(expires)) {
    token = persistToken;
    user = persistUser;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', user);
  }

  if (!token || !user) return false;
  authToken = token;
  const res = await apiCall('/api/verify');
  if (res.error) {
    authToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token_persist');
    localStorage.removeItem('auth_user_persist');
    localStorage.removeItem('auth_expires');
    return false;
  }
  currentUser = { name: res.name, role: res.role };
  localStorage.setItem('auth_user', JSON.stringify(currentUser));

  // Check for approval notification
  if (res.status === 'approved' && localStorage.getItem('auth_pending_notified')) {
    localStorage.removeItem('auth_pending_notified');
    const sucEl = document.getElementById('authSuccess');
    if (sucEl) sucEl.textContent = '🎉 你的账号已通过审批，欢迎回来！';
  }
  return true;
}

function handleLogout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_token_persist');
  localStorage.removeItem('auth_user_persist');
  localStorage.removeItem('auth_expires');
  document.getElementById('authOverlay').style.display = 'flex';
  switchAuthCard('login');
  document.getElementById('loginName').value = '';
  document.getElementById('loginPassword').value = '';
}

