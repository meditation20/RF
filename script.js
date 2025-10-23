const API_KEY = "YOUR_SPOONACULAR_API_KEY"; // REMEMBER TO USE YOUR REAL KEY HERE
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
      // Mark results as from API and push to the combined list
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
          
          // Filter local recipes based on the query
          const filtered = data.filter((r) => r.title.toLowerCase().includes(query));

          if (filtered.length > 0) {
              // Mark results as local and push to the combined list
              const localResults = filtered.map(r => ({ ...r, source: 'local' }));
              allResults.push(...localResults);
          }
      } catch (error) {
          console.error("Local JSON Load Error:", error);
      }
  }

  loading.style.display = "none";
  
  // 3. Display all results or a "No Results" message
  if (allResults.length > 0) {
    displayCombinedResults(allResults);
  } else {
    recipeContainer.innerHTML = `<p class="no-results">🍳 No recipes found for "${query}" from either source.</p>`;
  }
}

// 🟩 NEW: Single function to handle both API and Local results
function displayCombinedResults(results) {
  recipeContainer.innerHTML = results
    .map(
      (r) => {
        // Use a flag to determine which ID/Title method to use
        const isLocal = r.source === 'local';
        const recipeIdentifier = isLocal ? `'${r.title}'` : r.id;
        const openFunction = isLocal ? 'openLocalRecipe' : 'openRecipe';
        const sourceLabel = isLocal ? 'Local Indian Data' : 'Spoonacular API';
        
        // Use the title from the local JSON for image display
        const imageSrc = isLocal ? r.image : r.image; 

        return `
          <div class="recipe-card">
            <img src="${imageSrc}" alt="${r.title}">
            <h3>${r.title}</h3>
            <button class="btn" onclick="${openFunction}(${recipeIdentifier})">👨‍🍳 Show Recipe</button>
            <p class="source-label">🔹 Source: ${sourceLabel}</p>
          </div>
        `;
      }
    )
    .join("");
}

// 🌟 Navigation functions (Unchanged)
function openRecipe(id) {
  localStorage.setItem("selectedRecipeId", id);
  localStorage.removeItem("selectedLocalRecipeTitle");
  window.location.href = "recipe.html";
}

function openLocalRecipe(title) {
  // Need to wrap title in single quotes in the JS code if it's a string, 
  // but since we are receiving the string directly here, we just use it.
  localStorage.setItem("selectedLocalRecipeTitle", title);
  localStorage.removeItem("selectedRecipeId");
  window.location.href = "recipe.html";
}