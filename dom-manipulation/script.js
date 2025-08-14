// script.js

// Load quotes from localStorage or use default quotes
let storedQuotes = JSON.parse(localStorage.getItem("quotes"));
let quotes = storedQuotes || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" },
  { text: "You miss 100% of the shots you don't take.", category: "motivation" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");

// Utility to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Populate category dropdown dynamically
function populateCategories() {
  // Extract unique categories from quotes
  const uniqueCategories = Array.from(new Set(quotes.map(q => q.category.toLowerCase())));
  
  // Clear existing except "all"
  categorySelect.innerHTML = '<option value="all">All</option>';
  
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = capitalize(cat);
    categorySelect.appendChild(option);
  });
}

// Show random quote based on selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — Category: ${capitalize(quote.category)}`;

  // Save last viewed quote and category in sessionStorage
  sessionStorage.setItem('lastCategory', selectedCategory);
  sessionStorage.setItem('lastQuoteText', quote.text);
}

// Add new quote from form inputs
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim().toLowerCase();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  if (quotes.some(q => q.text.toLowerCase() === text.toLowerCase())) {
    alert("This quote already exists.");
    return;
  }

  quotes.push({ text, category });
  localStorage.setItem("quotes", JSON.stringify(quotes));

  newQuoteText.value = "";
  newQuoteCategory.value = "";

  populateCategories();
  showRandomQuote();
  alert("Quote added successfully!");
}

// Export quotes to JSON file
function exportToJson() {
  if (quotes.length === 0) {
    alert("No quotes to export.");
    return;
  }
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file input
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== "application/json" && !file.name.endsWith(".json")) {
    alert("Please select a valid JSON file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        alert("Invalid JSON format: expected an array.");
        return;
      }

      const validQuotes = imported.filter(q =>
        q.text && typeof q.text === "string" &&
        q.category && typeof q.category === "string"
      );

      if (validQuotes.length === 0) {
        alert("No valid quotes found in imported file.");
        return;
      }

      // Avoid duplicates by quote text (case-insensitive)
      const existingTexts = new Set(quotes.map(q => q.text.toLowerCase()));
      const newUniqueQuotes = validQuotes.filter(q => !existingTexts.has(q.text.toLowerCase()));

      quotes.push(...newUniqueQuotes);
      localStorage.setItem("quotes", JSON.stringify(quotes));

      alert(`Imported ${newUniqueQuotes.length} new quotes successfully!`);

      populateCategories();
      showRandomQuote();
    } catch (err) {
      alert("Failed to import JSON: " + err.message);
    }
  };
  reader.readAsText(file);

  // Reset input so user can re-import the same file if needed
  event.target.value = "";
}

// Restore last viewed category and quote from sessionStorage
function restoreLastState() {
  const lastCategory = sessionStorage.getItem('lastCategory') || 'all';
  const lastQuoteText = sessionStorage.getItem('lastQuoteText');

  categorySelect.value = lastCategory;

  if (lastQuoteText) {
    const quote = quotes.find(q => q.text === lastQuoteText);
    if (quote) {
      quoteDisplay.textContent = `"${quote.text}" — Category: ${capitalize(quote.category)}`;
      return;
    }
  }
  showRandomQuote();
}

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
categorySelect.addEventListener("change", showRandomQuote);

// Initialize app
function init() {
  populateCategories();
  restoreLastState();
}

init();
