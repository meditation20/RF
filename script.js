// 🌟 Recipe Finder Main Page with smart Indian fallback
const API_KEY = "089c5f803d4941859e76f1f83d561808";
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const cuisineSelect = document.getElementById("cuisineSelect");
const recipeContainer = document.getElementById("recipeContainer");
const loading = document.getElementById("loading");

searchBtn.addEventListener("click", fetchRecipes);

async function fetchRecipes() {
  const query = searchInput.value.trim().toLowerCase();
  const cuisine = cuisineSelect.value;

  if (!query) {
    alert("Please enter a recipe name or ingredient!");
    return;
  }

  recipeContainer.innerHTML = "";
  loading.style.display = "block";

  const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&cuisine=${cuisine}&number=8&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    loading.style.display = "none";

    // ✅ If Spoonacular returns recipes
    if (data.results && data.results.length > 0) {
      displayRecipeCards(data.results);
    } 
    // ✅ Otherwise, check if query looks Indian or cuisine is Indian
    else if (
      cuisine === "Indian" ||
      /dal|paneer|biryani|masala|makhni|chole|roti|dosa|sabzi|pulao|tikka|idli|samosa|curry/.test(query)
    ) {
      console.warn("Likely Indian dish - loading local Indian recipes...");
      loadLocalIndianRecipes(query);
    } 
    else {
      recipeContainer.innerHTML = `<p class="no-results">🍳 No recipes found for "${query}". Try another keyword or cuisine.</p>`;
    }
  } catch (err) {
    loading.style.display = "none";
    console.error("Error:", err);
    // ✅ If network/API error but search seems Indian, load local recipes
    if (
      cuisine === "Indian" ||
      /dal|paneer|biryani|masala|makhni|chole|roti|dosa|sabzi|pulao|tikka|idli|samosa|curry/.test(query)
    ) {
      loadLocalIndianRecipes(query);
    } else {
      recipeContainer.innerHTML = `<p class="error">⚠️ Error fetching recipes. Please try again later.</p>`;
    }
  }
}

// 🟩 Display recipes from Spoonacular
function displayRecipeCards(recipes) {
  recipeContainer.innerHTML = recipes
    .map(
      (r) => `
      <div class="recipe-card">
        <img src="${r.image}" alt="${r.title}">
        <h3>${r.title}</h3>
        <button class="btn" onclick="openRecipe(${r.id})">👨‍🍳 Show Recipe</button>
        <p class="source-label">🔹 Source: Spoonacular API</p>
      </div>`
    )
    .join("");
}

// 🟩 Load local Indian recipes from indianRecipes.json
async function loadLocalIndianRecipes(query = "") {
  try {
    const res = await fetch("indianRecipes.json");
    const data = await res.json();

    // Filter recipes based on query keywords
    const filtered = data.filter((r) =>
      r.title.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length > 0) {
      recipeContainer.innerHTML = filtered
        .map(
          (r, index) => `
          <div class="recipe-card">
            <img src="${r.image}" alt="${r.title}">
            <h3>${r.title}</h3>
            <button class="btn" onclick="openLocalRecipe(${index})">👨‍🍳 Show Recipe</button>
            <p class="source-label">🔹 Source: Local Indian Data</p>
          </div>`
        )
        .join("");
    } else {
      recipeContainer.innerHTML = `<p class="no-results">🍛 No Indian recipes found for "${query}".</p>`;
    }
  } catch (error) {
    console.error("Failed to load local recipes:", error);
    recipeContainer.innerHTML = `<p class="error">⚠️ Could not load Indian recipes.</p>`;
  }
}

// 🟩 Navigation Functions
function openRecipe(id) {
  localStorage.setItem("selectedRecipeId", id);
  localStorage.removeItem("selectedLocalRecipeId");
  // FIX: Use replace to ensure a clean navigation and prevent cache issues
  window.location.replace("recipe.html");
}

function openLocalRecipe(index) {
  localStorage.setItem("selectedLocalRecipeId", index);
  localStorage.removeItem("selectedRecipeId");
  // FIX: Use replace to ensure a clean navigation and prevent cache issues
  window.location.replace("recipe.html");
}