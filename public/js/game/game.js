
// ==================== GAME: 你画我猜 ====================
let peer = null, connections = {}, players = {}, myPeerId = null;
let roomId = null, roomName = '', isRoomHost = false;
let gameActive = false, currentWord = '', roundEnded = false;
let guessedPeers = new Set(), myTurn = false;
let totalRounds = 0, currentRound = 0;
let roundTimer = null, roundTimeLeft = 80;
let playerName = '';
const WORD_LIST = [
  // Animals
  '小猫', '小狗', '兔子', '大象', '长颈鹿', '熊猫', '企鹅', '鲨鱼', '蝴蝶', '蜗牛',
  '老虎', '狮子', '猴子', '斑马', '海豚', '鲸鱼', '章鱼', '螃蟹', '乌龟', '青蛙',
  '鹦鹉', '猫头鹰', '天鹅', '孔雀', '老鹰', '海鸥', '金鱼', '海马', '松鼠', '刺猬',
  // Food
  '苹果', '香蕉', '西瓜', '草莓', '披萨', '蛋糕', '冰淇淋', '汉堡', '寿司', '面条',
  '饺子', '火锅', '烧烤', '棉花糖', '巧克力', '棒棒糖', '薯条', '蛋挞', '月饼', '粽子',
  '葡萄', '橙子', '樱桃', '芒果', '柠檬', '面包', '饼干', '三明治', '烤鸭', '奶茶',
  // Objects
  '太阳', '月亮', '星星', '彩虹', '闪电', '雪花', '房子', '树木', '花朵', '云朵',
  '汽车', '飞机', '自行车', '火箭', '轮船', '火车', '手机', '电脑', '眼镜', '雨伞',
  '钥匙', '锁', '时钟', '蜡烛', '灯泡', '风扇', '相机', '电视', '冰箱', '洗衣机',
  '铅笔', '书包', '帽子', '鞋子', '手套', '围巾', '戒指', '项链', '皇冠', '魔杖',
  // Sports & Actions
  '足球', '篮球', '游泳', '跑步', '跳舞', '唱歌', '睡觉', '吃饭', '看书', '画画',
  '跳绳', '滑雪', '冲浪', '拳击', '射箭', '钓鱼', '骑马', '骑车', '爬山', '放风筝',
  // Characters
  '机器人', '恐龙', '龙', '公主', '超人', '海盗', '忍者', '国王', '美人鱼', '天使',
  '圣诞老人', '女巫', '吸血鬼', '僵尸', '外星人', '宇航员', '骑士', '精灵', '巨人', '魔法师',
  // Nature
  '火山', '瀑布', '沙漠', '森林', '大海', '河流', '山峰', '草原', '北极光', '龙卷风',
  // Emoji & Feelings
  '微笑', '哭泣', '生气', '爱心', '礼物', '气球', '烟花', '鬼魂', '骷髅', '小丑',
  // Random Fun
  '城堡', '灯塔', '风车', '蘑菇', '仙人掌', '雪人', '彩虹独角兽', '海盗船', '热气球', '潜水艇',
  'UFO', '金字塔', '埃菲尔铁塔', '自由女神像', '长城', '太极', '功夫', '麻将', '灯笼', '鞭炮'
];
const WORD_CATEGORIES = {
  animals: ['小猫','小狗','兔子','大象','长颈鹿','熊猫','企鹅','鲨鱼','蝴蝶','蜗牛','老虎','狮子','猴子','斑马','海豚','鲸鱼','章鱼','螃蟹','乌龟','青蛙','鹦鹉','猫头鹰','天鹅','孔雀','老鹰','海鸥','金鱼','海马','松鼠','刺猬'],
  food: ['苹果','香蕉','西瓜','草莓','披萨','蛋糕','冰淇淋','汉堡','寿司','面条','饺子','火锅','烧烤','棉花糖','巧克力','棒棒糖','薯条','蛋挞','月饼','粽子','葡萄','橙子','樱桃','芒果','柠檬','面包','饼干','三明治','烤鸭','奶茶'],
  objects: ['太阳','月亮','星星','彩虹','闪电','雪花','房子','树木','花朵','云朵','汽车','飞机','自行车','火箭','轮船','火车','手机','电脑','眼镜','雨伞','钥匙','锁','时钟','蜡烛','灯泡','风扇','相机','电视','冰箱','洗衣机','铅笔','书包','帽子','鞋子','手套','围巾','戒指','项链','皇冠','魔杖'],
  sports: ['足球','篮球','游泳','跑步','跳舞','唱歌','睡觉','吃饭','看书','画画','跳绳','滑雪','冲浪','拳击','射箭','钓鱼','骑马','骑车','爬山','放风筝'],
  characters: ['机器人','恐龙','龙','公主','超人','海盗','忍者','国王','美人鱼','天使','圣诞老人','女巫','吸血鬼','僵尸','外星人','宇航员','骑士','精灵','巨人','魔法师'],
  nature: ['火山','瀑布','沙漠','森林','大海','河流','山峰','草原','北极光','龙卷风'],
  emoji: ['微笑','哭泣','生气','爱心','礼物','气球','烟花','鬼魂','骷髅','小丑'],
  fun: ['城堡','灯塔','风车','蘑菇','仙人掌','雪人','彩虹独角兽','海盗船','热气球','潜水艇','UFO','金字塔','埃菲尔铁塔','自由女神像','长城','太极','功夫','麻将','灯笼','鞭炮']
};


let drawColor = '#1d1d1f';
let drawSize = 3;
let drawTool = 'pen';
let isDrawing = false;
let lastX = 0, lastY = 0;
let drawHistory = [];
const MAX_HISTORY = 50;
let shapeStartX = 0, shapeStartY = 0;
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');

// Canvas setup
function initCanvas() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', doDraw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawTouch(e.touches[0]); });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); doDrawTouch(e.touches[0]); });
  canvas.addEventListener('touchend', stopDraw);
  canvas.addEventListener('touchcancel', stopDraw);
}

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function saveCanvasState() {
  drawHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (drawHistory.length > MAX_HISTORY) drawHistory.shift();
}

function undoDraw() {
  if (drawHistory.length > 0) {
    var state = drawHistory.pop();
    ctx.putImageData(state, 0, 0);
    if (myTurn) sendDrawData({ act: 'undo' });
  }
}

function restoreLastState() {
  if (drawHistory.length > 0) {
    ctx.putImageData(drawHistory[drawHistory.length - 1], 0, 0);
  }
}

function startDraw(e) {
  if (!myTurn) return;
  saveCanvasState();
  isDrawing = true;
  const pos = getCanvasPos(e);
  lastX = pos.x; lastY = pos.y;
  if (drawTool === 'rect' || drawTool === 'circle' || drawTool === 'line') {
    shapeStartX = lastX; shapeStartY = lastY;
  }
  sendDrawData({ act: 'start', x: lastX, y: lastY, c: drawColor, s: drawSize, t: drawTool });
}

