function renderRecentFoods() {
  const recentDiv = document.getElementById('recentFoods');
  let recent = JSON.parse(localStorage.getItem('recentFoods') || '[]');
  recent = recent.filter(f => typeof f === 'object' && f.name); // Only objects with nutrition info
  if (!recent.length) {
    recentDiv.innerHTML = '';
    return;
  }
  recentDiv.innerHTML = `<b>Recently searched:</b> ` +
    recent.map(f => `<a href="#" style="margin-right:10px;" onclick="document.getElementById('foodInput').value='${f.name.replace(/'/g,"\\'")}';lookupFood();return false;">${f.name}</a>`).join('');
}

function filterRecent(type) {
  let recent = JSON.parse(localStorage.getItem('recentFoods') || '[]');
  recent = recent.filter(f => typeof f === 'object' && f.name);
  if (type === 'lowSalt') recent = recent.filter(f => f.sodium !== undefined && f.sodium <= 120);
  if (type === 'lowSugar') recent = recent.filter(f => f.sugar !== undefined && f.sugar <= 5);
  if (type === 'highFiber') recent = recent.filter(f => f.fiber !== undefined && f.fiber >= 3);
  const recentDiv = document.getElementById('recentFoods');
  if (!recent.length) {
    recentDiv.innerHTML = '<i>No foods match this filter.</i>';
    return;
  }
  recentDiv.innerHTML = `<b>Filtered foods:</b> ` +
    recent.map(f => `<a href="#" style="margin-right:10px;" onclick="document.getElementById('foodInput').value='${f.name.replace(/'/g,"\\'")}';lookupFood();return false;">${f.name}</a>`).join('');
}

function getAlternatives(foodName, warningType) {
  const name = foodName.toLowerCase();
  if (warningType === "sodium") {
    if (name.includes("soup")) return ["Low-sodium soup", "Homemade vegetable soup", "Miso soup"];
    if (name.includes("bread")) return ["Whole grain bread (low salt)", "Rice cakes", "Corn tortillas"];
    if (name.includes("cheese")) return ["Ricotta cheese", "Swiss cheese", "Low-sodium cottage cheese"];
    return ["Fresh fruits", "Unsalted nuts", "Steamed vegetables"];
  }
  if (warningType === "sugar") {
    if (name.includes("soda") || name.includes("soft drink")) return ["Sparkling water", "Unsweetened iced tea", "Diluted fruit juice"];
    if (name.includes("cake") || name.includes("cookie")) return ["Oatmeal cookies (no sugar)", "Fruit salad", "Yogurt with berries"];
    if (name.includes("cereal")) return ["Oatmeal", "Bran flakes", "Unsweetened muesli"];
    return ["Fresh fruit", "Plain yogurt", "Nuts"];
  }
  return [];
}

