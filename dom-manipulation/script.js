// =============================
// Quotes Array
// =============================
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Persistence" }
];

// =============================
// Save & Load from LocalStorage
// =============================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

// =============================
// Save Last Quote in SessionStorage
// =============================
function saveLastQuote(quote) {
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function restoreLastQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const q = JSON.parse(last);
    document.getElementById("quoteDisplay").textContent =
      `"${q.text}" — ${q.category}`;
  }
}

// =============================
// Populate Categories Dropdown
// =============================
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  select.innerHTML = ""; // clear
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // restore last saved category
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && categories.includes(savedCategory)) {
    select.value = savedCategory;
  }
}

// =============================
// Filter Quotes by Category
// =============================
function filterQuote(category) {
  if (category === "all") {
    return quotes;
  }
  return quotes.filter(q => q.category.toLowerCase() === category.toLowerCase());
}

// =============================
// Show Random Quote
// =============================
function showRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  const filtered = filterQuote(category);

  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").textContent =
      "No quotes available for this category.";
    return;
  }

  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("quoteDisplay").textContent =
    `"${quote.text}" — ${quote.category}`;

  saveLastQuote(quote);
  localStorage.setItem("selectedCategory", category); // save category
}

// =============================
// Add New Quote + Post to Server
// =============================
async function addQuote() {
  const text = document.getElementById("newQuote").value.trim();
  const category = document.getElementById("newCategory").value.trim();
  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    showRandomQuote();
    document.getElementById("newQuote").value = "";
    document.getElementById("newCategory").value = "";

    // Post to server too
    try {
      await postQuoteToServer(newQuote);
      addNotice("Quote also posted to server ✅");
    } catch (err) {
      addNotice("Failed to post new quote to server ❌");
    }
  }
}

// Render form dynamically
function renderAddQuoteForm() {
  const container = document.getElementById("addQuoteContainer");
  container.innerHTML = `
    <h2>Add a New Quote</h2>
    <form id="addQuoteForm">
      <input type="text" id="newQuote" placeholder="Enter quote" required />
      <input type="text" id="newCategory" placeholder="Enter category" required />
      <button type="submit">Add Quote</button>
    </form>
  `;

  // handle submit
  document.getElementById("addQuoteForm").addEventListener("submit", (e) => {
    e.preventDefault(); // prevent page reload
    addQuote();
  });
}

// =============================
// Export Quotes as JSON
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
// Import Quotes from JSON File
// =============================
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// =============================
// Mock Server API
// =============================
async function fetchQuotesFromServer() {
  // Simulate API fetch
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { text: "Server quote: Knowledge is power.", category: "Wisdom" },
        { text: "Server quote: Keep pushing forward.", category: "Motivation" }
      ]);
    }, 1000);
  });
}

async function postQuoteToServer(quote) {
  // Simulate API post
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("Posted to server:", quote);
      resolve({ success: true });
    }, 500);
  });
}

// =============================
// Conflict Resolution
// =============================
function resolveConflicts(serverQuotes) {
  const texts = new Set(quotes.map(q => q.text));
  let conflicts = [];

  serverQuotes.forEach(sq => {
    if (!texts.has(sq.text)) {
      quotes.push(sq);
    } else {
      // mark as conflict
      conflicts.push(sq.text);
    }
  });

  if (conflicts.length > 0) {
    addNotice(`Conflicts detected: ${conflicts.length} duplicate(s) skipped.`);
  }
}

// =============================
// Sync Quotes with Server
// =============================
async function syncQuotes() {
  const status = document.getElementById("syncStatus");
  status.textContent = "Syncing…";

  try {
    const serverQuotes = await fetchQuotesFromServer();

    resolveConflicts(serverQuotes); // now handles duplicates
    saveQuotes();
    populateCategories();

    status.textContent = "Sync complete ✅";
    addNotice("Quotes synced with server!");
  } catch (err) {
    status.textContent = "Sync failed ❌";
    addNotice("Error syncing with server.");
  }
}

// =============================
// UI Notices
// =============================
function addNotice(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  div.style.padding = "5px";
  div.style.marginTop = "5px";
  div.style.borderRadius = "4px";
  div.style.backgroundColor = msg.includes("❌") ? "#fdd" : "#dfd";
  document.getElementById("notices").appendChild(div);
}

// =============================
// Event Listeners
// =============================
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  restoreLastQuote();
  renderAddQuoteForm();

  document.getElementById("newQuoteBtnRandom").addEventListener("click", showRandomQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
  document.getElementById("categoryFilter").addEventListener("change", showRandomQuote);
  document.getElementById("syncNowBtn").addEventListener("click", syncQuotes);

  // auto-sync every 30s
  setInterval(syncQuotes, 30000);
});
