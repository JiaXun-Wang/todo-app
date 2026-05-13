// ==================== ANNOUNCEMENTS ====================

async function checkAnnounce() {
  try {
    const res = await apiCall('/api/announce');
    if (res.text && res.id) {
      const dismissed = localStorage.getItem('announce_dismissed');
      if (dismissed !== res.id) {
        document.getElementById('announceText').textContent = '📢 ' + res.text;
        document.getElementById('announceBar').style.display = 'block';
        announceId = res.id;
      }
    }
  } catch(e) {}
}

function dismissAnnounce() {
  document.getElementById('announceBar').style.display = 'none';
  if (announceId) localStorage.setItem('announce_dismissed', announceId);
}

async function publishAnnounce() {
  const text = prompt('输入公告内容:');
  if (!text) return;
  const res = await apiCall('/api/announce/publish', { text });
  if (res.error) { showToast(res.error); return; }
  showToast('公告已发布');
}
