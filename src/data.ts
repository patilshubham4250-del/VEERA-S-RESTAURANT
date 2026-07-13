/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, MenuItem, Order } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'chicken_specials', name: 'Chicken Specials', icon: 'Flame' },
  { id: 'egg_specials', name: 'Egg Specials', icon: 'Coffee' },
  { id: 'soups', name: 'Soups', icon: 'CupSoda' },
  { id: 'veg_soyabean', name: 'Veg & Soyabean Delights', icon: 'Utensils' },
  { id: 'rice_noodles', name: 'Rice & Noodles', icon: 'Layers' },
];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  // Chicken Specials
  { id: 'chk_chilly', name: 'Chicken chilly', price: 180, category: 'chicken_specials', isAvailable: true, description: 'Spicy stir-fried chicken with bell peppers and green chilies' },
  { id: 'chk_hot_garlic', name: 'Chicken Hot garlic', price: 180, category: 'chicken_specials', isAvailable: true, description: 'Succulent chicken tossed in sweet, spicy, and garlicky sauce' },
  { id: 'chk_schezwan', name: 'Chicken schezwan', price: 180, category: 'chicken_specials', isAvailable: true, description: 'Classic fiery Indo-Chinese style schezwan chicken' },
  { id: 'chk_red_sauce', name: 'Chicken Red sauce', price: 200, category: 'chicken_specials', isAvailable: true, description: 'Juicy chicken cooked in a rich, tangy red sauce' },
  { id: 'chk_hunan', name: 'Chicken Hunan', price: 200, category: 'chicken_specials', isAvailable: true, description: 'Hunan style spicy chicken with a hint of ginger and garlic' },
  { id: 'chk_manchurian', name: 'Chicken Manchurian', price: 170, category: 'chicken_specials', isAvailable: true, description: 'Deep-fried chicken balls in a tangy and savory Manchurian gravy' },
  { id: 'chk_kantikki', name: 'Chicken Kantikki', price: 170, category: 'chicken_specials', isAvailable: true, description: 'Crispy pan-fried marinated chicken patties' },
  { id: 'chk_lollipop', name: 'Chicken Lollipop', price: 180, category: 'chicken_specials', isAvailable: true, description: 'Crispy fried chicken drumettes served with hot schezwan sauce' },

  // Egg Specials
  { id: 'egg_chilly', name: 'Egg chilly', price: 100, category: 'egg_specials', isAvailable: true, description: 'Stir-fried hard-boiled eggs with green chilies and onions' },
  { id: 'egg_omlet', name: 'Egg Omlet', price: 60, category: 'egg_specials', isAvailable: true, description: 'Classic fluffy pan-fried egg omelet with onions and herbs' },
  { id: 'egg_boil', name: 'Boil egg', price: 30, category: 'egg_specials', isAvailable: true, description: 'Two perfectly hard-boiled eggs served with seasoning' },
  { id: 'egg_roast', name: 'Egg Roast', price: 40, category: 'egg_specials', isAvailable: true, description: 'Pan-roasted hard-boiled eggs with spices' },
  { id: 'egg_bhurji', name: 'Egg bhurji', price: 50, category: 'egg_specials', isAvailable: true, description: 'Spiced scrambled eggs with onions, green chilies, and coriander' },

  // Soups
  { id: 'veg_manchao_soup', name: 'Veg manchao soup', price: 50, category: 'soups', isAvailable: true, description: 'Hot and spicy thick soup loaded with vegetables and fried noodles' },
  { id: 'chk_manchao_soup', name: 'Chicken manchao soup', price: 70, category: 'soups', isAvailable: true, description: 'Fiery chicken broth with shredded chicken, ginger, and crispy noodles' },

  // Veg & Soyabean Delights
  { id: 'soya_chilly', name: 'Soyabean chilly', price: 110, category: 'veg_soyabean', isAvailable: true, description: 'Crispy fried soya chunks tossed in chili manchurian sauce' },
  { id: 'dry_veg_manchurian', name: 'Dry veg Manchurian', price: 100, category: 'veg_soyabean', isAvailable: true, description: 'Crispy mix veg balls tossed in dry spicy Manchurian sauce' },
  { id: 'gravy_veg_manchurian', name: 'Gravy veg Manchurian', price: 110, category: 'veg_soyabean', isAvailable: true, description: 'Veg balls dipped in a savory, glossy dark soy gravy' },
  { id: 'soya_kantikki', name: 'Soyabean Kantikki', price: 90, category: 'veg_soyabean', isAvailable: true, description: 'Deep-fried delicious soy cutlets' },
  { id: 'soya_manchurian', name: 'Soyabean Manchurian', price: 100, category: 'veg_soyabean', isAvailable: true, description: 'Soya nuggets tossed in a rich, tangy Manchurian sauce' },
  { id: 'paneer_chilly', name: 'Panner chilly', price: 180, category: 'veg_soyabean', isAvailable: true, description: 'Fresh paneer cubes stir-fried with capsicum, onions, and chili' },
  { id: 'pav_bhaji', name: 'Pav bhaji', price: 70, category: 'veg_soyabean', isAvailable: true, description: 'Thick spicy vegetable curry served with soft butter-toasted buns' },

  // Rice & Noodles
  { id: 'veg_fried_rice', name: 'Veg fried rice', price: 100, category: 'rice_noodles', isAvailable: true, description: 'Wok-tossed basmati rice with finely chopped fresh vegetables' },
  { id: 'schezwan_fried_rice', name: 'Schezwan fried rice', price: 110, category: 'rice_noodles', isAvailable: true, description: 'Spicy wok-fried rice in aromatic home-style schezwan sauce' },
  { id: 'chk_fried_rice', name: 'Chicken fried rice', price: 130, category: 'rice_noodles', isAvailable: true, description: 'Tender chicken bits scrambled with egg and basmati rice' },
  { id: 'chk_sz_fried_rice', name: 'Chicken Schezwan fried rice', price: 140, category: 'rice_noodles', isAvailable: true, description: 'Spicy fried rice tossed with shredded chicken in schezwan paste' },
  { id: 'chk_noodles', name: 'Chicken noodles', price: 130, category: 'rice_noodles', isAvailable: true, description: 'Classic stir-fried noodles with chicken, cabbage, carrots and soy' },
  { id: 'chk_sz_noodles', name: 'Chicken schezwan noodles', price: 140, category: 'rice_noodles', isAvailable: true, description: 'Wok-tossed noodles with chicken and spicy schezwan sauce' },
  { id: 'veg_hakka_noodles', name: 'Veg hakka noodles', price: 100, category: 'rice_noodles', isAvailable: true, description: 'Classic Chinese stir-fried noodles loaded with healthy vegetables' },
  { id: 'veg_sejwan_noodles', name: 'Veg sejwan noodles', price: 110, category: 'rice_noodles', isAvailable: true, description: 'Fiery vegetable stir-fry noodles tossed in aromatic schezwan sauce' },
  { id: 'chk_biryani', name: 'Chicken biryani', price: 100, category: 'rice_noodles', isAvailable: true, description: 'Fragrant long-grain basmati rice cooked with spicy marinated chicken' },
];

export const MOCK_ORDERS: Order[] = [];
