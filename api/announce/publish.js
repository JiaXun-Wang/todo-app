const { verifyToken } = require('../_lib/storage');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

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

    const { text } = req.body || {};
    if (!text) {
      res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '公告内容不能为空' }));
      return;
    }

    // Read current announce
    const getRes = await fetch(API_BASE, { headers: apiHeaders(), signal: AbortSignal.timeout(10000) });
    let sha = null;
    if (getRes.status === 200) {
      const data = await getRes.json();
      sha = data.sha;
    }

    const announce = {
      text,
      id: Date.now().toString(36),
      updatedAt: new Date().toISOString()
    };

    const content = Buffer.from(JSON.stringify(announce, null, 2)).toString('base64');
    const body = { message: 'Update announce', content };
    if (sha) body.sha = sha;

    const putRes = await fetch(API_BASE, {
      method: 'PUT',
      headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000)
    });

    if (!putRes.ok) {
      throw new Error(`GitHub API write failed: ${putRes.status}`);
    }

    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: '公告已发布', id: announce.id }));
  } catch (err) {
    res.writeHead(500, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '服务器错误: ' + err.message }));
  }
};
