const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  try {
    if (req.method === 'GET') {
      const fetchRes = await fetch(API_BASE, { headers: apiHeaders(), signal: AbortSignal.timeout(10000) });
      if (fetchRes.status === 404) {
        res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ text: '', id: '' }));
        return;
      }
      if (!fetchRes.ok) throw new Error(`GitHub API read failed: ${fetchRes.status}`);
      const data = await fetchRes.json();
      const content = Buffer.from(data.content, 'base64').toString('utf8');
      const announce = JSON.parse(content);
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify(announce));
      return;
    }

    res.writeHead(405, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (err) {
    res.writeHead(500, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '服务器错误: ' + err.message }));
  }
};