function doDraw(e) {
  if (!isDrawing || !myTurn) return;
  const pos = getCanvasPos(e);
  if (drawTool === 'rect' || drawTool === 'circle' || drawTool === 'line') {
    restoreLastState();
    previewShape(pos.x, pos.y);
  } else {
    drawLine(lastX, lastY, pos.x, pos.y, drawColor, drawSize, drawTool);
    sendDrawData({ act: 'move', x: pos.x, y: pos.y, c: drawColor, s: drawSize, t: drawTool });
  }
  lastX = pos.x; lastY = pos.y;
}

function previewShape(ex, ey) {
  const sx = shapeStartX, sy = shapeStartY;
  ctx.beginPath();
  ctx.strokeStyle = drawTool === 'eraser' ? '#ffffff' : drawColor;
  ctx.lineWidth = drawSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (drawTool === 'rect') ctx.strokeRect(sx, sy, ex - sx, ey - sy);
  else if (drawTool === 'circle') {
    const rx = Math.abs(ex - sx) / 2, ry = Math.abs(ey - sy) / 2;
    ctx.beginPath();
    ctx.ellipse(Math.min(sx, ex) + rx, Math.min(sy, ey) + ry, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (drawTool === 'line') {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  }
}

function finishShape(ex, ey) {
  if (!myTurn) return;
  restoreLastState();
  previewShape(ex, ey);
}

function startDrawTouch(t) {
  if (!myTurn) return;
  saveCanvasState();
  isDrawing = true;
  const pos = getCanvasPos(t);
  lastX = pos.x; lastY = pos.y;
  if (drawTool === 'rect' || drawTool === 'circle' || drawTool === 'line') {
    shapeStartX = lastX; shapeStartY = lastY;
  }
  sendDrawData({ act: 'start', x: lastX, y: lastY, c: drawColor, s: drawSize, t: drawTool });
}

function doDrawTouch(t) {
  if (!isDrawing || !myTurn) return;
  const pos = getCanvasPos(t);
  if (drawTool === 'rect' || drawTool === 'circle' || drawTool === 'line') {
    restoreLastState();
    previewShape(pos.x, pos.y);
  } else {
    drawLine(lastX, lastY, pos.x, pos.y, drawColor, drawSize, drawTool);
    sendDrawData({ act: 'move', x: pos.x, y: pos.y, c: drawColor, s: drawSize, t: drawTool });
  }
  lastX = pos.x; lastY = pos.y;
}

function stopDraw() {
  if (!isDrawing) return;
  isDrawing = false;
  if ((drawTool === 'rect' || drawTool === 'circle' || drawTool === 'line') && myTurn) {
    finishShape(lastX, lastY);
    sendDrawData({ act: 'shape_end', x: lastX, y: lastY, tool: drawTool });
  }
  sendDrawData({ act: 'end' });
}

function drawLine(x1, y1, x2, y2, color, size, tool) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
  ctx.lineWidth = tool === 'eraser' ? size * 3 : size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function clearCanvas(send = true) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (send && myTurn) sendDrawData({ act: 'clear' });
}

function floodFill() {
  if (!myTurn) return;
  saveCanvasState();
  var cx = Math.floor(canvas.width / 2);
  var cy = Math.floor(canvas.height / 2);
  execFloodFill(cx, cy, drawColor);
  sendDrawData({ act: 'fill', x: cx, y: cy, c: drawColor });
}

function execFloodFill(cx, cy, fillColor) {
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
  var w = canvas.width, h = canvas.height;
  var idx = (cy * w + cx) * 4;
  var targetR = data[idx], targetG = data[idx + 1], targetB = data[idx + 2], targetA = data[idx + 3];
  var fillR = parseInt(fillColor.slice(1, 3), 16);
  var fillG = parseInt(fillColor.slice(3, 5), 16);
  var fillB = parseInt(fillColor.slice(5, 7), 16);
  if (fillR === targetR && fillG === targetG && fillB === targetB) return;
  var stack = [[cx, cy]];
  var visited = new Uint8Array(w * h);
  while (stack.length > 0) {
    var pos = stack.pop();
    var x = pos[0], y = pos[1];
    var pi = y * w + x;
    if (visited[pi]) continue;
    var i = pi * 4;
    if (data[i] !== targetR || data[i + 1] !== targetG || data[i + 2] !== targetB || data[i + 3] !== targetA) continue;
    visited[pi] = 1;
    data[i] = fillR; data[i + 1] = fillG; data[i + 2] = fillB; data[i + 3] = 255;
    if (x > 0) stack.push([x - 1, y]);
    if (x < w - 1) stack.push([x + 1, y]);
    if (y > 0) stack.push([x, y - 1]);
    if (y < h - 1) stack.push([x, y + 1]);
  }
  ctx.putImageData(imageData, 0, 0);
}

// Drawing tools UI
document.getElementById('penColor').addEventListener('input', (e) => { drawColor = e.target.value; });
document.getElementById('penSize').addEventListener('input', (e) => { drawSize = parseInt(e.target.value); });
document.querySelectorAll('#drawingTools .tool-btn[data-tool]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#drawingTools .tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    drawTool = btn.dataset.tool;
  });
});

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.qq.com:3478' },
    { urls: 'stun:stun.miwifi.com:3478' },
    { urls: 'stun:stun.xten.com:3478' },
    { urls: 'stun:stun.voipbuster.com:3478' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
  iceCandidatePoolSize: 2
};

function initPeer(customId) {
  if (peer) { peer.destroy(); peer = null; }
  connections = {};
  myPeerId = null;

  const opts = { debug: 0, config: ICE_SERVERS };
  peer = customId ? new Peer(customId, opts) : new Peer(opts);

  peer.on('open', (id) => {
    myPeerId = id;
    console.log('PeerJS ready, ID:', id);
  });

  peer.on('connection', (conn) => {
    console.log('Incoming connection from:', conn.peer);
    setupConnection(conn);
  });

  peer.on('error', (err) => {
    console.error('Peer error:', err);
    if (err.type === 'unavailable-id') {
      showToast('房间号已被占用，请换一个');
      resetToLobby();
    } else if (err.type === 'peer-unavailable') {
      showToast('无法连接到该房间，请确认房间号正确且房主在线');
    } else if (err.type === 'server-error') {
      showToast('信令服务器连接失败，请检查网络后刷新重试');
    } else if (err.type === 'network') {
      showToast('网络连接失败，请检查网络');
    } else {
      showToast('连接出错: ' + (err.message || err.type));
    }
  });

  peer.on('disconnected', () => {
    console.log('Peer disconnected, trying to reconnect...');
    if (peer && !peer.destroyed) {
      setTimeout(() => {
        if (peer && !peer.destroyed) peer.reconnect();
      }, 1000);
    }
  });
}

