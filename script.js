window.showQuote = function (mood) {
  const quoteBox = document.getElementById("quote-box");

  const filtered = quotes.filter(q =>
    q.moods.includes(mood)
  );

  if (filtered.length === 0) {
    quoteBox.innerHTML = `<p><em>No quotes for that mood yet.</em></p>`;
  } else {
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    const imageSrc = random.image || "img/image.png";

    quoteBox.innerHTML = `
      <div class="quote-image-wrapper">
        <img src="${imageSrc}" alt="Quote Image" class="quote-image">
        <div class="quote-overlay">${random.quote}</div>
      </div>
      <div class="category"><strong>Category:</strong> ${random.category || "Uncategorized"}</div>
    `;
  }
};
