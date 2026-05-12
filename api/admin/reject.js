const { readUsers, writeUsers, verifyToken } = require('../_lib/storage');

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
  if (req.method !== 'POST') {
    res.writeHead(405, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const auth = req.headers.authorization;
    if (!auth) {
      res.writeHead(401, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '未登录' }));
      return;
    }
    const admin = verifyToken(auth.replace('Bearer ', ''));
    if (!admin || admin.role !== 'admin') {
      res.writeHead(403, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '无管理员权限' }));
      return;
    }

    const { users, sha } = await readUsers();
    const { name } = req.body || {};
    const idx = users.findIndex(u => u.name === name && u.status === 'pending');
    if (idx === -1) {
      res.writeHead(404, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '未找到待审批用户' }));
      return;
    }

    users.splice(idx, 1);
    await writeUsers(users, sha);
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `已拒绝用户 ${name}` }));
  } catch (err) {
    res.writeHead(500, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '服务器错误: ' + err.message }));
  }
};
