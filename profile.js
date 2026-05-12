// ==================== PROFILE ====================

function openProfile() {
  document.getElementById('profilePanel').style.display = 'flex';
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profileRole').textContent = currentUser.role === 'admin' ? '管理员' : '用户';
  const avatar = localStorage.getItem('user_avatar') || '🐱';
  document.getElementById('profileAvatar').textContent = avatar;
  const sig = localStorage.getItem('user_signature') || '';
  document.getElementById('profileSignature').value = sig;

  // Calculate stats
  const now = new Date();
  const created = currentUser.createdAt ? new Date(currentUser.createdAt) : now;
  const days = Math.max(1, Math.floor((now - created) / (24 * 3600 * 1000)));
  document.getElementById('statDays').textContent = days;
  document.getElementById('statCompleted').textContent = todos.filter(t => t.completed).length;
  document.getElementById('statTotal').textContent = todos.length;
  document.getElementById('statGameWins').textContent = gameCorrectCount;
}

function closeProfile() {
  document.getElementById('profilePanel').style.display = 'none';
}

function cycleAvatar() {
  const avatars = ['🐱','🐶','🐰','🐼','🦊','🐸','🐵','🦁','🐮','🐷','🐭','🐹','🐻','🐨','🐯','🦄','🐙','🐳','🦋','🐞'];
  const current = document.getElementById('profileAvatar').textContent;
  const idx = avatars.indexOf(current);
  const next = avatars[(idx + 1) % avatars.length];
  document.getElementById('profileAvatar').textContent = next;
  localStorage.setItem('user_avatar', next);
}

function saveSignature() {
  const sig = document.getElementById('profileSignature').value.trim();
  localStorage.setItem('user_signature', sig);
  showToast('签名已保存');
}

// Track game stats
const origHandleGameData = handleGameData;
handleGameData = function(data, peerId) {
  origHandleGameData(data, peerId);
  if (data.type === 'guess' && data.correct && data.peerId === myPeerId) {
    gameCorrectCount++;
  }
  if (data.type === 'new_round' && data.drawerPeerId === myPeerId) {
    gameDrawCount++;
  }
};
