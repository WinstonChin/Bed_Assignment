

const {
  getAlternatives,
  filterLowSaltFoods,
  filterHighFiberFoods,
  formatNutritionInfo
} = require('../Nutrition Lookup/nutritionHelpers');

describe('nutritionHelpers', () => {
  describe('getAlternatives', () => {
    test('returns low-sodium soup alternatives for soup', () => {
      expect(getAlternatives('chicken soup', 'sodium')).toContain('Low-sodium soup');
    });

    test('returns low-sugar alternatives for soda', () => {
      expect(getAlternatives('soda', 'sugar')).toContain('Sparkling water');
    });

    test('returns low-fat alternatives for fried food', () => {
      expect(getAlternatives('fried chicken', 'fat')).toContain('Grilled chicken');
    });

    test('returns default alternatives for unknown food', () => {
      expect(getAlternatives('unknownfood', 'sodium')).toContain('Fresh fruits');
    });
  });

  describe('filterLowSaltFoods', () => {
    const foods = [
      { name: 'apple', sodium: 1 },
      { name: 'soup', sodium: 500 },
      { name: 'bread', sodium: 120 },
      { name: 'banana', sodium: 0 }
    ];

    test('filters foods with sodium <= 120', () => {
      const result = filterLowSaltFoods(foods);
      expect(result).toEqual([
        { name: 'apple', sodium: 1 },
        { name: 'bread', sodium: 120 },
        { name: 'banana', sodium: 0 }
      ]);
    });
  });

  describe('filterHighFiberFoods', () => {
    const foods = [
      { name: 'apple', fiber: 2.4 },
      { name: 'beans', fiber: 7 },
      { name: 'rice', fiber: 1 },
      { name: 'broccoli', fiber: 3.3 }
    ];

    test('filters foods with fiber >= 3', () => {
      const result = filterHighFiberFoods(foods);
      expect(result).toEqual([
        { name: 'beans', fiber: 7 },
        { name: 'broccoli', fiber: 3.3 }
      ]);
    });
  });

  describe('formatNutritionInfo', () => {
    test('formats nutrition info as HTML string', () => {
      const food = {
        name: 'apple',
        calories: 52,
        carbs: 14,
        protein: 0.3,
        fat: 0.2,
        sugar: 10,
        sodium: 1,
        fiber: 2.4
      };
      const html = formatNutritionInfo(food);
      expect(html).toContain('<strong>apple</strong>');
      expect(html).toContain('Calories: 52 kcal');
      expect(html).toContain('Carbs: 14 g');
      expect(html).toContain('Protein: 0.3 g');
      expect(html).toContain('Fat: 0.2 g');
      expect(html).toContain('Sugar: 10 g');
      expect(html).toContain('Sodium: 1 mg');
      expect(html).toContain('Fiber: 2.4 g');
    });
  });
});