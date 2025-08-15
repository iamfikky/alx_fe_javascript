// =============================
// Initial quotes array
// =============================
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Persistence" }
];

// Mock API endpoint
const API_URL = "https://jsonplaceholder.typicode.com/posts";

// =============================
// Save & Load from Local Storage
// =============================
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        quotes = parsed;
      }
    } catch (e) {
      console.error("Failed to parse stored quotes", e);
    }
  }
}

// =============================
// Display a random quote
// =============================
function displayRandomQuote() {
  if (quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  document.getElementById('quote-text').textContent = quote.text;
  document.getElementById('quote-category').textContent = quote.category;
}

// =============================
// Add a new quote (local + server)
// =============================
async function addQuote(text, category) {
  if (!text || !category) return;

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  displayRandomQuote();

  try {
    // Post to server (mock API)
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(newQuote),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      showNotification("Quote posted to server successfully");
    }
  } catch (err) {
    console.error("Error posting quote to server:", err);
  }
}

// =============================
// Fetch from Server (one-way)
// =============================
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(`${API_URL}?_limit=5`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const serverQuotes = data.map(item => ({
      text: String(item.title || '').trim(),
      category: 'Server'
    }));

    mergeQuotes(serverQuotes);
    showNotification("Fetched latest quotes from server");
  } catch (err) {
    console.error('Error fetching quotes:', err);
  }
}

// =============================
// Merge and resolve conflicts
// =============================
function mergeQuotes(serverQuotes) {
  const texts = new Set(quotes.map(q => q.text.toLowerCase()));
  let added = 0;

  serverQuotes.forEach(sq => {
    if (!texts.has(sq.text.toLowerCase())) {
      quotes.push(sq);
      added++;
    }
  });

  if (added > 0) {
    saveQuotes();
    displayRandomQuote();
  }
}

// =============================
// Sync Quotes (two-way)
// =============================
async function syncQuotes() {
  await fetchQuotesFromServer(); // get from server
  // Could add extra logic for pushing unsynced local quotes here
  alert("Quotes synced with server!");
  console.log("Sync complete");
}

// =============================
// Periodic Check for New Quotes
// =============================
setInterval(() => {
  console.log("Checking for new quotes...");
  fetchQuotesFromServer();
}, 30000); // every 30s

// =============================
// UI Notification
// =============================
function showNotification(message) {
  const note = document.getElementById("notification");
  if (note) {
    note.textContent = message;
    note.style.display = "block";
    setTimeout(() => {
      note.style.display = "none";
    }, 3000);
  }
}

// =============================
// Event Listeners
// =============================
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  displayRandomQuote();
  fetchQuotesFromServer();
});

document.getElementById('new-quote-btn')
  .addEventListener('click', displayRandomQuote);

document.getElementById('add-quote-btn')
  .addEventListener('click', () => {
    const textInput = document.getElementById('new-quote-text');
    const categoryInput = document.getElementById('new-quote-category');
    addQuote(textInput.value.trim(), categoryInput.value.trim());
    textInput.value = '';
    categoryInput.value = '';
  });
