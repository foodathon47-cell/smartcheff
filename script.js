let model;
const spoonacularKey = "YOUR_SPOONACULAR_API_KEY"; // 👈 replace with your key

(async function() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>Loading AI model... ⏳</p>";
  model = await mobilenet.load();
  resultsDiv.innerHTML = "<p>Model loaded ✅</p>";
})();

document.getElementById("goBtn").addEventListener("click", async () => {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>Analyzing ingredients... 🍽️</p>";

  let detectedIngredients = [];

  // Image input
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
      fetchRecipes(detectedIngredients);
    };
  } else {
    const manual = document.getElementById("manualInput").value
                    .toLowerCase()
                    .split(",")
                    .map(i => i.trim())
                    .filter(i => i);
    fetchRecipes(manual);
  }
});

async function fetchRecipes(ingredients) {
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
                          <h3>Suggested Recipes:</h3>`;

  try {
    const ingString = ingredients.join(",");
    const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingString}&number=5&apiKey=${spoonacularKey}`);
    const data = await response.json();

    data.forEach((recipe, idx) => {
      const used = recipe.usedIngredients.map(i => i.name).join(", ");
      const missed = recipe.missedIngredients.map(i => i.name).join(", ");
      resultsDiv.innerHTML += `
        <div class="recipe-card">
          <h4>${idx+1}. ${recipe.title}</h4>
          <img src="${recipe.image}" alt="${recipe.title}" />
          <p><b>Uses:</b> ${used}</p>
          <p><b>Missing:</b> ${missed || "None"}</p>
        </div>
      `;
    });

  } catch (err) {
    resultsDiv.innerHTML += "<p>❌ Error fetching recipes</p>";
  }
}
