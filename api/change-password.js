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
    const auth = req.headers.authorization;
    if (!auth) {
      return jsonResponse({ error: '未登录' }, 401);
    }
    const token = auth.replace('Bearer ', '');

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return jsonResponse({ error: '请填写旧密码和新密码' }, 400);
    }
    if (newPassword.length < 4) {
      return jsonResponse({ error: '新密码至少4位' }, 400);
    }

    const { users, sha } = await readUsers();
    const user = users.find(u => u.token === token);
    if (!user) {
      return jsonResponse({ error: '登录已过期' }, 401);
    }
    if (user.password !== hashPassword(oldPassword)) {
      return jsonResponse({ error: '旧密码错误' }, 401);
    }

    user.password = hashPassword(newPassword);
    user.token = generateToken(); // Invalidate old token
    await writeUsers(users, sha);

    return jsonResponse({ message: '密码修改成功', token: user.token });
  } catch (err) {
    console.error('change password error:', err);
    return jsonResponse({ error: '服务器错误: ' + err.message }, 500);
  }
};
