let model;
const spoonacularKey = "d34a6368a50546189cea0fa16a85b838
"; // Replace with your key

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
    // Step 1: Get recipes by ingredients
    const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingString}&number=3&apiKey=${spoonacularKey}`);
    const recipes = await response.json();

    // Step 2: For each recipe, get full instructions
    for (const recipe of recipes) {
      const infoResponse = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?includeNutrition=false&apiKey=${spoonacularKey}`);
      const info = await infoResponse.json();

      // Combine instructions into a readable string
      const steps = info.analyzedInstructions.length > 0 ?
                    info.analyzedInstructions[0].steps.map(s => `${s.number}. ${s.step}`).join("<br>") :
                    "Instructions not available";

      resultsDiv.innerHTML += `
        <div class="recipe-card">
          <h4>${info.title}</h4>
          <img src="${info.image}" alt="${info.title}" />
          <p>${steps}</p>
        </div>
      `;
    }

  } catch (err) {
    resultsDiv.innerHTML += "<p>❌ Error fetch
