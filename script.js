const API_KEY = "YOUR_SPOONACULAR_API_KEY";
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

    if (data.results && data.results.length > 0) {
      displayRecipeCards(data.results);
    } else if (
      cuisine === "Indian" ||
      /dal|paneer|biryani|masala|makhni|chole|roti|dosa|sabzi|pulao|tikka|idli|samosa|curry/.test(query)
    ) {
      loadLocalIndianRecipes(query);
    } else {
      recipeContainer.innerHTML = `<p class="no-results">🍳 No recipes found for "${query}". Try another keyword or cuisine.</p>`;
    }
  } catch (err) {
    loading.style.display = "none";
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

// 🌟 Display cards for Spoonacular API
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

// 🌟 Load local Indian recipes
async function loadLocalIndianRecipes(query = "") {
  try {
    const res = await fetch("indianRecipes.json");
    const data = await res.json();

    const filtered = data.filter((r) =>
      r.title.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length > 0) {
      recipeContainer.innerHTML = filtered
        .map(
          (r) => `
          <div class="recipe-card">
            <img src="${r.image}" alt="${r.title}">
            <h3>${r.title}</h3>
            <button class="btn" onclick="openLocalRecipe('${r.title}')">👨‍🍳 Show Recipe</button>
            <p class="source-label">🔹 Source: Local Indian Data</p>
          </div>`
        )
        .join("");
    } else {
      recipeContainer.innerHTML = `<p class="no-results">🍛 No Indian recipes found for "${query}".</p>`;
    }
  } catch (error) {
    recipeContainer.innerHTML = `<p class="error">⚠️ Could not load Indian recipes.</p>`;
  }
}

// 🌟 Navigation functions
function openRecipe(id) {
  localStorage.setItem("selectedRecipeId", id);
  window.location.href = "recipe.html";
}

function openLocalRecipe(title) {
  localStorage.setItem("selectedLocalRecipeTitle", title);
  window.location.href = "recipe.html";
}
