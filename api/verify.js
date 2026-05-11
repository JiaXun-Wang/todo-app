const { readUsers, corsHeaders, jsonResponse } = require('./_lib/storage');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return jsonResponse({ error: '未登录' }, 401);
    }
    const token = auth.replace('Bearer ', '');
    const { users } = await readUsers();
    const user = users.find(u => u.token === token);
    if (!user) {
      return jsonResponse({ error: '登录已过期' }, 401);
    }
    return jsonResponse({
      name: user.name,
      role: user.role,
      status: user.status
    });
  } catch (err) {
    console.error('verify error:', err);
    return jsonResponse({ error: '服务器错误: ' + err.message }, 500);
  }
};
