let model;

// Load MobileNet model
(async function() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>Loading AI model... ⏳</p>";
  model = await mobilenet.load();
  resultsDiv.innerHTML = "<p>Model loaded ✅</p>";
})();

// Button click
document.getElementById("goBtn").addEventListener("click", async () => {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>Analyzing ingredients... 🍽️</p>";

  let detectedIngredients = [];

  // Image detection
  const imageInput = document.getElementById("imageInput");
  if (imageInput.files.length > 0 && model) {
    const file = imageInput.files[0];
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.width = 224;
    img.height = 224;
    img.onload = async () => {
      const predictions = await model.classify(img);
      detectedIngredients = predictions.slice(0, 5).map(p => p.className);
      generateRecipes(detectedIngredients);
    };
  } else {
    const manual = document.getElementById("manualInput").value
                    .toLowerCase()
                    .split(",")
                    .map(i => i.trim())
                    .filter(i => i);
    generateRecipes(manual);
  }
});

// Tiny JS AI recipe generator
function generateRecipes(ingredients) {
  const resultsDiv = document.getElementById("results");
  if (ingredients.length === 0) {
    resultsDiv.innerHTML = "<p>No ingredients provided.</p>";
    return;
  }

  // Nutrition scoring
  let score = 3;
  const healthy = ["lettuce","broccoli","carrot","spinach","fish","chicken"];
  const unhealthy = ["chocolate","cake","sugar","bacon","butter"];
  healthy.forEach(i => { if (ingredients.includes(i)) score++; });
  unhealthy.forEach(i => { if (ingredients.includes(i)) score--; });
  score = Math.max(1, Math.min(5, score));

  resultsDiv.innerHTML = `<h3>Ingredients Detected:</h3><p>${ingredients.join(", ")}</p>
                          <p><b>Nutrition Score:</b> ${score}/5</p>
                          <h3>Generated Recipes:</h3>`;

  ingredients.forEach((ing, idx) => {
    // Tiny AI template
    const recipeName = `${ing.charAt(0).toUpperCase() + ing.slice(1)} Delight`;
    const instructions = `
      1. Prepare ${ing} by washing and chopping.
      2. Cook ${ing} on medium heat for 10 minutes.
      3. Add spices and seasoning.
      4. Serve hot and enjoy your ${recipeName}!
    `;
    resultsDiv.innerHTML += `
      <div class="recipe-card">
        <h4>${recipeName}</h4>
        <p>${instructions}</p>
      </div>
    `;
  });
}
