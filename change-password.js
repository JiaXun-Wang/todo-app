// ==================== CHANGE PASSWORD ====================
function openChangePassword() {
  document.getElementById('changePwdPanel').style.display = 'flex';
  document.getElementById('changePwdError').textContent = '';
  document.getElementById('changePwdSuccess').textContent = '';
  document.getElementById('oldPassword').value = '';
  document.getElementById('newPassword').value = '';
}

function closeChangePwd() {
  document.getElementById('changePwdPanel').style.display = 'none';
}

async function handleChangePassword() {
  const oldPwd = document.getElementById('oldPassword').value;
  const newPwd = document.getElementById('newPassword').value;
  const errEl = document.getElementById('changePwdError');
  const sucEl = document.getElementById('changePwdSuccess');
  errEl.textContent = ''; sucEl.textContent = '';
  if (!oldPwd || !newPwd) { errEl.textContent = '请填写旧密码和新密码'; return; }
  if (newPwd.length < 4) { errEl.textContent = '新密码至少4位'; return; }
  const res = await apiCall('/api/change-password', { oldPassword: oldPwd, newPassword: newPwd });
  if (res.error) { errEl.textContent = res.error; return; }
  authToken = res.token;
  localStorage.setItem('auth_token', authToken);
  sucEl.textContent = '密码已修改';
  setTimeout(closeChangePwd, 1500);
}
