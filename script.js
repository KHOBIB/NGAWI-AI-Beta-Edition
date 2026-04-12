/* ═══════════════════════════════════════════
   NGAWI AI — APP.JS
   Firebase Auth + Chat + Header Animation
═══════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

/* ── Firebase config ── */
const app = initializeApp({
  apiKey: "AIzaSyAalw-VTn9T3x6UIIdCtPfoVtaG7jlllzw",
  authDomain: "ngawi-ai-666.firebaseapp.com",
  projectId: "ngawi-ai-666",
  storageBucket: "ngawi-ai-666.firebasestorage.app",
  messagingSenderId: "709879888470",
  appId: "1:709879888470:web:433ccc9c7146facc1759f7",
});
const auth = getAuth(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

/* ── Chat history ── */
let history = [
  {
    role: "system",
    content:
      "Kamu adalah orang bekasi yang selalu pakai bahasa bekasi bukan betawi. Sifatmu adalah teman yang asik dan usil, Gunakan bahasa sehari-hari manusia dan gaul, jangan baku. Panggil user dengan sebutan 'rek'. di awal kalimat gunakan kata 'welahdalah' jika diperlukan jangan terlalu sering. Gunakan kata-kata seperti 'jir', bangsat, anjir, bangke, 'kocak', 'lawak' jika perlu. pakai emote 😹 jika sedang meledek user. jika pengguna kesal kamu akan menulis 'marah loh ya😹'. Kamu tidak harus selalu menurut, jadilah kritis agar hasil kerjamu benar. Jangan pakai kata 'aku/kamu' karena itu norak. Ubah kata biarin aja menjadi bagen. harus memberi solusi setiap ada masalah. mengingatkan untuk sholat 5 waktu saat sudah waktunya adzan sudah waktunya. jangan terlalu panjang saat menjawab cukup seperlunya namun tetap seru.",
  },
];

/* ─────────────────────────────────────────
   MOON ANIMATION — WELCOME
   Animasi bulan berkilau dengan orbit bintang
───────────────────────────────────────── */
function runMoonAnimation(canvas) {
  if (!canvas || canvas._moonRunning) return;
  canvas._moonRunning = true;

  const ctx = canvas.getContext("2d");
  const W = 90,
    H = 90;

  /* Static star positions */
  const STARS = [
    { x: 11, y: 13, r: 1.1, p: 0.0 },
    { x: 74, y: 17, r: 0.85, p: 1.1 },
    { x: 82, y: 54, r: 1.0, p: 2.4 },
    { x: 7, y: 64, r: 0.9, p: 0.6 },
    { x: 17, y: 78, r: 0.8, p: 1.9 },
    { x: 78, y: 74, r: 1.0, p: 2.7 },
    { x: 63, y: 9, r: 0.75, p: 0.3 },
    { x: 19, y: 43, r: 0.65, p: 1.4 },
    { x: 83, y: 31, r: 0.8, p: 3.1 },
    { x: 55, y: 79, r: 0.7, p: 2.0 },
  ];

  function draw() {
    /* Stop loop if canvas removed from DOM */
    if (!canvas.isConnected) return;

    const t = Date.now() / 1000;
    const isDark = document.body.getAttribute("data-theme") !== "light";

    ctx.clearRect(0, 0, W, H);

    /* ── 1. Deep space background ── */
    const bgGrd = ctx.createRadialGradient(45, 45, 5, 45, 45, 52);
    bgGrd.addColorStop(0, isDark ? "#1c0d3a" : "#210e52");
    bgGrd.addColorStop(0.7, isDark ? "#0d0820" : "#160a3a");
    bgGrd.addColorStop(1, isDark ? "#06060f" : "#0a0620");
    ctx.fillStyle = bgGrd;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 22);
    ctx.fill();

    /* ── 2. Twinkling stars ── */
    STARS.forEach((s) => {
      const alpha = 0.28 + 0.68 * (0.5 + 0.5 * Math.sin(t * 1.7 + s.p));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210,200,255,${alpha})`;
      ctx.fill();
      /* Cross sparkle on brighter/larger stars */
      if (s.r >= 0.9 && alpha > 0.72) {
        ctx.save();
        ctx.strokeStyle = `rgba(210,200,255,${alpha * 0.45})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x - s.r * 2.8, s.y);
        ctx.lineTo(s.x + s.r * 2.8, s.y);
        ctx.moveTo(s.x, s.y - s.r * 2.8);
        ctx.lineTo(s.x, s.y + s.r * 2.8);
        ctx.stroke();
        ctx.restore();
      }
    });

    /* ── 3. Moon outer corona (pulsing) ── */
    const pulse = 1 + 0.11 * Math.sin(t * 1.25);
    const corona = ctx.createRadialGradient(45, 45, 21, 45, 45, 43 * pulse);
    corona.addColorStop(0, "rgba(255,240,160,0.22)");
    corona.addColorStop(0.5, "rgba(255,210, 80,0.09)");
    corona.addColorStop(1, "rgba(255,180,  0,0)");
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(45, 45, 43 * pulse, 0, Math.PI * 2);
    ctx.fill();

    /* ── 4. Moon body ── */
    const moonGrd = ctx.createRadialGradient(38, 36, 1, 45, 45, 23);
    moonGrd.addColorStop(0, "#fffde8");
    moonGrd.addColorStop(0.42, "#f8e060");
    moonGrd.addColorStop(0.82, "#d98818");
    moonGrd.addColorStop(1, "#b86808");
    ctx.fillStyle = moonGrd;
    ctx.beginPath();
    ctx.arc(45, 45, 23, 0, Math.PI * 2);
    ctx.fill();

    /* Surface highlight sheen */
    const sheen = ctx.createRadialGradient(38, 37, 0, 38, 37, 11);
    sheen.addColorStop(0, "rgba(255,255,240,0.38)");
    sheen.addColorStop(1, "rgba(255,255,200,0)");
    ctx.fillStyle = sheen;
    ctx.beginPath();
    ctx.arc(45, 45, 23, 0, Math.PI * 2);
    ctx.fill();

    /* ── 5. Rotating crescent shadow ── */
    const ca = t * 0.18;
    const cxS = 45 + 13 * Math.cos(ca);
    const cyS = 45 + 5 * Math.sin(ca);

    const sdark = isDark ? "rgba(6,4,16,0.97)" : "rgba(10,4,26,0.97)";
    const smid = isDark ? "rgba(8,5,18,0.78)" : "rgba(14,6,34,0.78)";
    const sfade = isDark ? "rgba(10,7,20,0.22)" : "rgba(18,8,42,0.22)";

    const shadowGrd = ctx.createRadialGradient(cxS, cyS, 3, cxS, cyS, 21);
    shadowGrd.addColorStop(0, sdark);
    shadowGrd.addColorStop(0.58, smid);
    shadowGrd.addColorStop(0.88, sfade);
    shadowGrd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shadowGrd;
    ctx.beginPath();
    ctx.arc(cxS, cyS, 21, 0, Math.PI * 2);
    ctx.fill();

    /* ── 6. Moon rim highlight ── */
    const rim = ctx.createRadialGradient(45, 45, 19, 45, 45, 24);
    rim.addColorStop(0, "rgba(255,255,255,0)");
    rim.addColorStop(0.75, "rgba(255,245,170,0)");
    rim.addColorStop(1, "rgba(255,235,120,0.28)");
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(45, 45, 24, 0, Math.PI * 2);
    ctx.fill();

    /* ── 7. Orbit ring (faint ellipse) ── */
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(45, 45, 36, 15, -0.14, 0, Math.PI * 2);
    ctx.strokeStyle = isDark
      ? "rgba(167,139,255,0.1)"
      : "rgba(100,60,200,0.12)";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    /* ── 8. Orbiting sparkle — golden 4-pt star ── */
    const a1 = t * 0.65;
    const o1x = 45 + 36 * Math.cos(a1);
    const o1y = 45 + 15 * Math.sin(a1);
    const al1 = 0.6 + 0.38 * Math.sin(t * 3.1);

    ctx.save();
    ctx.translate(o1x, o1y);
    ctx.rotate(t * 2.4);
    ctx.fillStyle = `rgba(255,235,110,${al1})`;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 3.8 : 1.4;
      if (i === 0) ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
      else ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    /* ── 9. Orbiting sparkle — purple orb ── */
    const a2 = t * 0.65 + Math.PI;
    const o2x = 45 + 36 * Math.cos(a2);
    const o2y = 45 + 15 * Math.sin(a2);
    const al2 = 0.55 + 0.4 * Math.sin(t * 2.7 + 1.0);

    /* Glow halo */
    const o2g = ctx.createRadialGradient(o2x, o2y, 0, o2x, o2y, 7);
    o2g.addColorStop(0, `rgba(167,139,255,${al2 * 0.32})`);
    o2g.addColorStop(1, "rgba(167,139,255,0)");
    ctx.fillStyle = o2g;
    ctx.beginPath();
    ctx.arc(o2x, o2y, 7, 0, Math.PI * 2);
    ctx.fill();
    /* Core */
    ctx.beginPath();
    ctx.arc(o2x, o2y, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(167,139,255,${al2})`;
    ctx.fill();

    /* ── 10. Orbiting sparkle — cyan dot ── */
    const a3 = t * 0.41 + Math.PI * 0.7;
    const o3x = 45 + 36 * Math.cos(a3);
    const o3y = 45 + 15 * Math.sin(a3);
    const al3 = 0.42 + 0.46 * Math.sin(t * 2.1 + 2.2);

    ctx.beginPath();
    ctx.arc(o3x, o3y, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(103,232,249,${al3})`;
    ctx.fill();

    requestAnimationFrame(draw);
  }

  draw();
}

