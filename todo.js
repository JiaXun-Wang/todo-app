// ==================== TODO APP ====================

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const data = JSON.parse(raw);
    todos = data.todos || [];
    categories = data.categories || [];
  }
}
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos, categories }));
}


// Export / Import
function exportData() {
  const blob = new Blob([JSON.stringify({ todos, categories }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'todo_backup_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('数据已导出 ✓');
}

function handleImport() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.todos && Array.isArray(data.todos)) {
          todos = data.todos;
          categories = data.categories || [];
          updateCategories(); saveData(); renderTodos();
          showToast('数据已导入 ✓ (共 ' + todos.length + ' 条)');
        } else { showToast('无效的数据格式'); }
      } catch { showToast('文件解析失败'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

// Categories
function updateCategories() {
  const set = new Set(categories);
  todos.forEach(t => { if (t.category) set.add(t.category); });
  categories = [...set].sort();
}

function renderCategoryBar() {
  const el = document.getElementById('categoryBar');
  if (categories.length === 0) { el.innerHTML = ''; return; }
  const activeCat = document.getElementById('categoryFilter')?.dataset?.cat || 'all';
  el.innerHTML = `<span class="category-chip${activeCat === 'all' ? ' active' : ''}"
    onclick="filterByCategory('all')" style="font-weight:500;">全部</span>` +
    categories.map(c => {
      const count = todos.filter(t => t.category === c).length;
      const isActive = activeCat === c;
      return `<span class="category-chip${isActive ? ' active' : ''}"
        onclick="filterByCategory('${escapeHtml(c)}')">
        ${escapeHtml(c)}<span class="chip-count">${count}</span></span>`;
    }).join('');
}

function filterByCategory(cat) {
  const el = document.getElementById('categoryFilter');
  if (!el) {
    const hidden = document.createElement('input');
    hidden.type = 'hidden'; hidden.id = 'categoryFilter'; hidden.dataset.cat = cat;
    document.body.appendChild(hidden);
  } else { el.dataset.cat = cat; }
  renderTodos();
}

// Rendering
function getFilteredTodos() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';
  const priorityFilter = document.getElementById('priorityFilter')?.value || 'all';
  const categoryFilter = document.getElementById('categoryFilter')?.dataset?.cat || 'all';
  const today = new Date().toISOString().slice(0,10);

  let filtered = [...todos];
  if (search) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(search) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(search)) ||
      (t.category || '').toLowerCase().includes(search)
    );
  }
  if (statusFilter === 'active') filtered = filtered.filter(t => !t.completed);
  else if (statusFilter === 'completed') filtered = filtered.filter(t => t.completed);
  else if (statusFilter === 'overdue') filtered = filtered.filter(t => !t.completed && t.dueDate && t.dueDate < today);
  if (priorityFilter !== 'all') filtered = filtered.filter(t => t.priority === priorityFilter);
  if (categoryFilter !== 'all') filtered = filtered.filter(t => t.category === categoryFilter);
  filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return filtered;
}

