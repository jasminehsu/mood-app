const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxjwvyQcYTM9MY-cK0p7TQpEF8fXzl2gCNtW4VdYYhMOvUg8OmzkaK1CDdH0n-QAoCh/exec";


(function () {
  let quotes = [];

  // ✅ Fetch all quotes
  fetch(GOOGLE_SHEET_URL)
    .then(response => response.json())
    .then(data => {
      quotes = data.map(q => {
        const moodArray = (q.moods || "")
          .toLowerCase()
          .split(/[,|\n]/)
          .map(m => m.trim())
          .filter(Boolean);

        return {
          quote: q.quote,
          moods: moodArray,
          category: q.category
        };
      });
      console.log("✅ Quotes loaded:", quotes);
      populateCategoryOptions();
    })
    .catch(error => {
      console.error("❌ Failed to load quotes:", error);
    });

  // ✅ Show a quote based on mood
  window.showQuote = function () {
    const mood = document.getElementById("mood-select").value.toLowerCase();
    const quoteBox = document.getElementById("quote-box");

    const filtered = quotes.filter(q =>
      q.moods.includes(mood)
    );

    if (filtered.length === 0) {
      quoteBox.innerHTML = `<p><em>No quotes for that mood yet.</em></p>`;
    } else {
      const random = filtered[Math.floor(Math.random() * filtered.length)];
      quoteBox.innerHTML = `
        <p>${random.quote}</p>
        <small><strong>Category:</strong> ${random.category || "Uncategorized"}</small>
      `;
    }
  };

  // ✅ Save new quote with FormData
  window.addQuote = function () {
    const quote = document.getElementById("new-quote").value.trim();
    const moods = document.getElementById("new-moods").value.trim().toLowerCase();
    const category = document.getElementById("new-category").value.trim() ||
                     document.getElementById("category-select").value.trim();
    const statusBox = document.getElementById("add-status");

    if (!quote || !moods || !category) {
      statusBox.innerText = "⚠️ Please fill out all fields.";
      statusBox.style.color = "red";
      return;
    }

    const formData = new FormData();
    formData.append("quote", quote);
    formData.append("moods", moods);
    formData.append("category", category);

    fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      body: formData
    })
    .then(res => res.text())
    .then(msg => {
      statusBox.innerText = "✅ Quote saved!";
      statusBox.style.color = "green";
      console.log("Server response:", msg);

      // Clear form
      document.getElementById("new-quote").value = "";
      document.getElementById("new-moods").value = "";
      document.getElementById("new-category").value = "";
      document.getElementById("category-select").value = "";

      // Refresh quotes
      return fetch(GOOGLE_SHEET_URL);
    })
    .then(response => response.json())
    .then(data => {
      quotes = data.map(q => ({
        quote: q.quote,
        moods: (q.moods || "").toLowerCase().split(/[,|\n]/).map(m => m.trim()).filter(Boolean),
        category: q.category
      }));
      populateCategoryOptions();
    })
    .catch(err => {
      statusBox.innerText = "❌ Failed to save quote.";
      statusBox.style.color = "red";
      console.error(err);
    });
  };

  // ✅ Populate category dropdown
  function populateCategoryOptions() {
    const select = document.getElementById("category-select");
    const categories = [...new Set(quotes.map(q => q.category.toLowerCase()))];

    select.innerHTML = `<option value="">-- Choose existing category --</option>`;
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      select.appendChild(opt);
    });
  }

  window.clearSavedQuotes = function () {
    alert("You're using Google Sheets — nothing to reset here!");
  };
})();