function setupConnection(conn) {
  connections[conn.peer] = conn;

  // HOST: immediately add placeholder when someone connects
  if (isRoomHost && !players[conn.peer]) {
    players[conn.peer] = { name: '加入中...', score: 0, isDrawer: false };
    broadcastPlayerList();
    updateGameUI();
  }

  function sendJoinInfo() {
    conn.send({ type: 'join_info', name: playerName, peerId: myPeerId, isHost: isRoomHost });
    if (isRoomHost) {
      conn.send({ type: 'player_list', players, roomName });
      if (roomName) conn.send({ type: 'room_name', roomName });
    }
  }

  // Handle race condition: connection may already be open
  if (conn.open) {
    sendJoinInfo();
  } else {
    conn.on('open', sendJoinInfo);
  }

  conn.on('data', (data) => {
    handleGameData(data, conn.peer);
  });

  conn.on('close', () => {
    handlePlayerDisconnect(conn.peer);
  });

  conn.on('error', (err) => {
    console.error('Conn error:', err);
    delete connections[conn.peer];
    delete players[conn.peer];
    broadcastPlayerList();
    updateGameUI();
  });
}

function broadcast(data) {
  const conns = Object.values(connections);
  if (conns.length === 0) {
    console.warn('[broadcast] No connections to send:', data.type);
    return;
  }
  conns.forEach(conn => {
    try {
      conn.send(data);
    } catch(e) {
      console.error('[broadcast] Send failed for', data.type, e);
    }
  });
}

function broadcastExcept(data, exceptPeerId) {
  Object.entries(connections).forEach(([peerId, conn]) => {
    if (peerId === exceptPeerId) return;
    try { conn.send(data); } catch(e) {
      console.error('[broadcastExcept] Send failed for', data.type, e);
    }
  });
}

function handleGameData(data, fromPeerId) {
  switch (data.type) {
    case 'join_info':
      joinSuccessFlag = true;
      // Update or create player entry
      const prevName = players[data.peerId]?.name || '';
      players[data.peerId] = {
        name: data.name,
        score: players[data.peerId]?.score || 0,
        isDrawer: players[data.peerId]?.isDrawer || false
      };
      broadcastPlayerList();
      if (prevName !== data.name) {
        addChatMessage('system', data.name + ' 加入了房间 🎉');
      }
      updateGameUI();
      // Sync player join to server
      if (isRoomHost) {
        apiGameRooms({ action: 'player_join', roomId, playerName: data.name, peerId: data.peerId }).catch(() => {});
      }
      break;

    case 'player_list':
      joinSuccessFlag = true;
      players = data.players;
      if (data.roomName) roomName = data.roomName;
      updateGameUI();
      break;

    case 'host_transfer':
      handleHostTransfer(data);
      break;

    case 'room_name':
      roomName = data.roomName;
      updateGameUI();
      break;

    case 'start_game':
      gameActive = true;
      totalRounds = data.totalRounds || 0;
      currentRound = 0;
      roundEnded = false;
      guessedPeers.clear();
      document.getElementById('gamePlayArea').style.display = 'block';
      document.getElementById('startGameBtn').style.display = 'none';
      document.getElementById('roundDisplay').textContent = '';
      addChatMessage('system', '🎮 游戏开始！');
      break;

    case 'new_round':
      processNewRoundData(data);
      startRoundTimer(data.roundTime);
      if (data.word) {
        addChatMessage('system', '第 ' + (currentRound + 1) + ' 局 | 轮到你画画！词语: ' + data.word);
      } else {
        addChatMessage('system', '第 ' + (currentRound + 1) + ' 局 | ' + data.drawerName + ' 正在画画，快来猜！');
      }
      break;

    case 'round_end':
      roundEnded = true;
      currentRound = data.currentRound || (currentRound + 1);
      players = data.players;
      clearCanvas();
      updateGameUI();
      if (data.word) addChatMessage('system', '答案揭晓: ' + data.word);
      if (roundTimer) { clearInterval(roundTimer); roundTimer = null; }
      document.getElementById('timerDisplay').textContent = '⏱ --';
      break;

    case 'draw':
      if (isRoomHost) {
        var currentDrawer = Object.keys(players).find(function(pid) { return players[pid].isDrawer; });
        if (fromPeerId !== currentDrawer) break;
        handleRemoteDraw(data);
        broadcastExcept(data, fromPeerId);
      } else {
        handleRemoteDraw(data);
      }
      break;

    case 'guess':
      if (fromPeerId === myPeerId) break;
      if (isRoomHost) {
        var isCorrect = !roundEnded && data.text === currentWord;
        if (isCorrect && !guessedPeers.has(fromPeerId)) {
          guessedPeers.add(fromPeerId);
          var points = 10 + Math.max(0, roundTimeLeft);
          players[fromPeerId].score = (players[fromPeerId].score || 0) + points;
          var drawerId = Object.keys(players).find(function(pid) { return players[pid].isDrawer; });
          if (drawerId && players[drawerId]) {
            players[drawerId].score = (players[drawerId].score || 0) + 5;
          }
          broadcast({
            type: 'guess_result', name: data.name, peerId: fromPeerId,
            correct: true, points: points, players: players
          });
          addChatMessage('correct', data.name + ' 猜对了！🎉 (+' + points + '分)');
          updateGameUI();
          if (!roundEnded && guessedPeers.size >= Object.keys(players).length - 1) {
            endRound();
          }
        } else if (!isCorrect) {
          addChatMessage('normal', data.name + ': ' + data.text);
          broadcastExcept({ type: 'guess_chat', name: data.name, peerId: fromPeerId, text: data.text }, fromPeerId);
        }
      }
      break;

    case 'guess_result':
      if (data.correct) {
        guessedPeers.add(data.peerId);
        players = data.players;
        addChatMessage('correct', data.name + ' 猜对了！🎉 (+' + data.points + '分)');
        updateGameUI();
        if (isRoomHost && !roundEnded && guessedPeers.size >= Object.keys(players).length - 1) {
          endRound();
        }
      }
      break;

    case 'guess_chat':
      if (data.peerId === myPeerId) break;
      addChatMessage('normal', data.name + ': ' + data.text);
      break;

    case 'game_over':
      gameActive = false;
      roundEnded = true;
      if (roundTimer) { clearInterval(roundTimer); roundTimer = null; }
      document.getElementById('startGameBtn').style.display = isRoomHost ? 'block' : 'none';
      document.getElementById('gamePlayArea').style.display = 'none';
      document.getElementById('wordDisplay').textContent = '游戏结束';
      document.getElementById('timerDisplay').textContent = '⏱ --';
      myTurn = false;
      guessedPeers.clear();
      players = data.players;
      const scores = Object.values(players).sort((a, b) => b.score - a.score);
      addChatMessage('system', '🏆 游戏结束！' + (data.reason ? '(' + data.reason + ')' : ''));
      if (scores[0]) addChatMessage('system', '🥇 第一名: ' + scores[0].name + ' (' + scores[0].score + '分)');
      updateGameUI();
      break;

    case 'player_leave':
      handlePlayerDisconnect(data.peerId);
      break;

    case 'chat':
      if (data.peerId === myPeerId) break;
      addChatMessage('normal', data.name + ': ' + data.text);
      if (isRoomHost) broadcastExcept(data, fromPeerId);
      break;
  }
}

