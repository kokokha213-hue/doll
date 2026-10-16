/* ============================================================
   MY PERSONAL AI — Phase 1 Frontend Logic
   Everything is stored in browser localStorage.
   No server, no AI yet — we fake replies.
   ============================================================ */

/* ---------- STATE ---------- */
const state = {
  conversations: [],      // [{ id, title, messages: [{role, text, attachments, ts}], createdAt }]
  currentId: null,
  memories: [],           // [{ id, text, ts }]
  settings: {
    memoryEnabled: true,
    autoMemory: false,
    speakReplies: false,
    saveHistory: true,
    voiceURI: null,
  },
  pendingAttachments: [], // { type:'image'|'file', name, dataUrl?, textContent? }
  isRecording: false,
};

/* ---------- STORAGE KEYS ---------- */
const LS = {
  CONVOS: "mpai_conversations",
  MEMS: "mpai_memories",
  SETTINGS: "mpai_settings",
};

/* ---------- DOM REFS ---------- */
const $ = (id) => document.getElementById(id);

const els = {
  sidebar: $("sidebar"),
  overlay: $("overlay"),
  menuToggle: $("menuToggle"),
  newChatBtn: $("newChatBtn"),
  historyList: $("historyList"),
  historySearch: $("historySearch"),
  messages: $("messages"),
  welcome: $("welcome"),
  userInput: $("userInput"),
  sendBtn: $("sendBtn"),
  micBtn: $("micBtn"),
  attachImageBtn: $("attachImageBtn"),
  attachDocBtn: $("attachDocBtn"),
  imageInput: $("imageInput"),
  docInput: $("docInput"),
  attachmentPreview: $("attachmentPreview"),
  attachmentItems: $("attachmentItems"),
  openSettingsBtn: $("openSettingsBtn"),
  topbarSettings: $("topbarSettings"),
  settingsPanel: $("settingsPanel"),
  closeSettingsBtn: $("closeSettingsBtn"),
  // settings controls
  memoryToggle: $("memoryToggle"),
  autoMemoryToggle: $("autoMemoryToggle"),
  speakToggle: $("speakToggle"),
  historyToggle: $("historyToggle"),
  voiceSelect: $("voiceSelect"),
  memoriesList: $("memoriesList"),
  clearMemoriesBtn: $("clearMemoriesBtn"),
  clearHistoryBtn: $("clearHistoryBtn"),
  // memory modal
  memoryModal: $("memoryModal"),
  memoryModalText: $("memoryModalText"),
  memoryAllowBtn: $("memoryAllowBtn"),
  memoryDenyBtn: $("memoryDenyBtn"),
};

/* ============================================================
   INITIALIZATION
   ============================================================ */
function init() {
  loadFromStorage();
  applySettingsToUI();
  renderHistory();
  renderMemories();
  renderWelcomeChips();
  populateVoices();
  attachEventListeners();
  autoResizeTextarea();
}

function loadFromStorage() {
  try {
    state.conversations = JSON.parse(localStorage.getItem(LS.CONVOS) || "[]");
    state.memories = JSON.parse(localStorage.getItem(LS.MEMS) || "[]");
    const savedSettings = JSON.parse(localStorage.getItem(LS.SETTINGS) || "null");
    if (savedSettings) Object.assign(state.settings, savedSettings);
  } catch (e) {
    console.warn("Storage load failed:", e);
  }
}

function saveConversations() {
  if (!state.settings.saveHistory) return;
  localStorage.setItem(LS.CONVOS, JSON.stringify(state.conversations));
}
function saveMemories() {
  localStorage.setItem(LS.MEMS, JSON.stringify(state.memories));
}
function saveSettings() {
  localStorage.setItem(LS.SETTINGS, JSON.stringify(state.settings));
}

/* ============================================================
   CONVERSATIONS
   ============================================================ */
function createConversation() {
  const conv = {
    id: "c_" + Date.now(),
    title: "New Chat",
    messages: [],
    createdAt: Date.now(),
  };
  state.conversations.unshift(conv);
  state.currentId = conv.id;
  saveConversations();
  renderHistory();
  clearMessagesView();
  return conv;
}

