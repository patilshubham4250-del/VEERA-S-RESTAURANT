/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, MenuItem, Order } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'chicken_special', name: 'Chicken Special', icon: 'Flame' },
  { id: 'mutton_special', name: 'Mutton Special', icon: 'UtensilsCrossed' },
  { id: 'veg_special', name: 'Veg Special', icon: 'Salad' },
  { id: 'fish_special', name: 'Fish Special', icon: 'Fish' },
  { id: 'rice', name: 'Rice', icon: 'CookingPot' },
  { id: 'bread', name: 'Bread', icon: 'Sandwich' },
  { id: 'papad', name: 'Papad', icon: 'Disc' },
  { id: 'egg_special', name: 'Egg Special', icon: 'Egg' },
  { id: 'veeras_special', name: "Veera's Special", icon: 'Sparkles' },
  { id: 'ukad', name: 'Ukad', icon: 'Soup' },
  { id: 'chicken_chinese_special', name: 'Chicken Chinese Special', icon: 'Flame' },
  { id: 'soups', name: 'Soups', icon: 'CupSoda' },
  { id: 'veg_soyabean', name: 'Veg & Soyabean Delights', icon: 'Utensils' },
  { id: 'rice_noodles', name: 'Rice & Noodles', icon: 'Layers' },
  { id: 'beverages', name: 'Beverages & Cold Drinks', icon: 'GlassWater' },
];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  // 1. Chicken Special
  { id: 'chk_hydrabadi', name: 'Chicken Hydrabadi', price: 250, category: 'chicken_special', isAvailable: true, description: 'Flavorful spiced chicken cooked in rich green herbs and gravy (5 pc)' },
  { id: 'chk_curry', name: 'Chicken Curry', price: 200, category: 'chicken_special', isAvailable: true, description: 'Traditional homestyle chicken curry simmered with spices (5 pc)' },
  { id: 'chk_masala', name: 'Chicken Masala', price: 225, category: 'chicken_special', isAvailable: true, description: 'Rich chicken curry cooked in roasted onion-tomato gravy (5 pc)' },
  { id: 'chk_do_pyaja', name: 'Chicken Do Pyaja', price: 250, category: 'chicken_special', isAvailable: true, description: 'Tender chicken tossed with chunky caramelized onions and spices (5 pc)' },
  { id: 'chk_hundi_10', name: 'Chicken Hundi (10 pc)', price: 350, category: 'chicken_special', isAvailable: true, description: 'Slow-cooked handi chicken in thick aromatic gravy (10 pc)' },
  { id: 'chk_hundi_18', name: 'Chicken Hundi (18 pc)', price: 650, category: 'chicken_special', isAvailable: true, description: 'Full pot slow-cooked handi chicken in royal village spices (18 pc)' },
  { id: 'chk_kadhai', name: 'Kadhai Chicken', price: 260, category: 'chicken_special', isAvailable: true, description: 'Wok-tossed chicken with bell peppers, onions, and freshly ground kadhai masala (5 pc)' },
  { id: 'chk_butter', name: 'Butter Chicken', price: 280, category: 'chicken_special', isAvailable: true, description: 'Tender tandoori chicken simmered in rich creamy makhani tomato butter gravy' },
  { id: 'chk_rada', name: 'Rada Chicken', price: 270, category: 'chicken_special', isAvailable: true, description: 'Rich and spicy chicken delicacy cooked in a flavorful minced meat gravy (5 pc)' },
  { id: 'chk_latpat', name: 'Chicken Latpat', price: 225, category: 'chicken_special', isAvailable: true, description: 'Spicy, semi-dry roasted chicken coated with thick masala (5 pc)' },
  { id: 'chk_malwani', name: 'Chicken Malwani', price: 250, category: 'chicken_special', isAvailable: true, description: 'Authentic coastal Malvani style chicken with roasted coconut spices (5 pc)' },

  // 2. Mutton Special
  { id: 'mut_masala', name: 'Mutton Masala', price: 320, category: 'mutton_special', isAvailable: true, description: 'Rich and savory tender goat meat cooked in thick spicy gravy (5 pc)' },
  { id: 'mut_hundi_10', name: 'Mutton Hundi (10 pc)', price: 700, category: 'mutton_special', isAvailable: true, description: 'Earthen pot slow-cooked mutton in rich traditional gravy (10 pc)' },
  { id: 'mut_hundi_20', name: 'Mutton Hundi (20 pc)', price: 1280, category: 'mutton_special', isAvailable: true, description: 'Royal grand clay-pot mutton cooked with secret spices (20 pc)' },
  { id: 'mut_rogan_josh', name: 'Mutton Rogen Josh', price: 350, category: 'mutton_special', isAvailable: true, description: 'Kashmiri style aromatic tender mutton with ratan jot and whole spices (5 pc)' },
  { id: 'mut_curry', name: 'Mutton Curry', price: 300, category: 'mutton_special', isAvailable: true, description: 'Homestyle slow-cooked mutton curry in deep flavorful rassa (5 pc)' },
  { id: 'mut_latpat', name: 'Mutton Latpat', price: 320, category: 'mutton_special', isAvailable: true, description: 'Tender mutton tossed in semi-dry spicy roasted masala (5 pc)' },

  // 3. Veg Special
  { id: 'veg_mutter_paneer', name: 'Mutter Paneer', price: 210, category: 'veg_special', isAvailable: true, description: 'Fresh green peas and soft cottage cheese simmered in spiced tomato gravy' },
  { id: 'veg_paneer_hundi', name: 'Paneer Hundi', price: 220, category: 'veg_special', isAvailable: true, description: 'Clay pot cooked cottage cheese in rich aromatic gravy' },
  { id: 'veg_kadhai_paneer', name: 'Kadhai Paneer', price: 230, category: 'veg_special', isAvailable: true, description: 'Paneer cubes tossed with crisp capsicum, onions, and freshly pounded spices' },
  { id: 'veg_shahi_paneer', name: 'Shahi Paneer', price: 250, category: 'veg_special', isAvailable: true, description: 'Royal Mughlai cottage cheese in creamy cashew and almond white gravy' },
  { id: 'veg_paneer_lawabdar', name: 'Paneer Lawabdar', price: 230, category: 'veg_special', isAvailable: true, description: 'Creamy and slightly sweet tomato-onion gravy with grated and cubed paneer' },
  { id: 'veg_palak_paneer', name: 'Palak Paneer', price: 230, category: 'veg_special', isAvailable: true, description: 'Fresh blanched spinach puree tempered with garlic, spices, and paneer cubes' },
  { id: 'veg_lasuni_palak', name: 'Lasuni Palak', price: 160, category: 'veg_special', isAvailable: true, description: 'Finely pureed spinach with a prominent golden fried garlic tadka' },
  { id: 'veg_paneer_hydrabadi', name: 'Paneer Hydrabadi', price: 240, category: 'veg_special', isAvailable: true, description: 'Spiced cottage cheese cooked in aromatic mint, spinach, and coriander gravy' },
  { id: 'veg_paneer_butter', name: 'Paneer Butter Masala', price: 240, category: 'veg_special', isAvailable: true, description: 'Soft paneer cubes simmered in rich creamy butter tomato sauce' },
  { id: 'veg_kaju_curry', name: 'Kaju Curry', price: 230, category: 'veg_special', isAvailable: true, description: 'Whole roasted cashews cooked in rich onion-tomato and mawa gravy' },
  { id: 'veg_kaju_masala', name: 'Kaju Masala', price: 250, category: 'veg_special', isAvailable: true, description: 'Spicy and crunchy roasted cashews in thick aromatic red gravy' },
  { id: 'veg_kofta', name: 'Veg Kofta', price: 180, category: 'veg_special', isAvailable: true, description: 'Crispy vegetable dumplings cooked in rich flavorful gravy' },
  { id: 'veg_sev_bhaji', name: 'Sev Bhaji', price: 140, category: 'veg_special', isAvailable: true, description: 'Popular spicy Khandeshi style curry topped with crispy gram flour sev' },
  { id: 'veg_sevga_masala', name: 'Sevga Masala', price: 140, category: 'veg_special', isAvailable: true, description: 'Tender drumsticks simmered in flavorful spicy village gravy' },
  { id: 'veg_mix_veg', name: 'Mix Veg', price: 190, category: 'veg_special', isAvailable: true, description: 'Seasonal assorted vegetables tossed with onions, tomatoes, and herbs' },
  { id: 'veg_kolhapuri', name: 'Veg Kolhapuri', price: 190, category: 'veg_special', isAvailable: true, description: 'Fiery Kolhapuri spiced mixed vegetables with dry coconut and red chilies' },
  { id: 'veg_soyabean_masala', name: 'Soyabean Masala', price: 140, category: 'veg_special', isAvailable: true, description: 'Nutritious protein soya chunks simmered in thick spicy masala' },
  { id: 'veg_greenpeace_masala', name: 'Greenpeace Masala', price: 180, category: 'veg_special', isAvailable: true, description: 'Fresh green peas simmered in rich spiced onion-tomato gravy' },
  { id: 'veg_lasuni_methi', name: 'Lasuni Methi', price: 160, category: 'veg_special', isAvailable: true, description: 'Fresh fenugreek leaves sauteed with abundant golden roasted garlic' },
  { id: 'veg_dal_tadka', name: 'Dal Tadka', price: 120, category: 'veg_special', isAvailable: true, description: 'Yellow lentils tempered with pure ghee, cumin seeds, garlic & red chilies' },

  // 4. Fish Special
  { id: 'fish_masala', name: 'Fish Masala', price: 210, category: 'fish_special', isAvailable: true, description: 'Fresh fish fillets cooked in rich onion, tomato & coastal spices (3 pc)' },
  { id: 'fish_curry', name: 'Fish Curry', price: 190, category: 'fish_special', isAvailable: true, description: 'Traditional coastal style fish curry in tangy kokum and coconut rassa (3 pc)' },
  { id: 'fish_latpat', name: 'Fish Latpat', price: 210, category: 'fish_special', isAvailable: true, description: 'Fish pieces coated in spicy, semi-dry roasted tawa masala (3 pc)' },
  { id: 'fish_fry', name: 'Fish Fry', price: 225, category: 'fish_special', isAvailable: true, description: 'Crispy rava pan-fried seasoned fish fillets (4 pc)' },
  { id: 'fish_thecha', name: 'Thecha Fish', price: 220, category: 'fish_special', isAvailable: true, description: 'Fish cooked with fiery crushed green chili-garlic thecha masala (3 pc)' },
  { id: 'fish_hundi', name: 'Fish Hundi', price: 430, category: 'fish_special', isAvailable: true, description: 'Special earthen pot cooked fish in thick coastal gravy (6 pc)' },

  // 5. Rice
  { id: 'rice_jeera_half', name: 'Jeera Rice (Half)', price: 70, category: 'rice', isAvailable: true, description: 'Basmati rice tempered with golden cumin seeds and ghee (Half)' },
  { id: 'rice_jeera_full', name: 'Jeera Rice (Full)', price: 120, category: 'rice', isAvailable: true, description: 'Fragrant basmati rice tempered with cumin seeds and ghee (Full)' },
  { id: 'rice_steam_half', name: 'Steam Rice (Half)', price: 60, category: 'rice', isAvailable: true, description: 'Fluffy steamed long-grain basmati rice (Half)' },
  { id: 'rice_steam_full', name: 'Steam Rice (Full)', price: 100, category: 'rice', isAvailable: true, description: 'Fluffy steamed long-grain basmati rice (Full)' },
  { id: 'rice_veg_pulao', name: 'Veg Pulao', price: 140, category: 'rice', isAvailable: true, description: 'Basmati rice cooked with fresh seasonal vegetables and whole spices' },
  { id: 'rice_mutter_pulao', name: 'Mutter Pulao', price: 140, category: 'rice', isAvailable: true, description: 'Aromatic basmati rice cooked with sweet green peas and mild spices' },
  { id: 'rice_dal_khichadi', name: 'Dal Khichadi', price: 140, category: 'rice', isAvailable: true, description: 'Comforting rice and yellow lentil mash tempered with cumin and ghee' },
  { id: 'rice_dal_fry', name: 'Dal Fry', price: 105, category: 'rice', isAvailable: true, description: 'Creamy yellow lentils cooked with onions, tomatoes, and aromatic herbs' },
  { id: 'rice_veg_biryani', name: 'Veg Biryani', price: 140, category: 'rice', isAvailable: true, description: 'Layers of basmati rice and spiced vegetables cooked in traditional dum style' },
  { id: 'rice_chk_biryani', name: 'Chicken Biryani', price: 150, category: 'rice', isAvailable: true, description: 'Classic dum biryani layered with spiced tender chicken and basmati rice' },

  // 6. Bread
  { id: 'brd_aaloo_paratha', name: 'Aaloo Paratha', price: 40, category: 'bread', isAvailable: true, description: 'Whole wheat flatbread stuffed with spiced mashed potato filling' },
  { id: 'brd_paneer_paratha', name: 'Paneer Paratha', price: 65, category: 'bread', isAvailable: true, description: 'Tawa-toasted flatbread stuffed with grated cottage cheese & herbs' },
  { id: 'brd_plain_paratha', name: 'Plain Paratha', price: 25, category: 'bread', isAvailable: true, description: 'Flaky multi-layered whole wheat tawa paratha' },
  { id: 'brd_butter_nan', name: 'Butter Nan', price: 45, category: 'bread', isAvailable: true, description: 'Soft tandoori naan brushed with rich melted butter' },
  { id: 'brd_plain_nan', name: 'Plain Nan', price: 40, category: 'bread', isAvailable: true, description: 'Soft clay-oven baked classic Indian tandoori naan' },
  { id: 'brd_garlic_nan', name: 'Garlic Nan', price: 55, category: 'bread', isAvailable: true, description: 'Tandoori naan topped with roasted minced garlic and coriander' },
  { id: 'brd_lachha', name: 'Lachha', price: 40, category: 'bread', isAvailable: true, description: 'Crispy multi-layered round flatbread baked in the tandoor' },
  { id: 'brd_tandoori_roti', name: 'Tandoori Roti', price: 18, category: 'bread', isAvailable: true, description: 'Whole wheat roti baked in traditional clay tandoor' },
  { id: 'brd_butter_tandoori_roti', name: 'Butter Tandoori Roti', price: 22, category: 'bread', isAvailable: true, description: 'Tandoori roti generously glazed with fresh butter' },
  { id: 'brd_tawa_roti', name: 'Tawa Roti', price: 15, category: 'bread', isAvailable: true, description: 'Homestyle fresh hot whole wheat tawa chapati' },
  { id: 'brd_butter_roti', name: 'Butter Roti', price: 18, category: 'bread', isAvailable: true, description: 'Hot tawa roti topped with creamy butter' },
  { id: 'brd_kulcha', name: 'Kulcha', price: 50, category: 'bread', isAvailable: true, description: 'Soft leavened bread baked in the tandoor' },
  { id: 'brd_butter_kulcha', name: 'Butter Kulcha', price: 55, category: 'bread', isAvailable: true, description: 'Tandoori kulcha brushed generously with butter' },
  { id: 'brd_bhakari', name: 'Bhakari', price: 30, category: 'bread', isAvailable: true, description: 'Traditional rustic sorghum / jowar bhakri baked on earthen tawa' },
  { id: 'extra_pav', name: 'Pav', price: 7, category: 'bread', isAvailable: true, description: 'Fresh soft baker pav bun lightly toasted with butter' },

  // 7. Papad
  { id: 'ppd_udid_masala', name: 'Udid Masala Papad', price: 30, category: 'papad', isAvailable: true, description: 'Crispy roasted urad dal papad topped with chopped onions, tomatoes, and spices' },
  { id: 'ppd_fry', name: 'Fry Papad', price: 25, category: 'papad', isAvailable: true, description: 'Golden crunchy oil-fried papad' },

  // 8. Egg Special
  { id: 'egg_curry', name: 'Egg Curry', price: 120, category: 'egg_special', isAvailable: true, description: 'Hard boiled eggs simmered in spicy onion-tomato gravy' },
  { id: 'egg_masala', name: 'Egg Masala', price: 140, category: 'egg_special', isAvailable: true, description: 'Eggs cooked in thick savory masala gravy with spices' },
  { id: 'egg_masala_omlate', name: 'Masala Omlate', price: 80, category: 'egg_special', isAvailable: true, description: 'Pan-fried fluffy egg omelet loaded with onions, tomatoes, and green chilies' },
  { id: 'egg_half_fry', name: 'Half Fry', price: 50, category: 'egg_special', isAvailable: true, description: 'Classic sunny-side-up fried egg with runny yolk and black pepper' },
  { id: 'egg_cheesy_omlate', name: 'Cheesy Omlate', price: 100, category: 'egg_special', isAvailable: true, description: 'Rich fluffy omelet folded with gooey melted cheese' },
  { id: 'egg_boil', name: 'Boil Egg', price: 40, category: 'egg_special', isAvailable: true, description: 'Hard boiled eggs served with salt and black pepper' },
  { id: 'egg_bhurji', name: 'Egg Bhurji', price: 60, category: 'egg_special', isAvailable: true, description: 'Spiced scrambled eggs tossed with onions, green chilies, and coriander' },

  // 9. Veera's Special
  { id: 'vs_special_veg', name: "Veera's Special Veg", price: 360, category: 'veeras_special', isAvailable: true, description: "Signature chef's special vegetarian platter with premium paneer, kaju, bhakri & rice" },
  { id: 'vs_special_nonveg', name: "Veera's Special Non-Veg", price: 480, category: 'veeras_special', isAvailable: true, description: "Signature feast with Chicken & Mutton Sukka, Tambda Rassa, 2 Bhakri & Rice" },

  // 10. Ukad
  { id: 'ukad_chicken', name: 'Chicken Ukad', price: 190, category: 'ukad', isAvailable: true, description: 'Nutritious aromatic clear chicken bone broth simmered with turmeric and pepper' },
  { id: 'ukad_mutton', name: 'Mutton Ukad', price: 290, category: 'ukad', isAvailable: true, description: 'Nourishing traditional mutton bone soup rich in marrow and natural herbs' },

  // 11. Chicken Chinese Special
  { id: 'chk_chilly', name: 'Chicken Chilly', price: 180, category: 'chicken_chinese_special', isAvailable: true, description: 'Crispy fried chicken wok-tossed with capsicum, onions, and green chilies' },
  { id: 'chk_schezwan', name: 'Chicken Schezwan', price: 180, category: 'chicken_chinese_special', isAvailable: true, description: 'Fiery chicken tossed in home-made spicy schezwan sauce' },
  { id: 'chk_red_sauce', name: 'Chicken Red Sauce', price: 200, category: 'chicken_chinese_special', isAvailable: true, description: 'Juicy chicken cooked in tangy, sweet-and-spicy vibrant red sauce' },
  { id: 'chk_hunan', name: 'Chicken Hunan', price: 200, category: 'chicken_chinese_special', isAvailable: true, description: 'Hunan style chicken tossed with peppers, ginger, and garlic' },
  { id: 'chk_manchurian', name: 'Chicken Manchurian', price: 170, category: 'chicken_chinese_special', isAvailable: true, description: 'Crispy chicken dumplings in savory dark soy and coriander Manchurian sauce' },
  { id: 'chk_kantikki', name: 'Chicken Kantikki', price: 170, category: 'chicken_chinese_special', isAvailable: true, description: 'Crispy seasoned minced chicken patties shallow-fried to perfection' },
  { id: 'chk_lollipop', name: 'Chicken Lollipop', price: 180, category: 'chicken_chinese_special', isAvailable: true, description: 'Crisp fried chicken drumettes served with spicy schezwan dip' },

  // 12. Soups
  { id: 'soup_veg_manchao', name: 'Veg Manchao Soup', price: 70, category: 'soups', isAvailable: true, description: 'Hot and spicy thick vegetable soup topped with crunchy fried noodles' },
  { id: 'soup_chk_manchao', name: 'Chicken Manchao Soup', price: 90, category: 'soups', isAvailable: true, description: 'Spicy chicken broth loaded with shredded chicken and crispy fried noodles' },

  // 13. Veg & Soyabean Delights
  { id: 'veg_65', name: 'Veg 65', price: 130, category: 'veg_soyabean', isAvailable: true, description: 'Crispy deep-fried seasoned vegetable nuggets tossed with curry leaves' },
  { id: 'soya_chilly', name: 'Soyabean Chilly', price: 110, category: 'veg_soyabean', isAvailable: true, description: 'Crispy fried protein soya chunks tossed with capsicum and chilies' },
  { id: 'gravy_soya_chilly', name: 'Gravy Soyabean Chilly', price: 120, category: 'veg_soyabean', isAvailable: true, description: 'Juicy soya chunks cooked in spicy and glossy Chinese chili gravy' },
  { id: 'dry_veg_manchurian', name: 'Dry Veg Manchurian', price: 100, category: 'veg_soyabean', isAvailable: true, description: 'Crisp vegetable balls tossed with garlic, ginger, and dark soy' },
  { id: 'gravy_veg_manchurian', name: 'Gravy Veg Manchurrian', price: 110, category: 'veg_soyabean', isAvailable: true, description: 'Golden vegetable balls simmered in savory dark soy garlic gravy' },
  { id: 'soya_kantikki', name: 'Soyabean Kantikki', price: 90, category: 'veg_soyabean', isAvailable: true, description: 'Spiced and crispy deep-fried soy cutlets' },
  { id: 'soya_manchurian', name: 'Soyabean Manchurian', price: 100, category: 'veg_soyabean', isAvailable: true, description: 'Soya chunks coated in savory Manchurian sauce with spring onions' },
  { id: 'paneer_chilly', name: 'Paneer Chilly', price: 180, category: 'veg_soyabean', isAvailable: true, description: 'Cottage cheese cubes stir-fried with bell peppers, green chilies, and soy' },
  { id: 'pav_bhaji', name: 'Pav Bhaji', price: 70, category: 'veg_soyabean', isAvailable: true, description: 'Rich mashed spiced vegetable curry served with 2 soft buttered pav' },
  { id: 'only_bhaji', name: 'Only Bhaji', price: 50, category: 'veg_soyabean', isAvailable: true, description: 'Extra portion of flavorful butter-topped pav bhaji curry' },

  // 14. Rice & Noodles
  { id: 'rn_veg_fried_rice', name: 'Veg Fried Rice', price: 100, category: 'rice_noodles', isAvailable: true, description: 'Wok-tossed basmati rice with finely chopped seasonal vegetables' },
  { id: 'rn_sch_fried_rice', name: 'Schezwan Fried Rice', price: 110, category: 'rice_noodles', isAvailable: true, description: 'Spicy wok-fried rice tossed in fiery home-style schezwan sauce' },
  { id: 'rn_burn_garlic_rice', name: 'Burn Garlic Rice', price: 120, category: 'rice_noodles', isAvailable: true, description: 'Fragrant fried rice loaded with aromatic golden burnt garlic' },
  { id: 'rn_paneer_fried_rice', name: 'Paneer Fried Rice', price: 130, category: 'rice_noodles', isAvailable: true, description: 'Wok-fried basmati rice tossed with fresh cottage cheese cubes and veggies' },
  { id: 'rn_veg_hakka_noodles', name: 'Veg Hakka Noodles', price: 100, category: 'rice_noodles', isAvailable: true, description: 'Classic Indo-Chinese stir-fried noodles with crunchy cabbage, carrots & soy' },
  { id: 'rn_veg_sch_noodles', name: 'Veg Sch Noodles', price: 110, category: 'rice_noodles', isAvailable: true, description: 'Spicy stir-fried noodles tossed with vegetables in schezwan sauce' },
  { id: 'rn_paneer_noodles', name: 'Paneer Noodles', price: 130, category: 'rice_noodles', isAvailable: true, description: 'Stir-fried noodles with soft paneer cubes, vegetables, and seasoning' },
  { id: 'rn_hong_kong_veg_noodles', name: 'Hong Kong Veg Noodles', price: 140, category: 'rice_noodles', isAvailable: true, description: 'Hong Kong style wok-tossed noodles with colorful vegetables and special sauce' },
  { id: 'rn_burn_garlic_noodles', name: 'Burn Garlic Noodles', price: 140, category: 'rice_noodles', isAvailable: true, description: 'Flavor-packed noodles tossed with deeply roasted golden burnt garlic' },
  { id: 'rn_chk_jingling_noodles', name: 'Chicken Jingling Noodles', price: 140, category: 'rice_noodles', isAvailable: true, description: "Chef's signature spicy stir-fried chicken noodles with crunchy vegetables" },
  { id: 'rn_chk_fried_rice', name: 'Chicken Fried Rice', price: 130, category: 'rice_noodles', isAvailable: true, description: 'Basmati rice wok-tossed with tender chicken bits and egg' },
  { id: 'rn_chi_sch_fried_rice', name: 'Chi Sch Fried Rice', price: 140, category: 'rice_noodles', isAvailable: true, description: 'Spicy chicken schezwan fried rice with chicken chunks and spring onions' },
  { id: 'rn_chk_garlic_rice', name: 'Chicken Garlic Rice', price: 150, category: 'rice_noodles', isAvailable: true, description: 'Wok-tossed chicken rice infused with rich toasted garlic flavor' },
  { id: 'rn_chk_noodles', name: 'Chicken Noodles', price: 130, category: 'rice_noodles', isAvailable: true, description: 'Classic stir-fried noodles with shredded chicken and fresh vegetables' },
  { id: 'rn_chk_sch_noodles', name: 'Chicken Sch Noodles', price: 140, category: 'rice_noodles', isAvailable: true, description: 'Fiery wok-tossed chicken noodles in spicy schezwan sauce' },

  // 15. Beverages & Cold Drinks
  { id: 'bev_bisleri', name: 'Bisleri', price: 20, category: 'beverages', isAvailable: true, description: 'Packaged mineral drinking water (Chilled 1L)' },
  { id: 'bev_sprite', name: 'Sprite', price: 20, category: 'beverages', isAvailable: true, description: 'Chilled refreshing lemon-lime cold drink (Can/Bottle)' },
];

