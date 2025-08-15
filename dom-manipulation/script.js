/*********************************************************
 * Storage Keys
 *********************************************************/
const LS_QUOTES_KEY = "dqg_quotes";
const SS_LAST_QUOTE_KEY = "dqg_last_viewed";
const LS_LAST_CATEGORY_KEY = "dqg_last_category";   // NEW: persist category filter


/*********************************************************
 * State
 *********************************************************/
// Default seed quotes (used only if nothing in localStorage)
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Resilience" }
];

/*********************************************************
 * DOM Refs
 *********************************************************/
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const showLastViewedBtn = document.getElementById("showLastViewed");
const exportBtn = document.getElementById("exportJson");
const formContainer = document.getElementById("formContainer");
const categoryFilter = document.getElementById("categoryFilter"); // NEW

/*********************************************************
 * Category Helpers
 *********************************************************/
function getUniqueCategories() {
  const categories = quotes.map(q => q.category.trim());
  return [...new Set(categories)];
}

function populateCategories() {
  // Clear existing options except "All"
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const uniqueCategories = getUniqueCategories();
  uniqueCategories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  // Restore last selected filter if exists
  const lastFilter = localStorage.getItem(LS_LAST_CATEGORY_KEY) || "all";
  categoryFilter.value = lastFilter;
}

/*********************************************************
 * Filter Quotes
 *********************************************************/
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;

  // Save the chosen filter so it's remembered
  localStorage.setItem(LS_LAST_CATEGORY_KEY, selectedCategory);

  // If "all" is selected, show a random quote from the full list
  if (selectedCategory === "all") {
    showRandomQuote();
    return;
  }

  // Filter the quotes array based on category
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  // If no quotes match, show a message
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = `No quotes available in "${selectedCategory}" category.`;
    return;
  }

  // Pick a random quote from the filtered list and display it
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const chosenQuote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${chosenQuote.text}"</p>
    <small>- Category: ${chosenQuote.category}</small>
  `;

  // Save last viewed quote to session storage
  saveLastViewedToSession(chosenQuote);
}

/*********************************************************
 * Modified addQuote (updates categories too)
 *********************************************************/
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote text and category!");
    return;
  }

  const newObj = { text: newText, category: newCategory };
  quotes.push(newObj);
  saveQuotes();
  renderQuote(newObj);
  saveLastViewedToSession(newObj);

  // ✅ Update categories dropdown dynamically
  populateCategories();

  textInput.value = "";
  categoryInput.value = "";
  alert("New quote added successfully!");
}

/*********************************************************
 * Local & Session Storage Helpers
 *********************************************************/
function saveQuotes() {
  try {
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save quotes to localStorage:", err);
    alert("Could not save quotes to local storage. Check browser settings.");
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Validate minimal shape
      quotes = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
    }
  } catch (err) {
    console.warn("Invalid quotes in localStorage. Using defaults.", err);
  }
}

function saveLastViewedToSession(quoteObj) {
  try {
    sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quoteObj));
  } catch (err) {
    console.error("Failed to save last viewed quote to sessionStorage:", err);
  }
}

function loadLastViewedFromSession() {
  try {
    const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/*********************************************************
 * UI: Render Helpers
 *********************************************************/
function renderQuote(q) {
  if (!q) {
    quoteDisplay.textContent = "No quotes available. Please add one!";
    return;
  }
  quoteDisplay.innerHTML = `
    <p>"${q.text}"</p>
    <small>- Category: ${q.category}</small>
  `;
}

/*********************************************************
 * Core Features
 *********************************************************/
function showRandomQuote() {
  if (quotes.length === 0) {
    renderQuote(null);
    return;
  }
  const idx = Math.floor(Math.random() * quotes.length);
  const q = quotes[idx];
  renderQuote(q);
  // Persist last viewed for this session
  saveLastViewedToSession(q);
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote text and category!");
    return;
  }

  const newObj = { text: newText, category: newCategory };
  quotes.push(newObj);
  saveQuotes();                 // ✅ Persist to localStorage on every add
  renderQuote(newObj);          // Show immediately
  saveLastViewedToSession(newObj);

  textInput.value = "";
  categoryInput.value = "";
  alert("New quote added successfully!");
}

/*********************************************************
 * Dynamic Form Creation (required by checker)
 *********************************************************/
function createAddQuoteForm() {
  const form = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";
  textInput.style.marginRight = "8px";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.marginRight = "8px";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(addBtn);

  formContainer.appendChild(form);
}

/*********************************************************
 * Export / Import (JSON)
 *********************************************************/
function exportToJson() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const ts = new Date();
    const stamp = [
      ts.getFullYear(),
      String(ts.getMonth() + 1).padStart(2, "0"),
      String(ts.getDate()).padStart(2, "0"),
      String(ts.getHours()).padStart(2, "0"),
      String(ts.getMinutes()).padStart(2, "0")
    ].join("");
    a.href = url;
    a.download = `quotes-export-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Export failed. See console for details.");
  }
}

