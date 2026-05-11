const { readUsers, writeUsers, corsHeaders, jsonResponse } = require('./_lib/storage');

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
    const { users, sha } = await readUsers();
    const user = users.find(u => u.token === token);
    if (!user) {
      return jsonResponse({ error: '登录已过期' }, 401);
    }

    if (req.method === 'GET') {
      return jsonResponse({
        todos: user.todos || [],
        categories: user.categories || []
      });
    }

    if (req.method === 'POST') {
      const { todos, categories } = req.body;
      user.todos = todos || [];
      user.categories = categories || [];
      user.lastSync = new Date().toISOString();
      await writeUsers(users, sha);
      return jsonResponse({ message: '同步成功' });
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (err) {
    console.error('sync error:', err);
    return jsonResponse({ error: '服务器错误: ' + err.message }, 500);
  }
};
