/**
 * Suggests healthier alternatives based on food and nutrient type.
 * @param {string} foodName
 * @param {string} nutrientType - e.g. 'sodium', 'sugar', 'fat'
 * @returns {string[]} Array of alternative food suggestions
 */
function getAlternatives(foodName, nutrientType) {
  const lower = foodName.toLowerCase();
  if (nutrientType === 'sodium') {
    if (lower.includes('soup')) return ['Low-sodium soup', 'Fresh salad', 'Steamed vegetables'];
    if (lower.includes('noodle')) return ['Rice noodles', 'Zucchini noodles', 'Whole grain pasta'];
    return ['Fresh fruits', 'Steamed vegetables', 'Unsalted nuts'];
  }
  if (nutrientType === 'sugar') {
    if (lower.includes('soda')) return ['Sparkling water', 'Unsweetened tea', 'Infused water'];
    if (lower.includes('dessert')) return ['Fruit salad', 'Greek yogurt', 'Dark chocolate'];
    return ['Fresh fruits', 'Nuts', 'Low-sugar snacks'];
  }
  if (nutrientType === 'fat') {
    if (lower.includes('fried')) return ['Grilled chicken', 'Baked fish', 'Steamed tofu'];
    return ['Lean meats', 'Legumes', 'Vegetables'];
  }
  return ['Drink more water', 'Eat more vegetables', 'Choose whole foods'];
}

/**
 * Filters a list of foods for low sodium (salt) content.
 * @param {Array} foods - Array of food objects with a sodium property (mg)
 * @param {number} [maxSodium=120] - Maximum sodium per 100g to be considered "low salt"
 * @returns {Array} Filtered array of foods
 */
function filterLowSaltFoods(foods, maxSodium = 120) {
  return foods.filter(food => food.sodium !== undefined && food.sodium <= maxSodium);
}

/**
 * Filters a list of foods for high fiber content.
 * @param {Array} foods - Array of food objects with a fiber property (g)
 * @param {number} [minFiber=3] - Minimum fiber per 100g to be considered "high fiber"
 * @returns {Array} Filtered array of foods
 */
function filterHighFiberFoods(foods, minFiber = 3) {
  return foods.filter(food => food.fiber !== undefined && food.fiber >= minFiber);
}

/**
 * Formats nutrition info for display.
 * @param {Object} food
 * @returns {string}
 */
function formatNutritionInfo(food) {
  return `
    <strong>${food.name}</strong><br>
    Calories: ${food.calories} kcal<br>
    Carbs: ${food.carbs} g<br>
    Protein: ${food.protein} g<br>
    Fat: ${food.fat} g<br>
    Sugar: ${food.sugar} g<br>
    Sodium: ${food.sodium} mg<br>
    Fiber: ${food.fiber} g
  `;
}

module.exports = {
  getAlternatives,
  filterLowSaltFoods,
  filterHighFiberFoods,
  formatNutritionInfo
};