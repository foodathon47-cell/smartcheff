// When the button is clicked
document.getElementById("goBtn").addEventListener("click", () => {
  const results = document.getElementById("results");
  const ingredients = document.getElementById("manualInput").value.toLowerCase();

  // Simple nutrition scoring logic
  let nutrition = 3;
  if (ingredients.includes("lettuce") || ingredients.includes("broccoli") || ingredients.includes("fish") || ingredients.includes("carrot")) nutrition++;
  if (ingredients.includes("chocolate") || ingredients.includes("cake") || ingredients.includes("butter") || ingredients.includes("sugar")) nutrition--;

  // Display AI tools and nutrition score
  results.innerHTML = `
    <h3>AI Recognition & Recipes</h3>
    <p>📷 Image recognition (scan your food below):</p>
    <iframe src="https://huggingface.co/spaces/microsoft/resnet-50" width="100%" height="400"></iframe>
    <p>🍳 Recipe generation:</p>
    <iframe src="https://huggingface.co/spaces/flax-community/recipe-generator" width="100%" height="600"></iframe>
    <p><b>Nutrition Score:</b> ${Math.max(1, Math.min(5, nutrition))} / 5</p>
  `;
});
