// Initial quotes or load from localStorage
let storedQuotes = JSON.parse(localStorage.getItem("quotes"));
let quotes = storedQuotes || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" },
  { text: "You miss 100% of the shots you don't take.", category: "motivation" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");

// Dynamically create Add Quote form
function createAddQuoteForm(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found.`);
    return;
  }

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

// Populate category dropdown
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

// Show random quote filtered by category
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
}

// Add quote function
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

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
categorySelect.addEventListener("change", showRandomQuote);

// Initial setup
populateCategories();
showRandomQuote();
createAddQuoteForm("quoteFormContainer");
