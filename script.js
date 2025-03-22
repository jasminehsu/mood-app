const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyCGShUYOcgkzf-vHcyIg8a92DKIC1649tDk3rGayl9OwaUPUiqW3vGjsCjV1oCkg-9/exec";

(function () {
  let quotes = [];

  // ✅ Fetch all quotes from Google Sheet
  fetch(GOOGLE_SHEET_URL)
    .then(response => response.json())
    .then(data => {
      quotes = data.map(q => {
        const rawMoods = (q.moods || "").toString().toLowerCase();
        const moodArray = rawMoods
          .split(/[,|\n]/)         // split by comma or newline
          .map(m => m.trim())      // trim spaces
          .filter(m => m.length);  // remove empty ones
    
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
      console.error("❌ Failed to load quotes from Google Sheets:", error);
    });

  // ✅ Expose showQuote globally
  window.showQuote = function () {
    const mood = document.getElementById("mood-select").value.toLowerCase();
    console.log("🎯 Selected mood value:", mood);
    const quoteBox = document.getElementById("quote-box");

    if (!mood) {
      quoteBox.innerText = "Please select a mood first.";
      return;
    }

    const filtered = quotes.filter(q =>
      q.moods.some(m => m === mood)
    );

    console.log("🔍 Matching quotes:", filtered);

    if (filtered.length === 0) {
      quoteBox.innerHTML = `<p><em>No quotes for that mood yet.</em></p>`;
    } else {
      const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
      quoteBox.innerHTML = `
        <p>${randomQuote.quote}</p>
        <small><strong>Category:</strong> ${randomQuote.category || 'Uncategorized'}</small>
      `;
    }
  };

  // ✅ Expose addQuote globally
  window.addQuote = function () {
    const quote = document.getElementById("new-quote").value.trim();
    const moods = document.getElementById("new-moods").value.trim().toLowerCase().split(',').map(m => m.trim());
    const category = document.getElementById("new-category").value.trim() || document.getElementById("category-select").value.trim();
    const statusBox = document.getElementById("add-status");

    if (!quote || moods.length === 0 || !category) {
      statusBox.innerText = "⚠️ Please fill out all fields.";
      statusBox.style.color = "red";
      return;
    }

    fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      body: JSON.stringify({ quote, moods, category }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => response.text())
      .then(message => {
        statusBox.innerText = "✅ Quote saved!";
        statusBox.style.color = "green";

        document.getElementById("new-quote").value = "";
        document.getElementById("new-moods").value = "";
        document.getElementById("new-category").value = "";
        document.getElementById("category-select").value = "";

        return fetch(GOOGLE_SHEET_URL);
      })
      .then(response => response.json())
      .then(data => {
        quotes = data.map(q => ({
          quote: q.quote,
          moods: typeof q.moods === 'string' ? q.moods.split(',').map(m => m.trim().toLowerCase()) : [],
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

  // ✅ Populate categories
  function populateCategoryOptions() {
    const categorySet = new Set();

    quotes.forEach(q => {
      if (q.category && typeof q.category === "string") {
        categorySet.add(q.category.toLowerCase());
      }
    });

    const select = document.getElementById("category-select");
    select.innerHTML = '<option value="">-- Choose existing category --</option>';

    categorySet.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      select.appendChild(opt);
    });
  }

  // ✅ Optional clearSavedQuotes
  window.clearSavedQuotes = function () {
    alert("You're using Google Sheets — nothing to clear!");
  };
})();
