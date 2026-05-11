const { readUsers, corsHeaders, jsonResponse } = require('./_lib/storage');
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

async function readAnnounce() {
  const res = await fetch(API_BASE, { headers: apiHeaders() });
  if (res.status === 404) {
    return { data: { text: '', id: '' }, sha: null };
  }
  if (!res.ok) throw new Error(`GitHub API read failed: ${res.status}`);
  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf8');
  return { data: JSON.parse(content), sha: data.sha };
}

async function writeAnnounce(data, sha) {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const body = { message: 'Update announce', content, sha };
  const res = await fetch(API_BASE, {
    method: 'PUT',
    headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`GitHub API write failed: ${res.status}`);
  return res.json();
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { data } = await readAnnounce();
      return jsonResponse(data);
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (err) {
    console.error('announce error:', err);
    return jsonResponse({ error: '服务器错误: ' + err.message }, 500);
  }
};
