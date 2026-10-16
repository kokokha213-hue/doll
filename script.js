/* ============================================================
   MY PERSONAL AI — Phase 1 (Clean & Working)
   Settings hidden until user clicks ⚙️
   ============================================================ */

const state = {
  conversations: [],
  currentId: null,
  memories: [],
  settings: {
    memoryEnabled: false,
    autoMemory: false,
    speakReplies: false,
    saveHistory: true,
    voiceURI: null,
  },
  pendingAttachments: [],
  isRecording: false,
};

const LS = {
  CONVOS: "mpai_conversations_v4",
  MEMS: "mpai_memories_v4",
  SETTINGS: "mpai_settings_v4",
};

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
  settingsOverlay: $("settingsOverlay"),
  closeSettingsBtn: $("closeSettingsBtn"),
  memoryToggle: $("memoryToggle"),
  autoMemoryToggle: $("autoMemoryToggle"),
  speakToggle: $("speakToggle"),
  historyToggle: $("historyToggle"),
  voiceSelect: $("voiceSelect"),
  memoriesList: $("memoriesList"),
  clearMemoriesBtn: $("clearMemoriesBtn"),
  clearHistoryBtn: $("clearHistoryBtn"),
};

/* ============================================================
   INIT
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
  updateSendButton();

  // Force settings to be hidden on load
  els.settingsPanel.hidden = true;
  els.settingsOverlay.hidden = true;

  console.log("✅ My Personal AI ready. Settings hidden by default.");
}

function loadFromStorage() {
  try {
    state.conversations = JSON.parse(localStorage.getItem(LS.CONVOS) || "[]");
    state.memories = JSON.parse(localStorage.getItem(LS.MEMS) || "[]");
    const s = JSON.parse(localStorage.getItem(LS.SETTINGS) || "null");
    if (s) Object.assign(state.settings, s);
  } catch (e) { console.warn("Storage load failed:", e); }
}

function saveConversations() {
  if (!state.settings.saveHistory) return;
  try { localStorage.setItem(LS.CONVOS, JSON.stringify(state.conversations)); } catch(e){}
}
function saveMemories() {
  try { localStorage.setItem(LS.MEMS, JSON.stringify(state.memories)); } catch(e){}
}
function saveSettings() {
  try { localStorage.setItem(LS.SETTINGS, JSON.stringify(state.settings)); } catch(e){}
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
  els.welcome.hidden = false;
  return conv;
}

function getCurrentConversation() {
  return state.conversations.find((c) => c.id === state.currentId) || null;
}

function clearMessagesView() {
  [...els.messages.querySelectorAll(".msg")].forEach((el) => el.remove());
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
  if (conv.messages.length) {
    els.welcome.hidden = true;
    conv.messages.forEach((m) => renderMessage(m.role, m.text, m.attachments, false));
    scrollToBottom();
  } else {
    els.welcome.hidden = false;
  }
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

  if (text) {
    const textNode = document.createElement("div");
    textNode.textContent = text;
    bubble.appendChild(textNode);
  }

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
  bubble.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';

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
   SEND
   ============================================================ */
async function handleSend() {
  const text = els.userInput.value.trim();
  const attachments = [...state.pendingAttachments];
  if (!text && attachments.length === 0) return;

  let conv = getCurrentConversation();
  if (!conv) conv = createConversation();

  conv.messages.push({ role: "user", text, attachments, ts: Date.now() });

  if (conv.title === "New Chat" && text) {
    conv.title = text.slice(0, 40) + (text.length > 40 ? "…" : "");
  }

  renderMessage("user", text, attachments);
  els.userInput.value = "";
  autoResizeTextarea();
  clearAttachments();
  updateSendButton();

  saveConversations();
  renderHistory(els.historySearch.value);

  renderTyping();
  const reply = await fakeAIResponse(text, attachments);
  removeTyping();

  renderMessage("ai", reply);
  conv.messages.push({ role: "ai", text: reply, attachments: [], ts: Date.now() });
  saveConversations();

  if (state.settings.speakReplies) speakText(reply);
}

function fakeAIResponse(userText, attachments) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let reply = "";

      if (attachments.length) {
        const imgs = attachments.filter((a) => a.type === "image").length;
        const docs = attachments.filter((a) => a.type === "file").length;
        const parts = [];
        if (imgs) parts.push(`${imgs} image(s)`);
        if (docs) parts.push(`${docs} document(s)`);
        reply += `Got it — I received ${parts.join(" and ")}.\n\n`;
      }

      if (userText) {
        reply += `You said: "${userText}"\n\n`;
      }

      reply += `Main aapka Phase 1 frontend demo hun. Jald hi local Ollama model se connect ho jaunga.`;

      resolve(reply);
    }, 700 + Math.random() * 500);
  });
}

/* ============================================================
   MEMORY (managed only via Settings)
   ============================================================ */
function addMemory(text) {
  state.memories.unshift({ id: "m_" + Date.now(), text, ts: Date.now() });
  saveMemories();
  renderMemories();
}

function renderMemories() {
  els.memoriesList.innerHTML = "";
  if (!state.memories.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent =
