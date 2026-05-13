// ==================== APP STARTUP ====================

// Initialize data from localStorage
loadData();

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').catch(function() {});
  });
}

function initApp() {
  loadTheme();
  updateCategories();
  renderTodos();
  // Show notification enable button if permission is not granted
  var notifBtn = document.getElementById('notifEnableBtn');
  if (notifBtn && 'Notification' in window) {
    if (Notification.permission !== 'granted') {
      notifBtn.style.display = 'inline-flex';
    }
  }
  if (currentUser) {
    document.getElementById("headerUserName").innerHTML = "<a href=\"#\" onclick=\"openProfile();return false;\" style=\"color:var(--accent);text-decoration:none;cursor:pointer;\">👤 " + currentUser.name + "</a>";
    if (currentUser.role === "admin") {
      document.getElementById("headerAdminBtn").style.display = "inline-flex";
    }
    loadFromCloud().then(function() { updateCategories(); renderTodos(); });
    checkAnnounce();
  }
}

async function startApp() {
  initCanvas();
  window.addEventListener("hashchange", checkUrlHash);
  var authed = await verifyToken();
  if (authed) {
    document.getElementById("authOverlay").style.display = "none";
    initApp();
    setTimeout(checkUrlHash, 500);
  } else {
    document.getElementById("authOverlay").style.display = "flex";
  }
}

window.addEventListener("load", startApp);
