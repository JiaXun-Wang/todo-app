// ==================== CLOUD SYNC ====================
function scheduleCloudSync() {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(syncToCloud, 3000);
}

async function syncToCloud() {
  if (!authToken) return;
  try {
    await apiCall('/api/sync', { todos, categories });
    console.log('Cloud synced');
  } catch(e) { console.error('Sync failed:', e); }
}

async function loadFromCloud() {
		    checkAnnounce();
  if (!authToken) return;
  try {
    const res = await apiCall('/api/sync');
    if (res.todos) { todos = res.todos; categories = res.categories || []; }
  } catch(e) { console.error('Load failed:', e); }
}
