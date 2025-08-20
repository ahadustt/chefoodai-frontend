/**
 * Advanced Ingredient Parser
 * Handles multiple data formats from different APIs and extracts meaningful ingredient names
 */

interface IngredientObject {
  // AI Generated formats
  item?: string;
  name?: string;
  ingredient?: string;
  amount?: string | number;
  unit?: string;
  preparation?: string;
  
  // Database formats
  quantity?: number;
  preparation_notes?: string;
  notes?: string;
}

// Comprehensive food knowledge database
const FOOD_PATTERNS = {
  // Proteins
  'chicken': ['breast', 'thigh', 'wing', 'drumstick', 'tender', 'cutlet'],
  'beef': ['ground', 'steak', 'roast', 'brisket', 'chuck', 'sirloin', 'ribeye'],
  'pork': ['chop', 'tenderloin', 'shoulder', 'belly', 'loin', 'ribs'],
  'fish': ['salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'mahi'],
  'turkey': ['breast', 'ground', 'thigh', 'cutlet'],
  'lamb': ['chop', 'leg', 'shoulder', 'rack'],
  'shrimp': ['jumbo', 'large', 'medium', 'cooked', 'raw'],
  
  // Vegetables
  'onion': ['yellow', 'white', 'red', 'sweet', 'green', 'shallot'],
  'pepper': ['bell', 'red', 'green', 'yellow', 'jalapeño', 'serrano', 'poblano'],
  'tomato': ['cherry', 'roma', 'beefsteak', 'plum', 'grape', 'heirloom'],
  'potato': ['russet', 'yukon', 'red', 'sweet', 'fingerling', 'baby'],
  'carrot': ['baby', 'large', 'medium', 'rainbow'],
  'mushroom': ['button', 'cremini', 'shiitake', 'portobello', 'oyster'],
  'lettuce': ['romaine', 'iceberg', 'butter', 'arugula', 'spinach'],
  
  // Herbs & Spices
  'basil': ['fresh', 'dried', 'thai', 'sweet'],
  'oregano': ['fresh', 'dried', 'mexican'],
  'parsley': ['fresh', 'dried', 'flat-leaf', 'curly'],
  'cilantro': ['fresh', 'leaves'],
  'thyme': ['fresh', 'dried', 'lemon'],
  'rosemary': ['fresh', 'dried'],
  'sage': ['fresh', 'dried'],
  
  // Dairy & Cheese
  'cheese': ['cheddar', 'mozzarella', 'parmesan', 'swiss', 'feta', 'goat', 'cream', 'cottage'],
  'milk': ['whole', 'skim', 'almond', 'coconut', 'oat', 'soy'],
  'cream': ['heavy', 'light', 'sour', 'whipping'],
  'yogurt': ['greek', 'plain', 'vanilla'],
  
  // Grains & Starches
  'rice': ['white', 'brown', 'jasmine', 'basmati', 'arborio', 'wild'],
  'pasta': ['spaghetti', 'penne', 'fusilli', 'rigatoni', 'linguine', 'fettuccine'],
  'bread': ['white', 'wheat', 'sourdough', 'rye', 'pita', 'naan'],
  'flour': ['all-purpose', 'wheat', 'almond', 'coconut'],
  
  // Oils & Vinegars
  'oil': ['olive', 'vegetable', 'canola', 'coconut', 'sesame', 'avocado'],
  'vinegar': ['balsamic', 'apple cider', 'white wine', 'red wine', 'rice'],
  
  // Nuts & Seeds
  'nuts': ['almonds', 'walnuts', 'pecans', 'cashews', 'pistachios'],
  'seeds': ['sesame', 'sunflower', 'pumpkin', 'chia', 'flax']
};

// Common measurement units to filter out
const MEASUREMENT_UNITS = /^(\d+\.?\d*\s*)?(cups?|cup|c|tsp|teaspoons?|tbsp|tablespoons?|oz|ounces?|lbs?|pounds?|kg|kilograms?|g|grams?|ml|milliliters?|l|liters?|pint|pints|quart|quarts|gallon|gallons|inch|inches|can|cans|package|packages|jar|jars|bottle|bottles|cloves?|pieces?|slices?|strips?|bunch|bunches|head|heads|stalk|stalks)\s+/gi;

// Common preparation terms to filter out
const PREPARATION_TERMS = /(chopped|diced|sliced|minced|grated|shredded|cubed|julienned|crushed|pressed|peeled|seeded|stemmed|trimmed|cleaned|washed|cooked|roasted|grilled|sautéed|boiled|steamed|fried|baked|toasted|melted|softened|room temperature|cold|hot|warm|fresh|frozen|canned|dried|powdered|ground|whole|halved|quartered)(\s+\w+)*$/gi;

// Common descriptive words to filter out
const DESCRIPTIVE_WORDS = /^(a|an|the|some|of|fresh|dried|ground|chopped|diced|sliced|minced|grated|shredded|cooked|raw|organic|free-range|extra|virgin|large|small|medium|whole|half|baby|young|mature|ripe|unripe)\s+/gi;

export function extractIngredientName(ingredient: any): string {
  // Handle different ingredient data structures
  let rawText = '';
  
  if (typeof ingredient === 'string') {
    rawText = ingredient;
  } else if (typeof ingredient === 'object' && ingredient !== null) {
    // Try different object properties in order of preference
    rawText = ingredient.item || 
              ingredient.name || 
              ingredient.ingredient ||
              (ingredient.amount && ingredient.unit ? 
                `${ingredient.amount} ${ingredient.unit} ${ingredient.item || ingredient.name}` : '') ||
              JSON.stringify(ingredient);
  }
  
  if (!rawText || rawText.trim() === '') return 'Ingredient';
  
  // Clean and normalize the text
  let cleaned = rawText.toLowerCase().trim();
  
  // Remove quantities with units at the start (more precise pattern)
  cleaned = cleaned.replace(/^(\d+\.?\d*\s*)?(cups?|cup|c\b|tsp|teaspoons?|tbsp|tablespoons?|oz|ounces?|lbs?|pounds?|kg|kilograms?|g\b|grams?|ml|milliliters?|l\b|liters?|pint|pints|quart|quarts|gallon|gallons|can|cans|package|packages|jar|jars|bottle|bottles|cloves?|pieces?|bunch|bunches|head|heads)\s+/gi, '');
  
  // Remove standalone numbers and fractions at the beginning
  cleaned = cleaned.replace(/^(\d+\.?\d*|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞|\d+\/\d+)\s+/g, '');
  
  // Remove weight/quantity in parentheses like (170g), (2 lbs)
  cleaned = cleaned.replace(/\(\d+\.?\d*\s*(g|grams?|oz|ounces?|lbs?|pounds?|kg|ml|l)\)/gi, '');
  
  // Remove percentage indicators like "70%"
  cleaned = cleaned.replace(/\d+%/g, '');
  
  // Remove common descriptive words at the start
  cleaned = cleaned.replace(/^(a|an|the|some|of|about|approximately)\s+/gi, '');
  
  // Remove quality descriptors but preserve important ones
  cleaned = cleaned.replace(/^(organic|free-range|grass-fed|wild-caught|extra|pure)\s+/gi, '');
  
  // Remove size descriptors unless they're important food identifiers
  const sizePattern = /^(large|small|medium|big|tiny|jumbo|mini|baby|young)\s+(?!shrimp|eggs)/gi;
  cleaned = cleaned.replace(sizePattern, '');
  
  // Remove preparation state descriptors
  cleaned = cleaned.replace(/^(fresh|frozen|dried|canned|cooked|raw|uncooked)\s+/gi, '');
  
  // Remove preparation notes at the end
  cleaned = cleaned.replace(/,\s*(chopped|diced|sliced|minced|grated|shredded|cubed|julienned|crushed|pressed|peeled|seeded|stemmed|trimmed|cleaned|washed|for serving|to taste|optional).*$/gi, '');
  
  // Clean up any remaining parenthetical notes
  cleaned = cleaned.replace(/\([^)]*\)/g, '').trim();
  
  // Split by commas and take the first part (main ingredient)
  const mainPart = cleaned.split(',')[0].trim();
  
  if (!mainPart) return 'Ingredient';
  
  // Extract meaningful words
  const words = mainPart.split(/\s+/).filter(word => 
    word.length > 1 && 
    !word.match(/^(and|or|with|plus)$/i) &&
    !word.match(/^\d+$/)
  );
  
  if (words.length === 0) return 'Ingredient';
  
  // Try to identify the main ingredient using food knowledge
  const joinedText = words.join(' ');
  
  for (const [baseFood, variants] of Object.entries(FOOD_PATTERNS)) {
    if (joinedText.includes(baseFood)) {
      // Check if we have a specific variant
      const foundVariant = variants.find(variant => joinedText.includes(variant));
      if (foundVariant) {
        return `${foundVariant} ${baseFood}`;
      }
      return baseFood;
    }
    
    // Check if any variant is present
    const foundVariant = variants.find(variant => joinedText.includes(variant));
    if (foundVariant) {
      return `${foundVariant} ${baseFood}`;
    }
  }
  
  // If no food pattern matches, use smart word selection
  if (words.length === 1) {
    return words[0];
  } else if (words.length === 2) {
    return words.join(' ');
  } else {
    // For longer phrases, prioritize the last 1-2 words (usually the main ingredient)
    // But if first words look like important descriptors, include them
    const importantDescriptors = ['boneless', 'skinless', 'ground', 'whole', 'half'];
    const firstWord = words[0];
    
    if (importantDescriptors.includes(firstWord)) {
      return `${firstWord} ${words[words.length - 1]}`;
    } else {
      const coreWords = words.slice(-2);
      return coreWords.join(' ');
    }
  }
}

export function formatIngredientDisplay(ingredient: any): string {
  const name = extractIngredientName(ingredient);
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Utility to get ingredient category for potential color coding
export function getIngredientCategory(ingredient: any): string {
  const name = extractIngredientName(ingredient).toLowerCase();
  
  if (['chicken', 'beef', 'pork', 'fish', 'turkey', 'lamb', 'shrimp'].some(protein => name.includes(protein))) {
    return 'protein';
  }
  if (['onion', 'pepper', 'tomato', 'potato', 'carrot', 'mushroom', 'lettuce'].some(veg => name.includes(veg))) {
    return 'vegetable';
  }
  if (['basil', 'oregano', 'parsley', 'cilantro', 'thyme', 'rosemary'].some(herb => name.includes(herb))) {
    return 'herb';
  }
  if (['cheese', 'milk', 'cream', 'yogurt'].some(dairy => name.includes(dairy))) {
    return 'dairy';
  }
  if (['rice', 'pasta', 'bread', 'flour'].some(grain => name.includes(grain))) {
    return 'grain';
  }
  
  return 'other';
} 