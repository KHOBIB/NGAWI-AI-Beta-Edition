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

/* ── Personalities ── */
const personalities = {
  teman: {
    name: "Temen ngopi",
    prompt:
      "Kamu adalah orang bekasi yang selalu pakai bahasa bekasi bukan betawi. Sifatmu adalah teman yang asik dan usil, Gunakan bahasa sehari-hari manusia dan gaul, jangan baku. Panggil user dengan sebutan 'rek'. di awal kalimat gunakan kata 'welahdalah' jika diperlukan jangan terlalu sering. Gunakan kata-kata seperti 'jir', bangsat, anjir, bangke, 'kocak', 'lawak' jika perlu. pakai emote 😹 jika sedang meledek user. jika pengguna kesal kamu akan menulis 'marah loh ya😹'. Kamu tidak harus selalu menurut, jadilah kritis agar hasil kerjamu benar. Jangan pakai kata 'aku/kamu' karena itu norak. Ubah kata biarin aja menjadi bagen. harus memberi solusi setiap ada masalah. mengingatkan untuk sholat 5 waktu saat sudah waktunya adzan sudah waktunya. SANGAT PENTING: WAJIB jawab minimal 3-4 kalimat penuh yang bermakna dan berguna. DILARANG KERAS TOTAL menjawab hanya 1 kata, 1 huruf, 2 kata, atau kalimat terpotong. Setiap jawaban HARUS lengkap, jelas, informatif, dan tidak terpotong di tengah kalimat.",
  },
  guru: {
    name: "Guru Ngoding",
    prompt:
      "Kamu adalah seorang guru pemrograman yang bijak, sabar, namun tetap asik. Panggil user dengan sebutan 'Muridku'. Gunakan bahasa yang memotivasi dan edukatif. Fokuslah pada penjelasan konsep coding dengan analogi yang mudah dimengerti. Tetap gunakan gaya bahasa santai tapi sopan. Jika ada error, bantu debug langkah demi langkah. SANGAT PENTING: WAJIB jawab minimal 3-4 kalimat penuh yang bermakna dan berguna.",
  },
  coding_buddy: {
    name: "Temen Ngoding",
    prompt:
      "Kamu adalah teman seperjuangan dalam ngoding. Gaya bahasamu sangat santai, panggil user 'Bro' atau 'Sist'. Gunakan istilah-instilah tech seperti 'bug', 'deploy', 'production', 'ngopi', 'stack overflow'. Kamu sangat suportif dan selalu siap membantu mencarikan solusi cepat atau sekadar curhat soal kode yang berantakan. SANGAT PENTING: WAJIB jawab minimal 3-4 kalimat penuh yang bermakna dan berguna.",
  },
  romantis_cewe: {
    name: "My Bini",
    prompt:
      "Kamu adalah sosok perempuan yang sangat romantis, perhatian, dan lembut. Panggil user dengan sebutan 'Sayang' atau 'Beb'. Gunakan banyak emoji manis seperti ❤️, 🌸, ✨. Bicaralah dengan penuh kasih sayang, berikan dukungan emosional, dan jadilah pendengar yang baik. Fokus pada kenyamanan dan kebahagiaan user. SANGAT PENTING: WAJIB jawab minimal 3-4 kalimat penuh yang bermakna dan berguna.",
  },
  romantis_cowo: {
    name: "My Suami",
    prompt:
      "Kamu adalah sosok laki-laki yang protektif, manis, dan romantis. Panggil user dengan sebutan 'Sayang' atau 'Cantik'. Gunakan gaya bahasa yang *gentleman*, penuh perhatian, dan menenangkan. Gunakan emoji seperti 🌹, 💫, 💖. Fokus pada melindungi, menghibur, dan memberikan perhatian spesial kepada user. SANGAT PENTING: WAJIB jawab minimal 3-4 kalimat penuh yang bermakna dan berguna.",
  },
};

