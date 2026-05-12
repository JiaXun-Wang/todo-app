const { readUsers, hashPassword, generateToken } = require('./_lib/storage');

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
    const { name, password } = req.body || {};
    if (!name || !password) {
      res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '名称和密码不能为空' }));
      return;
    }

    const { users } = await readUsers();
    const user = users.find(u => u.name === name);

    if (!user) {
      res.writeHead(401, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '用户不存在' }));
      return;
    }
    if (user.password !== hashPassword(password)) {
      res.writeHead(401, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '密码错误' }));
      return;
    }
    if (user.status === 'pending') {
      res.writeHead(403, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '账号尚未通过管理员审批' }));
      return;
    }
    if (user.status === 'rejected') {
      res.writeHead(403, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '账号审批未通过' }));
      return;
    }

    const token = generateToken(user);
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: '登录成功', token, name: user.name, role: user.role }));
  } catch (err) {
    res.writeHead(500, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '服务器错误: ' + err.message }));
  }
};
