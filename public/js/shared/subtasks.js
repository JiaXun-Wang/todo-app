// ==================== SUBTASKS ====================
function renderSubtasksInModal(subtasks) {
  const el = document.getElementById('subtaskList');
  if (!el) return;
  let html = '<div style="font-size:12px;color:var(--text-secondary);margin:4px 0;">子任务:</div>';
  (subtasks || []).forEach((st, i) => {
    html += '<div style="display:flex;align-items:center;gap:6px;margin:3px 0;">' +
      '<input type="checkbox" ' + (st.completed ? 'checked' : '') + ' style="width:14px;height:14px;cursor:pointer;" onchange="toggleSubtaskInModal(' + i + ', this.checked)">' +
      '<span style="flex:1;font-size:13px;' + (st.completed ? 'text-decoration:line-through;color:var(--text-tertiary);' : '') + '">' + escapeHtml(st.title) + '</span>' +
      '<button onclick="removeSubtaskInModal(' + i + ')" style="background:none;border:none;cursor:pointer;color:var(--danger);font-size:14px;">x</button>' +
      '</div>';
  });
  html += '<div style="display:flex;gap:6px;margin-top:6px;" id="subtaskInput">' +
    '<input type="text" id="subtaskNewTitle" placeholder="添加子任务..." style="flex:1;padding:6px 8px;border-radius:6px;border:1px solid var(--border);font-size:13px;font-family:inherit;outline:none;background:var(--bg);" onkeydown="if(event.key===\'Enter\')addSubtaskInModal()">' +
    '<button class="btn btn-primary btn-sm" onclick="addSubtaskInModal()">+</button>' +
    '</div>';
  el.innerHTML = html;
}

function addSubtaskInModal() {
  const input = document.getElementById('subtaskNewTitle');
  const title = input.value.trim();
  if (!title) return;
  modalSubtasks.push({ id: generateId(), title, completed: false });
  input.value = '';
  renderSubtasksInModal(modalSubtasks);
}
function toggleSubtaskInModal(idx, checked) {
  if (modalSubtasks[idx]) modalSubtasks[idx].completed = checked;
  renderSubtasksInModal(modalSubtasks);
}
function removeSubtaskInModal(idx) {
  modalSubtasks.splice(idx, 1);
  renderSubtasksInModal(modalSubtasks);
}

