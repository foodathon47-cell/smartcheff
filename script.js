let model;

// Load MobileNet model when page loads
(async function() {
  document.getElementById("results").innerHTML = "<p>Loading AI model... ⏳</p>";
  model = await mobilenet.load();
  document.getElementById("results").innerHTML = "";
})();

document.getElementById("goBtn").addEventListener("click", async () => {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>Analyzing ingredients... 🍽️</p>";

  let detectedIngredients = [];

  // If image uploaded, use TensorFlow.js
  const imageInput = document.getElementById("imageInput");
  if (imageInput.files.length > 0 && model) {
    const file = imageInput.files[0];
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.width = 224; // recommended input size
    img.height = 224;
    img.onload = async () => {
      const predictions = await model.classify(img);
      detectedIngredients = predictions.slice(0, 3).map(p => p.className);
      displayResults(detectedIngredients);
    };
  } else {
    displayResults([]);
  }
});

function displayResults(detectedIngredients) {
  const resultsDiv = document.getElementById("results");
  const manual = document.getElementById("manualInput").value
                  .toLowerCase()
                  .split(",")
                  .map(i => i.trim())
                  .filter(i => i);

  const ingredients = [...new Set([...manual, ...detectedIngredients])];

  // Nutrition scoring
  let score = 3;
  const healthy = ["lettuce","broccoli","carrot","spinach","fish","chicken"];
  const unhealthy = ["chocolate","cake","sugar","bacon","butter"];
  healthy.forEach(i => { if (ingredients.includes(i)) score++; });
  unhealthy.forEach(i => { if (ingredients.includes(i)) score--; });
  score = Math.max(1, Math.min(5, score));

  resultsDiv.innerHTML = `<h3>Ingredients Detected:</h3><p>${ingredients.join(", ") || "None"}</p>
                          <p><b>Nutrition Score:</b> ${score}/5</p>
                          <h3>Suggested Recipes:</h3>`;

  ingredients.forEach((ing, idx) => {
    resultsDiv.innerHTML += `
      <div class="recipe-card">
        <h4>Recipe ${idx+1} with ${ing}</h4>
        <p>Uses ${ing}</p>
        <p>Remaining ingredients: ${ingredients.filter(i => i !== ing).join(", ") || "None"}</p>
      </div>
    `;
  });
}