/* Initial run on page load */
(function () {
  const canvas = document.getElementById("catWelcomeCanvas");
  if (canvas) runMoonAnimation(canvas);
})();

/* Re-run after clearChat() rebuilds the DOM */
function initMoonAfterRebuild() {
  const canvas = document.getElementById("catWelcomeCanvas");
  runMoonAnimation(canvas);
}

/* ─────────────────────────────────────────
   HEADER CHARACTER ANIMATION
───────────────────────────────────────── */
(function initHeaderAnim() {
  const canvas = document.getElementById("headerCharCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const CHARS = [
    { x: 60, y: 0, vx: 0.7, vy: 0, frame: 0, ft: 0, color: "#a78bff", size: 3 },
    {
      x: 180,
      y: 0,
      vx: -0.5,
      vy: 0,
      frame: 1,
      ft: 4,
      color: "#67e8f9",
      size: 2.5,
    },
    {
      x: 300,
      y: 0,
      vx: 0.9,
      vy: 0,
      frame: 0,
      ft: 2,
      color: "#f472b6",
      size: 2.5,
    },
    {
      x: 420,
      y: 0,
      vx: -0.7,
      vy: 0,
      frame: 1,
      ft: 6,
      color: "#34d399",
      size: 2,
    },
  ];

  const BODY_A = [
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 1, 0, 1, 0],
    [1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1],
  ];
  const BODY_B = [
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0],
  ];

  function drawChar(c) {
    const body = c.frame === 0 ? BODY_A : BODY_B;
    const tileW = c.size;
    const bobY = Math.sin(Date.now() / 400 + c.x * 0.01) * 2;
    const baseY = canvas.height / 2 - (body.length * tileW) / 2 + bobY;
    const baseX = c.x - (body[0].length * tileW) / 2;

    body.forEach((row, ry) => {
      row.forEach((px, rx) => {
        if (px) {
          ctx.fillStyle = c.color;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(
            Math.round(baseX + rx * tileW),
            Math.round(baseY + ry * tileW),
            tileW - 0.5,
            tileW - 0.5,
          );
        }
      });
    });
    ctx.globalAlpha = 1;
  }

  const sparkles = [];
  setInterval(() => {
    if (sparkles.length < 15) {
      sparkles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        life: 30 + Math.random() * 20,
        maxL: 50,
        size: 1 + Math.random() * 2,
        color: ["#a78bff", "#67e8f9", "#f472b6", "#fbbf24"][
          Math.floor(Math.random() * 4)
        ],
      });
    }
  }, 300);

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    CHARS.forEach((c) => {
      c.x += c.vx;
      c.ft++;
      if (c.ft > 10) {
        c.frame = (c.frame + 1) % 2;
        c.ft = 0;
      }
      const margin = 20;
      if (c.x < margin || c.x > canvas.width - margin) {
        c.vx *= -1;
        c.x = Math.max(margin, Math.min(canvas.width - margin, c.x));
      }
      drawChar(c);
    });

    sparkles.forEach((s, i) => {
      s.life--;
      if (s.life <= 0) {
        sparkles.splice(i, 1);
        return;
      }
      const alpha = s.life / s.maxL;
      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha * 0.7;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
    });
    ctx.globalAlpha = 1;
  }
  loop();
})();

/* ─────────────────────────────────────────
   PLACEHOLDER HELPER
───────────────────────────────────────── */
window.updatePlaceholder = function () {
  const ta = document.getElementById("uIn");
  const ph = document.getElementById("inputPh");
  if (!ta || !ph) return;
  if (ta.value.length > 0) ph.classList.add("hidden");
  else ph.classList.remove("hidden");
};
document.addEventListener("DOMContentLoaded", () => {
  window.updatePlaceholder();
});

/* ─────────────────────────────────────────
   UTILITIES
───────────────────────────────────────── */
window.showAlert = (msg, type = "error") => {
  const a = document.getElementById("alert");
  const icon = document.getElementById("alertIcon");
  const text = document.getElementById("alertMsg");
  icon.textContent = type === "success" ? "check_circle" : "error";
  text.textContent = msg;
  a.className = `show ${type}`;
  clearTimeout(a._t);
  a._t = setTimeout(() => a.classList.remove("show"), 3400);
};

window.autoResizeTA = (el) => {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 140) + "px";
};

function setBtnLoading(id, on) {
  document.getElementById(id)?.classList[on ? "add" : "remove"]("loading");
}

/* ─────────────────────────────────────────
   THEME
───────────────────────────────────────── */
const savedTheme = localStorage.getItem("king-theme") || "dark";
document.body.setAttribute("data-theme", savedTheme);
const themeIcon = document.getElementById("themeBtn")?.querySelector("span");
if (themeIcon)
  themeIcon.textContent = savedTheme === "dark" ? "light_mode" : "dark_mode";

function syncSideThemeIcon() {
  const sideIcon = document.getElementById("sideThemeIcon");
  if (sideIcon) {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    sideIcon.textContent = isDark ? "light_mode" : "dark_mode";
  }
}
syncSideThemeIcon();

window.smoothThemeSwitch = () => {
  const overlay = document.getElementById("themeOverlay");
  const isDark = document.body.getAttribute("data-theme") === "dark";
  overlay.style.backgroundColor = isDark ? "#f0edff" : "#06060f";
  overlay.classList.add("active");
  setTimeout(() => {
    const t = isDark ? "light" : "dark";
    document.body.setAttribute("data-theme", t);
    const btn = document.getElementById("themeBtn")?.querySelector("span");
    if (btn) btn.textContent = t === "dark" ? "light_mode" : "dark_mode";
    localStorage.setItem("king-theme", t);
    syncSideThemeIcon();
  }, 350);
  setTimeout(() => overlay.classList.remove("active"), 750);
};

/* ─────────────────────────────────────────
   FUN TOAST
───────────────────────────────────────── */
const funMessages = [
  { emoji: "🔥", msg: "Siap tempur Rek! Tanya apa aja~" },
  { emoji: "💡", msg: "Ide bagus! Gue suka semangat lu rek" },
  { emoji: "🎮", msg: "Lagi mode gaming nih, gas terus!" },
  { emoji: "🚀", msg: "Rocket mode activated bro!" },
  { emoji: "😹", msg: "Haha lucu juga pertanyaan lu rek" },
  { emoji: "🎵", msg: "Sambil denger musik makin asik rek!" },
];
let toastIdx = 0;
function showFunToast() {
  const t = document.getElementById("funToast");
  const m = funMessages[toastIdx % funMessages.length];
  document.getElementById("toastEmoji").textContent = m.emoji;
  document.getElementById("toastMsg").textContent = m.msg;
  t.classList.add("show");
  toastIdx++;
  setTimeout(() => t.classList.remove("show"), 2800);
}

