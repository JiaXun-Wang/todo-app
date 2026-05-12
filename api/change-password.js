const { readUsers, writeUsers, hashPassword, verifyToken, generateToken } = require('./_lib/storage');

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
    const tokenData = verifyToken(auth.replace('Bearer ', ''));
    if (!tokenData) {
      res.writeHead(401, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '登录已过期' }));
      return;
    }

    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) {
      res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '请填写旧密码和新密码' }));
      return;
    }
    if (newPassword.length < 4) {
      res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '新密码至少4位' }));
      return;
    }

    const { users, sha } = await readUsers();
    const user = users.find(u => u.name === tokenData.name);
    if (!user) {
      res.writeHead(401, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '用户不存在' }));
      return;
    }
    if (user.password !== hashPassword(oldPassword)) {
      res.writeHead(401, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '旧密码错误' }));
      return;
    }

    user.password = hashPassword(newPassword);
    await writeUsers(users, sha);

    const newToken = generateToken(user);
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: '密码修改成功', token: newToken }));
  } catch (err) {
    res.writeHead(500, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '服务器错误: ' + err.message }));
  }
};
