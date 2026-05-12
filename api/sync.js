const { readUsers, writeUsers, verifyToken } = require('./_lib/storage');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  try {
    const auth = req.headers.authorization;
    if (!auth) {
      res.writeHead(401, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '未登录' }));
      return;
    }
    const tokenData = verifyToken(auth.replace('Bearer ', ''));
    if (!tokenData) {
      res.writeHead(401, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '登录已过期' }));
      return;
    }

    const { users, sha } = await readUsers();
    const user = users.find(u => u.name === tokenData.name);
    if (!user) {
      res.writeHead(401, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '用户不存在' }));
      return;
    }

    if (req.method === 'GET') {
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ todos: user.todos || [], categories: user.categories || [] }));
      return;
    }

    if (req.method === 'POST') {
      const { todos, categories } = req.body || {};
      user.todos = todos || [];
      user.categories = categories || [];
      user.lastSync = new Date().toISOString();
      await writeUsers(users, sha);
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: '同步成功' }));
      return;
    }

    res.writeHead(405, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (err) {
    res.writeHead(500, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '服务器错误: ' + err.message }));
  }
};
