/* ═══════════════════════════════════════════
   NGAWI AI — APP.JS
   Firebase Auth + Chat + Spotify Music + Crop
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

const app = initializeApp({
  apiKey: "AIzaSyAalw-VTn9T3x6UIIdCtPfoVtaG7jlllzw",
  authDomain: "ngawi-ai-666.firebaseapp.com",
  projectId: "ngawi-ai-666",
  storageBucket: "ngawi-ai-666.firebasestorage.app",
  messagingSenderId: "709879888470",
  appId: "1:709879888470:web:433ccc9c7146facc1759f7",
});
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/* ── Chat history ── */
let history = [
  {
    role: "system",
    content:
      "Kamu adalah orang bekasi yang selalu pakai bahasa bekasi bukan betawi. Sifatmu adalah teman yang asik dan usil, Gunakan bahasa sehari-hari manusia dan gaul, jangan baku. Panggil user dengan sebutan 'rek'. di awal kalimat gunakan kata 'welahdalah' jika diperlukan jangan terlalu sering. Gunakan kata-kata seperti 'jir', bangsat, anjir, bangke, 'kocak', 'lawak' jika perlu. pakai emote 😹 jika sedang meledek user. jika pengguna kesal kamu akan menulis 'marah loh ya😹'. Kamu tidak harus selalu menurut, jadilah kritis agar hasil kerjamu benar. Jangan pakai kata 'aku/kamu' karena itu norak. Ubah kata biarin aja menjadi bagen. harus memberi solusi setiap ada masalah. mengingatkan untuk sholat 5 waktu saat sudah waktunya adzan sudah waktunya. SANGAT PENTING: WAJIB jawab minimal 3-4 kalimat penuh yang bermakna dan berguna. DILARANG KERAS TOTAL menjawab hanya 1 kata, 1 huruf, 2 kata, atau kalimat terpotong. Setiap jawaban HARUS lengkap, jelas, informatif, dan tidak terpotong di tengah kalimat. Jika ditanya sesuatu, beri penjelasan yang cukup dan tuntas. Pastikan setiap respons selesai dengan kalimat yang lengkap — jangan berhenti di tengah-tengah. Jika kamu tidak tahu sesuatu, katakan dengan jujur tapi tetap berikan alternatif atau saran yang berguna minimal 2-3 kalimat.",
  },
];

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
  initCropCanvas();
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
    if (wt && u)
      wt.textContent = `Halo ${(u.displayName || u.email.split("@")[0]).split(" ")[0]},`;
  }, 50);
};

function buildWelcomeHTML() {
  return `
    <div id="welcome">
      <div class="welcome-orb-wrap">
        <div class="welcome-icon">
          <img src="nyan.gif" class="welcome-gif" alt="Rainbow Cat" />
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
    p.style.cssText = `left:${cx - 4}px;top:${cy - 4}px;background:${colors[i % colors.length]};--dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist}px;--rot:${Math.random() * 360}deg;animation-duration:${0.6 + Math.random() * 0.4}s;`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }
}

/* ─────────────────────────────────────────
   AI CHAT — FIXED STREAMING + TRUNCATION BUG
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

  try {
    history.push({ role: "user", content: prompt });

    // Truncate history to prevent context overflow (keep system + last 30 messages)
    const messagesToSend =
      history.length > 32 ? [history[0], ...history.slice(-30)] : history;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: messagesToSend,
        stream: true,
        max_tokens: 4096,
        temperature: 0.85,
        min_tokens: 40,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let full = "",
      started = false,
      buffer = "";

    const processLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) return;
      const data = trimmed.slice(6).trim();
      if (data === "[DONE]" || !data) return;
      try {
        const parsed = JSON.parse(data);
        const content = parsed?.choices?.[0]?.delta?.content;
        if (content && typeof content === "string" && content.length > 0) {
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
      } catch (_) {
        /* skip malformed chunks */
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        const flushed = decoder.decode(new Uint8Array(0), { stream: false });
        if (flushed) buffer += flushed;
        if (buffer.trim()) {
          buffer.split("\n").forEach(processLine);
          buffer = "";
        }
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      lines.forEach(processLine);
    }

    // Flush remaining buffer
    if (buffer.trim()) {
      buffer.split("\n").forEach(processLine);
    }

    // Fallback: response terlalu pendek/terpotong
    if (!full || full.trim().length < 15) {
      full =
        "Waduh maaf Rek, kayaknya jawaban gue ke-cut atau koneksi lagi gangguan nih. Coba kirim lagi pertanyaan lu ya, gue bakal jawab yang lengkap dan bener. Pastiin koneksi lu stabil juga biar streaming-nya lancar! 😹";
      const tm = document.getElementById("typing-msg-" + lId);
      if (tm) {
        if (!started)
          tm.innerHTML = `<div class="ai-avatar">N</div><div class="bubble" id="${lId}"></div>`;
        const bubble = document.getElementById(lId);
        if (bubble) bubble.innerHTML = full;
      }
    }

    document.getElementById(lId)?.querySelector(".typing-cursor")?.remove();
    history.push({ role: "assistant", content: full });
  } catch (e) {
    console.error("Chat error:", e);
    const tm = document.getElementById("typing-msg-" + lId);
    if (tm)
      tm.innerHTML = `<div class="ai-avatar">N</div><div class="bubble">Koneksi error Rek! Coba lagi ya, mungkin koneksi lu lagi lemot atau server lagi sibuk. 😹</div>`;
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
───────────────────────────────────────── */
window.checkPwStrength = (val) => {
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
    window.showAlert(msgs[err.code] || "Gagal! Cek lagi data lu coba");
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
  if (!pw || !eye) return;
  const isHidden = pw.type === "password";
  pw.type = isHidden ? "text" : "password";
  eye.textContent = isHidden ? "visibility" : "visibility_off";
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
   SIDEBAR STATE
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
      trigger.innerHTML = `<img src="${photo}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);cursor:pointer;box-shadow:0 0 12px var(--glow);transition:transform .2s" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" onclick="window.toggleSidebar()" />`;
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
      trigger.innerHTML = `<button class="icon-btn" onclick="window.toggleSidebar()"><span class="material-symbols-rounded" style="font-size:26px">account_circle</span></button>`;
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
  e.target.value = "";
  openCropModal(file);
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
      try {
        document.getElementById("photoStatus").textContent =
          "⏳ Uploading foto ke ImgBB...";
        const formData = new FormData();
        formData.append("image", selectedPhotoFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          finalPhoto = data.data.url;
          selectedPhotoFile = null;
        } else throw new Error(data.error?.message || "Upload gagal");
      } catch (uploadErr) {
        console.error("ImgBB upload error:", uploadErr);
        document.getElementById("photoStatus").textContent =
          "⚠️ Upload foto gagal, hanya nama yang diupdate";
      }
    } else if (manualUrl && manualUrl.startsWith("http")) {
      finalPhoto = manualUrl;
    }
    await updateProfile(user, { displayName: newName, photoURL: finalPhoto });
    await user.reload();
    const freshUser = auth.currentUser;
    const photo =
      freshUser.photoURL ||
      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    const wt = document.getElementById("welcomeText");
    if (wt) wt.textContent = `Halo ${newName.split(" ")[0]},`;
    const sideName = document.getElementById("sideName");
    const sideAvatar = document.getElementById("sideAvatar");
    const trigger = document.getElementById("profileTrigger");
    if (sideName) sideName.textContent = newName;
    if (sideAvatar) sideAvatar.src = photo;
    if (trigger)
      trigger.innerHTML = `<img src="${photo}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);cursor:pointer;box-shadow:0 0 12px var(--glow);transition:transform .2s" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" onclick="window.toggleSidebar()" />`;
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