// Exact signature & wiring per the task spec
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) {
        alert("Invalid file format: expected an array of quotes.");
        return;
      }

      // Minimal schema validation & normalization
      const valid = importedQuotes
        .filter(q => q && typeof q.text === "string" && typeof q.category === "string")
        .map(q => ({ text: q.text.trim(), category: q.category.trim() }))
        .filter(q => q.text && q.category);

      if (valid.length === 0) {
        alert("No valid quotes found in the file.");
        return;
      }

      quotes.push(...valid);
      saveQuotes();
      alert(`Quotes imported successfully! (${valid.length} added)`);
    } catch (err) {
      console.error("Import failed:", err);
      alert("Failed to import JSON. Make sure the file is valid.");
    } finally {
      // Clear file input to allow re-importing same file if needed
      const input = document.getElementById("importFile");
      if (input) input.value = "";
    }
  };
  const file = event.target.files && event.target.files[0];
  if (file) {
    fileReader.readAsText(file);
  }
}

/*********************************************************
 * Session Feature: Show Last Viewed
 *********************************************************/
function showLastViewedQuote() {
  const last = loadLastViewedFromSession();
  if (!last) {
    alert("No last viewed quote found for this session.");
    return;
  }
  renderQuote(last);
}

/*********************************************************
 * Init
 *********************************************************/

/*********************************************************
 * Config
 *********************************************************/
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API
const SYNC_INTERVAL_MS = 30000; // 30s

/*********************************************************
 * Storage Keys
 *********************************************************/
const LS_QUOTES_KEY = "dqg_quotes";
const SS_LAST_QUOTE_KEY = "dqg_last_viewed";
const LS_LAST_CATEGORY_KEY = "dqg_last_category";
const LS_CONFLICTS_KEY = "dqg_conflicts";
const LS_LAST_SYNC_AT_KEY = "dqg_last_sync_at";

/*********************************************************
 * State
 *********************************************************/
// Default seed quotes (used only if nothing in localStorage)
let quotes = [
  { id: makeId(), text: "The best way to get started is to quit talking and begin doing.", category: "Motivation", updatedAt: Date.now() },
  { id: makeId(), text: "Don't let yesterday take up too much of today.", category: "Inspiration", updatedAt: Date.now() },
  { id: makeId(), text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Resilience", updatedAt: Date.now() }
];

// Conflicts: { id, server: Quote, localBefore: Quote, resolved:boolean, choice?:'server'|'local', resolvedAt?:number }
let conflicts = [];

let isSyncing = false;
let syncTimer = null;

/*********************************************************
 * DOM Refs
 *********************************************************/
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const showLastViewedBtn = document.getElementById("showLastViewed");
const exportBtn = document.getElementById("exportJson");
const formContainer = document.getElementById("formContainer");
const categoryFilter = document.getElementById("categoryFilter");

const syncNowBtn = document.getElementById("syncNow");
const syncStatusEl = document.getElementById("syncStatus");
const reviewConflictsBtn = document.getElementById("reviewConflicts");
const conflictPanel = document.getElementById("conflictPanel");
const lastSyncAtEl = document.getElementById("lastSyncAt");

/*********************************************************
 * Utilities
 *********************************************************/
function makeId() {
  return "q_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function shallowEqualQuote(a, b) {
  return a && b && a.text === b.text && a.category === b.category;
}

function nowStamp() {
  const d = new Date();
  return `${d.toLocaleString()}`;
}

/*********************************************************
 * Local & Session Storage Helpers
 *********************************************************/
function saveQuotes() {
  try {
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save quotes to localStorage:", err);
    alert("Could not save quotes to local storage. Check browser settings.");
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      quotes = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
    }
  } catch (err) {
    console.warn("Invalid quotes in localStorage. Using defaults.", err);
  }
}

function saveLastViewedToSession(quoteObj) {
  try {
    sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quoteObj));
  } catch (err) {
    console.error("Failed to save last viewed quote to sessionStorage:", err);
  }
}

