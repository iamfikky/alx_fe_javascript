// =============================
// Quotes Array (initialize)
// =============================
let quotes = [];

// =============================
// Local Storage Helpers
// =============================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "The best way to predict the future is to invent it.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Do not watch the clock. Do what it does. Keep going.", category: "Persistence" }
    ];
  }
}

// =============================
// Mock Server API
// =============================
function fetchQuotesFromServer() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { text: "Stay hungry, stay foolish.", category: "Inspiration" },
        { text: "Simplicity is the ultimate sophistication.", category: "Philosophy" }
      ]);
    }, 1000);
  });
}

function postQuoteToServer(quote) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("Posted to server:", quote);
      resolve({ success: true });
    }, 500);
  });
}

// =============================
// Sync with Server
// =============================
async function syncQuotes() {
  showSyncStatus("Syncing with server…");

  try {
    const serverQuotes = await fetchQuotesFromServer();
    let updated = false;

    // Merge: Add server quotes not in local
    serverQuotes.forEach(sq => {
      if (!quotes.find(lq => lq.text === sq.text && lq.category === sq.category)) {
        quotes.push(sq);
        updated = true;
        showNotice("New quote from server added!");
      }
    });

    // Post local quotes missing on server
    for (let lq of quotes) {
      if (!serverQuotes.find(sq => sq.text === lq.text && sq.category === lq.category)) {
        await postQuoteToServer(lq);
        showNotice("Local quote synced to server.");
      }
    }

    if (updated) {
      saveQuotes();
      updateCategoryOptions();
      showRandomQuote();
    }

    showSyncStatus("Quotes synced with server!");
  } catch (err) {
    showSyncStatus("Sync failed.");
    console.error(err);
  }
}

// =============================
// Quote Display
// =============================
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available.";
    return;
  }

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

  document.getElementById("quoteDisplay").textContent = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// =============================
// Add Quote
// =============================
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  if (!textInput.value.trim() || !categoryInput.value.trim()) return;

  const newQuote = {
    text: textInput.value.trim(),
    category: categoryInput.value.trim()
  };

  quotes.push(newQuote);
  saveQuotes();
  updateCategoryOptions();
  textInput.value = "";
  categoryInput.value = "";
  showNotice("Quote added!");
  showRandomQuote();

  // Also post to server
  postQuoteToServer(newQuote);
}

// =============================
// Category Filter Options
// =============================
function updateCategoryOptions() {
  const select = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];

  select.innerHTML = "";
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat === "all" ? "All Categories" : cat;
    select.appendChild(opt);
  });

  // Restore last selected category
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && categories.includes(savedCategory)) {
    select.value = savedCategory;
  }
}

// =============================
// Notifications & Sync Status
// =============================
function showNotice(msg) {
  const noticeArea = document.getElementById("notices");
  const div = document.createElement("div");
  div.textContent = msg;
  div.className = "notice";
  noticeArea.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function showSyncStatus(msg) {
  document.getElementById("syncStatus").textContent = msg;
}

// =============================
// Event Listeners
// =============================
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  updateCategoryOptions();
  showRandomQuote();

  // Restore last viewed quote
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const q = JSON.parse(lastQuote);
    document.getElementById("quoteDisplay").textContent = `"${q.text}" — ${q.category}`;
  }

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("categoryFilter").addEventListener("change", e => {
    localStorage.setItem("selectedCategory", e.target.value);
    showRandomQuote();
  });

  setInterval(syncQuotes, 10000); // Periodic sync
});