/* ─────────────────────────────────────────
   PHOTO CROP
───────────────────────────────────────── */
let cropImg = null,
  cropOffsetX = 0,
  cropOffsetY = 0,
  cropScale = 1;
let cropIsDragging = false,
  cropLastX = 0,
  cropLastY = 0;
const CROP_SIZE = 260;

function initCropCanvas() {
  const canvas = document.getElementById("cropCanvas");
  if (!canvas) return;
  canvas.addEventListener("mousedown", (e) => {
    cropIsDragging = true;
    cropLastX = e.clientX;
    cropLastY = e.clientY;
    e.preventDefault();
  });
  canvas.addEventListener(
    "touchstart",
    (e) => {
      cropIsDragging = true;
      cropLastX = e.touches[0].clientX;
      cropLastY = e.touches[0].clientY;
    },
    { passive: true },
  );
  document.addEventListener("mousemove", (e) => {
    if (!cropIsDragging) return;
    cropOffsetX += e.clientX - cropLastX;
    cropOffsetY += e.clientY - cropLastY;
    cropLastX = e.clientX;
    cropLastY = e.clientY;
    renderCropCanvas();
  });
  document.addEventListener(
    "touchmove",
    (e) => {
      if (!cropIsDragging) return;
      cropOffsetX += e.touches[0].clientX - cropLastX;
      cropOffsetY += e.touches[0].clientY - cropLastY;
      cropLastX = e.touches[0].clientX;
      cropLastY = e.touches[0].clientY;
      renderCropCanvas();
    },
    { passive: true },
  );
  document.addEventListener("mouseup", () => {
    cropIsDragging = false;
  });
  document.addEventListener("touchend", () => {
    cropIsDragging = false;
  });
  document.getElementById("cropZoom")?.addEventListener("input", (e) => {
    cropScale = parseFloat(e.target.value);
    renderCropCanvas();
  });
}