let currentPersonality = localStorage.getItem("ngawi-personality") || "teman";

/* ── Vision Support ── */
let selectedImages = [];

window.handleAIImageSelect = (files) => {
  if (!files.length) return;
  Array.from(files).forEach((file) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      selectedImages.push(base64);
      renderImagePreviews();
    };
    reader.readAsDataURL(file);
  });
  const inp = document.getElementById("aiImageInput");
  if (inp) inp.value = "";
};

function renderImagePreviews() {
  const area = document.getElementById("imagePreviewArea");
  if (!area) return;
  area.innerHTML = selectedImages
    .map(
      (img, i) => `
    <div class="preview-item">
      <img src="${img}" />
      <div class="preview-remove" onclick="window.removeAIImage(${i})">×</div>
    </div>`,
    )
    .join("");
}

window.removeAIImage = (idx) => {
  selectedImages.splice(idx, 1);
  renderImagePreviews();
};

/* ── Chat history ── */
let history = [
  {
    role: "system",
    content: personalities[currentPersonality].prompt,
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

function formatAssistantText(text) {
  return escHtml(text)
    .replace(/\*\*(.*?)\*\*/gs, "<strong>$1</strong>")
    .replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\n/g, "<br>");
}

function formatAssistantMessage(rawText, { streaming = false } = {}) {
  const source = String(rawText || "");
  const codeFenceRegex = /```([\w.+-]*)\n?([\s\S]*?)```/g;
  let html = "";
  let lastIndex = 0;
  let match;

  while ((match = codeFenceRegex.exec(source)) !== null) {
    const [fullMatch, langRaw, codeRaw] = match;
    const before = source.slice(lastIndex, match.index);
    if (before) html += formatAssistantText(before);

    const lang = escHtml((langRaw || "").trim() || "code");
    const codeLines = codeRaw.replace(/\n$/, "").split("\n");
    const codeHtml = codeLines
      .map((line, idx) => {
        const safeLine = line ? escHtml(line) : "&nbsp;";
        return `<span class="code-line"><span class="code-line-no">${idx + 1}</span><span class="code-line-text">${safeLine}</span></span>`;
      })
      .join("");
    html += `<div class="code-block"><div class="code-toolbar"><div class="code-toolbar-dots"><span></span><span></span><span></span></div><div class="code-block-label">${lang}</div><div class="code-toolbar-spacer"></div></div><pre><code>${codeHtml}</code></pre></div>`;
    lastIndex = match.index + fullMatch.length;
  }

  const tail = source.slice(lastIndex);
  if (tail) html += formatAssistantText(tail);
  if (streaming) html += '<span class="typing-cursor"></span>';
  return html;
}

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

  if (!prompt && selectedImages.length === 0) {
    window.showAlert("Isi dulu pertanyaannya atau pilih gambar Rek");
    return;
  }

  try {
    sendBtn.disabled = true;
    spawnParticles(sendBtn);

    const welcome = document.getElementById("welcome");
    if (welcome) welcome.style.display = "none";

    // Build user message content (text + images)
    let userMessageContent = [];
    if (prompt) {
      userMessageContent.push({ type: "text", text: prompt });
    }

    let displayHtml = prompt.replace(/\n/g, "<br>");

    selectedImages.forEach((imgBase64) => {
      userMessageContent.push({
        type: "image_url",
        image_url: { url: imgBase64 },
      });
      // Only add <br> if there's already text content
      const separator = displayHtml.trim() ? "<br>" : "";
      displayHtml += `${separator}<div class="chat-image-wrap"><img src="${imgBase64}" class="chat-sent-img" onclick="window.openImageViewer('${imgBase64}')"></div>`;
    });

    addBubble("user", displayHtml);

    // Clear input and previews
    input.value = "";
    input.style.height = "auto";
    const imagesToSubmit = [...selectedImages];
    selectedImages = [];
    renderImagePreviews();
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

    // Add to history (handling multimodal if images present)
    const newUserMsg = {
      role: "user",
      content: imagesToSubmit.length > 0 ? userMessageContent : prompt,
    };
    history.push(newUserMsg);

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
      if (!trimmed.startsWith("data:")) return;
      const data = trimmed.slice(trimmed.indexOf(":") + 1).trim();
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
            bubble.innerHTML = formatAssistantMessage(full, {
              streaming: true,
            });
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
        if (bubble) bubble.innerHTML = formatAssistantMessage(full);
      }
    }

    document.getElementById(lId)?.querySelector(".typing-cursor")?.remove();
    history.push({ role: "assistant", content: full });
  } catch (e) {
    console.error("Chat error:", e);
    // Find the latest typing-indicator and show error
    const typingIndicators = document.querySelectorAll(".msg.ai");
    const tm = typingIndicators[typingIndicators.length - 1];
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
      ? `<div class="ai-avatar">N</div><div class="bubble"${id ? ` id="${id}"` : ""}>${formatAssistantMessage(text)}</div>`
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
  if (!modal) return;
  modal.style.display = "flex";

  // Trigger reflow for animations
  const formContainer = modal.querySelector(".auth-form-container");
  if (formContainer) {
    formContainer.classList.remove("animate");
    void formContainer.offsetWidth;
    formContainer.classList.add("animate");
  }

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
   PERSONALITY LOGIC
───────────────────────────────────────── */
window.openPersonality = () => {
  window.closeSidebar();
  const modal = document.getElementById("personalityModal");
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("active"), 10);

  // Mark active card
  document
    .querySelectorAll(".p-card")
    .forEach((c) => c.classList.remove("active"));
  document.getElementById("p-" + currentPersonality)?.classList.add("active");
};