export const MOCK_ORDERS: Order[] = [];

/**
 * Normalizes an array of MenuItems:
 * 1. Converts legacy category identifiers to the official 14 categories.
 * 2. Deduplicates items strictly by ID so no duplicate keys can ever exist.
 * 3. Checks if any of the 14 categories are missing and merges default items without ID collisions.
 */
export function normalizeMenuItems(existingItems: MenuItem[]): MenuItem[] {
  if (!existingItems || existingItems.length === 0) {
    return DEFAULT_MENU_ITEMS;
  }

  // If existing menu items are older schema and don't include key items like Chicken Hydrabadi or Veg 65,
  // return the official DEFAULT_MENU_ITEMS
  const hasOfficialCatalog = existingItems.some(item => item.id === 'chk_hydrabadi' || item.id === 'veg_65' || item.id === 'mut_hundi_10');
  if (!hasOfficialCatalog) {
    return DEFAULT_MENU_ITEMS;
  }

  const categoryMap: Record<string, string> = {
    'chicken_specials': 'chicken_special',
    'egg_specials': 'egg_special',
    'chicken special': 'chicken_special',
    'chicken specials': 'chicken_special',
    'mutton special': 'mutton_special',
    'veg special': 'veg_special',
    'fish special': 'fish_special',
    'rice': 'rice',
    'bread': 'bread',
    'papad': 'papad',
    'egg special': 'egg_special',
    'egg specials': 'egg_special',
    "veera's special": 'veeras_special',
    "veeras special": 'veeras_special',
    'veeras_special': 'veeras_special',
    'ukad': 'ukad',
    'chicken chinese special': 'chicken_chinese_special',
    'chicken_chinese_special': 'chicken_chinese_special',
    'soups': 'soups',
    'soup': 'soups',
    'veg & soyabean delights': 'veg_soyabean',
    'veg & soyabean': 'veg_soyabean',
    'veg_soyabean': 'veg_soyabean',
    'rice & noodles': 'rice_noodles',
    'rice_noodles': 'rice_noodles',
    'beverages': 'beverages',
    'beverage': 'beverages',
    'cold drinks': 'beverages',
    'drinks': 'beverages',
    'water': 'beverages',
  };

  const seenIds = new Set<string>();
  const deduplicated: MenuItem[] = [];

  for (const item of existingItems) {
    if (!item || !item.id) continue;
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);

    const rawCat = (item.category || '').toLowerCase().trim();
    let mapped = categoryMap[rawCat] || item.category;

    // Explicitly enforce proper category assignments for specific items
    if (item.id === 'bev_bisleri' || item.id === 'bev_sprite') {
      mapped = 'beverages';
    } else if (item.id === 'extra_pav') {
      mapped = 'bread';
    } else if (item.id === 'only_bhaji') {
      mapped = 'veg_soyabean';
    }

    deduplicated.push({
      ...item,
      category: mapped,
    });
  }

  // Check which of the 14 categories are present
  const presentCategoryIds = new Set(deduplicated.map((i) => i.category));
  const missingCategories = DEFAULT_CATEGORIES.filter((cat) => !presentCategoryIds.has(cat.id));

  // If any of the official 14 categories are completely missing,
  // merge defaults for those categories, ensuring NO duplicate IDs can ever be added
  if (missingCategories.length > 0) {
    for (const defItem of DEFAULT_MENU_ITEMS) {
      if (missingCategories.some((cat) => cat.id === defItem.category)) {
        if (!seenIds.has(defItem.id)) {
          seenIds.add(defItem.id);
          deduplicated.push(defItem);
        }
      }
    }
  }

  return deduplicated;
}
