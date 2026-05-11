const { readUsers, writeUsers, hashPassword, corsHeaders, jsonResponse } = require('./_lib/storage');

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
    const { name, password } = req.body;
    if (!name || !password) {
      return jsonResponse({ error: '名称和密码不能为空' }, 400);
    }
    if (name.length < 2 || name.length > 20) {
      return jsonResponse({ error: '名称长度需在2-20个字符之间' }, 400);
    }
    if (password.length < 4) {
      return jsonResponse({ error: '密码长度至少4位' }, 400);
    }

    const { users, sha } = await readUsers();

    const existing = users.find(u => u.name === name);
    if (existing) {
      return jsonResponse({ error: '该用户名已存在' }, 409);
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
    return jsonResponse({ message: '注册成功，等待管理员审批' });
  } catch (err) {
    console.error('register error:', err);
    return jsonResponse({ error: '服务器错误: ' + err.message }, 500);
  }
};