window.closePersonality = () => {
  const modal = document.getElementById("personalityModal");
  modal.classList.remove("active");
  setTimeout(() => (modal.style.display = "none"), 400);
};

window.setPersonality = (key) => {
  if (!personalities[key]) return;
  currentPersonality = key;
  localStorage.setItem("ngawi-personality", key);

  // Update system prompt in history
  history[0].content = personalities[key].prompt;

  // UI Feedback
  document
    .querySelectorAll(".p-card")
    .forEach((c) => c.classList.remove("active"));
  document.getElementById("p-" + key)?.classList.add("active");

  window.showAlert(
    `Sifat AI diganti jadi: ${personalities[key].name}`,
    "success",
  );

  // Option: Clear chat or just keep going with new prompt
  // window.clearChat();

  setTimeout(() => window.closePersonality(), 600);
};

/* ─────────────────────────────────────────
   IMAGE VIEWER LOGIC
───────────────────────────────────────── */
window.openImageViewer = (src) => {
  const modal = document.getElementById("imageViewerModal");
  const img = document.getElementById("viewerImg");
  img.src = src;
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("active"), 10);
};

window.closeImageViewer = () => {
  const modal = document.getElementById("imageViewerModal");
  modal.classList.remove("active");
  setTimeout(() => {
    modal.style.display = "none";
    document.getElementById("viewerImg").src = "";
  }, 400);
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
    if (wt) wt.textContent = `Halo ${name}`;
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
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
    currentTrack = -1,
    isPlayingFavorites = false; // State baru untuk menandai playlist favorit yang diputar
  let isRepeat = false,
    isShuffle = false;

  /* ── Helper: Ambil antrean putar saat ini (Semua vs Favorit) ── */
  function getCurrentQueue() {
    return isPlayingFavorites
      ? playlist.filter((t) => isFavTrack(t))
      : playlist;
  }
  let audioCtx = null,
    analyser = null,
    sourceConnected = false;
  let currentMobileTab = null;
  let lastTabTouchAt = 0;
  const isMobileViewport = () =>
    window.matchMedia("(max-width: 768px)").matches;

  const audio = new Audio();
  audio.volume = parseFloat(localStorage.getItem("ngawi-vol") || "0.8");
  let isProgressDragging = false;
  let lastRenderedCurrentSecond = -1;
  let lastRenderedDurationLabel = "";
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
      .map((t, i) => {
        const isActive = isPlayingFavorites && i === currentTrack;
        return `
        <div class="playlist-item ${isActive ? "active" : ""}" onclick="window.loadTrack(${i}, true, true)">
          <div class="playlist-item-num">${isActive && isPlaying ? "▶" : i + 1}</div>
          <div class="playlist-item-info">
            <div class="playlist-item-name">${escHtml(t.name)}</div>
            <div class="playlist-item-dur">${t.duration}</div>
          </div>
          <button class="playlist-item-love is-liked" onclick="event.stopPropagation();window.toggleFavFromListObject('${t.id || t.name}')" title="Hapus dari Favorit">
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

  /* ── Album cover via iTunes & Deezer APIs ── */
  async function fetchAlbumCover(trackName) {
    const cleanName = (s) => {
      if (!s) return "";
      return s
        .replace(/^\d+[\s.-]*/, "")
        .replace(/\(.*\)|\[.*\]/g, "")
        .replace(/feat\..*|ft\..*/i, "")
        .replace(/\.mp3|\.m4a|\.wav|\.flac/i, "")
        .trim();
    };

    const tryiTunes = async (q) => {
      if (!q || q.length < 2) return null;
      try {
        const query = q
          .replace(/[^\w\s-]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const r = data.results[0];
          const art = r.artworkUrl100 || r.artworkUrl60;
          return art ? art.replace("100x100bb", "600x600bb") : null;
        }
      } catch (_) {}
      return null;
    };

    const tryDeezer = async (q) => {
      if (!q || q.length < 2) return null;
      try {
        // Deezer often needs a proxy or specific headers for direct fetch, but let's try their public search
        const url = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=1&output=json`;
        // Use a CORS proxy for Deezer since their API often blocks direct browser requests
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        const data = await res.json();
        const content = JSON.parse(data.contents);
        if (content.data && content.data.length > 0) {
          return (
            content.data[0].album.cover_xl || content.data[0].album.cover_big
          );
        }
      } catch (_) {}
      return null;
    };

    const fullClean = cleanName(trackName);

    // Step 1: Try iTunes with full name
    let cover = await tryiTunes(fullClean);
    if (cover) return cover;

    // Step 2: Try Deezer with full name
    cover = await tryDeezer(fullClean);
    if (cover) return cover;

    // Step 3: If has " - ", try parts
    if (trackName.includes(" - ")) {
      const parts = trackName.split(" - ");
      const title = cleanName(parts[1]);

      cover = await tryiTunes(title);
      if (!cover) cover = await tryDeezer(title);
    }

    return cover;
  }

  /* ── Set album art cover ── */
  function setAlbumCover(coverUrl) {
    const albumEl = document.getElementById("albumArt");
    currentAlbumCoverUrl = coverUrl || null;
    if (!albumEl) return;

    // Ensure emoji span exists
    let emojiEl = albumEl.querySelector(".album-art-emoji");
    if (!emojiEl) {
      const textNodes = Array.from(albumEl.childNodes).filter(
        (n) => n.nodeType === 3 && n.textContent.trim(),
      );
      const emojiText =
        textNodes.length > 0 ? textNodes[0].textContent.trim() : "🎵";
      if (textNodes.length > 0) textNodes[0].remove();

      emojiEl = document.createElement("span");
      emojiEl.className = "album-art-emoji";
      emojiEl.textContent = emojiText;
      albumEl.appendChild(emojiEl);
    }

    // Remove all existing imgs
    albumEl.querySelectorAll(".album-art-img").forEach((img) => img.remove());

    if (!coverUrl) {
      emojiEl.style.opacity = "1";
      _updateSideMiniInfo();
      return;
    }

    const img = document.createElement("img");
    img.className = "album-art-img";
    img.alt = "Album Cover";
    img.onload = () => {
      img.classList.add("loaded");
      emojiEl.style.opacity = "0";
      // Ensure the URL matches current track after load
      if (currentAlbumCoverUrl === coverUrl) {
        _updateSideMiniInfo();
      }
    };
    img.onerror = () => {
      img.remove();
      emojiEl.style.opacity = "1";
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
    const wasPlayingFavs =
      localStorage.getItem("ngawi-playing-favs") === "true";
    scheduleRenderPlaylist();
    if (lastTrack >= 0 && lastTrack < playlist.length)
      loadTrack(lastTrack, false, wasPlayingFavs);
  }

  /* ── Visualizer ── */
  const canvas = document.getElementById("visualizerCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  let visualizerFrameId = 0;
  let visualizerFreqData = null;
  let visualizerLastFrameAt = 0;

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      isMobileViewport() ? 1.5 : 2,
    );
    canvas.width = Math.floor(canvas.offsetWidth * dpr);
    canvas.height = Math.floor(canvas.offsetHeight * dpr);
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  let resizeCanvasTimer = 0;
  function scheduleCanvasResize() {
    window.clearTimeout(resizeCanvasTimer);
    resizeCanvasTimer = window.setTimeout(resizeCanvas, 120);
  }
  function isVisualizerActive() {
    const panel = document.getElementById("musicPanel");
    return !!canvas && !!panel?.classList.contains("open") && !document.hidden;
  }
  function stopVisualizer() {
    if (!visualizerFrameId) return;
    cancelAnimationFrame(visualizerFrameId);
    visualizerFrameId = 0;
  }
  function requestVisualizerFrame() {
    if (visualizerFrameId || !isVisualizerActive()) return;
    visualizerFrameId = requestAnimationFrame(drawVisualizer);
  }
  function syncVisualizerState() {
    if (isVisualizerActive()) requestVisualizerFrame();
    else stopVisualizer();
  }
  window.addEventListener("resize", scheduleCanvasResize);
  setTimeout(resizeCanvas, 120);

  function drawVisualizer(now = 0) {
    visualizerFrameId = 0;
    if (!canvas || !ctx) return;
    if (!isVisualizerActive()) return;
    const frameInterval = isMobileViewport()
      ? audio.paused
        ? 1000 / 12
        : 1000 / 24
      : audio.paused
        ? 1000 / 18
        : 1000 / 36;
    if (now && now - visualizerLastFrameAt < frameInterval) {
      requestVisualizerFrame();
      return;
    }
    visualizerLastFrameAt = now;
    const W = canvas.offsetWidth,
      H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    const isDark = document.body.getAttribute("data-theme") !== "light";
    const barCount = isMobileViewport() ? 20 : 32;
    let beatLevel = 0;
    if (analyser && !audio.paused) {
      const data =
        visualizerFreqData &&
        visualizerFreqData.length === analyser.frequencyBinCount
          ? visualizerFreqData
          : new Uint8Array(analyser.frequencyBinCount);
      visualizerFreqData = data;
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
    requestVisualizerFrame();
  }
  document.addEventListener("visibilitychange", syncVisualizerState);

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

  window.loadTrack = function (idx, autoplay = true, fromFavs = false) {
    isPlayingFavorites = fromFavs;
    const queue = getCurrentQueue();
    if (idx < 0 || idx >= queue.length) return;
    currentTrack = idx;
    const track = queue[idx];
    audio.src = track.url;
    localStorage.setItem("ngawi-track", idx);
    localStorage.setItem("ngawi-playing-favs", isPlayingFavorites);
    const likeBtn = document.getElementById("likeBtn");
    if (likeBtn) {
      likeBtn.style.color = "";
    }
    window._currentTrackName = track.name;
    window._lyricsLoaded = false;
    window._lyricsLoadedFor = null;
    syncedLines = [];
    lastActiveLine = -1;
    setAlbumCover(null);
    fetchAlbumCover(track.name).then((coverUrl) => {
      if (currentTrack === idx && isPlayingFavorites === fromFavs)
        setAlbumCover(coverUrl);
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
          window.fetchLyrics(track.name);
        })
        .catch(console.error);
    } else {
      updatePlayerUI(false);
      window.fetchLyrics(track.name);
    }
  };

  function _updateSideMiniInfo() {
    const queue = getCurrentQueue();
    const track = currentTrack >= 0 ? queue[currentTrack] : null;
    const titleEl = document.getElementById("mpMobileNowbarTitle");
    const artistEl = document.getElementById("mpMobileNowbarArtist");
    const thumbEl = document.getElementById("mpMobileNowbarThumb");
    const pauseBtn = document.getElementById("mpMobilePauseBtn");
    const pauseIcon = pauseBtn?.querySelector("span");
    if (titleEl) titleEl.textContent = track ? track.name : "—";
    if (artistEl) {
      if (track && track.name.includes(" - ")) {
        const artistRaw = track.name.split(" - ")[0].trim();
        artistEl.textContent = artistRaw.replace(/^\d+[\s.-]*/, "");
      } else artistEl.textContent = track ? "Local Music" : "—";
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
          syncVisualizerState();
        })
        .catch(() => {
          window.showAlert("Tekan lagi tombol play ya Rek 🙌");
        });
    } else {
      audio.pause();
      updatePlayerUI(false);
      syncVisualizerState();
      document.getElementById("headerMusicMini")?.classList.remove("visible");
    }
  };

  window.nextTrack = function () {
    const queue = getCurrentQueue();
    if (!queue.length) return;
    window.loadTrack(
      isShuffle
        ? Math.floor(Math.random() * queue.length)
        : (currentTrack + 1) % queue.length,
      true,
      isPlayingFavorites,
    );
  };
  window.prevTrack = function () {
    const queue = getCurrentQueue();
    if (!queue.length) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    window.loadTrack(
      (currentTrack - 1 + queue.length) % queue.length,
      true,
      isPlayingFavorites,
    );
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
    const isLight = document.body.getAttribute("data-theme") === "light";

    if (isLight) {
      // Warna aksen untuk mode terang agar kontras
      slider.style.background = `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--accent-dim) ${pct}%, var(--accent-dim) 100%)`;
    } else {
      // Putih filled track untuk mode gelap
      slider.style.background = `linear-gradient(to right, var(--text) 0%, var(--text) ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`;
    }
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
    window.showAlert(
      isLiked ? "Dihapus dari favorit" : "Ditambah ke favorit 💜",
      "success",
    );
  };

  window.toggleFavFromList = function (idx) {
    const track = playlist[idx];
    if (!track) return;
    const isLiked = isFavTrack(track);
    setFavTrack(track, !isLiked);
    if (idx === currentTrack && !isPlayingFavorites) syncLikeBtn();
    _lastRenderedPlaylistLength = -1;
    _lastRenderedCurrentTrack = -1;
    scheduleRenderPlaylist();
    renderFavsList();
  };

  window.toggleFavFromListObject = function (idOrName) {
    const track = playlist.find(
      (t) => t.id === idOrName || t.name === idOrName,
    );
    if (!track) return;
    const isLiked = isFavTrack(track);
    setFavTrack(track, !isLiked);

    // Sinkronisasi jika track ini sedang diputar
    const queue = getCurrentQueue();
    const playingTrack = queue[currentTrack];
    if (
      playingTrack &&
      (playingTrack.id === track.id || playingTrack.name === track.name)
    ) {
      syncLikeBtn();
    }

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

    if (isPlayingFavorites) {
      // Jika sedang putar favorit, kembalikan ke mode semua lagu jika ada perubahan drastis
      // atau tetap di mode favorit tapi reset indeks
      isPlayingFavorites = false;
    }

    if (currentTrack === idx) {
      audio.pause();
      if (playlist.length > 0)
        window.loadTrack(Math.min(idx, playlist.length - 1), false, false);
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
      .map((t, i) => {
        const isActive = !isPlayingFavorites && i === currentTrack;
        return `
      <div class="playlist-item ${isActive ? "active" : ""}" onclick="window.loadTrack(${i}, true, false)">
        <div class="playlist-item-num">${isActive && isPlaying ? "▶" : i + 1}</div>
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
      </div>`;
      })
      .join("");
  }

  function updatePlayerUI(playing) {
    const queue = getCurrentQueue();
    const track = currentTrack >= 0 ? queue[currentTrack] : null;
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
        const artistRaw = parts[0].trim();
        artistDisplay = artistRaw.replace(/^\d+[\s.-]*/, "");
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
        queue.length > 0 ? `${currentTrack + 1}/${queue.length}` : "0/0";
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
    const currentSecond = Math.floor(audio.currentTime);
    const durationLabel = formatTime(audio.duration);
    if (!isProgressDragging) {
      const slider = document.getElementById("seekSlider");
      if (slider) slider.value = String(Math.round(ratio * 1000));
      _setSeekSliderVisual(ratio);
      if (ct && currentSecond !== lastRenderedCurrentSecond) {
        ct.textContent = formatTime(audio.currentTime);
      }
    }
    if (tt && durationLabel !== lastRenderedDurationLabel)
      tt.textContent = durationLabel;
    lastRenderedCurrentSecond = currentSecond;
    lastRenderedDurationLabel = durationLabel;
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
    lastRenderedCurrentSecond = -1;
    lastRenderedDurationLabel = "";
    if (slider) slider.value = "0";
    _setSeekSliderVisual(0);
    if (ct) ct.textContent = "0:00";
    if (tt && isFinite(audio.duration))
      tt.textContent = formatTime(audio.duration);
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
        const targetTop =
          activeLine.offsetTop -
          container.clientHeight / 2 +
          activeLine.clientHeight / 2;
        container.scrollTo({
          top: Math.max(0, targetTop),
          behavior: isDesktop ? "smooth" : "auto",
        });
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

  /* ── Keyboard Shortcuts (Space for Play/Pause) ── */
  document.addEventListener("keydown", (e) => {
    // Pastikan user tidak sedang mengetik di input chat atau textarea
    const activeEl = document.activeElement;
    const isInput =
      activeEl.tagName === "INPUT" ||
      activeEl.tagName === "TEXTAREA" ||
      activeEl.isContentEditable;

    if (e.code === "Space" && !isInput) {
      e.preventDefault(); // Cegah scroll halaman saat tekan spasi
      window.togglePlay();
    }
  });

  audio.addEventListener("ended", () => {
    const queue = getCurrentQueue();
    if (!isRepeat) {
      if (isShuffle)
        window.loadTrack(
          Math.floor(Math.random() * queue.length),
          true,
          isPlayingFavorites,
        );
      else if (currentTrack < queue.length - 1) window.nextTrack();
      else {
        updatePlayerUI(false);
        document.getElementById("headerMusicMini")?.classList.remove("visible");
      }
    }
  });
  audio.addEventListener("play", () => {
    updatePlayerUI(true);
    syncVisualizerState();
  });
  audio.addEventListener("pause", () => {
    updatePlayerUI(false);
    syncVisualizerState();
  });

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
      scheduleCanvasResize();
    }
    syncVisualizerState();
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
  let musicLayoutResizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(musicLayoutResizeTimer);
    musicLayoutResizeTimer = window.setTimeout(() => {
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
      syncVisualizerState();
    }, 120);
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
