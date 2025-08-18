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
// Add New Quote
// =============================
function addQuote() {
  const text = document.getElementById("newQuote").value.trim();
  const category = document.getElementById("newCategory").value.trim();
  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    showRandomQuote();
    document.getElementById("newQuote").value = "";
    document.getElementById("newCategory").value = "";
  }
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
// Event Listeners
// =============================
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  restoreLastQuote();

  document.getElementById("newQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("newQuoteBtnRandom").addEventListener("click", showRandomQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
  document.getElementById("categoryFilter").addEventListener("change", showRandomQuote);
});
