const { readUsers, writeUsers, corsHeaders, jsonResponse } = require('../_lib/storage');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { users, sha } = await readUsers();
    const { name } = req.body;

    const auth = req.headers.authorization;
    if (!auth) {
      return jsonResponse({ error: '未登录' }, 401);
    }
    const token = auth.replace('Bearer ', '');
    const admin = users.find(u => u.role === 'admin' && u.token === token);
    if (!admin) {
      return jsonResponse({ error: '无管理员权限' }, 403);
    }

    const idx = users.findIndex(u => u.name === name && u.status === 'pending');
    if (idx === -1) {
      return jsonResponse({ error: '未找到待审批用户' }, 404);
    }

    users.splice(idx, 1);
    await writeUsers(users, sha);

    return jsonResponse({ message: `已拒绝用户 ${name}` });
  } catch (err) {
    console.error('reject error:', err);
    return jsonResponse({ error: '服务器错误: ' + err.message }, 500);
  }
};
