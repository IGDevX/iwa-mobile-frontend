/**
 * Category Icons Mapping
 *
 * Maps category slugs to their respective icons
 */

// Default placeholder icon for missing icons
const defaultIcon = require('../assets/images/icons8-cardboard-box-96.png');

export const CATEGORY_ICONS: Record<string, any> = {
  'fruits': require('../assets/images/icons8-watermelon-96.png'),
  'legumes': require('../assets/images/icons8-broccoli-96.png'),
  'viandes': require('../assets/images/icons8-steak-96.png'),
  'poissons': require('../assets/images/icons8-fish-96.png'),
  'charcuterie': require('../assets/images/icons8-meat-96.png'),
  'produits-laitiers': require('../assets/images/icons8-milk-96.png'),
  'oeufs': require('../assets/images/icons8-eggs-96.png'),
  'pain-farines': require('../assets/images/icons8-bread-96.png'),
  'epicerie': require('../assets/images/icons8-shopping-basket-96.png'),
  'condiments': require('../assets/images/icons8-olive-oil-96.png'),
  'boissons': require('../assets/images/icons8-wine-96.png'),
  'patisserie-desserts': require('../assets/images/icons8-birthday-cake-96.png'),
  'autres-produits': defaultIcon,
};

/**
 * Get icon for a category by slug
 * @param slug - Category slug
 * @returns Icon require statement or default icon
 */
export function getCategoryIcon(slug: string): any {
  return CATEGORY_ICONS[slug] || defaultIcon;
}

