let model;

// Load MobileNet
(async function() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>Loading AI model... ⏳</p>";
  model = await mobilenet.load();
  resultsDiv.innerHTML = "<p>Model loaded ✅</p>";
})();

// Load GPT4All model
const gpt = new GPT4All(); // GPT4All.js instance
await gpt.load('ggml-gpt4all-j-v1.3-groovy'); // small browser model

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

async function generateRecipes(ingredients) {
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

  const prompt = `Generate 3 recipes using these ingredients: ${ingredients.join(", ")}.
  For each recipe:
  1. Give a creative name.
  2. Give detailed step-by-step instructions including cooking/baking temperatures if needed.`;

  const recipesText = await gpt.generate(prompt, { max_tokens: 500 });

  // Simple splitting assuming GPT separates recipes with line breaks
  const recipeArray = recipesText.split(/\n{2,}/).filter(r => r.trim() !== "");

  recipeArray.forEach((recipeText, idx) => {
    resultsDiv.innerHTML += `
      <div class="recipe-card">
        <h4>Recipe ${idx + 1}</h4>
        <p>${recipeText}</p>
      </div>
    `;
  });
}
