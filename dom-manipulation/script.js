// =============================
// Quotes Array
// =============================
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Persistence" }
];

// =============================
// Show Random Quote
// =============================
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available.";
    return;
  }

  // Apply category filter
  const category = document.getElementById("categoryFilter").value;
  let filtered = quotes;
  if (category !== "all") {
    filtered = quotes.filter(q => q.category.toLowerCase() === category.toLowerCase());
  }

  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];

  document.getElementById("quoteDisplay").textContent =
    `"${quote.text}" — ${quote.category}`;
}

// =============================
// Add Quote
// =============================
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  if (!textInput.value.trim() || !categoryInput.value.trim()) return;

  quotes.push({
    text: textInput.value.trim(),
    category: categoryInput.value.trim()
  });

  // Update category filter options dynamically
  updateCategoryOptions();

  // Reset form
  textInput.value = "";
  categoryInput.value = "";

  showNotice("Quote added!");
  showRandomQuote();
}

// =============================
// Create Add Quote Form Dynamically
// =============================
function createAddQuoteForm() {
  const container = document.getElementById("addQuoteContainer");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addBtn);
}

// =============================
// Category Filter Options
// =============================
function updateCategoryOptions() {
  const select = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];

  // Reset
  select.innerHTML = "";
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent =
      cat === "all" ? "All Categories" : cat;
    select.appendChild(opt);
  });
}

// =============================
// JSON Export / Import
// =============================
function exportQuotes() {
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

function importQuotes(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes = imported;
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
// Notifications
// =============================
function showNotice(msg) {
  const noticeArea = document.getElementById("notices");
  const div = document.createElement("div");
  div.textContent = msg;
  div.className = "notice";
  noticeArea.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// =============================
// Event Listeners
// =============================
document.addEventListener("DOMContentLoaded", () => {
  // Build UI
  createAddQuoteForm();
  updateCategoryOptions();
  showRandomQuote();

  // Show new quote
  document.getElementById("newQuote")
    .addEventListener("click", showRandomQuote);

  // Filter quotes
  document.getElementById("categoryFilter")
    .addEventListener("change", showRandomQuote);

  // Export
  document.getElementById("exportBtn")
    .addEventListener("click", exportQuotes);

  // Import
  document.getElementById("importFile")
    .addEventListener("change", e => {
      if (e.target.files.length > 0) {
        importQuotes(e.target.files[0]);
      }
    });
});
