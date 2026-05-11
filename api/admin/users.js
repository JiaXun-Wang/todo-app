const { readUsers, corsHeaders, jsonResponse } = require('../_lib/storage');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  try {
    const { users } = await readUsers();

    const auth = req.headers.authorization;
    if (!auth) {
      return jsonResponse({ error: '未登录' }, 401);
    }
    const token = auth.replace('Bearer ', '');
    const admin = users.find(u => u.role === 'admin' && u.token === token);
    if (!admin) {
      return jsonResponse({ error: '无管理员权限' }, 403);
    }

    // Return safe user list (no passwords)
    const safeUsers = users.map(u => ({
      name: u.name,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin
    }));

    return jsonResponse({ users: safeUsers });
  } catch (err) {
    console.error('admin users error:', err);
    return jsonResponse({ error: '服务器错误: ' + err.message }, 500);
  }
};