function renderTodos() {
  const list = document.getElementById('todoList');
  const filtered = getFilteredTodos();
  renderCategoryBar();
  updateStats(filtered);
  updateCategoryDatalist();

  if (filtered.length === 0) {
    const search = document.getElementById('searchInput')?.value || '';
    list.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">${search ? '🔍' : '🐣'}</div>
      <p>${search ? '没有匹配的待办事项' : '还没有待办事项，点击「新建」开始吧~'}</p>
    </div>`;
    return;
  }

  const today = new Date().toISOString().slice(0,10);

  list.innerHTML = filtered.map((t, i) => {
    const completedClass = t.completed ? ' completed' : '';
    const overdueClass = !t.completed && t.dueDate && t.dueDate < today ? ' overdue' : '';

    let dueHtml = '';
    if (t.dueDate) {
      let dueClass = 'normal', dueLabel = t.dueDate;
      if (t.dueDate === today) { dueClass = 'today'; dueLabel = '今天到期'; }
      else if (t.dueDate < today && !t.completed) { dueClass = 'overdue'; dueLabel = '已逾期 ' + t.dueDate; }
      else if (t.dueDate < today && t.completed) { dueLabel = t.dueDate; }
      dueHtml = `<span class="due-date ${dueClass}">📅 ${dueLabel}</span>`;
    }

    let reminderHtml = '';
    if (t.reminder) {
      const rmDate = new Date(t.reminder);
      reminderHtml = `<span class="reminder-tag">⏰ ${rmDate.toLocaleString('zh-CN', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>`;
    }

    let priorityHtml = '';
    if (t.priority && t.priority !== 'low') {
      const label = t.priority === 'high' ? '高' : '中';
      priorityHtml = `<span class="tag tag-priority-${t.priority}">${label}</span>`;
    }

    let categoryHtml = '';
    if (t.category) categoryHtml = `<span class="tag tag-category">${escapeHtml(t.category)}</span>`;

    let tagsHtml = (t.tags || []).map(tag =>
      `<span class="tag tag-category">${escapeHtml(tag)}</span>`
    ).join('');

    // Repeat indicator
    let repeatHtml = '';
    if (t.repeat) {
      const repeatLabels = { daily: '每天重复', weekly: '每周重复', monthly: '每月重复' };
      repeatHtml = `<span class="tag tag-category" style="background:#e8f5e9;color:#4caf50;">🔄 ${repeatLabels[t.repeat] || t.repeat}</span>`;
    }

    // Note indicator
    let noteHtml = '';
    if (t.note) {
      noteHtml = `<span class="tag tag-category" style="background:#fff3e0;color:var(--warning);" title="${escapeHtml(t.note)}">📝 备注</span>`;
    }

    // Subtask progress
    let subtaskHtml = '';
    if (t.subtasks && t.subtasks.length > 0) {
      const done = t.subtasks.filter(s => s.completed).length;
      const total = t.subtasks.length;
      subtaskHtml = `<span class="tag tag-category" style="background:#e8f2ff;color:var(--accent);">📋 ${done}/${total}</span>`;
    }

    const isSelected = selectedIds.has(t.id);
    const selectHtml = `<div class="select-check${isSelected ? ' selected' : ''}" onclick="event.stopPropagation();toggleSelect('${t.id}')"></div>`;

    return `<div class="todo-item${completedClass}${overdueClass}" draggable="true"
      data-id="${t.id}" data-index="${i}"
      ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)"
      ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)" ondragend="handleDragEnd(event)">
      <span class="drag-handle" onmousedown="event.stopPropagation()">⋮⋮</span>
      ${selectHtml}
      <div class="checkbox${t.completed ? ' checked' : ''}" onclick="toggleComplete('${t.id}')"></div>
      <div class="todo-content" ondblclick="openEditModal('${t.id}')">
        <span class="todo-title">${escapeHtml(t.title)}</span>
        <div class="todo-meta">
          ${dueHtml} ${reminderHtml} ${priorityHtml} ${categoryHtml} ${repeatHtml} ${subtaskHtml} ${noteHtml} ${tagsHtml}
        </div>
      </div>
      <div class="todo-actions">
        <button class="btn-edit" onclick="openEditModal('${t.id}')" title="编辑">✎</button>
        <button class="btn-delete" onclick="deleteTodo('${t.id}')" title="删除">✕</button>
      </div>
    </div>`;
  }).join('');

  updateBatchBar();
}

function updateStats(filtered) {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  document.getElementById('statsText').textContent = `共 ${total} 项 · ${active} 进行中 · ${completed} 已完成`;
}

function updateBatchBar() {
  const bar = document.getElementById('batchActions');
  bar.classList.toggle('hidden', selectedIds.size === 0);
}

function updateCategoryDatalist() {
  const dl = document.getElementById('categoryDatalist');
  dl.innerHTML = categories.map(c => `<option value="${escapeHtml(c)}">`).join('');
}

// Actions
function openAddModal() {
  editingId = null;
  modalSubtasks = [];
  document.getElementById('modalTitle').textContent = '新建待办';
  document.getElementById('todoTitle').value = '';
  document.getElementById('todoPriority').value = 'medium';
  document.getElementById('todoDueDate').value = '';
  document.getElementById('todoReminder').value = '';
  document.getElementById('todoCategory').value = '';
  document.getElementById('todoTags').value = '';
  document.getElementById('todoRepeat').value = '';
  document.getElementById('todoNote').value = '';
  document.getElementById('subtaskList').innerHTML = '';
  document.getElementById('todoModal').style.display = 'flex';
  document.getElementById('todoTitle').focus();
}

function openEditModal(id) {
  const t = todos.find(x => x.id === id);
  if (!t) return;
  editingId = id;
  document.getElementById('modalTitle').textContent = '编辑待办';
  document.getElementById('todoTitle').value = t.title;
  document.getElementById('todoPriority').value = t.priority || 'medium';
  document.getElementById('todoDueDate').value = t.dueDate || '';
  document.getElementById('todoReminder').value = t.reminder ? t.reminder.slice(0,16) : '';
  document.getElementById('todoCategory').value = t.category || '';
  document.getElementById('todoTags').value = (t.tags || []).join(', ');
  document.getElementById('todoRepeat').value = t.repeat || '';
  document.getElementById('todoNote').value = t.note || '';
  modalSubtasks = (t.subtasks || []).map(s => ({...s}));
  renderSubtasksInModal(modalSubtasks);
  document.getElementById('todoModal').style.display = 'flex';
  document.getElementById('todoTitle').focus();
}

function closeModal() {
  document.getElementById('todoModal').style.display = 'none';
  editingId = null;
}

function saveTodo() {
  const title = document.getElementById('todoTitle').value.trim();
  if (!title) { showToast('请输入标题'); return; }

  const priority = document.getElementById('todoPriority').value;
  const dueDate = document.getElementById('todoDueDate').value;
  const reminder = document.getElementById('todoReminder').value;
  const category = document.getElementById('todoCategory').value.trim();
  const tagsStr = document.getElementById('todoTags').value.trim();
  const tags = tagsStr ? tagsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
  const repeat = document.getElementById('todoRepeat').value;
  const note = document.getElementById('todoNote').value.trim();

  if (editingId) {
    const t = todos.find(x => x.id === editingId);
    if (t) {
      t.title = title; t.priority = priority;
      t.dueDate = dueDate || null; t.reminder = reminder || null;
      t.category = category || null; t.tags = tags;
      t.repeat = repeat || null; t.note = note || null;
      t.subtasks = modalSubtasks;
    }
  } else {
    const maxOrder = todos.reduce((max, t) => Math.max(max, t.order ?? 0), 0);
    todos.push({
      id: generateId(), title, completed: false, priority,
      dueDate: dueDate || null, reminder: reminder || null,
      category: category || null, tags, order: maxOrder + 1,
      repeat: repeat || null, note: note || null,
      subtasks: modalSubtasks,
      createdAt: new Date().toISOString()
    });
  }

  updateCategories(); saveData(); closeModal(); renderTodos();
  showToast(editingId ? '已更新 ✓' : '已添加 ✓');
  editingId = null;
  scheduleCloudSync();
}

function toggleComplete(id) {
  const t = todos.find(x => x.id === id);
  if (t) { t.completed = !t.completed; saveData(); renderTodos(); }
  scheduleCloudSync();
}

function deleteTodo(id) {
  if (!confirm('确定要删除这条待办吗？')) return;
  todos = todos.filter(t => t.id !== id);
  selectedIds.delete(id);
  updateCategories(); saveData(); renderTodos();
  showToast('已删除');
}

function toggleSelect(id) {
  if (selectedIds.has(id)) selectedIds.delete(id);
  else selectedIds.add(id);
  renderTodos();
}

function toggleSelectAll() {
  const filtered = getFilteredTodos();
  if (selectedIds.size === filtered.length) selectedIds.clear();
  else filtered.forEach(t => selectedIds.add(t.id));
  renderTodos();
}

function batchMarkComplete() {
  if (selectedIds.size === 0) return;
  todos.forEach(t => { if (selectedIds.has(t.id)) t.completed = true; });
  selectedIds.clear(); saveData(); renderTodos();
  scheduleCloudSync();
  showToast('已批量完成 ✓');
}

function batchDelete() {
  if (selectedIds.size === 0) return;
  if (!confirm(`确定要删除选中的 ${selectedIds.size} 条待办吗？`)) return;
  todos = todos.filter(t => !selectedIds.has(t.id));
  selectedIds.clear(); updateCategories(); saveData(); renderTodos();
  scheduleCloudSync();
  showToast('已批量删除');
}

// Drag & Drop

function handleDragStart(e) {
  dragSrcIndex = parseInt(e.target.dataset.index);
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.target.closest('.todo-item')?.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.target.closest('.todo-item')?.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.target.closest('.todo-item')?.classList.remove('drag-over');
  const targetIndex = parseInt(e.target.closest('.todo-item')?.dataset.index);
  if (dragSrcIndex === null || targetIndex === null || dragSrcIndex === targetIndex) return;

  const filtered = getFilteredTodos();
  const srcItem = filtered[dragSrcIndex];
  const tgtItem = filtered[targetIndex];
  if (!srcItem || !tgtItem) return;

  const srcOrder = srcItem.order;
  const tgtOrder = tgtItem.order;
  if (dragSrcIndex < targetIndex) {
    todos.forEach(t => { if (t.order > srcOrder && t.order <= tgtOrder) t.order--; });
  } else {
    todos.forEach(t => { if (t.order >= tgtOrder && t.order < srcOrder) t.order++; });
  }
  srcItem.order = tgtOrder;
  saveData(); renderTodos();
  dragSrcIndex = null;
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.todo-item').forEach(el => el.classList.remove('drag-over'));
  dragSrcIndex = null;
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key === 'n' || e.key === 'N') { e.preventDefault(); openAddModal(); }
  if (e.key === 'Escape') closeModal();
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); exportData(); showToast('已保存 ✓'); }
});

// Reminder checker
function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('你的浏览器不支持通知');
    return;
  }
  if (Notification.permission === 'denied') {
    showToast('通知权限已被拒绝，请在浏览器设置中重新允许');
    return;
  }
  Notification.requestPermission().then(function(perm) {
    if (perm === 'granted') {
      showToast('通知已开启 ✓');
      var notifBtn = document.getElementById('notifEnableBtn');
      if (notifBtn) notifBtn.style.display = 'none';
    } else {
      showToast('通知权限被拒绝');
    }
  });
}

function pad2(n) { return (n < 10 ? '0' : '') + n; }

function checkReminders() {
  if (Notification.permission !== 'granted') {
    console.log('[reminder] skipped, permission:', Notification.permission);
    return;
  }
  var d = new Date();
  var now = d.getFullYear() + '-' +
    pad2(d.getMonth() + 1) + '-' +
    pad2(d.getDate()) + 'T' +
    pad2(d.getHours()) + ':' +
    pad2(d.getMinutes());
  console.log('[reminder] checking at', now, 'todos count:', todos.length);
  todos.forEach(function(t) {
    if (t.reminder && !t.reminderNotified && t.reminder.slice(0,16) === now && !t.completed) {
      console.log('[reminder] MATCH for', t.title, 'reminder:', t.reminder);
      try {
        new Notification('⏰ 待办提醒', {
          body: t.title,
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">📋</text></svg>',
          tag: 'todo-reminder-' + t.id,
          requireInteraction: true
        });
        console.log('[reminder] notification sent for', t.title);
      } catch(e) {
        console.error('[reminder] notification failed:', e);
      }
      t.reminderNotified = true;
      saveData();
    }
  });
}
setInterval(checkReminders, 30000);
checkReminders();

// Tab switching
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
}

// Helpers


	// Init

