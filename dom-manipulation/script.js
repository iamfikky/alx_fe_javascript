// Load from localStorage or initialize default quotes
let storedQuotes = JSON.parse(localStorage.getItem("quotes"));
let quotes = storedQuotes || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" },
  { text: "You miss 100% of the shots you don't take.", category: "motivation" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");

// Create the Add Quote form dynamically
function createAddQuoteForm(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.id = "addQuoteBtn";
  addButton.textContent = "Add Quote";

  container.appendChild(quoteInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);

  addButton.addEventListener("click", addQuote);
}

// Populate dropdown with unique categories
function populateCategories() {
  const uniqueCategories = Array.from(new Set(quotes.map(q => q.category)));
  categorySelect.innerHTML = `<option value="all">All</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categorySelect.appendChild(option);
  });
}

// Show a random quote (filtered by category)
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" - (${quote.category})`;

  // Save to sessionStorage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Add a new quote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText");
  const newQuoteCategory = document.getElementById("newQuoteCategory");

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

// Export quotes as JSON file
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

// Import quotes from JSON file
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
  event.target.value = "";
}

// Restore last viewed quote (sessionStorage)
function restoreLastViewedQuote() {
  const last = sessionStorage.getItem("lastViewedQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.textContent = `"${quote.text}" - (${quote.category})`;
  }
}

// Initial setup
newQuoteBtn.addEventListener("click", showRandomQuote);
categorySelect.addEventListener("change", showRandomQuote);

populateCategories();
restoreLastViewedQuote();
createAddQuoteForm("quoteFormContainer");
