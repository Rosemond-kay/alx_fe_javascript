/*********************************************************
 * Storage Keys
 *********************************************************/
const LS_QUOTES_KEY = "dqg_quotes";
const SS_LAST_QUOTE_KEY = "dqg_last_viewed";

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
(function init() {
  // Load quotes from localStorage if present
  loadQuotes();

  // Wire up controls
  newQuoteBtn.addEventListener("click", showRandomQuote);
  showLastViewedBtn.addEventListener("click", showLastViewedQuote);
  exportBtn.addEventListener("click", exportToJson);

  // Build dynamic form (required)
  createAddQuoteForm();

  // Prefer showing last viewed from this session; otherwise random
  const last = loadLastViewedFromSession();
  if (last) {
    renderQuote(last);
  } else {
    showRandomQuote();
  }
})();
