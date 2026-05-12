const { readUsers, writeUsers, hashPassword } = require('./_lib/storage');

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
    if (name.length < 2 || name.length > 20) {
      res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '名称长度需在2-20个字符之间' }));
      return;
    }
    if (password.length < 4) {
      res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '密码长度至少4位' }));
      return;
    }

    const { users, sha } = await readUsers();

    const existing = users.find(u => u.name === name);
    if (existing) {
      res.writeHead(409, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '该用户名已存在' }));
      return;
    }

    users.push({
      name,
      password: hashPassword(password),
      role: 'user',
      status: 'pending',
      token: null,
      createdAt: new Date().toISOString()
    });

    await writeUsers(users, sha);
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: '注册成功，等待管理员审批' }));
  } catch (err) {
    res.writeHead(500, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '服务器错误: ' + err.message }));
  }
};