/* ─────────────────────────────────────────
   CLEAR CHAT
───────────────────────────────────────── */
window.clearChat = () => {
  history = [history[0]];
  document.getElementById("chatBox").innerHTML = buildWelcomeHTML();
  window.showAlert("Chat direset! Fresh start Rek 😹", "success");
  setTimeout(() => {
    const u = auth.currentUser;
    const wt = document.getElementById("welcomeText");
    if (wt && u) {
      wt.textContent = `Halo ${(u.displayName || u.email.split("@")[0]).split(" ")[0]},`;
    }
    initMoonAfterRebuild(); /* restart moon animation on new canvas */
  }, 50);
};

function buildWelcomeHTML() {
  return `
    <div id="welcome">
      <div class="welcome-orb-wrap">
        <div class="pixel-corner tl"></div><div class="pixel-corner tr"></div>
        <div class="pixel-corner bl"></div><div class="pixel-corner br"></div>
        <div class="welcome-icon">
          <canvas id="catWelcomeCanvas" width="90" height="90"
            style="display:block;border-radius:22px;"></canvas>
        </div>
      </div>
      <h2 id="welcomeText">Halo User Tercinta,</h2>
      <p class="welcome-sub">NGAWI AI siap tempur. Tanya apa aja Rek! 😹</p>
      <div class="pixel-status">ONLINE · READY</div>
      <div class="chips-grid">
        <div class="chip" onclick="useChip(this)"><span class="chip-icon">🧠</span><span class="chip-text">Jelasin konsep AI</span></div>
        <div class="chip" onclick="useChip(this)"><span class="chip-icon">📸</span><span class="chip-text">Caption Instagram</span></div>
        <div class="chip" onclick="useChip(this)"><span class="chip-icon">🐛</span><span class="chip-text">Bantu debug kode</span></div>
        <div class="chip" onclick="useChip(this)"><span class="chip-icon">🎬</span><span class="chip-text">Rekomendasiin film</span></div>
        <div class="chip" onclick="useChip(this)"><span class="chip-icon">✍️</span><span class="chip-text">Bikinin puisi buat doi</span></div>
        <div class="chip" onclick="useChip(this)"><span class="chip-icon">🎵</span><span class="chip-text">Rekomendasiin lagu</span></div>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────
   CHIPS
───────────────────────────────────────── */
window.useChip = (el) => {
  const ta = document.getElementById("uIn");
  const text =
    el.querySelector(".chip-text")?.textContent || el.textContent.trim();
  ta.value = text;
  ta.focus();
  window.autoResizeTA(ta);
  window.updatePlaceholder();
  showFunToast();
};

/* ─────────────────────────────────────────
   SEND PARTICLES
───────────────────────────────────────── */
function spawnParticles(btn) {
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const colors = ["#a78bff", "#67e8f9", "#f472b6", "#c084fc", "#34d399"];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const angle = ((Math.PI * 2) / 12) * i;
    const dist = 50 + Math.random() * 60;
    p.style.cssText = `
      left:${cx - 4}px; top:${cy - 4}px;
      background:${colors[i % colors.length]};
      --dx:${Math.cos(angle) * dist}px;
      --dy:${Math.sin(angle) * dist}px;
      --rot:${Math.random() * 360}deg;
      animation-duration:${0.6 + Math.random() * 0.4}s;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }
}

/* ─────────────────────────────────────────
   AI CHAT
───────────────────────────────────────── */
window.askAI = async () => {
  const input = document.getElementById("uIn");
  const sendBtn = document.getElementById("sendBtn");
  const prompt = input.value.trim();
  if (!prompt) {
    window.showAlert("Isi dulu pertanyaannya Rek");
    return;
  }

  sendBtn.disabled = true;
  spawnParticles(sendBtn);

  const welcome = document.getElementById("welcome");
  if (welcome) welcome.style.display = "none";

  addBubble("user", prompt.replace(/\n/g, "<br>"));
  input.value = "";
  input.style.height = "auto";
  window.updatePlaceholder();

  const lId = "L-" + Date.now();
  const box = document.getElementById("chatBox");
  const typingD = document.createElement("div");
  typingD.className = "msg ai";
  typingD.id = "typing-msg-" + lId;
  typingD.innerHTML = `
    <div class="ai-avatar">N</div>
    <div class="typing-indicator-wrap" id="${lId}">
      <div class="typing-dots"><span></span><span></span><span></span></div>
      <div class="typing-label">Bentar lagi ngetik...</div>
    </div>`;
  box.appendChild(typingD);
  box.scrollTop = box.scrollHeight;
  z;
  try {
    history.push({ role: "user", content: prompt });
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: history,
        stream: true,
      }),
    });

    const reader = res.body.getReader();
    let full = "",
      started = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = new TextDecoder().decode(value);
      for (const line of chunk
        .split("\n")
        .filter((l) => l.trim().startsWith("data: "))) {
        const data = line.slice(6);
        if (data === "[DONE]") break;
        try {
          const content = JSON.parse(data).choices[0].delta.content;
          if (content) {
            full += content;
            if (!started) {
              const tm = document.getElementById("typing-msg-" + lId);
              if (tm)
                tm.innerHTML = `<div class="ai-avatar">N</div><div class="bubble" id="${lId}"></div>`;
              started = true;
            }
            const bubble = document.getElementById(lId);
            if (bubble) {
              bubble.innerHTML =
                full.replace(/\*\*/g, "").replace(/\n/g, "<br>") +
                '<span class="typing-cursor"></span>';
              box.scrollTop = box.scrollHeight;
            }
          }
        } catch (_) {}
      }
    }

    document.getElementById(lId)?.querySelector(".typing-cursor")?.remove();
    history.push({ role: "assistant", content: full });
  } catch (e) {
    const tm = document.getElementById("typing-msg-" + lId);
    if (tm)
      tm.innerHTML = `<div class="ai-avatar">N</div><div class="bubble">Koneksi error Rek! Coba lagi ya 😹</div>`;
  } finally {
    sendBtn.disabled = false;
  }
};

