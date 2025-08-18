// =============================
// Quotes Array
// =============================
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Persistence" }
];

// =============================
// Local Storage Helpers
// =============================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch {
      quotes = [];
    }
  }
}

// =============================
// Show Random Quote
// =============================
function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  const category = document.getElementById("categoryFilter").value;

  let filtered = quotes;
  if (category !== "all") {
    filtered = quotes.filter(q => q.category === category);
  }

  if (filtered.length === 0) {
    display.textContent = "No quotes available for this category.";
    return;
  }

  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  display.textContent = `"${quote.text}" — ${quote.category}`;

  // Save last viewed quote to session storage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// =============================
// Add Quote Form
// =============================
function createAddQuoteForm() {
  const form = document.getElementById("addQuoteForm");

  form.innerHTML = `
    <input type="text" id="newQuoteText" placeholder="Enter quote" required />
    <input type="text" id="newQuoteCategory" placeholder="Category" required />
    <button type="submit">Add Quote</button>
  `;

  form.addEventListener("submit", event => {
    event.preventDefault();
    addQuote();
  });
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  if (!textInput.value.trim() || !categoryInput.value.trim()) return;

  quotes.push({
    text: textInput.value.trim(),
    category: categoryInput.value.trim()
  });

  saveQuotes(); // persist

  updateCategoryOptions();

  textInput.value = "";
  categoryInput.value = "";

  showNotice("Quote added!");
  showRandomQuote();
}

// =============================
// Category Filter Options
// =============================
function updateCategoryOptions() {
  const select = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];

  select.innerHTML = `<option value="all">All</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

// =============================
// Export Quotes to JSON
// =============================
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// =============================
// Import Quotes from JSON
// =============================
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        updateCategoryOptions();
        showRandomQuote();
        showNotice("Quotes imported successfully!");
      }
    } catch (err) {
      showNotice("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

// =============================
// Notices
// =============================
function showNotice(message) {
  const notice = document.getElementById("notice");
  notice.textContent = message;
  setTimeout(() => (notice.textContent = ""), 3000);
}

// =============================
// Initialization
// =============================
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes(); // load saved quotes

  createAddQuoteForm();
  updateCategoryOptions();
  showRandomQuote();

  // Restore last viewed quote if exists
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const q = JSON.parse(last);
    document.getElementById("quoteDisplay").textContent =
      `"${q.text}" — ${q.category}`;
  }

  // Button and file input handlers
  document.getElementById("newQuoteBtn").addEventListener("click", showRandomQuote);
  document.getElementById("categoryFilter").addEventListener("change", showRandomQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
});