function getCurrentConversation() {
  return state.conversations.find((c) => c.id === state.currentId) || null;
}

function clearMessagesView() {
  // Remove all message elements but keep welcome
  [...els.messages.querySelectorAll(".msg")].forEach((el) => el.remove());
  els.welcome.hidden = false;
}

function renderHistory(filter = "") {
  els.historyList.innerHTML = "";
  const list = state.conversations.filter((c) =>
    c.title.toLowerCase().includes(filter.toLowerCase())
  );

  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = filter ? "No matches" : "No conversations yet";
    els.historyList.appendChild(empty);
    return;
  }

  list.forEach((conv) => {
    const div = document.createElement("div");
    div.className = "history-item" + (conv.id === state.currentId ? " active" : "");

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = conv.title;

    const del = document.createElement("span");
    del.className = "delete-conv";
    del.textContent = "🗑";
    del.onclick = (e) => {
      e.stopPropagation();
      deleteConversation(conv.id);
    };

    div.appendChild(title);
    div.appendChild(del);
    div.onclick = () => openConversation(conv.id);
    els.historyList.appendChild(div);
  });
}

function openConversation(id) {
  state.currentId = id;
  renderHistory(els.historySearch.value);
  const conv = getCurrentConversation();
  if (!conv) return;

  clearMessagesView();
  if (conv.messages.length) els.welcome.hidden = true;
  conv.messages.forEach((m) => renderMessage(m.role, m.text, m.attachments, false));
  scrollToBottom();
  closeSidebarMobile();
}

function deleteConversation(id) {
  state.conversations = state.conversations.filter((c) => c.id !== id);
  if (state.currentId === id) {
    state.currentId = null;
    clearMessagesView();
    els.welcome.hidden = false;
  }
  saveConversations();
  renderHistory(els.historySearch.value);
}

/* ============================================================
   MESSAGES
   ============================================================ */
function renderMessage(role, text, attachments = [], animate = true) {
  els.welcome.hidden = true;

  const msg = document.createElement("div");
  msg.className = "msg " + (role === "user" ? "user" : "ai");

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "🧑" : "🤖";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  // Text
  if (text) {
    const textNode = document.createElement("div");
    textNode.textContent = text;
    bubble.appendChild(textNode);
  }

  // Attachments
  if (attachments && attachments.length) {
    attachments.forEach((att) => {
      if (att.type === "image" && att.dataUrl) {
        const img = document.createElement("img");
        img.src = att.dataUrl;
        img.className = "attachment-img";
        bubble.appendChild(img);
      } else if (att.type === "file") {
        const f = document.createElement("div");
        f.className = "attachment-file";
        f.textContent = "📄 " + att.name;
        bubble.appendChild(f);
      }
    });
  }

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  els.messages.appendChild(msg);

  if (animate) scrollToBottom();
  return msg;
}

