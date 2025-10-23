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

  const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&cuisine=${cuisine}&number=8&apiKey=${API_KEY}`;
  
  let allResults = [];
  let apiFetched = false;

  // 1. Attempt to fetch from Spoonacular API
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      const apiResults = data.results.map(r => ({ ...r, source: 'api' }));
      allResults.push(...apiResults);
      apiFetched = true;
    }
  } catch (err) {
    console.error("Spoonacular API Fetch Error:", err);
  }

  // 2. Load local recipes if the query is relevant (Indian/Keywords)
  const isRelevantToLocal = cuisine === "Indian" || /dal|paneer|biryani|masala|makhni|chole|roti|dosa|sabzi|pulao|tikka|idli|samosa|curry/.test(query);

  if (isRelevantToLocal || !apiFetched) {
      try {
          const res = await fetch("indianRecipes.json");
          const data = await res.json();
          
          // Filter local recipes based on the query (filter by title only)
          const filtered = data.filter((r) => r.title.toLowerCase().includes(query));

          if (filtered.length > 0) {
              // Map the filtered local recipes, preserving their original index for retrieval on recipe.html
              const localResults = filtered.map((r, index) => ({ 
                  ...r, 
                  source: 'local', 
                  // Use the original index (0, 1, 2) from the JSON file for retrieval
                  originalIndex: data.findIndex(item => item.title === r.title) 
              }));
              allResults.push(...localResults);
          }
      } catch (error) {
          console.error("Local JSON Load Error:", error);
      }
  }

  loading.style.display = "none";
  
  // 3. Display all results
  if (allResults.length > 0) {
    displayCombinedResults(allResults);
  } else {
    recipeContainer.innerHTML = `<p class="no-results">🍳 No recipes found for "${query}" from either source.</p>`;
  }
}

// 🟩 Display ALL results (API and Local)
function displayCombinedResults(results) {
  recipeContainer.innerHTML = results
    .map(
      (r) => {
        const isLocal = r.source === 'local';
        // Use the originalIndex for local recipes, or the Spoonacular ID for API recipes
        const identifier = isLocal ? r.originalIndex : r.id; 
        const openFunction = isLocal ? 'openLocalRecipe' : 'openRecipe';
        const sourceLabel = isLocal ? 'Local Indian Data' : 'Spoonacular API';
        
        return `
          <div class="recipe-card">
            <img src="${r.image}" alt="${r.title}">
            <h3>${r.title}</h3>
            <button class="btn" onclick="${openFunction}(${identifier})">👨‍🍳 Show Recipe</button>
            <p class="source-label">🔹 Source: ${sourceLabel}</p>
          </div>
        `;
      }
    )
    .join("");
}

// 🌟 Navigation functions
function openRecipe(id) {
  localStorage.setItem("selectedRecipeId", id);
  localStorage.removeItem("selectedLocalRecipeIndex"); // Corrected key name
  window.location.replace("recipe.html");
}

function openLocalRecipe(index) {
  localStorage.setItem("selectedLocalRecipeIndex", index); // Corrected key name
  localStorage.removeItem("selectedRecipeId");
  window.location.replace("recipe.html");
}