async function lookupFood() {
  const foodInput = document.getElementById("foodInput");
  const food = foodInput.value.trim();
  const resultDiv = document.getElementById("nutritionResult");

  if (!food) {
    resultDiv.innerHTML = "<p style='color:red;'>Please enter a food name.</p>";
    foodInput.focus();
    return;
  }
  if (!/^[a-zA-Z0-9\s]+$/.test(food)) {
    resultDiv.innerHTML = "<p style='color:red;'>Please use only letters, numbers, and spaces.</p>";
    foodInput.focus();
    return;
  }

  const APP_ID = "d3cc09da";   // 🔑 Replace with your Nutritionix App ID
  const APP_KEY = "dac4517b7d9f253bba02370657cad13f"; // 🔑 Replace with your Nutritionix App Key

  const url = "https://trackapi.nutritionix.com/v2/natural/nutrients";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": APP_ID,
        "x-app-key": APP_KEY
      },
      body: JSON.stringify({ query: food })
    });

    const data = await response.json();

    if (!data.foods || data.foods.length === 0) {
      resultDiv.innerHTML = "<p>No nutrition data found.</p>";
      return;
    }

    const foodInfo = data.foods[0];
    const weight = foodInfo.serving_weight_grams || 100;

    // Helper to round to 1 decimal
    const round = val => Math.round(val * 10) / 10;

    // Calculate per 100g values
    const factor = 100 / weight;
    const per100g = {
      calories: round(foodInfo.nf_calories * factor),
      carbs: round(foodInfo.nf_total_carbohydrate * factor),
      protein: round(foodInfo.nf_protein * factor),
      fat: round(foodInfo.nf_total_fat * factor),
      sugar: round(foodInfo.nf_sugars * factor),
      sodium: round(foodInfo.nf_sodium * factor),
      fiber: round(foodInfo.nf_dietary_fiber * factor)
    };

    // Dietary tags logic
    let tags = [];
    if (per100g.sodium <= 120) tags.push("🟢 Low Salt");
    if (per100g.sugar <= 5) tags.push("🟢 Low Sugar");
    if (per100g.fiber && per100g.fiber >= 3) tags.push("🌾 High Fiber");
    if (per100g.carbs <= 15 && per100g.sugar <= 5) tags.push("🟢 Diabetic-Friendly");
    if (per100g.fat <= 3) tags.push("🟢 Low Fat");
    if (per100g.protein >= 5) tags.push("💪 Good Protein Source");

    let tagsHtml = '';
    if (tags.length) {
      tagsHtml = `<div style="margin:10px 0 14px 0;">
        ${tags.map(t => `<span style="display:inline-block;background:#e9e6ff;color:#4b2caf;padding:4px 10px;border-radius:12px;font-size:0.98em;margin-right:7px;">${t}</span>`).join('')}
      </div>`;
    }

    // Personalized warnings
    let warnings = '';
    if (per100g.sodium > 250) {
      warnings += `<div style="color:#b71c1c; background:#fff3f3; border-left:5px solid #e53935; padding:10px 14px; margin-bottom:10px;">
        ⚠️ <b>High sodium:</b> This food contains ${per100g.sodium}mg sodium per 100g. Consider lower-salt alternatives.
      </div>`;
    }
    if (per100g.sugar > 20) {
      warnings += `<div style="color:#b71c1c; background:#fff3f3; border-left:5px solid #e53935; padding:10px 14px; margin-bottom:10px;">
        ⚠️ <b>High sugar:</b> This food contains ${per100g.sugar}g sugar per 100g. Consider lower-sugar alternatives.
      </div>`;
    }

    // Alternatives
    let alternativesHtml = '';
    if (per100g.sodium > 250) {
      const alts = getAlternatives(foodInfo.food_name, "sodium");
      if (alts.length) {
        alternativesHtml += `<div style="margin:8px 0 16px 0; color:#2d6a4f;">
          <b>Try these lower-sodium alternatives:</b>
          <ul>${alts.map(a => `<li>${a}</li>`).join('')}</ul>
        </div>`;
      }
    }
    if (per100g.sugar > 20) {
      const alts = getAlternatives(foodInfo.food_name, "sugar");
      if (alts.length) {
        alternativesHtml += `<div style="margin:8px 0 16px 0; color:#2d6a4f;">
          <b>Try these lower-sugar alternatives:</b>
          <ul>${alts.map(a => `<li>${a}</li>`).join('')}</ul>
        </div>`;
      }
    }

    resultDiv.innerHTML = `
      ${warnings}
      ${alternativesHtml}
      ${tagsHtml}
      <h2>🍽 Nutrition for: ${foodInfo.food_name}</h2>
      <div style="margin-bottom:10px;">
        <b>Original serving:</b> ${weight}g
        <ul>
          <li><strong>Calories:</strong> ${foodInfo.nf_calories} kcal</li>
          <li><strong>Carbohydrates:</strong> ${foodInfo.nf_total_carbohydrate} g</li>
          <li><strong>Protein:</strong> ${foodInfo.nf_protein} g</li>
          <li><strong>Fat:</strong> ${foodInfo.nf_total_fat} g</li>
          <li><strong>Sugar:</strong> ${foodInfo.nf_sugars} g</li>
          <li><strong>Sodium:</strong> ${foodInfo.nf_sodium} mg</li>
        </ul>
      </div>
      <div>
        <b>Per 100g:</b>
        <ul>
          <li><strong>Calories:</strong> ${per100g.calories} kcal</li>
          <li><strong>Carbohydrates:</strong> ${per100g.carbs} g</li>
          <li><strong>Protein:</strong> ${per100g.protein} g</li>
          <li><strong>Fat:</strong> ${per100g.fat} g</li>
          <li><strong>Sugar:</strong> ${per100g.sugar} g</li>
          <li><strong>Sodium:</strong> ${per100g.sodium} mg</li>
        </ul>
      </div>
    `;

    // Save to recent searches (store as objects with nutrition info)
    let recent = JSON.parse(localStorage.getItem('recentFoods') || '[]');
    recent = recent.filter(f => (typeof f === 'object' && f.name ? f.name.toLowerCase() !== food.toLowerCase() : f.toLowerCase() !== food.toLowerCase()));
    recent.unshift({
      name: food,
      sodium: per100g.sodium,
      sugar: per100g.sugar,
      fiber: per100g.fiber
    });
    if (recent.length > 8) recent = recent.slice(0, 8);
    localStorage.setItem('recentFoods', JSON.stringify(recent));
    renderRecentFoods();

    // Macro chart
    const macroChart = document.getElementById("macroChart");
    macroChart.style.display = "block";
    if (window.macroChartInstance) window.macroChartInstance.destroy();
    window.macroChartInstance = new Chart(macroChart, {
      type: 'pie',
      data: {
        labels: ['Carbs (g)', 'Protein (g)', 'Fat (g)'],
        datasets: [{
          data: [per100g.carbs, per100g.protein, per100g.fat],
          backgroundColor: ['#7c4dff', '#4caf50', '#ff9800']
        }]
      },
      options: {
        plugins: {
          legend: { display: true, position: 'bottom' },
          title: { display: true, text: 'Macronutrient Breakdown (per 100g)' }
        }
      }
    });

  } catch (err) {
    console.error("Nutrition API error:", err);
    resultDiv.innerHTML = "<p>Error fetching nutrition data. Please try again later.</p>";
  }
}

// Show recent foods on page load
renderRecentFoods();