function loadLastViewedFromSession() {
  try {
    const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveConflicts() {
  localStorage.setItem(LS_CONFLICTS_KEY, JSON.stringify(conflicts));
}
function loadConflicts() {
  try {
    const raw = localStorage.getItem(LS_CONFLICTS_KEY);
    conflicts = raw ? JSON.parse(raw) : [];
  } catch {
    conflicts = [];
  }
}

function setLastSyncAt(ts) {
  localStorage.setItem(LS_LAST_SYNC_AT_KEY, String(ts));
  lastSyncAtEl.textContent = `Last sync: ${nowStamp()}`;
}

/*********************************************************
 * UI: Render Helpers
 *********************************************************/
function renderQuote(q) {
  if (!q) {
    quoteDisplay.textContent = "No quotes available. Please add one!";
    return;
  }
  quoteDisplay.innerHTML = `
    <p>"${q.text}"</p>
    <small>- Category: ${q.category}</small>
  `;
}

function showSyncStatus(msg, type = "info") {
  syncStatusEl.textContent = msg;
  syncStatusEl.style.opacity = "0.9";
  syncStatusEl.style.padding = "2px 6px";
  syncStatusEl.style.borderRadius = "6px";
  syncStatusEl.style.marginLeft = "8px";
  syncStatusEl.style.display = "inline-block";
  syncStatusEl.style.background = type === "error" ? "#ffd6d6" : type === "success" ? "#d6ffe0" : "#eef";
}

/*********************************************************
 * Categories
 *********************************************************/
function getUniqueCategories() {
  const categories = quotes.map(q => q.category.trim());
  return [...new Set(categories)];
}

function populateCategories() {
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  getUniqueCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
  const lastFilter = localStorage.getItem(LS_LAST_CATEGORY_KEY) || "all";
  categoryFilter.value = lastFilter;
}

/*********************************************************
 * Core Features (Display & Add)
 *********************************************************/
function showRandomQuote() {
  const selected = categoryFilter.value;
  let pool = quotes;
  if (selected !== "all") {
    pool = quotes.filter(q => q.category === selected);
  }
  if (pool.length === 0) {
    quoteDisplay.textContent = selected === "all"
      ? "No quotes available. Please add one!"
      : `No quotes available in "${selected}" category.`;
    return;
  }
  const idx = Math.floor(Math.random() * pool.length);
  const q = pool[idx];
  renderQuote(q);
  saveLastViewedToSession(q);
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote text and category!");
    return;
  }

  const newObj = { id: makeId(), text: newText, category: newCategory, updatedAt: Date.now() };
  quotes.push(newObj);
  saveQuotes();
  renderQuote(newObj);
  saveLastViewedToSession(newObj);

  // Update categories dropdown dynamically
  populateCategories();

  textInput.value = "";
  categoryInput.value = "";
  alert("New quote added successfully!");
}

function createAddQuoteForm() {
  const form = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";
  textInput.style.marginRight = "8px";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.marginRight = "8px";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(addBtn);

  formContainer.appendChild(form);
}

/*********************************************************
 * Filter Quotes
 *********************************************************/
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem(LS_LAST_CATEGORY_KEY, selectedCategory);

  if (selectedCategory === "all") {
    showRandomQuote();
    return;
  }

  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = `No quotes available in "${selectedCategory}" category.`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const chosenQuote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${chosenQuote.text}"</p>
    <small>- Category: ${chosenQuote.category}</small>
  `;

  saveLastViewedToSession(chosenQuote);
}

/*********************************************************
 * Import / Export (JSON)
 *********************************************************/
function exportToJson() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const ts = new Date();
    const stamp = [
      ts.getFullYear(),
      String(ts.getMonth() + 1).padStart(2, "0"),
      String(ts.getDate()).padStart(2, "0"),
      String(ts.getHours()).padStart(2, "0"),
      String(ts.getMinutes()).padStart(2, "0")
    ].join("");
    a.href = url;
    a.download = `quotes-export-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Export failed. See console for details.");
  }
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) {
        alert("Invalid file format: expected an array of quotes.");
        return;
      }

      const valid = importedQuotes
        .filter(q => q && typeof q.text === "string" && typeof q.category === "string")
        .map(q => ({
          id: q.id || makeId(),
          text: q.text.trim(),
          category: q.category.trim(),
          serverId: q.serverId,               // preserve if present
          updatedAt: q.updatedAt || Date.now()
        }))
        .filter(q => q.text && q.category);

      if (valid.length === 0) {
        alert("No valid quotes found in the file.");
        return;
      }

      quotes.push(...valid);
      saveQuotes();
      populateCategories();
      filterQuotes();

      alert(`Quotes imported successfully! (${valid.length} added)`);
    } catch (err) {
      console.error("Import failed:", err);
      alert("Failed to import JSON. Make sure the file is valid.");
    } finally {
      const input = document.getElementById("importFile");
      if (input) input.value = "";
    }
  };
  const file = event.target.files && event.target.files[0];
  if (file) {
    fileReader.readAsText(file);
  }
}

