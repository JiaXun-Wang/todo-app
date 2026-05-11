const { readUsers, corsHeaders, jsonResponse } = require('../_lib/storage');
const crypto = require('crypto');

const REPO_OWNER = 'JiaXun-Wang';
const REPO_NAME = 'todo-app';
const ANNOUNCE_PATH = 'data/announce.json';
const GH_TOKEN = process.env.GH_TOKEN;
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${ANNOUNCE_PATH}`;

function apiHeaders() {
  return {
    'Authorization': `token ${GH_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'todo-app'
  };
}

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
    const { users } = await readUsers();
    const admin = users.find(u => u.role === 'admin' && u.token === token);
    if (!admin) {
      return jsonResponse({ error: '无管理员权限' }, 403);
    }

    const { text } = req.body;
    if (!text) {
      return jsonResponse({ error: '公告内容不能为空' }, 400);
    }

    // Read current announce
    const res = await fetch(API_BASE, { headers: apiHeaders() });
    let sha = null;
    if (res.status === 200) {
      const data = await res.json();
      sha = data.sha;
    }

    const announce = {
      text,
      id: Date.now().toString(36),
      updatedAt: new Date().toISOString()
    };

    const content = Buffer.from(JSON.stringify(announce, null, 2)).toString('base64');
    const body = { message: 'Update announce', content, sha };
    if (!sha) delete body.sha;

    const putRes = await fetch(API_BASE, {
      method: 'PUT',
      headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!putRes.ok) {
      throw new Error(`GitHub API write failed: ${putRes.status}`);
    }

    return jsonResponse({ message: '公告已发布', id: announce.id });
  } catch (err) {
    console.error('publish announce error:', err);
    return jsonResponse({ error: '服务器错误: ' + err.message }, 500);
  }
};
