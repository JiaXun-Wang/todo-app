const { readRooms, writeRooms, verifyToken, corsHeaders } = require('../_lib/storage');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  try {
    const auth = req.headers.authorization;
    if (!auth) {
      res.writeHead(401, { ...corsHeaders(), 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '未登录' }));
      return;
    }
    const tokenData = verifyToken(auth.replace('Bearer ', ''));
    if (!tokenData) {
      res.writeHead(401, { ...corsHeaders(), 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '登录已过期' }));
      return;
    }

    if (req.method === 'GET') {
      const { rooms } = await readRooms();
      const now = Date.now();
      const alive = rooms.filter(r =>
        r.status === 'active' &&
        r.lastHeartbeat &&
        (now - new Date(r.lastHeartbeat).getTime()) < 90000
      );
      // Strip internal hostPeerId from public listing
      const safe = alive.map(r => ({
        id: r.id,
        name: r.name,
        hostName: r.hostName,
        playerCount: (r.players || []).length,
        createdAt: r.createdAt
      }));
      res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ rooms: safe }));
      return;
    }

    if (req.method === 'POST') {
      const { action, roomId, name, hostName, hostPeerId, playerName, peerId } = req.body || {};
      const userName = tokenData.name;
      const userRole = tokenData.role;
      const { rooms, sha } = await readRooms();

      switch (action) {
        case 'create': {
          if (!roomId || !hostName) {
            res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '缺少参数' }));
            return;
          }
          rooms.push({
            id: roomId,
            name: name || hostName + '的房间',
            hostName: userName,
            hostPeerId: hostPeerId || '',
            status: 'active',
            players: [{ name: hostName, peerId: hostPeerId || '' }],
            joinRequests: [],
            createdAt: new Date().toISOString(),
            lastHeartbeat: new Date().toISOString()
          });
          await writeRooms(rooms, sha);
          res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '房间已创建' }));
          return;
        }

        case 'request_join': {
          if (!roomId || !playerName) {
            res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '缺少参数' }));
            return;
          }
          const room = rooms.find(r => r.id === roomId && r.status === 'active');
          if (!room) {
            res.writeHead(404, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '房间不存在或已关闭' }));
            return;
          }
          if (room.joinRequests.find(jr => jr.name === playerName)) {
            res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '已申请，请等待房主审批' }));
            return;
          }
          room.joinRequests.push({ name: playerName, peerId: peerId || null, requestedAt: new Date().toISOString() });
          await writeRooms(rooms, sha);
          res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '申请已发送' }));
          return;
        }

        case 'approve_join': {
          if (!roomId || !playerName) {
            res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '缺少参数' }));
            return;
          }
          const room = rooms.find(r => r.id === roomId && r.status === 'active');
          if (!room) {
            res.writeHead(404, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '房间不存在或已关闭' }));
            return;
          }
          if (room.hostName !== userName) {
            res.writeHead(403, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '只有房主可以审批' }));
            return;
          }
          room.joinRequests = (room.joinRequests || []).filter(jr => jr.name !== playerName);
          if (!room.players.find(p => p.name === playerName)) {
            room.players.push({ name: playerName, peerId: peerId || '' });
          }
          await writeRooms(rooms, sha);
          res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '已同意', hostPeerId: room.hostPeerId }));
          return;
        }

        case 'reject_join': {
          if (!roomId || !playerName) {
            res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '缺少参数' }));
            return;
          }
          const room = rooms.find(r => r.id === roomId && r.status === 'active');
          if (!room) {
            res.writeHead(404, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '房间不存在或已关闭' }));
            return;
          }
          if (room.hostName !== userName) {
            res.writeHead(403, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '只有房主可以审批' }));
            return;
          }
          room.joinRequests = (room.joinRequests || []).filter(jr => jr.name !== playerName);
          await writeRooms(rooms, sha);
          res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '已拒绝' }));
          return;
        }

        case 'player_join': {
          if (!roomId || !playerName) {
            res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '缺少参数' }));
            return;
          }
          const room = rooms.find(r => r.id === roomId && r.status === 'active');
          if (!room) {
            res.writeHead(404, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '房间不存在或已关闭' }));
            return;
          }
          if (!room.players.find(p => p.name === playerName)) {
            room.players.push({ name: playerName, peerId: peerId || '' });
          }
          await writeRooms(rooms, sha);
          res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'ok' }));
          return;
        }

        case 'player_leave': {
          if (!roomId || !playerName) {
            res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '缺少参数' }));
            return;
          }
          const room = rooms.find(r => r.id === roomId);
          if (room) {
            room.players = (room.players || []).filter(p => p.name !== playerName);
            await writeRooms(rooms, sha);
          }
          res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'ok' }));
          return;
        }

        case 'heartbeat': {
          if (!roomId) {
            res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '缺少参数' }));
            return;
          }
          const room = rooms.find(r => r.id === roomId);
          if (room) {
            if (room.hostName !== userName) {
              res.writeHead(403, { ...corsHeaders(), 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: '只有房主可以发心跳' }));
              return;
            }
            if (room.status === 'closed') {
              res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ closed: true, message: '房间已被管理员关闭' }));
              return;
            }
            room.lastHeartbeat = new Date().toISOString();
            await writeRooms(rooms, sha);
          }
          res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ closed: false }));
          return;
        }

        case 'close': {
          if (!roomId) {
            res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '缺少参数' }));
            return;
          }
          const room = rooms.find(r => r.id === roomId);
          if (!room) {
            res.writeHead(404, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '房间不存在' }));
            return;
          }
          if (room.hostName !== userName) {
            res.writeHead(403, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '只有房主可以关闭房间' }));
            return;
          }
          room.status = 'closed';
          await writeRooms(rooms, sha);
          res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '房间已关闭' }));
          return;
        }

        case 'admin_close': {
          if (userRole !== 'admin') {
            res.writeHead(403, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '仅管理员可操作' }));
            return;
          }
          if (roomId) {
            const room = rooms.find(r => r.id === roomId);
            if (!room) {
              res.writeHead(404, { ...corsHeaders(), 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: '房间不存在' }));
              return;
            }
            room.status = 'closed';
          } else {
            rooms.forEach(r => { r.status = 'closed'; });
          }
          await writeRooms(rooms, sha);
          res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: roomId ? '房间已关闭' : '所有房间已关闭' }));
          return;
        }

        case 'takeover': {
          if (!roomId || !hostName) {
            res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '缺少参数' }));
            return;
          }
          const room = rooms.find(r => r.id === roomId && r.status === 'active');
          if (!room) {
            res.writeHead(404, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '房间不存在或已关闭' }));
            return;
          }
          room.hostName = hostName;
          room.lastHeartbeat = new Date().toISOString();
          await writeRooms(rooms, sha);
          res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '已接管房间' }));
          return;
        }

        case 'admin_list': {
          if (userRole !== 'admin') {
            res.writeHead(403, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '仅管理员可操作' }));
            return;
          }
          res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ rooms }));
          return;
        }

        case 'poll': {
          // Room host polls for join requests and status changes
          if (!roomId) {
            res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '缺少参数' }));
            return;
          }
          const room = rooms.find(r => r.id === roomId);
          if (!room) {
            res.writeHead(404, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '房间不存在' }));
            return;
          }
          res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: room.status,
            joinRequests: (room.hostName === userName) ? (room.joinRequests || []) : [],
            players: room.players || []
          }));
          return;
        }

        case 'poll_join': {
          // Applicant polls to check if approved/rejected
          if (!roomId || !playerName) {
            res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '缺少参数' }));
            return;
          }
          const room = rooms.find(r => r.id === roomId);
          if (!room || room.status === 'closed') {
            res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'closed' }));
            return;
          }
          const stillPending = (room.joinRequests || []).find(jr => jr.name === playerName);
          const isPlayer = (room.players || []).find(p => p.name === playerName);
          if (isPlayer) {
            res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'approved', hostPeerId: room.hostPeerId }));
            return;
          }
          if (!stillPending) {
            // Was removed from joinRequests but not added to players = rejected
            res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'rejected' }));
            return;
          }
          res.writeHead(200, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'pending' }));
          return;
        }

        default:
          res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '未知操作: ' + action }));
          return;
      }
    }

    res.writeHead(405, { ...corsHeaders(), 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (err) {
    res.writeHead(500, { ...corsHeaders(), 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '服务器错误: ' + err.message }));
  }
};