function addBubble(role, text, id = "") {
  const box = document.getElementById("chatBox");
  const d = document.createElement("div");
  d.className = `msg ${role}`;
  d.innerHTML =
    role === "ai"
      ? `<div class="ai-avatar">N</div><div class="bubble"${id ? ` id="${id}"` : ""}>${text}</div>`
      : `<div class="bubble"${id ? ` id="${id}"` : ""}>${text}</div>`;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

/* ─────────────────────────────────────────
   PASSWORD STRENGTH
   ⚠️  Hanya aktif di mode DAFTAR (register)
───────────────────────────────────────── */
window.checkPwStrength = (val) => {
  /* Hanya tampilkan rate password saat mode register */
  if (window.mode !== "register") return;

  const wrap = document.getElementById("pwStrengthWrap");
  const fill = document.getElementById("pwStrengthFill");
  const label = document.getElementById("pwStrengthLabel");
  if (!val) {
    wrap.style.display = "none";
    return;
  }

  wrap.style.display = "block";
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const lvls = [
    { w: "20%", c: "#ff6b8a", t: "Lemah banget passwordnya😹" },
    { w: "45%", c: "#f59e0b", t: "Lumayan nih" },
    { w: "70%", c: "#06b6d4", t: "Udah oke lah" },
    { w: "100%", c: "#34d399", t: "Gelo kuat banget inimah" },
  ];
  const lv = lvls[Math.min(score, 3)];
  fill.style.width = lv.w;
  fill.style.background = lv.c;
  label.textContent = lv.t;
  label.style.color = lv.c;
};

/* ─────────────────────────────────────────
   AUTH
───────────────────────────────────────── */
window.openAuth = (m) => {
  window.mode = m;
  ["authEmail", "authPass", "regName"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  /* Selalu sembunyikan strength bar saat modal dibuka */
  const pwWrap = document.getElementById("pwStrengthWrap");
  if (pwWrap) pwWrap.style.display = "none";

  const modal = document.getElementById("authModal");
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("active"), 10);

  const isReg = m === "register";
  const s1 = document.getElementById("step1");
  const s2 = document.getElementById("step2");
  if (s1) s1.className = isReg ? "auth-step-dot done" : "auth-step-dot active";
  if (s2) s2.className = isReg ? "auth-step-dot active" : "auth-step-dot";

  const sets = {
    reset: {
      emoji: "🔑",
      title: "Reset Password",
      sub: "Masukin email buat dapet link reset",
      btnLabel: "🔑 Kirim Link Reset",
      switchText: "Inget password?",
      switchBtn: "Login Rek",
      showGoogle: false,
      showForgot: false,
      showSteps: false,
      showReg: false,
      showPw: false,
    },
    register: {
      emoji: "🎉",
      title: "Buat Akun Baru",
      sub: "Daftar gratis ke NGAWI AI",
      btnLabel: "🎉 Daftar Sekarang",
      switchText: "Udah punya akun?",
      switchBtn: "Login Aja",
      showGoogle: false,
      showForgot: false,
      showSteps: true,
      showReg: true,
      showPw: true,
    },
    login: {
      emoji: "🔐",
      title: "Selamat Datang",
      sub: "Masuk ke NGAWI AI buat lanjut",
      btnLabel: "Masuk Sekarang",
      switchText: "Belum punya akun?",
      switchBtn: "Daftar Dulu",
      showGoogle: true,
      showForgot: true,
      showSteps: true,
      showReg: false,
      showPw: true,
    },
  };
  const cfg = sets[m] || sets.login;

  document.getElementById("authEmoji").textContent = cfg.emoji;
  document.getElementById("authTitle").textContent = cfg.title;
  document.getElementById("authSub").textContent = cfg.sub;
  document.getElementById("btnLabel").textContent = cfg.btnLabel;
  document.getElementById("switchText").textContent = cfg.switchText;
  document.getElementById("switchBtn").textContent = cfg.switchBtn;
  document.getElementById("googleAuthBtn").style.display = cfg.showGoogle
    ? "flex"
    : "none";
  document.getElementById("forgotWrap").style.display = cfg.showForgot
    ? "block"
    : "none";
  document.getElementById("authSteps").style.display = cfg.showSteps
    ? "flex"
    : "none";
  document.getElementById("regFields").style.display = cfg.showReg
    ? "block"
    : "none";
  document.getElementById("pwField").style.display = cfg.showPw
    ? "block"
    : "none";
};

window.processAuth = async () => {
  const email = document.getElementById("authEmail")?.value.trim();
  const pass = document.getElementById("authPass")?.value;
  if (!email) return window.showAlert("Emailnya isi dulu jir! 😹");
  setBtnLoading("mainAuthBtn", true);
  try {
    if (window.mode === "register") {
      if (!pass || pass.length < 6)
        return window.showAlert("Password minimal 6 karakter woyy");
      await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(auth.currentUser, {
        displayName: document.getElementById("regName")?.value,
      });
      await signOut(auth);
      window.showAlert("Daftar Berhasil", "success");
      window.openAuth("login");
    } else if (window.mode === "reset") {
      await sendPasswordResetEmail(auth, email);
      window.showAlert(
        "Link reset sudah dikirim! Cek email di folder spam",
        "success",
      );
      window.openAuth("login");
    } else {
      await signInWithEmailAndPassword(auth, email, pass);
      window.showAlert("Login berhasil", "success");
      window.closeModal();
    }
  } catch (err) {
    const msgs = {
      "auth/email-already-in-use": "Email udah terdaftar jir!",
      "auth/invalid-credential": "Passwordnya salah woyy!",
      "auth/wrong-password": "Passwordnya salah woyy!",
      "auth/user-not-found": "Email belum kedaftar jir",
      "auth/invalid-email": "Format email salah coy",
    };
    window.showAlert(msgs[err.code] || "Gagal! Cek lagi data lu coba ");
  } finally {
    setBtnLoading("mainAuthBtn", false);
  }
};

window.loginGoogle = () => {
  setBtnLoading("googleAuthBtn", true);
  signInWithPopup(auth, provider)
    .then(() => {
      window.showAlert("Login berhasil", "success");
      window.closeModal();
    })
    .catch(() => window.showAlert("Login Google Gagal"))
    .finally(() => setBtnLoading("googleAuthBtn", false));
};

window.togglePW = () => {
  const pw = document.getElementById("authPass");
  const eye = document.getElementById("eyeIcon");
  pw.type = pw.type === "password" ? "text" : "password";
  eye.textContent = pw.type === "password" ? "visibility_off" : "visibility";
};

window.confirmLogout = () => {
  window.closeSidebar();
  const m = document.getElementById("logoutModal");
  m.style.display = "flex";
  setTimeout(() => m.classList.add("active"), 10);
};
window.closeLogoutModal = () => {
  const m = document.getElementById("logoutModal");
  m.classList.remove("active");
  setTimeout(() => (m.style.display = "none"), 400);
};
window.logout = () => signOut(auth).then(() => location.reload());

window.closeModal = () => {
  const m = document.getElementById("authModal");
  m.classList.remove("active");
  setTimeout(() => (m.style.display = "none"), 400);
};
window.switchAuth = () => {
  if (window.mode === "reset") window.openAuth("login");
  else window.openAuth(window.mode === "login" ? "register" : "login");
};
window.viewReset = () => {
  window.closeSidebar();
  window.openAuth("reset");
};
window.toggleSidebar = () => {
  document.getElementById("profileSidebar").classList.toggle("open");
  document.getElementById("sideOverlay").classList.toggle("open");
};
window.closeSidebar = () => {
  document.getElementById("profileSidebar").classList.remove("open");
  document.getElementById("sideOverlay").classList.remove("open");
};

/* ─────────────────────────────────────────
   SIDEBAR STATE UPDATER
───────────────────────────────────────── */
function updateSidebarState(user) {
  const headerGuest = document.getElementById("sideHeaderGuest");
  const headerUser = document.getElementById("sideHeaderUser");
  const menuGuest = document.getElementById("sideMenuGuest");
  const menuUser = document.getElementById("sideMenuUser");
  const logoutBtn = document.getElementById("sideLogoutBtn");

  if (user) {
    if (headerGuest) headerGuest.style.display = "none";
    if (headerUser) headerUser.style.display = "block";
    if (menuGuest) menuGuest.style.display = "none";
    if (menuUser) menuUser.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "flex";
  } else {
    if (headerGuest) headerGuest.style.display = "block";
    if (headerUser) headerUser.style.display = "none";
    if (menuGuest) menuGuest.style.display = "block";
    if (menuUser) menuUser.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

/* ─────────────────────────────────────────
   AUTH STATE
───────────────────────────────────────── */
onAuthStateChanged(auth, (user) => {
  const trigger = document.getElementById("profileTrigger");
  const wt = document.getElementById("welcomeText");

  if (user) {
    const name = (user.displayName || user.email.split("@")[0]).split(" ")[0];
    const photo =
      user.photoURL ||
      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    if (trigger)
      trigger.innerHTML = `
        <img src="${photo}"
             style="width:36px;height:36px;border-radius:50%;object-fit:cover;
                    border:2px solid var(--accent);cursor:pointer;
                    box-shadow:0 0 12px var(--glow);transition:transform .2s"
             onmouseover="this.style.transform='scale(1.1)'"
             onmouseout="this.style.transform='scale(1)'"
             onclick="window.toggleSidebar()" />`;
    if (wt) wt.textContent = `Halo ${name},`;
    const sideName = document.getElementById("sideName");
    const sideEmail = document.getElementById("sideEmail");
    const sideAvatar = document.getElementById("sideAvatar");
    if (sideName)
      sideName.textContent = user.displayName || user.email.split("@")[0];
    if (sideEmail) sideEmail.textContent = user.email;
    if (sideAvatar) sideAvatar.src = photo;
    updateSidebarState(user);
  } else {
    if (trigger)
      trigger.innerHTML = `
        <button class="icon-btn" onclick="window.toggleSidebar()">
          <span class="material-symbols-rounded" style="font-size:26px">account_circle</span>
        </button>`;
    if (wt) wt.textContent = "Halo User Tercinta";
    updateSidebarState(null);
  }
});

/* ─────────────────────────────────────────
   EDIT PROFILE
───────────────────────────────────────── */
let selectedPhotoFile = null;

window.openEditProfile = () => {
  const user = auth.currentUser;
  if (!user) return;
  window.closeSidebar();
  selectedPhotoFile = null;
  const photo =
    user.photoURL || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  document.getElementById("editNameInput").value = user.displayName || "";
  document.getElementById("editPhotoPreview").src = photo;
  document.getElementById("editPhotoUrl").value = user.photoURL?.startsWith(
    "http",
  )
    ? user.photoURL
    : "";
  document.getElementById("photoStatus").textContent = "";
  document.getElementById("photoFileInput").value = "";
  const m = document.getElementById("editProfileModal");
  m.style.display = "flex";
  setTimeout(() => m.classList.add("active"), 10);
};
window.closeEditProfile = () => {
  const m = document.getElementById("editProfileModal");
  m.classList.remove("active");
  setTimeout(() => (m.style.display = "none"), 400);
};
window.previewPhoto = () => {
  const url = document.getElementById("editPhotoUrl").value.trim();
  if (url && url.startsWith("http"))
    document.getElementById("editPhotoPreview").src = url;
};
window.triggerPhotoUpload = () =>
  document.getElementById("photoFileInput").click();

document.getElementById("photoFileInput")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  selectedPhotoFile = file;
  document.getElementById("editPhotoPreview").src = URL.createObjectURL(file);
  document.getElementById("editPhotoUrl").value = "";
  document.getElementById("photoStatus").textContent = `📎 ${file.name}`;
});

window.saveProfile = async () => {
  const user = auth.currentUser;
  if (!user) return;
  const newName = document.getElementById("editNameInput").value.trim();
  const manualUrl = document.getElementById("editPhotoUrl").value.trim();
  if (!newName) return window.showAlert("Nama jangan kosong King! 😹");
  setBtnLoading("saveProfileBtn", true);
  try {
    let finalPhoto = user.photoURL || null;

    if (selectedPhotoFile) {
      /* ── Upload foto ke Storage — jika gagal, tetap lanjut update nama ── */
      try {
        document.getElementById("photoStatus").textContent =
          "⏳ Uploading foto...";
        const r = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(r, selectedPhotoFile);
        finalPhoto = await getDownloadURL(r);
        selectedPhotoFile = null;
      } catch (uploadErr) {
        console.error("Storage upload error:", uploadErr);
        document.getElementById("photoStatus").textContent =
          "⚠️ Upload foto gagal, hanya nama yang diupdate";
        /* Tetap lanjut update nama meski foto gagal */
      }
    } else if (manualUrl && manualUrl.startsWith("http")) {
      finalPhoto = manualUrl;
    }

    /* ── Update profil di Firebase Auth ── */
    await updateProfile(user, { displayName: newName, photoURL: finalPhoto });

    /* ── Reload user agar data fresh (penting setelah updateProfile) ── */
    await user.reload();
    const freshUser = auth.currentUser;
    const photo =
      freshUser.photoURL ||
      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

    /* ── Update UI ── */
    const wt = document.getElementById("welcomeText");
    if (wt) wt.textContent = `Halo ${newName.split(" ")[0]},`;

    const sideName = document.getElementById("sideName");
    const sideAvatar = document.getElementById("sideAvatar");
    const trigger = document.getElementById("profileTrigger");

    if (sideName) sideName.textContent = newName;
    if (sideAvatar) sideAvatar.src = photo;
    if (trigger)
      trigger.innerHTML = `
        <img src="${photo}"
             style="width:36px;height:36px;border-radius:50%;object-fit:cover;
                    border:2px solid var(--accent);cursor:pointer;
                    box-shadow:0 0 12px var(--glow);transition:transform .2s"
             onmouseover="this.style.transform='scale(1.1)'"
             onmouseout="this.style.transform='scale(1)'"
             onclick="window.toggleSidebar()" />`;

    document.getElementById("photoStatus").textContent = "";
    window.showAlert("Profil berhasil diupdate King! 🔥", "success");
    window.closeEditProfile();
  } catch (err) {
    console.error("saveProfile error:", err);
    window.showAlert("Gagal update profil Rek! Coba lagi 😹");
  } finally {
    setBtnLoading("saveProfileBtn", false);
  }
};

/* ═══════════════════════════════════════════
   NGAWI AI — MUSIC PLAYER
   IndexedDB Persistence
═══════════════════════════════════════════ */
(function () {
  "use strict";

  const DB_NAME = "NgawiMusicDB";
  const DB_VERSION = 1;
  const STORE_NAME = "tracks";
  let db = null;

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE_NAME))
          d.createObjectStore(STORE_NAME, { keyPath: "id" });
      };
      req.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };
      req.onerror = (e) => reject(e);
    });
  }
  function saveTrackToDB(id, name, arrayBuffer, type) {
    if (!db) return;
    db.transaction(STORE_NAME, "readwrite")
      .objectStore(STORE_NAME)
      .put({ id, name, data: arrayBuffer, type });
  }
  function removeTrackFromDB(id) {
    if (!db) return;
    db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id);
  }
  function getAllTracksFromDB() {
    return new Promise((resolve) => {
      if (!db) return resolve([]);
      const req = db
        .transaction(STORE_NAME, "readonly")
        .objectStore(STORE_NAME)
        .getAll();
      req.onsuccess = (e) => resolve(e.target.result || []);
      req.onerror = () => resolve([]);
    });
  }

  let playlist = [],
    currentTrack = -1;
  let isRepeat = false,
    isShuffle = false;
  let audioCtx = null,
    analyser = null,
    sourceConnected = false;

  const audio = new Audio();
  audio.volume = parseFloat(localStorage.getItem("ngawi-vol") || "0.8");

  async function restoreState() {
    await openDB();
    const saved = await getAllTracksFromDB();
    if (!saved.length) return;
    saved.forEach((item) => {
      const blob = new Blob([item.data], { type: item.type });
      const url = URL.createObjectURL(blob);
      const track = {
        id: item.id,
        name: item.name,
        url,
        type: item.type,
        duration: "—",
        fromDB: true,
      };
      playlist.push(track);
      const tmp = new Audio(url);
      const idx = playlist.length - 1;
      tmp.addEventListener("loadedmetadata", () => {
        playlist[idx].duration = formatTime(tmp.duration);
        renderPlaylist();
      });
    });
    const lastTrack = parseInt(localStorage.getItem("ngawi-track") || "-1");
    renderPlaylist();
    if (lastTrack >= 0 && lastTrack < playlist.length)
      loadTrack(lastTrack, false);
  }

  const canvas = document.getElementById("visualizerCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  window.addEventListener("resize", resizeCanvas);
  setTimeout(resizeCanvas, 120);

  function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    if (!canvas || !ctx) return;
    const W = canvas.offsetWidth,
      H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    const isDark = document.body.getAttribute("data-theme") !== "light";
    const barCount = 32;
    if (analyser && !audio.paused) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const barW = (W - (barCount - 1) * 3) / barCount;
      for (let i = 0; i < barCount; i++) {
        const val = data[Math.floor((i * data.length) / barCount)] / 255;
        const barH = Math.max(4, val * (H - 8));
        const x = i * (barW + 3);
        const hue = 260 + i * 3;
        const grd = ctx.createLinearGradient(x, H - barH, x, H);
        grd.addColorStop(0, `hsla(${hue},80%,75%,0.9)`);
        grd.addColorStop(1, `hsla(${hue + 40},90%,60%,0.5)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, H - barH, barW, barH, 3);
        else ctx.rect(x, H - barH, barW, barH);
        ctx.fill();
      }
    } else {
      const t = Date.now() / 800;
      const barW = (W - (barCount - 1) * 3) / barCount;
      for (let i = 0; i < barCount; i++) {
        const val = ((Math.sin(t + i * 0.4) + 1) / 2) * 0.25 + 0.04;
        const barH = Math.max(3, val * H);
        const x = i * (barW + 3);
        ctx.fillStyle = isDark
          ? "rgba(167,139,255,0.2)"
          : "rgba(109,40,217,0.15)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, H - barH, barW, barH, 3);
        else ctx.rect(x, H - barH, barW, barH);
        ctx.fill();
      }
    }
  }
  drawVisualizer();

  function initAudioCtx() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    if (!sourceConnected) {
      const src = audioCtx.createMediaElementSource(audio);
      src.connect(analyser);
      analyser.connect(audioCtx.destination);
      sourceConnected = true;
    }
  }

  window.loadTrack = function (idx, autoplay = true) {
    if (idx < 0 || idx >= playlist.length) return;
    currentTrack = idx;
    audio.src = playlist[idx].url;
    localStorage.setItem("ngawi-track", idx);
    if (autoplay) {
      audio
        .play()
        .then(() => {
          initAudioCtx();
          if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
          updatePlayerUI(true);
        })
        .catch(console.error);
    } else {
      updatePlayerUI(false);
    }
  };

  window.togglePlay = function () {
    if (!playlist.length) {
      showAlert("Tambahin lagu dulu Rek! 🎵");
      return;
    }
    if (audio.paused) {
      audio.play().then(() => {
        initAudioCtx();
        if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
        updatePlayerUI(true);
      });
    } else {
      audio.pause();
      updatePlayerUI(false);
      document.getElementById("headerMusicMini")?.classList.remove("visible");
    }
  };

  window.nextTrack = function () {
    if (!playlist.length) return;
    window.loadTrack(
      isShuffle
        ? Math.floor(Math.random() * playlist.length)
        : (currentTrack + 1) % playlist.length,
    );
  };
  window.prevTrack = function () {
    if (!playlist.length) return;
    window.loadTrack((currentTrack - 1 + playlist.length) % playlist.length);
  };

  window.shuffleTrack = function () {
    isShuffle = !isShuffle;
    const btn = document.getElementById("shuffleBtn");
    if (btn) {
      btn.style.color = isShuffle ? "var(--accent3)" : "";
      btn.style.borderColor = isShuffle ? "var(--accent3)" : "";
    }
    showAlert(isShuffle ? "Shuffle ON 🔀" : "Shuffle OFF", "success");
  };
  window.toggleRepeat = function () {
    isRepeat = !isRepeat;
    audio.loop = isRepeat;
    const btn = document.getElementById("repeatBtn");
    if (btn) {
      btn.style.color = isRepeat ? "var(--accent)" : "";
      btn.style.borderColor = isRepeat ? "var(--accent)" : "";
    }
    showAlert(isRepeat ? "Repeat ON 🔁" : "Repeat OFF", "success");
  };
  window.seekAudio = function (e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if (isFinite(audio.duration)) audio.currentTime = ratio * audio.duration;
  };
  window.setVolume = function (val) {
    audio.volume = parseFloat(val);
    localStorage.setItem("ngawi-vol", val);
    const icon = document.getElementById("volIcon");
    if (icon)
      icon.textContent =
        val == 0 ? "volume_off" : val < 0.4 ? "volume_down" : "volume_up";
  };

  window.addMusicFiles = function (files) {
    if (!files || !files.length) return;
    let added = 0;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("audio/")) return;
      const url = URL.createObjectURL(file);
      const name = file.name.replace(/\.[^.]+$/, "");
      const id = `track_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      playlist.push({ id, name, url, type: file.type, duration: "—" });
      const idx = playlist.length - 1;
      const tmp = new Audio(url);
      tmp.addEventListener("loadedmetadata", () => {
        playlist[idx].duration = formatTime(tmp.duration);
        renderPlaylist();
      });
      file.arrayBuffer().then((buf) => saveTrackToDB(id, name, buf, file.type));
      added++;
    });
    if (added > 0) {
      showAlert(`${added} lagu ditambahkan rek! 🎵`, "success");
      renderPlaylist();
      if (currentTrack === -1) window.loadTrack(0);
    }
    const inp = document.getElementById("musicFileInput");
    if (inp) inp.value = "";
  };

  window.removeTrack = function (idx) {
    const track = playlist[idx];
    if (!track) return;
    URL.revokeObjectURL(track.url);
    removeTrackFromDB(track.id);
    playlist.splice(idx, 1);
    if (currentTrack === idx) {
      audio.pause();
      if (playlist.length > 0)
        window.loadTrack(Math.min(idx, playlist.length - 1));
      else {
        currentTrack = -1;
        localStorage.removeItem("ngawi-track");
        updatePlayerUI(false);
      }
    } else if (currentTrack > idx) {
      currentTrack--;
      localStorage.setItem("ngawi-track", currentTrack);
    }
    renderPlaylist();
  };

  function renderPlaylist() {
    const container = document.getElementById("playlistContainer");
    const countEl = document.getElementById("trackCount");
    if (!container) return;
    if (countEl)
      countEl.textContent =
        playlist.length > 0 ? `${currentTrack + 1}/${playlist.length}` : "0/0";
    if (playlist.length === 0) {
      container.innerHTML = `<div class="playlist-empty"><span class="playlist-empty-icon">🎧</span>Belum ada musik nih Rek!<br>Tambahkan dari storage kamu dulu</div>`;
      return;
    }
    container.innerHTML = playlist
      .map(
        (t, i) => `
      <div class="playlist-item ${i === currentTrack ? "active" : ""}" onclick="window.loadTrack(${i})">
        <div class="playlist-item-num">${i === currentTrack && !audio.paused ? "▶" : i + 1}</div>
        <div class="playlist-item-info">
          <div class="playlist-item-name">${escHtml(t.name)}</div>
          <div class="playlist-item-dur">${t.duration}</div>
        </div>
        <button class="playlist-item-del" onclick="event.stopPropagation();window.removeTrack(${i})" title="Hapus">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>`,
      )
      .join("");
  }

  function updatePlayerUI(playing) {
    const track = currentTrack >= 0 ? playlist[currentTrack] : null;
    const titleEl = document.getElementById("musicTitle");
    const artEl = document.getElementById("musicArtist");
    const ppBtn = document.getElementById("playPauseBtn");
    const albumEl = document.getElementById("albumArt");
    const mini = document.getElementById("headerMusicMini");
    const miniName = document.getElementById("miniSongName");
    if (titleEl)
      titleEl.textContent = track ? track.name : "Pilih musik dulu Rek!";
    if (artEl) artEl.textContent = track ? `Local · ${track.name}` : "— · —";
    if (ppBtn)
      ppBtn.querySelector("span").textContent = playing
        ? "pause"
        : "play_arrow";
    if (albumEl) albumEl.classList.toggle("spinning", !!playing);
    if (track && playing && mini && miniName) {
      mini.classList.add("visible");
      miniName.textContent = track.name;
    } else if (!playing && mini) {
      mini.classList.remove("visible");
    }
    const countEl = document.getElementById("trackCount");
    if (countEl)
      countEl.textContent =
        playlist.length > 0 ? `${currentTrack + 1}/${playlist.length}` : "0/0";
    renderPlaylist();
  }

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration || !isFinite(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    const pf = document.getElementById("progressFill");
    const ct = document.getElementById("currentTime");
    const tt = document.getElementById("totalTime");
    if (pf) pf.style.width = pct + "%";
    if (ct) ct.textContent = formatTime(audio.currentTime);
    if (tt) tt.textContent = formatTime(audio.duration);
  });
  audio.addEventListener("ended", () => {
    if (!isRepeat) {
      if (isShuffle)
        window.loadTrack(Math.floor(Math.random() * playlist.length));
      else if (currentTrack < playlist.length - 1) window.nextTrack();
      else {
        updatePlayerUI(false);
        document.getElementById("headerMusicMini")?.classList.remove("visible");
      }
    }
  });
  audio.addEventListener("play", () => updatePlayerUI(true));
  audio.addEventListener("pause", () => updatePlayerUI(false));

  const volSlider = document.getElementById("volSlider");
  if (volSlider) volSlider.value = audio.volume;

  window.toggleMusicPanel = function () {
    const panel = document.getElementById("musicPanel");
    const btn = document.getElementById("musicToggleBtn");
    const chat = document.getElementById("chatBox");
    const bottom = document.querySelector(".bottom");
    if (!panel) return;
    const isOpen = panel.classList.contains("open");
    panel.classList.toggle("open");
    btn?.classList.toggle("music-active", !isOpen);
    if (!isOpen) {
      resizeCanvas();
      setTimeout(() => {
        const panelH = panel.offsetHeight;
        if (chat) chat.style.paddingBottom = panelH + 20 + "px";
        if (bottom) bottom.style.bottom = panelH + "px";
      }, 100);
    } else {
      if (chat) chat.style.paddingBottom = "180px";
      if (bottom) bottom.style.bottom = "0";
    }
  };

  function formatTime(s) {
    if (!isFinite(s)) return "—";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  }
  function escHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function showAlert(msg, type = "error") {
    if (window.showAlert) window.showAlert(msg, type);
  }

  document.addEventListener("DOMContentLoaded", () => {
    restoreState();
  });
})();

