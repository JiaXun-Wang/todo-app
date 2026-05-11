const { readUsers, writeUsers, hashPassword, generateToken, corsHeaders, jsonResponse } = require('./_lib/storage');

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

    const { users, sha } = await readUsers();

    const user = users.find(u => u.name === name);
    if (!user) {
      return jsonResponse({ error: '用户不存在' }, 401);
    }

    if (user.password !== hashPassword(password)) {
      return jsonResponse({ error: '密码错误' }, 401);
    }

    if (user.status === 'pending') {
      return jsonResponse({ error: '账号尚未通过管理员审批' }, 403);
    }

    if (user.status === 'rejected') {
      return jsonResponse({ error: '账号审批未通过' }, 403);
    }

    // Generate new token
    const token = generateToken();
    user.token = token;
    user.lastLogin = new Date().toISOString();
    await writeUsers(users, sha);

    return jsonResponse({
      message: '登录成功',
      token,
      name: user.name,
      role: user.role
    });
  } catch (err) {
    console.error('login error:', err);
    return jsonResponse({ error: '服务器错误: ' + err.message }, 500);
  }
};
