(() => {
  "use strict";

  const STORAGE_KEY = "wsKiLearningChatCompleted";
  const model = window.WSLearningChatData;
  if (!model || !Array.isArray(model.chats) || !Array.isArray(model.groups)) return;

  const sidebar = document.getElementById("learning-chat-sidebar");
  const sidebarToggle = document.getElementById("learning-chat-sidebar-toggle");
  const sidebarClose = document.getElementById("learning-chat-sidebar-close");
  const nav = document.getElementById("learning-chat-nav");
  const title = document.getElementById("learning-chat-title");
  const description = document.getElementById("learning-chat-description");
  const status = document.getElementById("learning-chat-status");
  const stream = document.getElementById("learning-chat-stream");
  const composer = document.getElementById("learning-chat-composer");
  const attachmentSlot = document.getElementById("learning-chat-attachment-slot");
  const pauseButton = document.getElementById("learning-chat-pause");
  const nextButton = document.getElementById("learning-chat-next");
  const restartButton = document.getElementById("learning-chat-restart");

  if (!sidebar || !sidebarToggle || !sidebarClose || !nav || !title || !description || !status || !stream || !composer || !attachmentSlot || !pauseButton || !nextButton || !restartButton) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const state = {
    activeChatId: model.defaultChatId,
    stepIndex: 0,
    paused: false,
    waitingForContinue: false,
    completedCurrentRun: false,
    runToken: 0,
    draftText: "",
    draftAttachment: null
  };

  function wait(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
  }

  function getActiveChat() {
    return model.chats.find(chat => chat.id === state.activeChatId) || model.chats[0];
  }

  function getCompletedChats() {
    try {
      return new Set(JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {
      return new Set();
    }
  }

  function markChatComplete(id) {
    const completed = getCompletedChats();
    completed.add(id);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
    } catch {
      // Die Lernsimulation funktioniert auch ohne verfügbaren Session-Storage.
    }
    renderNavigation();
  }

  function updateControls() {
    pauseButton.disabled = state.paused || state.waitingForContinue || state.completedCurrentRun;
    nextButton.disabled = !state.paused && !state.waitingForContinue;
  }

  function updateHeader() {
    const chat = getActiveChat();
    title.textContent = chat.title;
    description.textContent = chat.description;
  }

  function renderNavigation() {
    const completed = getCompletedChats();
    nav.replaceChildren();

    model.groups.forEach(group => {
      const chats = model.chats.filter(chat => chat.group === group.id);
      if (!chats.length) return;

      const section = document.createElement("section");
      section.className = "learning-chat-nav-group";

      const heading = document.createElement("h3");
      heading.className = "learning-chat-nav-group__title";
      heading.textContent = group.label;
      section.append(heading);

      chats.forEach(chat => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "learning-chat-nav-item";
        if (chat.id === state.activeChatId) {
          button.classList.add("is-active");
          button.setAttribute("aria-current", "true");
        }
        if (completed.has(chat.id)) button.classList.add("is-complete");

        const buttonTitle = document.createElement("span");
        buttonTitle.className = "learning-chat-nav-item__title";
        buttonTitle.textContent = chat.title;

        const check = document.createElement("span");
        check.className = "learning-chat-nav-item__check";
        check.setAttribute("aria-hidden", "true");
        check.textContent = "✓";

        const desc = document.createElement("span");
        desc.className = "learning-chat-nav-item__desc";
        desc.textContent = chat.description;

        button.append(buttonTitle, check, desc);
        button.addEventListener("click", () => selectChat(chat.id));
        section.append(button);
      });

      nav.append(section);
    });
  }

  function createAvatar() {
    const avatar = document.createElement("span");
    avatar.className = "learning-chat-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "KI";
    return avatar;
  }

  function createMessage(role, text) {
    const row = document.createElement("article");
    row.className = `learning-chat-message learning-chat-message--${role}`;

    if (role === "assistant") row.append(createAvatar());

    const bubble = document.createElement("div");
    bubble.className = `learning-chat-bubble learning-chat-bubble--${role}`;
    bubble.textContent = text;
    row.append(bubble);
    return row;
  }

  function createAttachmentCard(step) {
    const card = document.createElement("div");
    const kind = step.kind === "pdf" ? "pdf" : "image";
    card.className = `learning-chat-attachment learning-chat-attachment--${kind}`;

    const icon = document.createElement("span");
    icon.className = "learning-chat-attachment__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = kind === "pdf" ? "PDF" : "▧";

    const copy = document.createElement("span");
    copy.className = "learning-chat-attachment__copy";

    const name = document.createElement("span");
    name.className = "learning-chat-attachment__name";
    name.textContent = step.name || (kind === "pdf" ? "Dokument.pdf" : "Bild.png");

    const meta = document.createElement("span");
    meta.className = "learning-chat-attachment__meta";
    meta.textContent = step.meta || (kind === "pdf" ? "PDF-Dokument" : "Bildanhang");

    copy.append(name, meta);
    card.append(icon, copy);
    return card;
  }

  function renderAttachment(step) {
    state.draftAttachment = { ...step };
    attachmentSlot.replaceChildren(createAttachmentCard(step));
  }

  function createUserMessage(text, attachment) {
    const row = document.createElement("article");
    row.className = "learning-chat-message learning-chat-message--user";

    const bubble = document.createElement("div");
    bubble.className = "learning-chat-bubble learning-chat-bubble--user";

    if (attachment) {
      const attachments = document.createElement("div");
      attachments.className = "learning-chat-message__attachments";
      attachments.append(createAttachmentCard(attachment));
      bubble.append(attachments);
    }

    if (text) {
      const textNode = document.createElement("div");
      textNode.textContent = text;
      bubble.append(textNode);
    }

    row.append(bubble);
    return row;
  }

  function renderWorking(step) {
    const row = document.createElement("div");
    row.className = "learning-chat-working";
    row.setAttribute("aria-label", step.text || "KI arbeitet");

    const dots = document.createElement("span");
    dots.className = "learning-chat-working__dots";
    dots.setAttribute("aria-hidden", "true");
    dots.append(document.createElement("span"), document.createElement("span"), document.createElement("span"));

    const copy = document.createElement("span");
    copy.textContent = step.text || "KI arbeitet …";
    row.append(dots, copy);
    stream.append(row);
    scrollToLatest();
    return row;
  }

  function renderLesson(step) {
    const box = document.createElement("aside");
    box.className = "learning-chat-lesson";

    const heading = document.createElement("strong");
    heading.textContent = step.title || "Das hast du gerade gelernt";

    const text = document.createElement("p");
    text.textContent = step.text || "";

    box.append(heading, text);
    stream.append(box);
    scrollToLatest();
  }

  function renderCheckpoint(step) {
    const box = document.createElement("div");
    box.className = "learning-chat-checkpoint";
    if (step.tone === "warning") box.classList.add("learning-chat-checkpoint--warning");

    const text = document.createElement("p");
    text.textContent = step.label || "Weiter, wenn du bereit bist.";
    box.append(text);
    stream.append(box);
    scrollToLatest();
  }

  function renderLink(step) {
    const row = document.createElement("div");
    row.className = "learning-chat-link-row";

    const a = document.createElement("a");
    a.className = "learning-chat-link";
    a.href = step.href;
    a.textContent = step.label;

    row.append(a);
    stream.append(row);
    scrollToLatest();
  }

  function scrollToLatest() {
    requestAnimationFrame(() => {
      stream.scrollTop = stream.scrollHeight;
    });
  }

  async function typeComposer(text, token) {
    state.draftText = "";
    composer.value = "";

    if (reduceMotion.matches) {
      composer.value = text;
      state.draftText = text;
      return;
    }

    for (const char of text) {
      if (token !== state.runToken || state.paused) return;
      await wait(18);
      if (token !== state.runToken || state.paused) return;
      state.draftText += char;
      composer.value = state.draftText;
      composer.scrollTop = composer.scrollHeight;
    }
  }

  function sendDraft() {
    if (!state.draftText && !state.draftAttachment) return;
    stream.append(createUserMessage(state.draftText, state.draftAttachment));
    state.draftText = "";
    state.draftAttachment = null;
    composer.value = "";
    attachmentSlot.replaceChildren();
    scrollToLatest();
  }

  async function runStep(step, token) {
    switch (step.type) {
      case "assistant":
        if (!reduceMotion.matches) await wait(180);
        if (token !== state.runToken) return;
        stream.append(createMessage("assistant", step.text || ""));
        scrollToLatest();
        break;

      case "compose":
        status.textContent = "Beispiel wird geschrieben …";
        await typeComposer(step.text || "", token);
        break;

      case "attachment":
        renderAttachment(step);
        if (!reduceMotion.matches) await wait(260);
        break;

      case "send":
        if (!reduceMotion.matches) await wait(160);
        if (token !== state.runToken) return;
        sendDraft();
        status.textContent = "Läuft";
        break;

      case "working": {
        const working = renderWorking(step);
        await wait(reduceMotion.matches ? 20 : 720);
        working.remove();
        break;
      }

      case "lesson":
        renderLesson(step);
        break;

      case "link":
        renderLink(step);
        break;

      case "checkpoint":
        renderCheckpoint(step);
        state.waitingForContinue = true;
        status.textContent = step.tone === "warning" ? "Stopp – erst kurz prüfen" : "Wartet auf dich";
        updateControls();
        break;

      default:
        console.warn("Unbekannter Lern-Chat-Schritt:", step.type, step);
    }
  }

  async function playFromCurrentStep() {
    const chat = getActiveChat();
    if (!chat) return;

    const token = ++state.runToken;
    state.completedCurrentRun = false;
    if (!state.paused && !state.waitingForContinue) status.textContent = "Läuft";
    updateControls();

    while (state.stepIndex < chat.steps.length && token === state.runToken) {
      if (state.paused || state.waitingForContinue) return;

      const step = chat.steps[state.stepIndex];
      await runStep(step, token);
      if (token !== state.runToken) return;

      state.stepIndex += 1;
      if (state.paused || state.waitingForContinue) return;
    }

    if (state.stepIndex >= chat.steps.length && token === state.runToken) {
      state.completedCurrentRun = true;
      markChatComplete(chat.id);
      status.textContent = "Lern-Chat abgeschlossen ✓";
      updateControls();
    }
  }

  function pausePlayback() {
    if (state.completedCurrentRun || state.waitingForContinue) return;
    state.paused = true;
    state.runToken += 1;
    status.textContent = "Pausiert";
    updateControls();
  }

  function continuePlayback() {
    if (!state.paused && !state.waitingForContinue) return;
    state.paused = false;
    state.waitingForContinue = false;
    status.textContent = "Läuft";
    updateControls();
    playFromCurrentStep();
  }

  function restartChat() {
    state.runToken += 1;
    state.stepIndex = 0;
    state.paused = false;
    state.waitingForContinue = false;
    state.completedCurrentRun = false;
    state.draftText = "";
    state.draftAttachment = null;
    stream.replaceChildren();
    composer.value = "";
    attachmentSlot.replaceChildren();
    status.textContent = "Startet …";
    updateControls();
    playFromCurrentStep();
  }

  function selectChat(id) {
    if (!model.chats.some(chat => chat.id === id)) return;
    state.activeChatId = id;
    updateHeader();
    renderNavigation();
    restartChat();
    toggleSidebar(false);
  }

  function toggleSidebar(force) {
    const open = typeof force === "boolean"
      ? force
      : !sidebar.classList.contains("is-open");
    sidebar.classList.toggle("is-open", open);
    sidebarToggle.setAttribute("aria-expanded", String(open));
    if (open && window.innerWidth <= 860) {
      sidebar.querySelector(".learning-chat-nav-item")?.focus();
    }
  }

  pauseButton.addEventListener("click", pausePlayback);
  nextButton.addEventListener("click", continuePlayback);
  restartButton.addEventListener("click", restartChat);
  sidebarToggle.addEventListener("click", () => toggleSidebar());
  sidebarClose.addEventListener("click", () => toggleSidebar(false));

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
      toggleSidebar(false);
      sidebarToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860 && sidebar.classList.contains("is-open")) {
      toggleSidebar(false);
    }
  });

  renderNavigation();
  updateHeader();
  selectChat(model.defaultChatId);
})();