function handleRemoteDraw(data) {
  switch (data.act) {
    case 'start':
      lastX = data.x; lastY = data.y;
      if (data.t === 'rect' || data.t === 'circle' || data.t === 'line') {
        shapeStartX = lastX; shapeStartY = lastY;
      }
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
      ctx.strokeStyle = data.t === 'eraser' ? '#ffffff' : data.c;
      ctx.lineWidth = data.t === 'eraser' ? data.s * 3 : data.s;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      break;
    case 'move':
      if (data.t === 'rect' || data.t === 'circle' || data.t === 'line') {
        // Skip move for shapes on remote (handled by shape_end)
        break;
      }
      drawLine(lastX, lastY, data.x, data.y, data.c, data.s, data.t);
      lastX = data.x; lastY = data.y;
      break;
    case 'shape_end':
      lastX = data.x; lastY = data.y;
      drawToolOld = drawTool; drawTool = data.tool || 'rect';
      finishShape(data.x, data.y);
      drawTool = drawToolOld;
      break;
    case 'end':
      break;
    case 'clear':
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      break;
    case 'undo':
      if (drawHistory.length > 0) {
        ctx.putImageData(drawHistory.pop(), 0, 0);
      }
      break;
    case 'fill':
      execFloodFill(data.x, data.y, data.c);
      break;
  }
}

function sendDrawData(data) {
  broadcast({ type: 'draw', ...data });
}