function renderTyping() {
  const msg = document.createElement("div");
  msg.className = "msg ai";
  msg.id = "typingIndicator";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "🤖";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`;

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  els.messages.appendChild(msg);
  scrollToBottom();
}

function removeTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    els.messages.scrollTop = els.messages.scrollHeight;
  });
}

/* ============================================================
   SENDING MESSAGES
   ============================================================ */
async function handleSend() {
  const text = els.userInput.value.trim();
  const attachments = [...state.pendingAttachments];
  if (!text && attachments.length === 0) return;

  // Ensure conversation exists
  let conv = getCurrentConversation();
  if (!conv) conv = createConversation();

  // Save to conversation
  const userMsg = {
    role: "user",
    text,
    attachments,
    ts: Date.now(),
  };
  conv.messages.push(userMsg);

  // Title = first user message
  if (conv.title === "New Chat" && text) {
    conv.title = text.slice(0, 40) + (text.length > 40 ? "…" : "");
  }

  // Render
  renderMessage("user", text, attachments);
  els.userInput.value = "";
  autoResizeTextarea();
  clearAttachments();
  updateSendButton();

  saveConversations();
  renderHistory(els.historySearch.value);

  // Show typing
  renderTyping();

  // Fake AI reply (Phase 1 only)
  const reply = await fakeAIResponse(text, attachments, conv);

  removeTyping();
  renderMessage("ai", reply);

  conv.messages.push({ role: "ai", text: reply, attachments: [], ts: Date.now() });
  saveConversations();

  // Speak if enabled
  if (state.settings.speakReplies) speakText(reply);

  // Check for memory-worthy content
  maybeOfferMemory(text);
}

/* ============================================================
   FAKE AI (replaced in Phase 2 with Ollama)
   ============================================================ */
function fakeAIResponse(userText, attachments, conv) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let reply = "";

      if (attachments.length) {
        const imgCount = attachments.filter((a) => a.type === "image").length;
        const docCount = attachments.filter((a) => a.type === "file").length;
        reply += `Got it — I received `;
        const parts = [];
        if (imgCount) parts.push(`${imgCount} image(s)`);
        if (docCount) parts.push(`${docCount} document(s)`);
        reply += parts.join(" and ") + ". ";
        reply += `(In Phase 3 I'll actually read them with a vision model.)\n\n`;
      }

      if (userText) {
        reply += `You said: "${userText}"\n\n`;
      }

      reply += `I'm your Phase 1 frontend demo. Right now I reply with placeholder text. Soon I'll connect to a local Ollama model so I can truly understand you. Everything you see here is saved locally in your browser.`;

      // Simple memory hint
      if (/\b(my name is|i am|i'm|remember that|my favorite)\b/i.test(userText)) {
        reply += `\n\n💡 Tip: You just shared something personal. When I detect that, I'll ask permission to save it to memory (see the modal in later phases).`;
      }

      resolve(reply);
    }, 900 + Math.random() * 600);
  });
}

/* ============================================================
   ATTACHMENTS
   ============================================================ */
function handleImageUpload(files) {
  [...files].forEach((file) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      state.pendingAttachments.push({
        type: "image",
        name: file.name,
        dataUrl: e.target.result,
      });
      renderAttachmentPreview();
    };
    reader.readAsDataURL(file);
  });
}

function handleDocUpload(files) {
  [...files].forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      state.pendingAttachments.push({
        type: "file",
        name: file.name,
        textContent: e.target.result,
      });
      renderAttachmentPreview();
    };
    // Read text for txt/md, else just keep name (Phase 3 will parse PDFs)
    if (/\.(txt|md)$/i.test(file.name)) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

function renderAttachmentPreview() {
  els.attachmentItems.innerHTML = "";
  if (!state.pendingAttachments.length) {
    els.attachmentPreview.hidden = true;
    updateSendButton();
    return;
  }
  els.attachmentPreview.hidden = false;

  state.pendingAttachments.forEach((att, i) => {
    const chip = document.createElement("div");
    chip.className = "att-chip";

    if (att.type === "image") {
      const img = document.createElement("img");
      img.src = att.dataUrl;
      chip.appendChild(img);
    }

    const label = document.createElement("span");
    label.textContent =
      att.type === "image" ? "🖼 " + att.name : "📄 " + att.name;
    chip.appendChild(label);

    const remove = document.createElement("span");
    remove.className = "remove-att";
    remove.textContent = "✕";
    remove.onclick = () => {
      state.pendingAttachments.splice(i, 1);
      renderAttachmentPreview();
    };
    chip.appendChild(remove);

    els.attachmentItems.appendChild(chip);
  });

  updateSendButton();
}

function clearAttachments() {
  state.pendingAttachments = [];
  renderAttachmentPreview();
}

/* ============================================================
   VOICE INPUT (Web Speech API)
   ============================================================ */
let recognition = null;
function initSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.continuous = false;
  rec.interimResults = false;
  rec.lang = "en-US";

  rec.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    els.userInput.value = (els.userInput.value + " " + transcript).trim();
    autoResizeTextarea();
    updateSendButton();
  };
  rec.onend = () => {
    state.isRecording = false;
    els.micBtn.classList.remove("recording");
  };
  rec.onerror = (e) => {
    console.warn("Speech error:", e.error);
    state.isRecording = false;
    els.micBtn.classList.remove("recording");
    if (e.error === "not-allowed") {
      alert("Microphone access was blocked. Please allow it in your browser settings.");
    }
  };
  return rec;
}