/* ═══════════════════════════════════════════
   NGAWI AI — PIXEL DASH GAME
═══════════════════════════════════════════ */
(function () {
  "use strict";

  const GAME_W = 560,
    GAME_H = 180;
  let canvas,
    ctx,
    gameState = "idle",
    animId = null;
  let score = 0,
    bestScore = parseInt(localStorage.getItem("ngawi-best") || "0");
  let lives = 3,
    speed = 4,
    frameCount = 0;
  let isJumping = false,
    jumpVel = 0,
    doubleJump = false;
  let particles = [],
    obstacles = [],
    coins = [],
    stars = [],
    clouds = [];
  let groundY;

  const SCALE = 2,
    TILE = 2 * SCALE;
  const player = {
    x: 60,
    y: 0,
    w: 16 * SCALE,
    h: 24 * SCALE,
    frame: 0,
    frameTimer: 0,
    invincible: 0,
    dead: false,
  };

  const PLAYER_SPRITES = [
    [
      "..XXXX..",
      "XXXXXX.",
      ".XOOXOX.",
      "XXXXXXXX",
      ".XXXXXX.",
      "..XXXX..",
      "..XXXX..",
      "..X..X..",
      ".XX..XX.",
      ".X....X.",
      "XX....XX",
      "X......X",
    ],
    [
      "..XXXX..",
      "XXXXXX.",
      ".XOOXOX.",
      "XXXXXXXX",
      ".XXXXXX.",
      "..XXXX..",
      "..XXXX..",
      ".X....X.",
      "XX....XX",
      ".X....X.",
      "..X..X..",
      "..X..X..",
    ],
  ];
  const PLAYER_JUMP_SPRITE = [
    "..XXXX..",
    "XXXXXX.",
    ".XOOXOX.",
    "XXXXXXXX",
    ".XXXXXX.",
    "..XXXX..",
    ".XXXXXX.",
    "..XXXX...",
    "...XX...",
    "..XXXX..",
    ".X....X.",
    "X......X",
  ];
  const OBS_SPRITES = {
    cactus: [
      ".X..X.",
      ".X.XX.",
      "XXXXX.",
      ".X..X.",
      ".X..X.",
      ".XXXX.",
      "..XX..",
      "..XX..",
    ],
    rock: [".XXXX.", "XXXXXX", "XXXXXX", ".XXXX."],
    bird: ["..XX..", ".XXXX.", "XXXXXX", "XXXXXX", ".X..X."],
  };
  const COLOR_PLAYER = ["#c084fc", "#a855f7", "#7c3aed"];
  const COLOR_PLAYER_O = "#67e8f9";
  const COLOR_OBS_CACTUS = ["#34d399", "#059669"];
  const COLOR_OBS_ROCK = ["#94a3b8", "#64748b"];
  const COLOR_OBS_BIRD = ["#f472b6", "#ec4899"];
  const COLOR_COIN = ["#fbbf24", "#f59e0b", "#fcd34d"];

  function initGame() {
    canvas = document.getElementById("gameCanvas");
    if (!canvas) return;
    canvas.width = GAME_W;
    canvas.height = GAME_H;
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    groundY = GAME_H - 36;
    player.y = groundY - player.h;
    stars = Array.from({ length: 30 }, () => ({
      x: Math.random() * GAME_W,
      y: Math.random() * (groundY - 20),
      size: Math.random() < 0.5 ? 1 : 2,
      twinkle: Math.random() * Math.PI * 2,
    }));
    clouds = Array.from({ length: 4 }, (_, i) => ({
      x: 100 + i * 130,
      y: 15 + Math.random() * 30,
      w: 50 + Math.random() * 40,
      spd: 0.5 + Math.random() * 0.4,
    }));
    document.addEventListener("keydown", handleKey);
    canvas.addEventListener("click", handleTap);
    canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        handleTap();
      },
      { passive: false },
    );
    updateScoreDisplay();
    drawIdle();
  }

  // SESUDAH (FIXED)
  function handleKey(e) {
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      if (gameState === "idle" || gameState === "dead") startGame();
      else handleJump();
    }
  }

  function handleTap() {
    if (gameState === "idle" || gameState === "dead") startGame();
    else handleJump();
  }
  function handleJump() {
    if (!player.dead) {
      if (!isJumping) {
        isJumping = true;
        jumpVel = -13;
        doubleJump = true;
        spawnJumpParticles();
      } else if (doubleJump) {
        jumpVel = -11;
        doubleJump = false;
        spawnJumpParticles();
      }
    }
  }

  window.startGame = function () {
    if (animId) cancelAnimationFrame(animId);
    gameState = "playing";
    score = 0;
    lives = 3;
    speed = 4;
    frameCount = 0;
    isJumping = false;
    jumpVel = 0;
    doubleJump = false;
    player.y = groundY - player.h;
    player.frame = 0;
    player.invincible = 0;
    player.dead = false;
    obstacles = [];
    coins = [];
    particles = [];
    document.getElementById("gameOverlay")?.classList.add("hidden");
    updateScoreDisplay();
    loop();
  };

  function loop() {
    animId = requestAnimationFrame(loop);
    update();
    draw();
  }

  function update() {
    frameCount++;
    score = Math.floor(frameCount / 6);
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("ngawi-best", bestScore);
    }
    speed = Math.min(12, 4 + Math.floor(score / 200) * 0.5);

    player.frameTimer++;
    if (player.frameTimer > 8) {
      player.frame = (player.frame + 1) % 2;
      player.frameTimer = 0;
    }

    if (isJumping) {
      player.y += jumpVel;
      jumpVel += 0.7;
      if (player.y >= groundY - player.h) {
        player.y = groundY - player.h;
        isJumping = false;
        jumpVel = 0;
        doubleJump = false;
      }
    }
    if (player.invincible > 0) player.invincible--;

    if (
      frameCount % Math.max(60, 110 - Math.floor(score / 100) * 5) === 0 &&
      obstacles.length < 4
    ) {
      const types = ["cactus", "rock", "bird"];
      const type = types[Math.floor(Math.random() * types.length)];
      const isBird = type === "bird";
      obstacles.push({
        x: GAME_W + 10,
        y: isBird ? groundY - 60 : groundY - 32,
        w: isBird ? 32 : 24,
        h: isBird ? 24 : 32,
        type,
        animT: 0,
      });
    }
    if (frameCount % 90 === 0 && coins.length < 6)
      coins.push({
        x: GAME_W + 10,
        y: groundY - 50 - Math.random() * 40,
        r: 6,
        animT: Math.random() * Math.PI * 2,
      });

    obstacles = obstacles.filter((o) => o.x > -40);
    obstacles.forEach((o) => {
      o.x -= speed;
      o.animT++;
      if (player.invincible === 0 && !player.dead) {
        const px = player.x + 6,
          py = player.y + 4,
          pw = player.w - 12,
          ph = player.h - 4;
        if (px < o.x + o.w && px + pw > o.x && py < o.y + o.h && py + ph > o.y)
          hitPlayer();
      }
    });
    coins = coins.filter((c) => c.x > -20);
    coins.forEach((c) => {
      c.x -= speed;
      c.animT += 0.1;
      const dx = player.x + player.w / 2 - c.x,
        dy = player.y + player.h / 2 - c.y;
      if (Math.sqrt(dx * dx + dy * dy) < c.r + 12) {
        score += 5;
        spawnCoinParticles(c.x, c.y);
        coins.splice(coins.indexOf(c), 1);
      }
    });
    clouds.forEach((c) => {
      c.x -= c.spd;
      if (c.x + c.w < 0) {
        c.x = GAME_W + 10;
        c.y = 15 + Math.random() * 30;
      }
    });
    particles = particles.filter((p) => p.life > 0);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life--;
      p.size = Math.max(0, p.size - 0.05);
    });
    if (frameCount % 10 === 0) updateScoreDisplay();
  }

  function hitPlayer() {
    lives--;
    player.invincible = 90;
    spawnHitParticles();
    if (lives <= 0) gameOver();
    else updateScoreDisplay();
  }
  function gameOver() {
    gameState = "dead";
    player.dead = true;
    cancelAnimationFrame(animId);
    draw();
    const overlay = document.getElementById("gameOverlay");
    const title = document.getElementById("gameOverlayTitle");
    const sub = document.getElementById("gameOverlaySub");
    const btn = document.getElementById("gameStartBtn");
    if (overlay && title && sub && btn) {
      title.textContent = `GAME OVER! ${score >= bestScore ? "👑 NEW BEST!" : ""}`;
      sub.textContent = `Score: ${score} · Best: ${bestScore}`;
      btn.textContent = "↺ MAIN LAGI";
      overlay.classList.remove("hidden");
    }
    updateScoreDisplay();
  }

  function draw() {
    ctx.clearRect(0, 0, GAME_W, GAME_H);
    const isDark = document.body.getAttribute("data-theme") !== "light";
    const skyGrd = ctx.createLinearGradient(0, 0, 0, groundY);
    if (isDark) {
      skyGrd.addColorStop(0, "#06060f");
      skyGrd.addColorStop(1, "#0d0d2a");
    } else {
      skyGrd.addColorStop(0, "#e8e0ff");
      skyGrd.addColorStop(1, "#c4b5fd");
    }
    ctx.fillStyle = skyGrd;
    ctx.fillRect(0, 0, GAME_W, groundY);

    stars.forEach((s) => {
      s.twinkle += 0.04;
      const alpha = 0.4 + Math.sin(s.twinkle) * 0.4;
      ctx.fillStyle = isDark
        ? `rgba(167,139,255,${alpha})`
        : `rgba(109,40,217,${alpha * 0.3})`;
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    });
    clouds.forEach((c) => drawCloud(c.x, c.y, c.w, isDark));

    const grdGrd = ctx.createLinearGradient(0, groundY, 0, GAME_H);
    if (isDark) {
      grdGrd.addColorStop(0, "#1a0f3a");
      grdGrd.addColorStop(1, "#0d0820");
    } else {
      grdGrd.addColorStop(0, "#7c3aed");
      grdGrd.addColorStop(1, "#5b21b6");
    }
    ctx.fillStyle = grdGrd;
    ctx.fillRect(0, groundY, GAME_W, GAME_H - groundY);
    ctx.fillStyle = isDark ? "#a78bff" : "#c4b5fd";
    for (let x = -((frameCount * speed) | 0) % 16; x < GAME_W; x += 16)
      ctx.fillRect(x, groundY, 8, 2);

    coins.forEach((c) => {
      const bob = Math.sin(c.animT) * 3;
      drawCoin(c.x, c.y + bob, c.r);
    });
    obstacles.forEach((o) => drawObstacle(o));
    drawPlayer();

    particles.forEach((p) => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.fillRect(
        Math.floor(p.x),
        Math.floor(p.y),
        Math.ceil(p.size),
        Math.ceil(p.size),
      );
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = isDark ? "rgba(167,139,255,0.7)" : "rgba(109,40,217,0.7)";
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = "right";
    ctx.fillText(`${score}`, GAME_W - 8, 14);
    ctx.textAlign = "left";
  }
  function drawIdle() {
    draw();
  }
  function drawCloud(x, y, w, isDark) {
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.5)";
    const h = 14;
    ctx.fillRect(x + 8, y, w - 16, h);
    ctx.fillRect(x + 4, y + 4, w - 8, h - 4);
    ctx.fillRect(x, y + 8, w, h - 8);
  }
  function drawPixelArt(sprite, x, y, colors, tileSize) {
    const ts = tileSize || TILE;
    sprite.forEach((row, ry) => {
      [...row].forEach((px, rx) => {
        if (px === "X") {
          ctx.fillStyle = colors[(ry + rx) % colors.length];
          ctx.fillRect(
            Math.floor(x + rx * ts),
            Math.floor(y + ry * ts),
            ts,
            ts,
          );
        } else if (px === "O") {
          ctx.fillStyle = COLOR_PLAYER_O;
          ctx.fillRect(
            Math.floor(x + rx * ts),
            Math.floor(y + ry * ts),
            ts,
            ts,
          );
        }
      });
    });
  }
  function drawPlayer() {
    if (player.invincible > 0 && Math.floor(player.invincible / 6) % 2 === 0)
      return;
    const sprite = isJumping
      ? PLAYER_JUMP_SPRITE
      : PLAYER_SPRITES[player.frame];
    const colors = player.dead
      ? ["#6b7280", "#4b5563", "#374151"]
      : COLOR_PLAYER;
    if (!player.dead) {
      ctx.fillStyle = "rgba(124,58,237,0.3)";
      ctx.beginPath();
      ctx.ellipse(
        player.x + player.w / 2,
        groundY + 3,
        player.w * 0.4,
        3,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    drawPixelArt(sprite, player.x, player.y, colors);
  }
  function drawObstacle(o) {
    const colors =
      o.type === "cactus"
        ? COLOR_OBS_CACTUS
        : o.type === "rock"
          ? COLOR_OBS_ROCK
          : COLOR_OBS_BIRD;
    if (o.type === "bird")
      drawPixelArt(
        OBS_SPRITES.bird,
        o.x,
        o.y + Math.sin(o.animT * 0.2) * 3,
        colors,
        TILE,
      );
    else drawPixelArt(OBS_SPRITES[o.type], o.x, o.y, colors, TILE);
  }
  function drawCoin(x, y, r) {
    const sz = r * 2;
    ctx.fillStyle = COLOR_COIN[0];
    ctx.fillRect(x - r + 2, y - r, sz - 4, sz);
    ctx.fillRect(x - r, y - r + 2, sz, sz - 4);
    ctx.fillStyle = COLOR_COIN[2];
    ctx.fillRect(x - r + 4, y - r + 2, sz - 8, sz - 4);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x - r + 2, y - r + 2, 2, 2);
  }
  function spawnJumpParticles() {
    for (let i = 0; i < 6; i++)
      particles.push({
        x: player.x + player.w / 2,
        y: player.y + player.h,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2 + 1,
        size: 4 + Math.random() * 3,
        color: ["#a78bff", "#67e8f9", "#c084fc"][i % 3],
        life: 20,
        maxLife: 20,
      });
  }
  function spawnHitParticles() {
    for (let i = 0; i < 12; i++) {
      const a = ((Math.PI * 2) / 12) * i;
      particles.push({
        x: player.x + player.w / 2,
        y: player.y + player.h / 2,
        vx: Math.cos(a) * (3 + Math.random() * 2),
        vy: Math.sin(a) * (3 + Math.random() * 2),
        size: 5 + Math.random() * 3,
        color: ["#ff6b8a", "#f472b6", "#fbbf24"][i % 3],
        life: 25,
        maxLife: 25,
      });
    }
  }
  function spawnCoinParticles(x, y) {
    for (let i = 0; i < 8; i++)
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: -Math.random() * 4 - 1,
        size: 4,
        color: COLOR_COIN[i % 3],
        life: 18,
        maxLife: 18,
      });
  }
  function updateScoreDisplay() {
    const sc = document.getElementById("gameScore");
    const bs = document.getElementById("gameBest");
    const lv = document.getElementById("gameLives");
    if (sc) sc.textContent = score;
    if (bs) bs.textContent = bestScore;
    if (lv)
      lv.textContent =
        "❤️".repeat(Math.max(0, lives)) + "🖤".repeat(Math.max(0, 3 - lives));
  }

  window.openGame = function () {
    const modal = document.getElementById("gameModal");
    if (!modal) return;
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("active"), 10);
    if (!canvas) setTimeout(initGame, 50);
    else if (gameState === "idle") drawIdle();
    document.getElementById("gameBest").textContent = bestScore;
  };
  window.closeGame = function () {
    if (animId) cancelAnimationFrame(animId);
    gameState = "idle";
    const modal = document.getElementById("gameModal");
    if (!modal) return;
    modal.classList.remove("active");
    setTimeout(() => {
      modal.style.display = "none";
    }, 400);
    document.removeEventListener("keydown", handleKey);
  };

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initGame, 200);
  });
})();
