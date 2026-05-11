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
  const res = await fetch(API_BASE, { headers: apiHeaders() });
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
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`GitHub API write failed: ${res.status}`);
  }
  return res.json();
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
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

module.exports = { readUsers, writeUsers, hashPassword, generateToken, corsHeaders, jsonResponse };
