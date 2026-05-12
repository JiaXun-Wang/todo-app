const crypto = require('crypto');

const REPO_OWNER = 'JiaXun-Wang';
const REPO_NAME = 'todo-app';
const DATA_PATH = 'data/users.json';
const GH_TOKEN = process.env.GH_TOKEN;

const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`;

function apiHeaders() {
  return {
    'Authorization': `token ${GH_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'todo-app'
  };
}

async function readUsers() {
  const res = await fetch(API_BASE, {
    headers: apiHeaders(),
    signal: AbortSignal.timeout(10000)
  });
  if (res.status === 404) {
    return { users: [], sha: null };
  }
  if (!res.ok) {
    throw new Error(`GitHub API read failed: ${res.status}`);
  }
  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf8');
  return { users: JSON.parse(content), sha: data.sha };
}

async function writeUsers(users, sha) {
  const content = Buffer.from(JSON.stringify(users, null, 2)).toString('base64');
  const body = {
    message: 'Update users.json',
    content,
    sha
  };
  const res = await fetch(API_BASE, {
    method: 'PUT',
    headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) {
    throw new Error(`GitHub API write failed: ${res.status}`);
  }
  return res.json();
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'todo-app-secret-key-2026';

function generateToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    name: user.name,
    role: user.role,
    status: user.status,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    if (signature !== expectedSig) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp && Date.now() > data.exp * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

function jsonResponse(data, status = 200) {
  return {
    statusCode: status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
}

module.exports = { readUsers, writeUsers, hashPassword, generateToken, verifyToken, corsHeaders, jsonResponse };