function startRoundTimer(seconds) {
  if (roundTimer) clearInterval(roundTimer);
  roundTimeLeft = seconds;
  roundEnded = false;
  updateTimerDisplay();
  roundTimer = setInterval(() => {
    roundTimeLeft--;
    updateTimerDisplay();
    if (roundTimeLeft <= 0) {
      clearInterval(roundTimer);
      roundTimer = null;
      if (isRoomHost && !roundEnded) endRound();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('timerDisplay');
  if (!el) return;
  el.textContent = '⏱ ' + Math.max(0, roundTimeLeft);
  if (roundTimeLeft <= 10) {
    el.style.color = 'var(--danger)';
  } else if (roundTimeLeft <= 20) {
    el.style.color = 'var(--warning)';
  } else {
    el.style.color = 'var(--accent)';
  }
}

function broadcastPlayerList() {
  broadcast({ type: 'player_list', players, roomName });
}

function resetToLobby() {
  sessionStorage.removeItem('game_room_state');
  if (peer) { peer.destroy(); peer = null; }
  connections = {};
  players = {};
  myPeerId = null;
  roomId = null;
  roomName = '';
  isRoomHost = false;
  gameActive = false;
  myTurn = false;
  roundEnded = false;
  currentRound = 0;
  guessedPeers.clear();
  if (roundTimer) { clearInterval(roundTimer); roundTimer = null; }
  stopHostPolling();
  stopHeartbeat();
  stopJoinPolling();
  document.getElementById('gameLobby').style.display = 'block';
  document.getElementById('gameRoom').style.display = 'none';
  document.getElementById('gamePlayArea').style.display = 'none';
  document.getElementById('chatMessages').innerHTML = '';
  document.getElementById('startGameBtn').style.display = 'none';
  document.getElementById('timerDisplay').textContent = '⏱ 80';
  document.getElementById('timerDisplay').style.color = 'var(--accent)';
  window.location.hash = '';
}

// Room management
function createRoom() {
  playerName = document.getElementById('gameNickname').value.trim();
  if (!playerName) { showToast('请输入昵称'); return; }

  roomName = document.getElementById('createRoomName').value.trim();
  let customCode = document.getElementById('createRoomCode').value.trim();

  // Validate custom code: alphanumeric, hyphens, underscores only
  if (customCode && !/^[a-zA-Z0-9_-]+$/.test(customCode)) {
    showToast('房间号只能包含英文、数字、下划线和连字符'); return;
  }

  isRoomHost = true;
  initPeer(customCode || undefined);

  const checkPeer = setInterval(() => {
    if (myPeerId) {
      clearInterval(checkPeer);
      roomId = myPeerId;
      players[myPeerId] = { name: playerName, score: 0, isDrawer: false };

      document.getElementById('roomNameDisplay').textContent = roomName || playerName + '的房间';
      document.getElementById('roomCodeDisplay').textContent = roomId;
      document.getElementById('gameLobby').style.display = 'none';
      document.getElementById('gameRoom').style.display = 'block';
      document.getElementById('startGameBtn').style.display = 'block';

      // Update URL hash for sharing
      window.location.hash = roomId;
      saveRoomState();

      updateGameUI();
      addChatMessage('system', '房间已创建！点击「🔗 分享」复制链接发给朋友');
    }
  }, 200);
}

let joinRetryCount = 0;
const MAX_JOIN_RETRIES = 3;
let joinSuccessFlag = false;

function doJoinRoom() {
  const code = roomId;
  if (!code || !peer || peer.destroyed) return;

  addChatMessage('system', '正在连接房间... (尝试 ' + (joinRetryCount + 1) + '/' + MAX_JOIN_RETRIES + ')');
  joinSuccessFlag = false;

  const conn = peer.connect(code, {
    reliable: true,
    serialization: 'json'
  });
  setupConnection(conn);

  // Check if connection succeeded (received data from host)
  setTimeout(function() {
    if (!joinSuccessFlag) {
      // Remove failed connection
      try { conn.close(); } catch(e) {}
      delete connections[conn.peer];
      joinRetryCount++;
      if (joinRetryCount < MAX_JOIN_RETRIES) {
        addChatMessage('system', '连接超时，正在重试...');
        if (peer) { peer.destroy(); peer = null; }
        myPeerId = null;
        initPeer();
        var waitForPeer = setInterval(function() {
          if (myPeerId) {
            clearInterval(waitForPeer);
            setTimeout(function() { doJoinRoom(); }, 500);
          }
        }, 200);
      } else {
        addChatMessage('system', '多次连接失败，请确认：');
        addChatMessage('system', '1. 房间号是否正确');
        addChatMessage('system', '2. 房主是否在线');
        addChatMessage('system', '3. 双方网络是否正常');
        addChatMessage('system', '💡 提示：房主和客人都尝试点击刷新按钮');
      }
    }
  }, 10000);
}

function joinRoom() {
  playerName = document.getElementById('gameNickname').value.trim();
  const code = document.getElementById('joinRoomCode').value.trim();
  if (!playerName) { showToast('请输入昵称'); return; }
  if (!code) { showToast('请输入房间号'); return; }

  isRoomHost = false;
  joinRetryCount = 0;
  initPeer();

  const checkPeer = setInterval(() => {
    if (myPeerId) {
      clearInterval(checkPeer);
      roomId = code;
      document.getElementById('roomNameDisplay').textContent = '加入的房间';
      document.getElementById('roomCodeDisplay').textContent = code;
      document.getElementById('gameLobby').style.display = 'none';
      document.getElementById('gameRoom').style.display = 'block';
      document.getElementById('startGameBtn').style.display = 'none';
      window.location.hash = code;
      saveRoomState();
      doJoinRoom();
    }
  }, 200);
}

function reconnectRoom() {
  if (isRoomHost) {
    // Host: re-initialize peer to refresh signaling, keep same room ID
    addChatMessage('system', '刷新房间连接...');
    Object.values(connections).forEach(c => { try { c.close(); } catch(e){} });
    connections = {};
    if (peer && !peer.destroyed) { peer.destroy(); peer = null; }
    myPeerId = null;
    initPeer(roomId);
    var checkPeer = setInterval(function() {
      if (myPeerId) {
        clearInterval(checkPeer);
        addChatMessage('system', '房间已刷新，等待玩家加入...');
        updateGameUI();
      }
    }, 200);
  } else {
    // Guest: try to reconnect to host
    if (!roomId) return;
    addChatMessage('system', '重新连接到房间...');
    joinRetryCount = 0;
    // Close existing connections
    Object.values(connections).forEach(c => { try { c.close(); } catch(e){} });
    connections = {};
    // Re-init peer and connect
    if (peer && !peer.destroyed) { peer.destroy(); peer = null; }
    myPeerId = null;
    initPeer();
    const waitForPeer = setInterval(() => {
      if (myPeerId) {
        clearInterval(waitForPeer);
        doJoinRoom();
      }
    }, 200);
  }
}

function leaveRoom() {
  // Host transfer: pick the first remaining player as new host
  if (isRoomHost) {
    const otherIds = Object.keys(players).filter(pid => pid !== myPeerId);
    if (otherIds.length > 0 && gameActive) {
      const newHostId = otherIds[0];
      broadcast({ type: 'host_transfer', newHostId, players, currentWord, currentRound, totalRounds, roundTimeLeft, gameActive, roundEnded, guessedPeers: [...guessedPeers] });
    } else if (gameActive) {
      broadcast({ type: 'game_over', players, reason: '房主离开' });
    }
  }
  broadcast({ type: 'player_leave', peerId: myPeerId });
  resetToLobby();
}

function handlePlayerDisconnect(peerId) {
  const name = players[peerId]?.name || peerId;
  const wasHost = players[peerId]?.isHost || (isRoomHost && peerId === Object.keys(players).find(pid => players[pid]?.isHost));
  // Sync player leave to server
  if (isRoomHost && name && name !== playerName) {
    apiGameRooms({ action: 'player_leave', roomId, playerName: name }).catch(() => {});
  }
  delete connections[peerId];
  delete players[peerId];

  if (Object.keys(players).length === 0 || (Object.keys(players).length === 1 && players[myPeerId])) {
    // Room is empty (or only me left) — reset game
    if (gameActive) {
      addChatMessage('system', '所有其他玩家已离开，游戏结束');
      gameActive = false;
      document.getElementById('gamePlayArea').style.display = 'none';
      document.getElementById('startGameBtn').style.display = isRoomHost ? 'block' : 'none';
    }
  }

  broadcastPlayerList();
  updateGameUI();
  addChatMessage('system', name + ' 离开了房间');

  // Host transfer: if the leaving player was host, pick new host
  if (wasHost) {
    const otherIds = Object.keys(players);
    if (otherIds.length > 0 && otherIds[0] === myPeerId) {
      isRoomHost = true;
      document.getElementById('startGameBtn').style.display = 'block';
      addChatMessage('system', '🎩 房主离开，你成为新房主！');
      if (gameActive && roundEnded) {
        // Previous round ended, host can start next round
      }
    }
  }
}

function handleHostTransfer(data) {
  if (data.newHostId === myPeerId) {
    isRoomHost = true;
    document.getElementById('startGameBtn').style.display = 'block';
    addChatMessage('system', '🎩 你成为了新房主！');
    // Register as new host on server
    apiGameRooms({ action: 'takeover', roomId, hostName: playerName }).then(() => {
      startHostPolling();
      startHeartbeat();
    });
    // Restore game state
    if (data.gameActive) {
      players = data.players;
      currentWord = data.currentWord;
      currentRound = data.currentRound;
      totalRounds = data.totalRounds;
      roundTimeLeft = data.roundTimeLeft;
      gameActive = data.gameActive;
      roundEnded = data.roundEnded;
      guessedPeers = new Set(data.guessedPeers || []);
      document.getElementById('gamePlayArea').style.display = 'block';
      myTurn = players[myPeerId]?.isDrawer || false;
      updateGameUI();
      updateTimerDisplay();
      if (!roundEnded) {
        startRoundTimer(roundTimeLeft);
      }
    }
  } else {
    addChatMessage('system', '房主已离开，' + (players[data.newHostId]?.name || '另一玩家') + ' 成为新房主');
    if (data.gameActive) {
      players = data.players;
      updateGameUI();
    }
  }
}

function copyShareLink() {
  const url = window.location.origin + window.location.pathname + '#' + roomId;
  navigator.clipboard.writeText(url).then(
    () => showToast('分享链接已复制 ✓ 发给朋友即可'),
    () => showToast('复制失败，请手动复制地址栏链接')
  );
}

// Game flow
function startGame() {
  if (Object.keys(players).length < 2) {
    showToast('至少需要2名玩家'); return;
  }
  totalRounds = parseInt(document.getElementById('totalRoundsSelect').value);
  currentRound = 0;
  roundEnded = false;
  // Reset scores, make first player (by insertion order) the first drawer
  const playerIds = Object.keys(players);
  playerIds.forEach((pid, i) => {
    players[pid].score = 0;
    players[pid].isDrawer = (i === 0);
  });
  guessedPeers.clear();
  broadcast({ type: 'start_game', totalRounds });
  gameActive = true;
  document.getElementById('gamePlayArea').style.display = 'block';
  document.getElementById('startGameBtn').style.display = 'none';
  document.getElementById('roundDisplay').textContent = '';
  const roundLabel = totalRounds > 0 ? '共 ' + totalRounds + ' 局' : '无限局';
  addChatMessage('system', '🎮 游戏开始！' + playerIds.length + ' 名玩家 · ' + roundLabel);
  newRound();
}

function newRound() {
  console.log('[newRound] currentRound:', currentRound, 'players:', Object.keys(players).length, 'gameActive:', gameActive);
  roundEnded = false;
  var playerIds = Object.keys(players);
  var drawerIdx = currentRound % playerIds.length;
  var drawerPeerId = playerIds[drawerIdx];
  console.log('[newRound] drawerIdx:', drawerIdx, 'drawer:', players[drawerPeerId]?.name);

  playerIds.forEach(function(pid) { players[pid].isDrawer = (pid === drawerPeerId); });
  guessedPeers.clear();

  currentWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  var roundTime = 80;

  var fullData = {
    type: 'new_round', word: currentWord, players: players,
    drawerPeerId: drawerPeerId, drawerName: players[drawerPeerId].name,
    roundTime: roundTime, currentRound: currentRound, totalRounds: totalRounds
  };
  var blindData = {
    type: 'new_round', wordLength: currentWord.length, players: players,
    drawerPeerId: drawerPeerId, drawerName: players[drawerPeerId].name,
    roundTime: roundTime, currentRound: currentRound, totalRounds: totalRounds
  };

  if (isRoomHost) {
    // Host always knows the word to validate guesses
    processNewRoundData(fullData);
    if (drawerPeerId === myPeerId) {
      // Host is drawer — send blind to all guests
      broadcast(blindData);
    } else {
      // Guest is drawer — send full word only to drawer
      var dc = connections[drawerPeerId];
      if (dc) { try { dc.send(fullData); } catch(e) { console.error('send full to drawer failed', e); } }
      broadcastExcept(blindData, drawerPeerId);
    }
  }

  updateGameUI();
  startRoundTimer(roundTime);

  if (drawerPeerId === myPeerId) {
    addChatMessage('system', '第 ' + (currentRound + 1) + ' 局 | 轮到你画画！词语: ' + currentWord);
  } else {
    addChatMessage('system', '第 ' + (currentRound + 1) + ' 局 | ' + players[drawerPeerId].name + ' 正在画画，快来猜！');
  }
}

function processNewRoundData(data) {
  if (data.word) {
    currentWord = data.word;
  }
  players = data.players;
  myTurn = data.drawerPeerId === myPeerId;
  roundTimeLeft = data.roundTime;
  currentRound = data.currentRound || 0;
  totalRounds = data.totalRounds || 0;
  roundEnded = false;
  guessedPeers.clear();
  document.getElementById('wordDisplay').textContent = data.word
    ? '🎨 你的词: ' + data.word
    : '🔍 提示: ' + '_ '.repeat(data.wordLength || 0).trim();
  document.getElementById('roundDisplay').textContent = totalRounds > 0
    ? '第 ' + (currentRound + 1) + '/' + totalRounds + ' 局'
    : '第 ' + (currentRound + 1) + ' 局';
  clearCanvas();
  updateGameUI();
}

function endRound() {
  console.log('[endRound] called, roundEnded:', roundEnded, 'gameActive:', gameActive, 'isRoomHost:', isRoomHost);
  if (roundEnded) { console.log('[endRound] Already ended, returning'); return; }
  roundEnded = true;
  if (roundTimer) { clearInterval(roundTimer); roundTimer = null; }

  currentRound++;
  broadcast({ type: 'round_end', word: currentWord, players, currentRound, totalRounds });
  addChatMessage('system', '─── 答案揭晓: ' + currentWord + ' ───');
  clearCanvas();
  myTurn = false;
  document.getElementById('wordDisplay').textContent = '答案: ' + currentWord;
  document.getElementById('timerDisplay').textContent = '⏱ --';
  document.getElementById('timerDisplay').style.color = 'var(--text-tertiary)';

  // Check if game should end
  if (totalRounds > 0 && currentRound >= totalRounds) {
    setTimeout(() => {
      gameActive = false;
      broadcast({ type: 'game_over', players });
      addChatMessage('system', '🏆 游戏结束！全部 ' + totalRounds + ' 局已完成');
      const scores = Object.values(players).sort((a, b) => b.score - a.score);
      if (scores[0]) addChatMessage('system', '🥇 第一名: ' + scores[0].name + ' (' + scores[0].score + '分)');
      document.getElementById('startGameBtn').style.display = isRoomHost ? 'block' : 'none';
      document.getElementById('gamePlayArea').style.display = 'none';
      document.getElementById('wordDisplay').textContent = '游戏结束';
      updateGameUI();
    }, 3000);
  } else {
    setTimeout(() => {
      if (gameActive && isRoomHost && roundEnded) newRound();
    }, 3000);
  }
}

function sendGuess() {
  var input = document.getElementById('chatInput');
  var text = input.value.trim();
  if (!text || myTurn) return;
  input.value = '';
  input.focus();

  if (!gameActive) {
    broadcast({ type: 'chat', name: playerName, peerId: myPeerId, text: text });
    addChatMessage('normal', '你: ' + text);
    return;
  }

  if (roundEnded) {
    addChatMessage('system', '本局已结束，等待下一局...');
    return;
  }

  if (guessedPeers.has(myPeerId)) {
    addChatMessage('system', '你已经猜对了，等下一轮吧~');
    return;
  }

  if (isRoomHost) {
    var correct = text === currentWord;
    if (correct) {
      guessedPeers.add(myPeerId);
      var points = 10 + Math.max(0, roundTimeLeft);
      players[myPeerId].score = (players[myPeerId].score || 0) + points;
      var drawerId = Object.keys(players).find(function(pid) { return players[pid].isDrawer; });
      if (drawerId && players[drawerId]) {
        players[drawerId].score = (players[drawerId].score || 0) + 5;
      }
      broadcast({
        type: 'guess_result', name: playerName, peerId: myPeerId,
        correct: true, points: points, players: players
      });
      addChatMessage('correct', '🎉 你猜对了！+' + points + '分');
      updateGameUI();
      if (!roundEnded && guessedPeers.size >= Object.keys(players).length - 1) {
        endRound();
      }
    } else {
      broadcast({ type: 'guess_chat', name: playerName, peerId: myPeerId, text: text });
      addChatMessage('normal', '你: ' + text);
    }
  } else {
    broadcast({ type: 'guess', name: playerName, peerId: myPeerId, text: text, correct: false });
    addChatMessage('normal', '你: ' + text);
  }
}

function addChatMessage(cls, text) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + cls;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function updateGameUI() {
  // Room name
  const rn = document.getElementById('roomNameDisplay');
  if (rn && roomName) rn.textContent = roomName;

  // Host-only controls
  const trs = document.getElementById('totalRoundsSelect');
  if (trs) trs.style.display = isRoomHost ? '' : 'none';
  const sgb = document.getElementById('startGameBtn');
  if (sgb && !gameActive) sgb.style.display = isRoomHost ? '' : 'none';

  // Player list
  const pl = document.getElementById('playerList');
  pl.innerHTML = Object.entries(players).map(([pid, p]) => {
    let cls = 'player-badge';
    if (p.isDrawer) cls += ' is-drawer';
    if (pid === myPeerId) cls += ' me';
    const icon = p.isDrawer ? '🎨 ' : '';
    const me = pid === myPeerId ? ' (我)' : '';
    return `<span class="${cls}">${icon}${escapeHtml(p.name)}${me}</span>`;
  }).join('');

  // Score list
  const sl = document.getElementById('scoreList');
  const sorted = Object.values(players).sort((a, b) => b.score - a.score);
  sl.innerHTML = sorted.map((p, i) => {
    const medals = ['🥇', '🥈', '🥉'];
    return `<div class="score-row">${(medals[i] || '')} ${escapeHtml(p.name)} <span>${p.score}分</span></div>`;
  }).join('');

  // Canvas
  canvas.style.opacity = myTurn ? '1' : '0.85';
  canvas.style.cursor = myTurn ? 'crosshair' : 'default';

  // Room code
  const cd = document.getElementById('roomCodeDisplay');
  if (cd && roomId) cd.textContent = roomId;

  // Admin button
  const ab = document.getElementById('adminGameBtnRoom');
  if (ab && currentUser && currentUser.role === 'admin') {
    ab.style.display = '';
  }
}

// === Session persistence for page refresh ===
function saveRoomState() {
  if (!roomId) return;
  const state = {
    playerName, roomId, roomName, isRoomHost,
    savedAt: Date.now()
  };
  sessionStorage.setItem('game_room_state', JSON.stringify(state));
}

function restoreRoomState() {
  const raw = sessionStorage.getItem('game_room_state');
  if (!raw) return false;
  try {
    const state = JSON.parse(raw);
    // Only restore if saved within last 30 minutes
    if (Date.now() - state.savedAt > 30 * 60 * 1000) {
      sessionStorage.removeItem('game_room_state');
      return false;
    }
    return state;
  } catch { return false; }
}

// Save state before page unload
window.addEventListener('beforeunload', () => {
  saveRoomState();
});

// Also save periodically while in room
setInterval(() => {
  if (roomId && (document.getElementById('gameRoom').style.display !== 'none')) {
    saveRoomState();
  }
}, 5000);

// Auto-join from URL hash or session state
function checkUrlHash() {
  const hash = window.location.hash.slice(1);

  // First check for session-based room recovery (page refresh)
  const savedState = restoreRoomState();
  if (savedState && !hash) {
    // User was in a room before refresh — auto rejoin
    switchToGameTab();
    playerName = savedState.playerName;
    roomName = savedState.roomName || '';
    document.getElementById('gameNickname').value = playerName;
    if (savedState.isRoomHost) {
      document.getElementById('createRoomName').value = roomName;
      document.getElementById('createRoomCode').value = savedState.roomId;
      addGameToast('检测到之前的房间，正在重新创建...');
      createRoom();
    } else {
      document.getElementById('joinRoomCode').value = savedState.roomId;
      addGameToast('检测到之前的房间，输入昵称后点击加入');
    }
    return;
  }

  // URL hash sharing link
  if (hash && hash.length >= 4 && hash.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(hash)) {
    switchToGameTab();
    document.getElementById('joinRoomCode').value = hash;
    document.getElementById('gameNickname').focus();
    addGameToast('检测到房间链接，输入昵称后点击加入');
  }
}

function switchToGameTab() {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const gameTabBtn = document.querySelector('.tab-btn:nth-child(2)');
  if (gameTabBtn) gameTabBtn.classList.add('active');
  document.getElementById('panel-game').classList.add('active');
  startRoomListRefresh();
  if (currentUser && currentUser.role === 'admin') {
    document.getElementById('adminGameBtn').style.display = '';
  }
}

function addGameToast(msg) {
  showToast(msg);
}

// ==================== ROOM MANAGEMENT (server-backed) ====================
let roomListTimer = null;
let hostPollTimer = null;
let joinPollTimer = null;
let heartbeatTimer = null;
let pendingJoinRoomId = null;
let pendingJoinRoomName = null;
let currentJoinRequest = null; // { name } - the join request being reviewed by host

function apiGameRooms(body) {
  return apiCall('/api/game/rooms', body);
}

// --- Room List ---
function startRoomListRefresh() {
  refreshRoomList();
  if (roomListTimer) clearInterval(roomListTimer);
  roomListTimer = setInterval(refreshRoomList, 10000);
}

function stopRoomListRefresh() {
  if (roomListTimer) { clearInterval(roomListTimer); roomListTimer = null; }
}

async function refreshRoomList() {
  try {
    const res = await apiGameRooms(null);
    if (res.error) return;
    renderRoomList(res.rooms || []);
  } catch (e) {
    // Silently fail — list stays stale until next refresh
  }
}

function renderRoomList(rooms) {
  const container = document.getElementById('roomListContainer');
  if (!container) return;
  if (rooms.length === 0) {
    container.innerHTML = '<div class="room-empty">暂无活跃房间，快来创建一个吧~</div>';
    return;
  }
  container.innerHTML = rooms.map(r => {
    const isMyRoom = roomId && r.id === roomId;
    return `<div class="room-card">
      <div class="room-card-info">
        <div class="room-card-name">${escapeHtml(r.name)}</div>
        <div class="room-card-meta">房主: ${escapeHtml(r.hostName)}</div>
      </div>
      <span class="room-card-players">👤 ${r.playerCount || 0}</span>
      <div class="room-card-actions">
        ${isMyRoom
          ? '<span style="font-size:12px;color:var(--accent);font-weight:500;">当前房间 ✓</span>'
          : '<button class="btn btn-primary btn-sm" onclick="requestJoinRoom(\'' + escapeHtml(r.id) + '\',\'' + escapeHtml(r.name) + '\')">申请加入</button>'}
      </div>
    </div>`;
  }).join('');
}

// --- Join Request (applicant side) ---
function requestJoinRoom(roomId, roomName) {
  const name = document.getElementById('gameNickname').value.trim();
  if (!name) { showToast('请先输入昵称'); return; }
  playerName = name;
  pendingJoinRoomId = roomId;
  pendingJoinRoomName = roomName;

  apiGameRooms({ action: 'request_join', roomId, playerName }).then(res => {
    if (res.error) { showToast(res.error); return; }
    showToast('申请已发送，等待房主同意...');
    startJoinPolling();
  });
}

function startJoinPolling() {
  if (joinPollTimer) clearInterval(joinPollTimer);
  joinPollTimer = setInterval(async () => {
    if (!pendingJoinRoomId) { stopJoinPolling(); return; }
    try {
      const res = await apiGameRooms({ action: 'poll_join', roomId: pendingJoinRoomId, playerName });
      if (res.status === 'approved') {
        stopJoinPolling();
        showToast('房主已同意，正在加入房间...');
        document.getElementById('joinRoomCode').value = pendingJoinRoomId;
        joinRoom();
      } else if (res.status === 'rejected') {
        stopJoinPolling();
        showToast('申请被拒绝');
        pendingJoinRoomId = null;
      } else if (res.status === 'closed') {
        stopJoinPolling();
        showToast('房间已关闭');
        pendingJoinRoomId = null;
      }
    } catch (e) {}
  }, 3000);
}

function stopJoinPolling() {
  if (joinPollTimer) { clearInterval(joinPollTimer); joinPollTimer = null; }
  pendingJoinRoomId = null;
}

// --- Host Polling (for join requests & closed check) ---
function startHostPolling() {
  if (hostPollTimer) clearInterval(hostPollTimer);
  hostPollTimer = setInterval(async () => {
    if (!roomId || !isRoomHost) { stopHostPolling(); return; }
    try {
      const res = await apiGameRooms({ action: 'poll', roomId });
      if (!res || res.error) return;

      // Check if room was closed by admin
      if (res.status === 'closed') {
        stopHostPolling();
        stopHeartbeat();
        addChatMessage('system', '⚠ 房间已被管理员关闭');
        showToast('房间已被管理员关闭');
        broadcast({ type: 'game_over', players, reason: '房间已被管理员关闭' });
        setTimeout(resetToLobby, 1500);
        return;
      }

      // Check join requests
      const requests = res.joinRequests || [];
      if (requests.length > 0 && !currentJoinRequest) {
        currentJoinRequest = requests[0];
        document.getElementById('joinRequestName').textContent = currentJoinRequest.name;
        document.getElementById('joinRequestModal').style.display = 'flex';
      }
    } catch (e) {}
  }, 5000);
}

function stopHostPolling() {
  if (hostPollTimer) { clearInterval(hostPollTimer); hostPollTimer = null; }
}

function approveJoinRequest() {
  if (!currentJoinRequest) return;
  apiGameRooms({ action: 'approve_join', roomId, playerName: currentJoinRequest.name }).then(() => {
    document.getElementById('joinRequestModal').style.display = 'none';
    currentJoinRequest = null;
  });
}

function rejectJoinRequest() {
  if (!currentJoinRequest) return;
  apiGameRooms({ action: 'reject_join', roomId, playerName: currentJoinRequest.name }).then(() => {
    document.getElementById('joinRequestModal').style.display = 'none';
    currentJoinRequest = null;
  });
}

function closeJoinRequest() {
  document.getElementById('joinRequestModal').style.display = 'none';
  // Don't clear currentJoinRequest — host will see it again on next poll if not handled
}

// --- Heartbeat ---
function startHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  sendHeartbeat();
  heartbeatTimer = setInterval(sendHeartbeat, 30000);
}

function stopHeartbeat() {
  if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
}

async function sendHeartbeat() {
  if (!roomId || !isRoomHost) return;
  try {
    const res = await apiGameRooms({ action: 'heartbeat', roomId });
    if (res && res.closed) {
      stopHeartbeat();
      stopHostPolling();
      addChatMessage('system', '⚠ 房间已被管理员关闭');
      showToast('房间已被管理员关闭');
      broadcast({ type: 'game_over', players, reason: '房间已被管理员关闭' });
      setTimeout(resetToLobby, 1500);
    }
  } catch (e) {}
}

// --- Admin ---
function openAdminGamePanel() {
  document.getElementById('adminGamePanel').style.display = 'flex';
  loadAdminRooms();
}

function closeAdminGamePanel() {
  document.getElementById('adminGamePanel').style.display = 'none';
}

async function loadAdminRooms() {
  const list = document.getElementById('adminRoomList');
  try {
    const res = await apiGameRooms({ action: 'admin_list' });
    if (res.error) { list.innerHTML = '<p style="color:var(--danger);">' + res.error + '</p>'; return; }
    const rooms = res.rooms || [];
    if (rooms.length === 0) {
      list.innerHTML = '<p style="color:var(--text-tertiary);text-align:center;padding:20px;">暂无房间</p>';
      return;
    }
    list.innerHTML = rooms.map(r => {
      const isActive = r.status === 'active';
      return `<div class="admin-room-row">
        <div class="admin-room-info">
          <div class="admin-room-name">${escapeHtml(r.name)} <span class="admin-room-status ${isActive ? 'status-active' : 'status-closed'}">${isActive ? '活跃' : '已关闭'}</span></div>
          <div class="admin-room-meta">房主: ${escapeHtml(r.hostName)} | 👤 ${(r.players||[]).length}人 | ${(r.createdAt||'').slice(0,16)}</div>
        </div>
        <div class="admin-room-actions">
          ${isActive ? '<button class="btn btn-danger btn-sm" onclick="adminCloseRoom(\'' + escapeHtml(r.id) + '\')">关闭</button>' : ''}
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    list.innerHTML = '<p style="color:var(--danger);">加载失败</p>';
  }
}

async function adminCloseRoom(roomId) {
  if (!confirm('确定关闭房间 ' + roomId + ' 吗？')) return;
  const res = await apiGameRooms({ action: 'admin_close', roomId });
  if (res.error) { showToast(res.error); return; }
  showToast(res.message);
  loadAdminRooms();
  refreshRoomList();
}

async function adminCloseAllRooms() {
  if (!confirm('⚠ 确定关闭所有房间吗？此操作不可撤销！')) return;
  const res = await apiGameRooms({ action: 'admin_close' });
  if (res.error) { showToast(res.error); return; }
  showToast(res.message);
  loadAdminRooms();
  refreshRoomList();
}

// --- Override createRoom to register on server ---
const origCreateRoom = createRoom;
createRoom = function() {
  origCreateRoom();

  const registerInterval = setInterval(() => {
    if (myPeerId && isRoomHost) {
      clearInterval(registerInterval);
      const name = roomName || playerName + '的房间';
      apiGameRooms({ action: 'create', roomId: myPeerId, name, hostName: playerName, hostPeerId: myPeerId }).then(() => {
        startHostPolling();
        startHeartbeat();
        refreshRoomList();
      });
    }
  }, 500);
};

// --- Override leaveRoom to deregister ---
const origLeaveRoom = leaveRoom;
leaveRoom = function() {
  stopHostPolling();
  stopHeartbeat();
  stopJoinPolling();
  if (roomId && isRoomHost) {
    // Only close room on server if no other players
    const otherCount = Object.keys(players).filter(pid => pid !== myPeerId).length;
    if (otherCount === 0) {
      apiGameRooms({ action: 'close', roomId }).catch(() => {});
    }
  } else if (roomId && !isRoomHost) {
    apiGameRooms({ action: 'player_leave', roomId, playerName }).catch(() => {});
  }
  origLeaveRoom();
};

// --- Hook into tab switch for room list ---
const origSwitchTab = switchTab;
switchTab = function(tab) {
  origSwitchTab(tab);
  if (tab === 'game') {
    startRoomListRefresh();
    if (currentUser && currentUser.role === 'admin') {
      document.getElementById('adminGameBtn').style.display = '';
    }
  } else {
    stopRoomListRefresh();
  }
};