/*********************************************************
 * Server Sync (Simulation via JSONPlaceholder)
 *********************************************************/
// Map a JSONPlaceholder post to our Quote model.
// We'll tag category as "Server" to keep things simple.
function mapServerPostToQuote(post) {
  return {
    id: `server_${post.id}`,        // local id derived from server id
    serverId: post.id,              // track the server id for conflict detection
    text: String(post.title || "").trim() || "(untitled)",
    category: "Server",             // simulated category
    updatedAt: Date.now()           // we don't have real updated time; simulate
  };
}

// Fetch "server" data
async function fetchServerQuotes() {
  const res = await fetch(`${SERVER_URL}?_limit=10`);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const posts = await res.json();
  return posts.map(mapServerPostToQuote);
}

// Push a local unsynced quote to "server"
async function pushLocalQuoteToServer(quote) {
  const payload = { title: quote.text, body: quote.category, userId: 1 };
  const res = await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(payload)
  });
  // JSONPlaceholder returns a fake id (e.g., 101) – good enough for simulation
  if (!res.ok) throw new Error(`POST failed: ${res.status}`);
  const created = await res.json();
  return created.id;
}

// Conflict detection & merge (server-wins by default)
function mergeServerIntoLocal(serverQuotes) {
  let conflictsFound = 0;
  const localByServerId = new Map(
    quotes.filter(q => q.serverId != null).map(q => [q.serverId, q])
  );

  for (const s of serverQuotes) {
    const local = localByServerId.get(s.serverId);

    if (!local) {
      // New from server: add locally
      quotes.push(s);
      continue;
    }

    // Same "record", check if fields differ
    if (!shallowEqualQuote(local, s)) {
      // Server-wins: record conflict & replace local
      const conflict = {
        id: "c_" + s.serverId + "_" + Date.now(),
        server: s,
        localBefore: { ...local },
        resolved: false
      };
      conflicts.push(conflict);
      conflictsFound++;

      // Replace local values with server
      local.text = s.text;
      local.category = s.category;
      local.updatedAt = s.updatedAt;
    }
  }

  if (conflictsFound > 0) {
    saveConflicts();
    showSyncStatus(`Conflicts detected (${conflictsFound}). Server changes applied.`, "info");
  }
}

// Try to push any local quotes that don't have a serverId yet
async function pushUnsyncedLocals() {
  const unsynced = quotes.filter(q => q.serverId == null);
  for (const q of unsynced) {
    try {
      const serverId = await pushLocalQuoteToServer(q);
      q.serverId = serverId;
      q.id = `server_${serverId}`;  // align local id with server for future matches
      q.updatedAt = Date.now();
    } catch (e) {
      console.warn("Failed to push a local quote:", e);
      showSyncStatus("Some local changes could not be pushed.", "error");
    }
  }
}

// One full sync cycle
async function syncWithServer() {
  if (isSyncing) return;
  isSyncing = true;
  showSyncStatus("Syncing…");

  try {
    // 1) Pull server data
    const serverQuotes = await fetchServerQuotes();

    // 2) Merge (server-wins)
    mergeServerIntoLocal(serverQuotes);

    // 3) Push local unsynced
    await pushUnsyncedLocals();

    // Save & refresh UI bits
    saveQuotes();
    populateCategories();
    // Keep current filter selection respected
    filterQuotes();

    setLastSyncAt(Date.now());
    showSyncStatus("Sync complete.", "success");
  } catch (e) {
    console.error(e);
    showSyncStatus("Sync failed.", "error");
  } finally {
    isSyncing = false;
  }
}

/*********************************************************
 * Conflict UI (manual resolution option)
 *********************************************************/