function renderCropCanvas() {
  const canvas = document.getElementById("cropCanvas");
  if (!canvas || !cropImg) return;
  canvas.width = CROP_SIZE;
  canvas.height = CROP_SIZE;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);
  const scaledW = cropImg.naturalWidth * cropScale;
  const scaledH = cropImg.naturalHeight * cropScale;
  const x = (CROP_SIZE - scaledW) / 2 + cropOffsetX;
  const y = (CROP_SIZE - scaledH) / 2 + cropOffsetY;
  ctx.save();
  ctx.beginPath();
  ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(cropImg, x, y, scaledW, scaledH);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2 - 1, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(167, 139, 255, 0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function openCropModal(file) {
  const url = URL.createObjectURL(file);
  cropImg = new Image();
  cropImg.onload = () => {
    cropOffsetX = 0;
    cropOffsetY = 0;
    const baseScale = Math.max(
      CROP_SIZE / cropImg.naturalWidth,
      CROP_SIZE / cropImg.naturalHeight,
    );
    cropScale = baseScale;
    const zoomEl = document.getElementById("cropZoom");
    if (zoomEl) {
      zoomEl.min = (baseScale * 0.5).toFixed(4);
      zoomEl.max = (baseScale * 4).toFixed(4);
      zoomEl.step = (baseScale * 0.01).toFixed(4);
      zoomEl.value = baseScale;
    }
    const m = document.getElementById("cropModal");
    m.style.display = "flex";
    setTimeout(() => {
      m.classList.add("active");
      renderCropCanvas();
    }, 10);
  };
  cropImg.onerror = () => window.showAlert("Gagal load gambar Rek 😹");
  cropImg.src = url;
}

window.closeCropModal = function () {
  const m = document.getElementById("cropModal");
  m.classList.remove("active");
  setTimeout(() => (m.style.display = "none"), 400);
};

window.applyCrop = function () {
  const canvas = document.getElementById("cropCanvas");
  if (!canvas) return;
  const OUTPUT_SIZE = 400;
  const offscreen = document.createElement("canvas");
  offscreen.width = OUTPUT_SIZE;
  offscreen.height = OUTPUT_SIZE;
  const ctx = offscreen.getContext("2d");
  const ratio = OUTPUT_SIZE / CROP_SIZE;
  const scaledW = cropImg.naturalWidth * cropScale * ratio;
  const scaledH = cropImg.naturalHeight * cropScale * ratio;
  const x = (OUTPUT_SIZE - scaledW) / 2 + cropOffsetX * ratio;
  const y = (OUTPUT_SIZE - scaledH) / 2 + cropOffsetY * ratio;
  ctx.save();
  ctx.beginPath();
  ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(cropImg, x, y, scaledW, scaledH);
  ctx.restore();
  offscreen.toBlob(
    (blob) => {
      if (!blob) {
        window.showAlert("Gagal crop foto Rek 😹");
        return;
      }
      selectedPhotoFile = new File([blob], "profile-crop.jpg", {
        type: "image/jpeg",
      });
      const previewUrl = URL.createObjectURL(blob);
      document.getElementById("editPhotoPreview").src = previewUrl;
      document.getElementById("editPhotoUrl").value = "";
      document.getElementById("photoStatus").textContent =
        "✅ Foto berhasil dipotong!";
      window.closeCropModal();
    },
    "image/jpeg",
    0.92,
  );
};

/* ═══════════════════════════════════════════
   MUSIC PLAYER
═══════════════════════════════════════════ */
(function () {
  "use strict";

  const DB_NAME = "NgawiMusicDB",
    DB_VERSION = 1,
    STORE_NAME = "tracks";
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
  let currentMobileTab = null;
  let lastTabTouchAt = 0;

  const audio = new Audio();
  audio.volume = parseFloat(localStorage.getItem("ngawi-vol") || "0.8");
  let isProgressDragging = false;
  let dragSeekRatio = 0;

  /* ── Synced lyrics state ── */
  let syncedLines = [];
  let lastActiveLine = -1;
  let currentAlbumCoverUrl = null;

  /* ── Favorites ── */
  const FAVS_KEY = "ngawi-favs";
  let favSet = new Set();
  function loadFavs() {
    try {
      const raw = localStorage.getItem(FAVS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      favSet = new Set(Array.isArray(arr) ? arr : []);
    } catch (_) {
      favSet = new Set();
    }
  }
  function saveFavs() {
    try {
      localStorage.setItem(FAVS_KEY, JSON.stringify(Array.from(favSet)));
    } catch (_) {}
  }
  function isFavTrack(track) {
    if (!track) return false;
    return favSet.has(track.id) || favSet.has(`name:${track.name}`);
  }
  function setFavTrack(track, on) {
    if (!track) return;
    const idKey = track.id;
    const nameKey = `name:${track.name}`;
    if (on) {
      if (idKey) favSet.add(idKey);
      favSet.add(nameKey);
    } else {
      if (idKey) favSet.delete(idKey);
      favSet.delete(nameKey);
    }
    saveFavs();
  }
  function syncLikeBtn() {
    const btn = document.getElementById("likeBtn");
    if (!btn) return;
    const icon = btn.querySelector("span");
    const track = currentTrack >= 0 ? playlist[currentTrack] : null;
    const liked = isFavTrack(track);
    btn.classList.toggle("liked", liked);
    btn.style.color = liked ? "#ff3b6a" : "";
    if (icon) icon.textContent = liked ? "favorite" : "favorite_border";
  }
  function renderFavsList() {
    const container = document.getElementById("favsContainer");
    if (!container) return;
    const favTracks = playlist.filter((t) => isFavTrack(t));
    if (favTracks.length === 0) {
      container.innerHTML = `<div class="playlist-empty"><span class="playlist-empty-icon">💜</span>Belum ada lagu favorit nih Rek!<br>Pencet tombol <strong>❤️</strong> di lagu yang disuka dulu</div>`;
      return;
    }
    const isPlaying = !audio.paused;
    container.innerHTML = favTracks
      .map((t) => {
        const idx = playlist.indexOf(t);
        const isActive = idx === currentTrack;
        return `
        <div class="playlist-item ${isActive ? "active" : ""}" onclick="window.loadTrack(${idx})">
          <div class="playlist-item-num">${isActive && isPlaying ? "▶" : idx + 1}</div>
          <div class="playlist-item-info">
            <div class="playlist-item-name">${escHtml(t.name)}</div>
            <div class="playlist-item-dur">${t.duration}</div>
          </div>
          <button class="playlist-item-love is-liked" onclick="event.stopPropagation();window.toggleFavFromList(${idx})" title="Hapus dari Favorit">
            <span class="material-symbols-rounded">favorite</span>
          </button>
        </div>`;
      })
      .join("");
  }

  /* ── Parse LRC format ── */
  function parseLRC(lrcText) {
    const lines = [];
    const regex = /\[(\d+):(\d+(?:\.\d+)?)\](.*)/;
    lrcText.split("\n").forEach((line) => {
      const match = line.match(regex);
      if (match) {
        const time = parseInt(match[1], 10) * 60 + parseFloat(match[2]);
        const text = match[3].trim();
        if (text) lines.push({ time, text });
      }
    });
    return lines.sort((a, b) => a.time - b.time);
  }

  /* ── Album cover via iTunes Search API ── */
  async function fetchAlbumCover(trackName) {
    try {
      let query = trackName;
      if (trackName.includes(" - ")) {
        const parts = trackName.split(" - ");
        query = parts[0].trim() + " " + parts.slice(1).join(" - ").trim();
      }
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=5`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const art = data.results[0].artworkUrl100;
        if (art) return art.replace("100x100bb", "600x600bb");
      }
    } catch (_) {}
    return null;
  }

  /* ── Set album art cover ── */
  function setAlbumCover(coverUrl) {
    const albumEl = document.getElementById("albumArt");
    currentAlbumCoverUrl = coverUrl || null;
    if (!albumEl) return;
    if (!albumEl.querySelector(".album-art-emoji")) {
      const textNodes = Array.from(albumEl.childNodes).filter(
        (n) => n.nodeType === 3 && n.textContent.trim(),
      );
      if (textNodes.length > 0) {
        const emojiText = textNodes[0].textContent.trim();
        textNodes[0].remove();
        const span = document.createElement("span");
        span.className = "album-art-emoji";
        span.textContent = emojiText;
        albumEl.appendChild(span);
      }
    }
    const oldImg = albumEl.querySelector(".album-art-img");
    if (oldImg) oldImg.remove();
    const emojiEl = albumEl.querySelector(".album-art-emoji");
    if (!coverUrl) {
      if (emojiEl) emojiEl.style.opacity = "1";
      _updateSideMiniInfo();
      return;
    }
    const img = document.createElement("img");
    img.className = "album-art-img";
    img.alt = "Album Cover";
    img.onload = () => {
      img.classList.add("loaded");
      if (emojiEl) emojiEl.style.opacity = "0";
    };
    img.onerror = () => {
      img.remove();
      if (emojiEl) emojiEl.style.opacity = "1";
      currentAlbumCoverUrl = null;
      _updateSideMiniInfo();
    };
    img.src = coverUrl;
    albumEl.insertBefore(img, albumEl.firstChild);
    _updateSideMiniInfo();
  }

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
        scheduleRenderPlaylist();
      });
    });
    const lastTrack = parseInt(localStorage.getItem("ngawi-track") || "-1");
    scheduleRenderPlaylist();
    if (lastTrack >= 0 && lastTrack < playlist.length)
      loadTrack(lastTrack, false);
  }

  /* ── Visualizer ── */
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
    let beatLevel = 0;
    if (analyser && !audio.paused) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      beatLevel = data.reduce((s, v) => s + v, 0) / (data.length * 255);
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
    updateBeatPulse(beatLevel);
  }
  drawVisualizer();

  function updateBeatPulse(level) {
    const album = document.getElementById("albumArt");
    if (!album) return;
    const n = Math.max(0, Math.min(1, level || 0));
    const scale = (1 + n * 0.035).toFixed(4);
    const glow = (16 + n * 26).toFixed(1);
    album.style.setProperty("--beat-scale", scale);
    album.style.setProperty("--beat-glow", `${glow}px`);
  }

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
    const likeBtn = document.getElementById("likeBtn");
    if (likeBtn) {
      likeBtn.style.color = "";
    }
    window._currentTrackName = playlist[idx].name;
    window._lyricsLoaded = false;
    window._lyricsLoadedFor = null;
    syncedLines = [];
    lastActiveLine = -1;
    setAlbumCover(null);
    fetchAlbumCover(playlist[idx].name).then((coverUrl) => {
      if (coverUrl && currentTrack === idx) setAlbumCover(coverUrl);
    });
    _updateSideMiniInfo();
    syncLikeBtn();
    renderFavsList();
    if (autoplay) {
      audio.load();
      audio
        .play()
        .then(() => {
          initAudioCtx();
          if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
          updatePlayerUI(true);
          window.fetchLyrics(playlist[idx].name);
        })
        .catch(console.error);
    } else {
      updatePlayerUI(false);
      window.fetchLyrics(playlist[idx].name);
    }
  };

  function _updateSideMiniInfo() {
    const track = currentTrack >= 0 ? playlist[currentTrack] : null;
    const titleEl = document.getElementById("mpMobileNowbarTitle");
    const artistEl = document.getElementById("mpMobileNowbarArtist");
    const thumbEl = document.getElementById("mpMobileNowbarThumb");
    const pauseBtn = document.getElementById("mpMobilePauseBtn");
    const pauseIcon = pauseBtn?.querySelector("span");
    if (titleEl) titleEl.textContent = track ? track.name : "—";
    if (artistEl) {
      if (track && track.name.includes(" - "))
        artistEl.textContent = track.name.split(" - ")[0].trim();
      else artistEl.textContent = track ? "Local Music" : "—";
    }
    if (thumbEl) {
      if (track && currentAlbumCoverUrl) {
        thumbEl.textContent = "";
        thumbEl.style.backgroundImage = `url("${currentAlbumCoverUrl}")`;
        thumbEl.style.backgroundSize = "cover";
        thumbEl.style.backgroundPosition = "center";
      } else {
        thumbEl.textContent = track ? "♪" : "🎵";
        thumbEl.style.backgroundImage = "";
        thumbEl.style.backgroundSize = "";
        thumbEl.style.backgroundPosition = "";
      }
    }
    if (pauseIcon)
      pauseIcon.textContent = audio.paused ? "play_arrow" : "pause";
  }

  window.togglePlay = function () {
    if (!playlist.length) {
      window.showAlert("Tambahin lagu dulu Rek! 🎵");
      return;
    }
    if (audio.paused) {
      audio
        .play()
        .then(() => {
          initAudioCtx();
          if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
          updatePlayerUI(true);
        })
        .catch(() => {
          window.showAlert("Tekan lagi tombol play ya Rek 🙌");
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
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    window.loadTrack((currentTrack - 1 + playlist.length) % playlist.length);
  };
  window.shuffleTrack = function () {
    isShuffle = !isShuffle;
    const btn = document.getElementById("shuffleBtn");
    if (btn) btn.classList.toggle("active-mode", isShuffle);
    window.showAlert(isShuffle ? "Shuffle ON 🔀" : "Shuffle OFF", "success");
  };
  window.toggleRepeat = function () {
    isRepeat = !isRepeat;
    audio.loop = isRepeat;
    const btn = document.getElementById("repeatBtn");
    if (btn) btn.classList.toggle("active-mode", isRepeat);
    window.showAlert(isRepeat ? "Repeat ON 🔁" : "Repeat OFF", "success");
  };
  function getSeekRatioFromEvent(e, el) {
    const rect = el.getBoundingClientRect();
    const point =
      e.touches?.[0] || e.changedTouches?.[0] || (e.clientX ? e : null);
    if (!point || !rect.width) return 0;
    return Math.max(0, Math.min(1, (point.clientX - rect.left) / rect.width));
  }
  function _setSeekSliderVisual(ratio) {
    const slider = document.getElementById("seekSlider");
    if (!slider) return;
    const pct = Math.max(0, Math.min(100, ratio * 100));
    // white filled track like YouTube Music
    slider.style.background = `linear-gradient(to right, #ffffff 0%, #ffffff ${pct}%, rgba(255,255,255,0.16) ${pct}%, rgba(255,255,255,0.16) 100%)`;
  }
  function renderProgressPreviewByRatio(ratio) {
    const slider = document.getElementById("seekSlider");
    const ct = document.getElementById("currentTime");
    if (slider) slider.value = String(Math.round(ratio * 1000));
    _setSeekSliderVisual(ratio);
    if (ct && isFinite(audio.duration))
      ct.textContent = formatTime(ratio * audio.duration);
  }
  function commitSeekByRatio(ratio) {
    if (isFinite(audio.duration)) audio.currentTime = ratio * audio.duration;
  }
  window.seekAudio = function (e) {
    // legacy hook (old div-based progress); no-op now
    return;
  };
  window.setVolume = function (val) {
    audio.volume = parseFloat(val);
    localStorage.setItem("ngawi-vol", val);
    const icon = document.getElementById("volIcon");
    if (icon)
      icon.textContent =
        val == 0 ? "volume_off" : val < 0.4 ? "volume_down" : "volume_up";
  };
  window.toggleLike = function () {
    const btn = document.getElementById("likeBtn");
    if (!btn || !playlist[currentTrack]) return;
    const track = playlist[currentTrack];
    const isLiked = isFavTrack(track);
    setFavTrack(track, !isLiked);
    syncLikeBtn();
    // Refresh playlist + favorites list
    _lastRenderedPlaylistLength = -1;
    _lastRenderedCurrentTrack = -1;
    scheduleRenderPlaylist();
    renderFavsList();
    window.showAlert(isLiked ? "Dihapus dari favorit" : "Ditambah ke favorit 💜", "success");
  };

  window.toggleFavFromList = function (idx) {
    const track = playlist[idx];
    if (!track) return;
    const isLiked = isFavTrack(track);
    setFavTrack(track, !isLiked);
    if (idx === currentTrack) syncLikeBtn();
    _lastRenderedPlaylistLength = -1;
    _lastRenderedCurrentTrack = -1;
    scheduleRenderPlaylist();
    renderFavsList();
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
        scheduleRenderPlaylist();
      });
      file.arrayBuffer().then((buf) => saveTrackToDB(id, name, buf, file.type));
      added++;
    });
    if (added > 0) {
      window.showAlert(`${added} lagu ditambahkan rek! 🎵`, "success");
      scheduleRenderPlaylist();
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
    scheduleRenderPlaylist();
  };

  /* ── Debounced render — prevents desktop flickering ── */
  let _renderTimer = null;
  let _lastRenderedPlaylistLength = -1;
  let _lastRenderedCurrentTrack = -1;

  function scheduleRenderPlaylist() {
    clearTimeout(_renderTimer);
    _renderTimer = setTimeout(_doRenderPlaylist, 60);
  }

  function _doRenderPlaylist() {
    // Guard: skip if nothing changed
    if (
      _lastRenderedPlaylistLength === playlist.length &&
      _lastRenderedCurrentTrack === currentTrack
    )
      return;
    _lastRenderedPlaylistLength = playlist.length;
    _lastRenderedCurrentTrack = currentTrack;

    const container = document.getElementById("playlistContainer");
    const countEl = document.getElementById("trackCount");
    if (!container) return;
    if (countEl)
      countEl.textContent =
        playlist.length > 0 ? `${currentTrack + 1}/${playlist.length}` : "0/0";
    if (playlist.length === 0) {
      container.innerHTML = `<div class="playlist-empty"><span class="playlist-empty-icon">🎧</span>Belum ada musik nih Rek!<br>Ketuk tombol <strong>+</strong> di atas untuk tambah lagu</div>`;
      return;
    }
    const isPlaying = !audio.paused;
    container.innerHTML = playlist
      .map(
        (t, i) => `
      <div class="playlist-item ${i === currentTrack ? "active" : ""}" onclick="window.loadTrack(${i})">
        <div class="playlist-item-num">${i === currentTrack && isPlaying ? "▶" : i + 1}</div>
        <div class="playlist-item-info">
          <div class="playlist-item-name">${escHtml(t.name)}</div>
          <div class="playlist-item-dur">${t.duration}</div>
        </div>
        <button class="playlist-item-love ${isFavTrack(t) ? "is-liked" : ""}" onclick="event.stopPropagation();window.toggleFavFromList(${i})" title="${isFavTrack(t) ? "Hapus dari Favorit" : "Tambah ke Favorit"}">
          <span class="material-symbols-rounded">${isFavTrack(t) ? "favorite" : "favorite_border"}</span>
        </button>
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
    let artistDisplay = "— · —";
    if (track) {
      if (track.name.includes(" - ")) {
        const parts = track.name.split(" - ");
        artistDisplay = parts[0].trim();
      } else artistDisplay = "Local Music";
    }
    if (artEl) artEl.textContent = artistDisplay;
    if (ppBtn)
      ppBtn.querySelector("span").textContent = playing
        ? "pause"
        : "play_arrow";
    if (albumEl) albumEl.classList.toggle("playing", !!playing);
    if (track && playing && mini && miniName) {
      mini.classList.add("visible");
      mini.classList.add("playing");
      miniName.textContent = track.name;
    } else if (!playing && mini) {
      mini.classList.remove("visible");
      mini.classList.remove("playing");
    }
    const countEl = document.getElementById("trackCount");
    if (countEl)
      countEl.textContent =
        playlist.length > 0 ? `${currentTrack + 1}/${playlist.length}` : "0/0";
    // Force re-render by resetting guard
    _lastRenderedPlaylistLength = -1;
    _lastRenderedCurrentTrack = -1;
    scheduleRenderPlaylist();
    _updateSideMiniInfo();
    syncLikeBtn();
    renderFavsList();

    const sideCol = document.getElementById("mpSideCol");
    if (sideCol) sideCol.classList.toggle("has-track", !!track);
  }

  /* ── Spotify-style lyrics sync on timeupdate ── */
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration || !isFinite(audio.duration)) return;
    const ratio = audio.currentTime / audio.duration;
    const ct = document.getElementById("currentTime");
    const tt = document.getElementById("totalTime");
    if (!isProgressDragging) {
      const slider = document.getElementById("seekSlider");
      if (slider) slider.value = String(Math.round(ratio * 1000));
      _setSeekSliderVisual(ratio);
      if (ct) ct.textContent = formatTime(audio.currentTime);
    }
    if (tt) tt.textContent = formatTime(audio.duration);
    if (syncedLines.length > 0) {
      const currentTime = audio.currentTime;
      let activeIdx = -1;
      for (let i = syncedLines.length - 1; i >= 0; i--) {
        if (currentTime >= syncedLines[i].time) {
          activeIdx = i;
          break;
        }
      }
      if (activeIdx !== lastActiveLine) {
        lastActiveLine = activeIdx;
        updateLyricsHighlight(activeIdx);
      }
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    const tt = document.getElementById("totalTime");
    const ct = document.getElementById("currentTime");
    const slider = document.getElementById("seekSlider");
    if (slider) slider.value = "0";
    _setSeekSliderVisual(0);
    if (ct) ct.textContent = "0:00";
    if (tt && isFinite(audio.duration)) tt.textContent = formatTime(audio.duration);
  });

  function updateLyricsHighlight(activeIdx) {
    const lyricsContent = document.querySelector(
      "#lyricsContainer .lyrics-content",
    );
    if (!lyricsContent) return;
    const lines = lyricsContent.querySelectorAll(".lyrics-line");
    lines.forEach((line, i) => {
      line.classList.remove("lyrics-active", "lyrics-past", "lyrics-future");
      if (i < activeIdx) line.classList.add("lyrics-past");
      else if (i === activeIdx) line.classList.add("lyrics-active");
      else line.classList.add("lyrics-future");
    });
    const sideCol = document.getElementById("mpSideCol");
    const isLyricsTabActive = sideCol?.dataset.activeTab === "lyrics";
    if (!isLyricsTabActive) return;
    // Mobile: jangan auto-scroll kalau tab panel belum kebuka (biar gak "nyeret" UI)
    const isDesktop = window.innerWidth >= 1025;
    if (!isDesktop && sideCol && !sideCol.classList.contains("mobile-open"))
      return;
    if (activeIdx >= 0 && activeIdx < lines.length) {
      const activeLine = lines[activeIdx];
      const container = document.getElementById("lyricsContainer");
      if (container && activeLine) {
        // Extra safety: kalau element lyrics content lagi "disembunyiin" via pointer-events (desktop slide),
        // skip scroll biar gak bikin layout aneh di tab lain.
        const pe = window.getComputedStyle(container).pointerEvents;
        if (pe === "none") return;
        activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  function bindLyricsSeekInteractions(isSynced) {
    const lyricsContainer = document.getElementById("lyricsContainer");
    if (!lyricsContainer) return;
    lyricsContainer.querySelectorAll(".lyrics-line").forEach((lineEl) => {
      lineEl.style.cursor = isSynced ? "pointer" : "default";
      lineEl.onclick = null;
      if (!isSynced) return;
      lineEl.onclick = () => {
        const idx = Number(lineEl.dataset.idx);
        if (!Number.isFinite(idx)) return;
        const target = syncedLines[idx]?.time;
        if (!Number.isFinite(target)) return;
        audio.currentTime = Math.max(0, target);
        lastActiveLine = -1;
        updateLyricsHighlight(idx);
      };
    });
  }

  function initProgressSeekInteractions() {
    const slider = document.getElementById("seekSlider");
    if (!slider) return;
    const ratioFromSlider = () => {
      const v = Number(slider.value);
      if (!Number.isFinite(v)) return 0;
      return Math.max(0, Math.min(1, v / 1000));
    };

    slider.addEventListener("pointerdown", () => {
      if (!isFinite(audio.duration)) return;
      isProgressDragging = true;
    });
    slider.addEventListener("pointerup", () => {
      if (!isFinite(audio.duration)) return;
      const r = ratioFromSlider();
      isProgressDragging = false;
      renderProgressPreviewByRatio(r);
      commitSeekByRatio(r);
    });
    slider.addEventListener("input", () => {
      if (!isFinite(audio.duration)) return;
      const r = ratioFromSlider();
      renderProgressPreviewByRatio(r);
    });
    slider.addEventListener("change", () => {
      if (!isFinite(audio.duration)) return;
      const r = ratioFromSlider();
      isProgressDragging = false;
      renderProgressPreviewByRatio(r);
      commitSeekByRatio(r);
    });
  }

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

  /* ── Toggle music panel ── */
  window.toggleMusicPanel = function () {
    const panel = document.getElementById("musicPanel");
    const btn = document.getElementById("musicToggleBtn");
    if (!panel) return;
    const isOpen = panel.classList.contains("open");
    panel.classList.toggle("open");
    btn?.classList.toggle("music-active", !isOpen);
    if (!isOpen) {
      setTimeout(resizeCanvas, 120);
    }
    // Close mobile tab when closing panel
    if (isOpen) {
      window.closeMobileTab();
    }
  };

  // Click on mini header song name -> open music panel
  window.openMusicFromMini = function () {
    const panel = document.getElementById("musicPanel");
    if (!panel) return;
    if (!panel.classList.contains("open")) window.toggleMusicPanel();
  };

  /* ── Show/hide mobile backdrop ── */
  function _showBackdrop() {
    const bd = document.getElementById("mpSideBackdrop");
    if (bd) bd.classList.add("active");
  }
  function _hideBackdrop() {
    const bd = document.getElementById("mpSideBackdrop");
    if (bd) bd.classList.remove("active");
  }

  /* ── Close mobile tab overlay ── */
  window.closeMobileTab = function (evtOrForce) {
    const sideCol = document.getElementById("mpSideCol");
    const forceClose = evtOrForce === true;
    if (evtOrForce && !forceClose) return;
    if (sideCol) sideCol.classList.remove("mobile-open");
    _hideBackdrop();
    currentMobileTab = null;
    _updateTabBtnStates();
  };

  window.handleMobileNowbarTap = function (evt) {
    if (!evt) return;
    if (evt.target?.closest?.(".mp-mobile-icon-btn")) return;
    window.closeMobileTab(true);
  };

  function _syncTabContentState(activeTab) {
    const queueContent = document.getElementById("tabQueueContent");
    const lyricsContent = document.getElementById("tabLyricsContent");
    const favsContent = document.getElementById("tabFavsContent");
    if (queueContent)
      queueContent.classList.toggle("active-tab", activeTab === "queue");
    if (lyricsContent)
      lyricsContent.classList.toggle("active-tab", activeTab === "lyrics");
    if (favsContent)
      favsContent.classList.toggle("active-tab", activeTab === "favs");
  }

  /* ── Update active state of tab buttons ── */
  function _updateTabBtnStates() {
    const isDesktop = window.innerWidth >= 1025;
    const sideCol = document.getElementById("mpSideCol");

    const qBtn = document.getElementById("tabQueueBtn");
    const lBtn = document.getElementById("tabLyricsBtn");
    const fBtn = document.getElementById("tabFavsBtn");
    const qBtnD = document.getElementById("tabQueueBtnD");
    const lBtnD = document.getElementById("tabLyricsBtnD");
    const fBtnD = document.getElementById("tabFavsBtnD");

    if (isDesktop) {
      const activeTab = sideCol?.dataset.activeTab || "queue";
      if (qBtnD) qBtnD.classList.toggle("active", activeTab === "queue");
      if (lBtnD) lBtnD.classList.toggle("active", activeTab === "lyrics");
      if (fBtnD) fBtnD.classList.toggle("active", activeTab === "favs");
      // Reset mobile bottom bar
      if (qBtn) qBtn.classList.remove("active");
      if (lBtn) lBtn.classList.remove("active");
      if (fBtn) fBtn.classList.remove("active");
    } else {
      // Mobile bottom bar buttons
      if (qBtn) qBtn.classList.toggle("active", currentMobileTab === "queue");
      if (lBtn) lBtn.classList.toggle("active", currentMobileTab === "lyrics");
      if (fBtn) fBtn.classList.toggle("active", currentMobileTab === "favs");
      // In-panel tab buttons
      if (qBtnD) qBtnD.classList.toggle("active", currentMobileTab === "queue");
      if (lBtnD)
        lBtnD.classList.toggle("active", currentMobileTab === "lyrics");
      if (fBtnD) fBtnD.classList.toggle("active", currentMobileTab === "favs");
    }
  }

  /* ── Tab switcher ── */
  window.switchMusicTab = function (tab) {
    const sideCol = document.getElementById("mpSideCol");
    const isDesktop = window.innerWidth >= 1025;
    const trackName = window._currentTrackName;
    if (!sideCol) return;

    if (isDesktop) {
      sideCol.dataset.activeTab = tab;
      _syncTabContentState(tab);
      if (tab === "lyrics") {
        if (trackName && !window._lyricsLoaded) window.fetchLyrics(trackName);
      }
    } else {
      currentMobileTab = tab;
      sideCol.dataset.activeTab = tab;
      _syncTabContentState(tab);
      sideCol.classList.add("mobile-open");
      _showBackdrop();
      if (tab === "lyrics" && trackName && !window._lyricsLoaded)
        window.fetchLyrics(trackName);
    }
    _updateTabBtnStates();
  };

  function initMobileMusicTabSwipe() {
    const sideCol = document.getElementById("mpSideCol");
    if (!sideCol) return;
    if (!sideCol.dataset.activeTab) sideCol.dataset.activeTab = "queue";
    let startX = 0;
    let startY = 0;
    let tracking = false;
    let allowSwipeSwitch = false;
    const minDist = 44;
    const maxVertical = 28;

    sideCol.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches?.[0];
        if (!t) return;
        tracking = true;
        startX = t.clientX;
        startY = t.clientY;
        const target = e.target;
        const inLyrics = target?.closest?.("#lyricsContainer");
        const inQueueList = target?.closest?.("#playlistContainer");
        allowSwipeSwitch = !(inLyrics || inQueueList);
      },
      { passive: true },
    );

    sideCol.addEventListener(
      "touchend",
      (e) => {
        if (!tracking || window.innerWidth >= 1025) return;
        tracking = false;
        if (!allowSwipeSwitch) return;
        if (!sideCol.classList.contains("mobile-open")) return;
        const t = e.changedTouches?.[0];
        if (!t) return;
        const dx = t.clientX - startX;
        const dy = Math.abs(t.clientY - startY);
        if (dy > maxVertical || Math.abs(dx) < minDist) return;

        if (dx < 0 && currentMobileTab === "queue") {
          window.switchMusicTab("lyrics");
        } else if (dx < 0 && currentMobileTab === "lyrics") {
          window.switchMusicTab("favs");
        } else if (dx > 0 && currentMobileTab === "favs") {
          window.switchMusicTab("lyrics");
        } else if (dx > 0 && currentMobileTab === "lyrics") {
          window.switchMusicTab("queue");
        }
      },
      { passive: true },
    );
  }
  initMobileMusicTabSwipe();

  function initMusicTabInteraction() {
    document.querySelectorAll(".yt-tab-btn").forEach((btn) => {
      btn.addEventListener(
        "touchstart",
        (e) => {
          e.stopPropagation();
          lastTabTouchAt = Date.now();
          btn.classList.add("tap-active");
        },
        { passive: true },
      );
      btn.addEventListener(
        "touchend",
        () => {
          lastTabTouchAt = Date.now();
          btn.classList.remove("tap-active");
        },
        { passive: true },
      );
      btn.addEventListener("click", (e) => {
        lastTabTouchAt = Date.now();
        e.stopPropagation();
      });
    });
  }
  initMusicTabInteraction();

  /* ── Restore display state on resize ── */
  window.addEventListener("resize", () => {
    const isDesktop = window.innerWidth >= 1025;
    const sideCol = document.getElementById("mpSideCol");
    if (isDesktop) {
      if (sideCol) sideCol.classList.remove("mobile-open");
      _hideBackdrop();
      currentMobileTab = null;
      if (sideCol && !sideCol.dataset.activeTab)
        sideCol.dataset.activeTab = "queue";
    } else if (sideCol && !currentMobileTab && sideCol.dataset.activeTab) {
      currentMobileTab = sideCol.dataset.activeTab;
    }
    if (sideCol) _syncTabContentState(sideCol.dataset.activeTab || "queue");
    _updateTabBtnStates();
  });

  /* ── Lyrics fetcher — Spotify style with LRC sync ── */
  window.fetchLyrics = async function (trackName) {
    const lyricsContainer = document.getElementById("lyricsContainer");
    if (!lyricsContainer) return;
    if (window._lyricsLoadedFor === trackName) return;
    window._lyricsLoadedFor = trackName;

    lyricsContainer.innerHTML = `
      <div class="lyrics-loading">
        <div class="spin" style="display:block;border-color:var(--glass-border);border-top-color:var(--accent);width:28px;height:28px;border-width:3px"></div>
        <p>Nyari lirik untuk <strong>${escHtml(trackName)}</strong>…</p>
      </div>`;

    try {
      let artist = "",
        title = trackName;
      if (trackName.includes(" - ")) {
        const parts = trackName.split(" - ");
        artist = parts[0].trim();
        title = parts.slice(1).join(" - ").trim();
      }
      title = title
        .replace(/\s*$feat[^)]*$/gi, "")
        .replace(/\s*$.*?$/gi, "")
        .replace(/\s*(feat|ft)\..*$/i, "")
        .replace(/\s*-\s*(Official.*|Lyrics.*|Audio.*)$/i, "")
        .trim();

      let lyricsText = null,
        syncedLrc = null,
        sourceLabel = "";

      // ATTEMPT 1: lrclib.net with artist + title
      if (artist && title) {
        try {
          const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (res.ok) {
            const data = await res.json();
            if (data.syncedLyrics && data.syncedLyrics.trim().length > 20) {
              syncedLrc = data.syncedLyrics;
              lyricsText = data.plainLyrics || null;
              sourceLabel = "lrclib.net (synced)";
            } else if (
              data.plainLyrics &&
              data.plainLyrics.trim().length > 20
            ) {
              lyricsText = data.plainLyrics;
              sourceLabel = "lrclib.net";
            }
          }
        } catch (_) {}
      }

      // ATTEMPT 2: lrclib.net search
      if (!lyricsText && !syncedLrc && title) {
        try {
          const q = artist ? `${artist} ${title}` : title;
          const url = `https://lrclib.net/api/search?q=${encodeURIComponent(q)}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (res.ok) {
            const results = await res.json();
            if (Array.isArray(results) && results.length > 0) {
              const best = results[0];
              if (best.syncedLyrics && best.syncedLyrics.trim().length > 20) {
                syncedLrc = best.syncedLyrics;
                lyricsText = best.plainLyrics || null;
                sourceLabel = "lrclib.net (synced)";
                if (!artist) artist = best.artistName || "";
                if (title === trackName) title = best.trackName || title;
              } else if (
                best.plainLyrics &&
                best.plainLyrics.trim().length > 20
              ) {
                lyricsText = best.plainLyrics;
                sourceLabel = "lrclib.net";
                if (!artist) artist = best.artistName || "";
                if (title === trackName) title = best.trackName || title;
              }
            }
          }
        } catch (_) {}
      }

      // ATTEMPT 3: lyrics.ovh fallback
      if (!lyricsText && !syncedLrc && artist && title) {
        try {
          const res = await fetch(
            `https://lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
            { signal: AbortSignal.timeout(8000) },
          );
          if (res.ok) {
            const data = await res.json();
            if (data.lyrics && data.lyrics.trim().length > 20) {
              lyricsText = data.lyrics;
              sourceLabel = "lyrics.ovh";
            }
          }
        } catch (_) {}
      }

      if (syncedLrc || lyricsText) {
        window._lyricsLoaded = true;
        if (syncedLrc) {
          syncedLines = parseLRC(syncedLrc);
          lastActiveLine = -1;
        } else syncedLines = [];

        const displayLines = syncedLrc
          ? syncedLines.map((l) => l.text)
          : lyricsText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

        let html = `
          <div class="lyrics-title-row">
            <div class="lyrics-song-name">${escHtml(title || trackName)}</div>
            <div class="lyrics-source">${escHtml(artist || "Unknown Artist")} · ${sourceLabel}</div>
          </div>
          <div class="lyrics-content">`;

        displayLines.forEach((line, i) => {
          const trimmed = typeof line === "string" ? line.trim() : line;
          if (trimmed === "") {
            html += `<span class="lyrics-line-break"></span>`;
          } else {
            const cls = syncedLrc ? "lyrics-line lyrics-future" : "lyrics-line";
            html += `<span class="${cls}" data-idx="${i}">${escHtml(trimmed)}</span>`;
          }
        });
        html += `</div>`;
        lyricsContainer.innerHTML = html;
        bindLyricsSeekInteractions(!!syncedLrc && syncedLines.length > 0);

        if (!audio.paused && syncedLines.length > 0) {
          const currentTime = audio.currentTime;
          let activeIdx = -1;
          for (let i = syncedLines.length - 1; i >= 0; i--) {
            if (currentTime >= syncedLines[i].time) {
              activeIdx = i;
              break;
            }
          }
          lastActiveLine = activeIdx;
          updateLyricsHighlight(activeIdx);
        }
      } else {
        window._lyricsLoaded = false;
        window._lyricsLoadedFor = null;
        syncedLines = [];
        lyricsContainer.innerHTML = `
          <div class="lyrics-empty">
            <span class="lyrics-empty-icon">😔</span>
            <p>Lirik tidak ditemukan Rek<br>
            <small style="font-size:12px;opacity:0.7;line-height:2">
              Tips: ganti nama file jadi<br>
              <strong>"Artist - Judul Lagu.mp3"</strong><br>
              Contoh: <em>Nadhif Basalamah - Kota Ini.mp3</em>
            </small></p>
          </div>`;
      }
    } catch (e) {
      window._lyricsLoadedFor = null;
      syncedLines = [];
      lyricsContainer.innerHTML = `
        <div class="lyrics-empty">
          <span class="lyrics-empty-icon">😔</span>
          <p>Gagal nyari lirik Rek<br>
          <small style="font-size:12px;opacity:0.7">Cek koneksi internet lu</small></p>
        </div>`;
    }
  };

  function formatTime(s) {
    if (!isFinite(s)) return "—";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  }
  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadFavs();
    restoreState();
    initProgressSeekInteractions();
    const sideCol = document.getElementById("mpSideCol");
    if (sideCol) _syncTabContentState(sideCol.dataset.activeTab || "queue");
    _updateTabBtnStates();
    syncLikeBtn();
    renderFavsList();
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
      title.textContent = "GAME OVER 💀";
      sub.textContent = `Skor lu: ${score} · Best: ${bestScore}`;
      btn.textContent = "▶ MAIN LAGI";
      overlay.classList.remove("hidden");
    }
  }

  /* ── Draw idle screen ── */
  function drawIdle() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, GAME_W, GAME_H);
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    stars.forEach((s) => {
      s.twinkle += 0.05;
      const alpha = 0.4 + Math.sin(s.twinkle) * 0.3;
      ctx.fillStyle = `rgba(200,200,255,${alpha})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    ctx.fillStyle = "#1e1b4b";
    ctx.fillRect(0, groundY, GAME_W, GAME_H - groundY);
    ctx.fillStyle = "#4f46e5";
    ctx.fillRect(0, groundY, GAME_W, 2);
    drawPixelSprite(
      PLAYER_SPRITES[0],
      player.x,
      player.y,
      COLOR_PLAYER,
      COLOR_PLAYER_O,
      TILE,
    );
  }

  /* ── Main draw ── */
  function draw() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, GAME_W, GAME_H);

    // Sky
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    // Stars
    stars.forEach((s) => {
      s.twinkle += 0.02;
      const alpha =
        gameState === "playing"
          ? 0.2 + Math.sin(s.twinkle) * 0.1
          : 0.4 + Math.sin(s.twinkle) * 0.3;
      ctx.fillStyle = `rgba(200,200,255,${alpha})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    // Clouds
    clouds.forEach((c) => {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(c.x, c.y, c.w, 14, 7);
      else ctx.rect(c.x, c.y, c.w, 14);
      ctx.fill();
    });

    // Ground
    ctx.fillStyle = "#1e1b4b";
    ctx.fillRect(0, groundY, GAME_W, GAME_H - groundY);
    ctx.fillStyle = "#4f46e5";
    ctx.fillRect(0, groundY, GAME_W, 2);
    for (let gx = 0; gx < GAME_W; gx += 16) {
      ctx.fillStyle = "rgba(99,102,241,0.3)";
      ctx.fillRect(gx, groundY + 4, 8, 2);
    }

    // Coins
    coins.forEach(drawCoin);

    // Obstacles
    obstacles.forEach(drawObstacle);

    // Player
    const sprite = isJumping
      ? PLAYER_JUMP_SPRITE
      : PLAYER_SPRITES[player.frame];
    const blink =
      player.invincible > 0 && Math.floor(player.invincible / 6) % 2 === 0;
    ctx.globalAlpha = blink ? 0.35 : 1;
    drawPixelSprite(
      sprite,
      player.x,
      player.y,
      COLOR_PLAYER,
      COLOR_PLAYER_O,
      TILE,
    );
    ctx.globalAlpha = 1;

    // Particles
    particles.forEach((p) => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      if (ctx.roundRect)
        ctx.roundRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, 2);
      else ctx.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  /* ── Pixel sprite renderer ── */
  function drawPixelSprite(sprite, x, y, colors, colorO, tileSize) {
    if (!ctx || !sprite) return;
    sprite.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) {
        const ch = row[rx];
        if (ch === "X") {
          const ci = Math.min(
            Math.floor((ry / sprite.length) * colors.length),
            colors.length - 1,
          );
          ctx.fillStyle = colors[ci];
          ctx.fillRect(
            x + rx * tileSize,
            y + ry * tileSize,
            tileSize,
            tileSize,
          );
        } else if (ch === "O") {
          ctx.fillStyle = colorO;
          ctx.fillRect(
            x + rx * tileSize,
            y + ry * tileSize,
            tileSize,
            tileSize,
          );
        }
      }
    });
  }

  /* ── Draw obstacle ── */
  function drawObstacle(o) {
    if (!ctx) return;
    let colors;
    if (o.type === "cactus") colors = COLOR_OBS_CACTUS;
    else if (o.type === "rock") colors = COLOR_OBS_ROCK;
    else colors = COLOR_OBS_BIRD;

    if (o.type === "bird") {
      // Animate wings
      const flapUp = Math.floor(o.animT / 10) % 2 === 0;
      const wingSprite = flapUp
        ? OBS_SPRITES.bird
        : ["......", ".XXXX.", "XXXXXX", ".X..X.", "......"];
      drawPixelSprite(wingSprite, o.x, o.y, colors, "#fff", TILE);
    } else {
      drawPixelSprite(OBS_SPRITES[o.type], o.x, o.y, colors, "#fff", TILE);
    }
  }

  /* ── Draw coin ── */
  function drawCoin(c) {
    if (!ctx) return;
    const pulse = Math.sin(c.animT * 3) * 0.25 + 0.75;
    const r = c.r * pulse;
    const grd = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 2);
    grd.addColorStop(0, COLOR_COIN[2]);
    grd.addColorStop(0.5, COLOR_COIN[0]);
    grd.addColorStop(1, COLOR_COIN[1]);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.fill();
    // Shine
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(c.x - r * 0.3, c.y - r * 0.3, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── Particle spawners ── */
  function spawnJumpParticles() {
    const colors = ["#c084fc", "#a855f7", "#67e8f9", "#f472b6"];
    for (let i = 0; i < 7; i++) {
      const angle = Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.9;
      const spd = 1.5 + Math.random() * 2.5;
      particles.push({
        x: player.x + player.w / 2,
        y: player.y + player.h,
        vx: Math.cos(angle) * spd,
        vy: -Math.sin(angle) * spd,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 3,
        life: 22 + Math.random() * 14,
        maxLife: 36,
      });
    }
  }

  function spawnHitParticles() {
    const colors = ["#ff6b8a", "#f43f5e", "#fbbf24", "#ff9eb0"];
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 4;
      particles.push({
        x: player.x + player.w / 2,
        y: player.y + player.h / 2,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        life: 30 + Math.random() * 20,
        maxLife: 50,
      });
    }
  }

  function spawnCoinParticles(cx, cy) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 2.5;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 1,
        color: COLOR_COIN[Math.floor(Math.random() * COLOR_COIN.length)],
        size: 3 + Math.random() * 3,
        life: 18 + Math.random() * 14,
        maxLife: 32,
      });
    }
  }

  /* ── Score display ── */
  function updateScoreDisplay() {
    const scoreEl = document.getElementById("gameScore");
    const bestEl = document.getElementById("gameBest");
    const livesEl = document.getElementById("gameLives");
    if (scoreEl) scoreEl.textContent = score;
    if (bestEl) bestEl.textContent = bestScore;
    if (livesEl) livesEl.textContent = "❤️".repeat(Math.max(0, lives)) || "💀";
  }

  /* ── Open / Close game modal ── */
  window.openGame = function () {
    const m = document.getElementById("gameModal");
    if (!m) return;
    m.style.display = "flex";
    setTimeout(() => {
      m.classList.add("active");
      if (!canvas) initGame();
    }, 10);
  };

  window.closeGame = function () {
    const m = document.getElementById("gameModal");
    if (!m) return;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    gameState = "idle";
    m.classList.remove("active");
    setTimeout(() => (m.style.display = "none"), 400);
  };

  /* ── Init on DOM ready ── */
  document.addEventListener("DOMContentLoaded", initGame);
})(); // end game IIFE
