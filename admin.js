// ==================== ADMIN ====================
async function openAdminPanel() {
  document.getElementById('adminPanel').style.display = 'flex';
  await loadAdminUsers();
}

function closeAdminPanel() {
  document.getElementById('adminPanel').style.display = 'none';
}

async function loadAdminUsers() {
  const list = document.getElementById('adminUserList');
  list.innerHTML = '<p style="color:var(--text-secondary);">加载中...</p>';
  const res = await apiCall('/api/admin/users');
  if (res.error) { list.innerHTML = '<p style="color:var(--danger);">' + res.error + '</p>'; return; }
  const pending = res.users.filter(u => u.status === 'pending');
  const approved = res.users.filter(u => u.status === 'approved');
  let html = '<p style="font-size:13px;color:var(--text-secondary);margin-bottom:10px;">待审批: ' + pending.length + ' 人</p>';
  if (res.users.length === 0) {
    html += '<p style="color:var(--text-tertiary);text-align:center;padding:20px;">暂无用户</p>';
  }
  res.users.forEach(u => {
    let badge = '';
    if (u.role === 'admin') badge = '<span class="badge-status badge-admin">管理员</span>';
    else if (u.status === 'pending') badge = '<span class="badge-status badge-pending">待审批</span>';
    else if (u.status === 'approved') badge = '<span class="badge-status badge-approved">已通过</span>';
    let actions = '';
    if (u.status === 'pending') {
      actions = '<button class="btn btn-success btn-sm" onclick="approveUser(\'' + escapeHtml(u.name) + '\')">通过</button>' +
        '<button class="btn btn-danger btn-sm" onclick="rejectUser(\'' + escapeHtml(u.name) + '\')">拒绝</button>';
    }
    html += '<div class="admin-user-row">' +
      '<div class="admin-user-info"><div class="admin-user-name">' + escapeHtml(u.name) + '</div>' +
      '<div class="admin-user-meta">' + badge + ' 注册: ' + (u.createdAt ? u.createdAt.slice(0,10) : '--') + '</div></div>' +
      '<div class="admin-user-actions">' + actions + '</div></div>';
  });
  list.innerHTML = html;
}

async function approveUser(name) {
  const res = await apiCall('/api/admin/approve', { name });
  if (res.error) { showToast(res.error); return; }
  showToast(res.message);
  loadAdminUsers();
}

async function rejectUser(name) {
  if (!confirm('确定拒绝用户 ' + name + ' 的注册吗？')) return;
  const res = await apiCall('/api/admin/reject', { name });
  if (res.error) { showToast(res.error); return; }
  showToast(res.message);
  loadAdminUsers();
}