function toggleRecording() {
  if (!recognition) {
    alert("Voice input is not supported in this browser. Try Chrome or Edge.");
    return;
  }
  if (state.isRecording) {
    recognition.stop();
    state.isRecording = false;
    els.micBtn.classList.remove("recording");
  } else {
    recognition.start();
    state.isRecording = true;
    els.micBtn.classList.add("recording");
  }
}

/* ============================================================
   SPEECH OUTPUT (SpeechSynthesis)
   ============================================================ */
function populateVoices() {
  if (!("speechSynthesis" in window)) return;
  const load = () => {
    const voices = speechSynthesis.getVoices();
    els.voiceSelect.innerHTML = "";
    voices.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v.voiceURI;
      opt.textContent = `${v.name} (${v.lang})`;
      if (v.voiceURI === state.settings.voiceURI) opt.selected = true;
      els.voiceSelect.appendChild(opt);
    });
  };
  load();
  speechSynthesis.onvoiceschanged = load;
}

function speakText(text) {
  if (!("speechSynthesis" in window)) return;
  const utt = new SpeechSynthesisUtterance(text);
  if (state.settings.voiceURI) {
    const v = speechSynthesis.getVoices().find((x) => x.voiceURI === state.settings.voiceURI);
    if (v) utt.voice = v;
  }
  speechSynthesis.cancel();
  speechSynthesis.speak(utt);
}

/* ============================================================
   MEMORY
   ============================================================ */
function renderMemories() {
  els.memoriesList.innerHTML = "";
  if (!state.memories.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No memories saved yet.";
    els.memoriesList.appendChild(empty);
    return;
  }

  state.memories.forEach((mem) => {
    const div = document.createElement("div");
    div.className = "memory-item";

    const text = document.createElement("div");
    text.className = "mem-text";
    text.textContent = mem.text;

    const del = document.createElement("button");
    del.className = "del-mem";
    del.textContent = "🗑";
    del.onclick = () => {
      state.memories = state.memories.filter((m) => m.id !== mem.id);
      saveMemories();
      renderMemories();
    };

    div.appendChild(text);
    div.appendChild(del);
    els.memoriesList.appendChild(div);
  });
}

function addMemory(text) {
  state.memories.unshift({ id: "m_" + Date.now(), text, ts: Date.now() });
  saveMemories();
  renderMemories();
}

// In Phase 1, we only detect memory-worthy phrases and offer a modal example.
function maybeOfferMemory(userText) {
  if (!state.settings.memoryEnabled) return;
  const patterns = [
    /\bmy name is\b/i,
    /\bi am\b/i,
    /\bi'm\b/i,
    /\bmy favorite\b/i,
    /\bi like\b/i,
    /\bi live in\b/i,
    /\bremember that\b/i,
  ];
  const matched = patterns.some((p) => p.test(userText));
  if (!matched) return;

  if (state.settings.autoMemory) {
    addMemory(userText);
    return;
  }
  askMemoryPermission(userText);
}

let pendingMemoryText = null;
function askMemoryPermission(text) {
  pendingMemoryText = text;
  els.memoryModalText.textContent = `"${text}"`;
  els.memoryModal.hidden = false;
}

/* ============================================================
   SETTINGS
   ============================================================ */
function applySettingsToUI() {
  els.memoryToggle.checked = state.settings.memoryEnabled;
  els.autoMemoryToggle.checked = state.settings.autoMemory;
  els.speakToggle.checked = state.settings.speakReplies;
  els.historyToggle.checked = state.settings.saveHistory;
  if (state.settings.voiceURI) els.voiceSelect.value = state.settings.voiceURI;
}

function openSettings() {
  els.settingsPanel.hidden = false;
  closeSidebarMobile();
}
function closeSettings() {
  els.settingsPanel.hidden = true;
}

/* ============================================================
   MOBILE SIDEBAR
   ============================================================ */