function renderConflictsPanel() {
  conflictPanel.innerHTML = "";

  if (!conflicts || conflicts.length === 0) {
    conflictPanel.innerHTML = `<em>No conflicts to review.</em>`;
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.style.border = "1px solid #ddd";
  wrapper.style.padding = "12px";
  wrapper.style.borderRadius = "8px";

  const heading = document.createElement("h3");
  heading.textContent = "Conflicts (Server wins applied)";
  heading.style.marginTop = "0";
  wrapper.appendChild(heading);

  conflicts.forEach((c, idx) => {
    const block = document.createElement("div");
    block.style.borderTop = "1px dashed #ccc";
    block.style.paddingTop = "8px";
    block.style.marginTop = "8px";

    const status = c.resolved ? `Resolved (${c.choice})` : "Unresolved";
    block.innerHTML = `
      <div><strong>#${idx + 1} — ${status}</strong></div>
      <div style="margin-top:6px;">
        <div><u>Server</u>: "${c.server.text}" <small>(${c.server.category})</small></div>
        <div><u>Local (before)</u>: "${c.localBefore.text}" <small>(${c.localBefore.category})</small></div>
      </div>
    `;

    const actions = document.createElement("div");
    actions.style.marginTop = "6px";

    const keepServerBtn = document.createElement("button");
    keepServerBtn.textContent = "Keep Server";
    keepServerBtn.onclick = () => resolveConflict(c.id, "server");

    const keepLocalBtn = document.createElement("button");
    keepLocalBtn.textContent = "Keep Local (override)";
    keepLocalBtn.style.marginLeft = "8px";
    keepLocalBtn.onclick = () => resolveConflict(c.id, "local");

    actions.appendChild(keepServerBtn);
    actions.appendChild(keepLocalBtn);
    block.appendChild(actions);

    wrapper.appendChild(block);
  });

  conflictPanel.appendChild(wrapper);
}

async function resolveConflict(conflictId, choice) {
  const i = conflicts.findIndex(c => c.id === conflictId);
  if (i === -1) return;

  const c = conflicts[i];
  if (c.resolved) {
    alert("This conflict is already resolved.");
    return;
  }

  if (choice === "server") {
    // Already applied (server-wins). Just mark resolved.
    c.resolved = true;
    c.choice = "server";
    c.resolvedAt = Date.now();
  } else if (choice === "local") {
    // Restore the local version and (optionally) try to PUT to server
    // Note: JSONPlaceholder accepts PUT/PATCH but won't persist. Simulation only.
    const local = quotes.find(q => q.serverId === c.server.serverId);
    if (local) {
      local.text = c.localBefore.text;
      local.category = c.localBefore.category;
      local.updatedAt = Date.now();

      if (local.serverId != null) {
        try {
          await fetch(`${SERVER_URL}/${local.serverId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({ title: local.text, body: local.category, userId: 1, id: local.serverId })
          });
        } catch (e) {
          console.warn("PUT to server failed (simulation).", e);
        }
      }
    }
    c.resolved = true;
    c.choice = "local";
    c.resolvedAt = Date.now();
    saveQuotes();
    populateCategories();
    filterQuotes();
  }

  saveConflicts();
  renderConflictsPanel();
  showSyncStatus(`Conflict resolved (${choice}).`, "success");
}

/*********************************************************
 * Init
 *********************************************************/
(function init() {
  // Load persisted data
  loadQuotes();
  loadConflicts();

  // Wire up controls
  newQuoteBtn.addEventListener("click", filterQuotes);
  showLastViewedBtn.addEventListener("click", showLastViewedQuote);
  exportBtn.addEventListener("click", exportToJson);
  syncNowBtn.addEventListener("click", syncWithServer);
  reviewConflictsBtn.addEventListener("click", renderConflictsPanel);

  // Build UI pieces
  createAddQuoteForm();
  populateCategories();

  // Restore last filter view immediately
  filterQuotes();

  // Show last sync time
  const lastSyncAt = localStorage.getItem(LS_LAST_SYNC_AT_KEY);
  if (lastSyncAt) lastSyncAtEl.textContent = `Last sync: ${nowStamp()}`;

  // Start periodic sync
  syncTimer = setInterval(syncWithServer, SYNC_INTERVAL_MS);
})();


(function init() {
  loadQuotes();
  populateCategories();   // ✅ Populate dropdown on load

  newQuoteBtn.addEventListener("click", filterQuotes);  // use filter-aware show
  showLastViewedBtn.addEventListener("click", showLastViewedQuote);
  exportBtn.addEventListener("click", exportToJson);

  createAddQuoteForm();

  // Restore last filter: show filtered quote immediately
  filterQuotes();
})();