function openSidebarMobile() {
  els.sidebar.classList.add("open");
  els.overlay.hidden = false;
}
function closeSidebarMobile() {
  els.sidebar.classList.remove("open");
  els.overlay.hidden = true;
}

/* ============================================================
   TEXTAREA UTILITIES
   ============================================================ */
function autoResizeTextarea() {
  els.userInput.style.height = "auto";
  els.userInput.style.height = Math.min(els.userInput.scrollHeight, 160) + "px";
}

function updateSendButton() {
  const hasText = els.userInput.value.trim().length > 0;
  const hasAtt = state.pendingAttachments.length > 0;
  els.sendBtn.disabled = !(hasText || hasAtt);
}

function renderWelcomeChips() {
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.onclick = () => {
      els.userInput.value = chip.dataset.prompt;
      autoResizeTextarea();
      updateSendButton();
      els.userInput.focus();
    };
  });
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */
function attachEventListeners() {
  // Sidebar / mobile
  els.menuToggle.onclick = openSidebarMobile;
  els.overlay.onclick = closeSidebarMobile;

  // New chat
  els.newChatBtn.onclick = () => {
    createConversation();
    els.userInput.focus();
    closeSidebarMobile();
  };

  // History search
  els.historySearch.oninput = (e) => renderHistory(e.target.value);

  // Input
  els.userInput.addEventListener("input", () => {
    autoResizeTextarea();
    updateSendButton();
  });
  els.userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!els.sendBtn.disabled) handleSend();
    }
  });

  // Send
  els.sendBtn.onclick = handleSend;

  // Attachments
  els.attachImageBtn.onclick = () => els.imageInput.click();
  els.attachDocBtn.onclick = () => els.docInput.click();
  els.imageInput.onchange = (e) => {
    handleImageUpload(e.target.files);
    e.target.value = "";
  };
  els.docInput.onchange = (e) => {
    handleDocUpload(e.target.files);
    e.target.value = "";
  };

  // Mic
  recognition = initSpeechRecognition();
  els.micBtn.onclick = toggleRecording;

  // Settings open/close
  els.openSettingsBtn.onclick = openSettings;
  els.topbarSettings.onclick = openSettings;
  els.closeSettingsBtn.onclick = closeSettings;

  // Settings toggles
  els.memoryToggle.onchange = (e) => {
    state.settings.memoryEnabled = e.target.checked;
    saveSettings();
  };
  els.autoMemoryToggle.onchange = (e) => {
    state.settings.autoMemory = e.target.checked;
    saveSettings();
  };
  els.speakToggle.onchange = (e) => {
    state.settings.speakReplies = e.target.checked;
    saveSettings();
  };
  els.historyToggle.onchange = (e) => {
    state.settings.saveHistory = e.target.checked;
    saveSettings();
  };
  els.voiceSelect.onchange = (e) => {
    state.settings.voiceURI = e.target.value;
    saveSettings();
  };

  // Clear buttons
  els.clearMemoriesBtn.onclick = () => {
    if (confirm("Delete ALL saved memories? This cannot be undone.")) {
      state.memories = [];
      saveMemories();
      renderMemories();
    }
  };
  els.clearHistoryBtn.onclick = () => {
    if (confirm("Delete ALL conversations? This cannot be undone.")) {
      state.conversations = [];
      state.currentId = null;
      saveConversations();
      renderHistory();
      clearMessagesView();
      els.welcome.hidden = false;
    }
  };

  // Memory modal
  els.memoryAllowBtn.onclick = () => {
    if (pendingMemoryText) addMemory(pendingMemoryText);
    pendingMemoryText = null;
    els.memoryModal.hidden = true;
  };
  els.memoryDenyBtn.onclick = () => {
    pendingMemoryText = null;
    els.memoryModal.hidden = true;
  };

  // Global ESC to close things
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!els.memoryModal.hidden) els.memoryModal.hidden = true;
      else if (!els.settingsPanel.hidden) closeSettings();
      else if (els.sidebar.classList.contains("open")) closeSidebarMobile();
    }
  });
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener("DOMContentLoaded", init);