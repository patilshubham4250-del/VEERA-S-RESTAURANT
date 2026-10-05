/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Flame,
  UtensilsCrossed,
  Salad,
  Fish,
  CookingPot,
  Sandwich,
  Disc,
  Egg,
  Sparkles,
  Soup,
  CupSoda,
  GlassWater,
  Utensils,
  Layers,
  Cake,
  Coffee,
  Pizza,
  Wine,
  Beer,
  Apple,
  Popcorn,
  Beef,
  IceCream,
  Croissant,
  Grape
} from 'lucide-react';

export interface CategoryIconOption {
  name: string;
  label: string;
  icon: React.ElementType;
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { name: 'Flame', label: 'Spicy / Grill', icon: Flame },
  { name: 'UtensilsCrossed', label: 'Main / Meat', icon: UtensilsCrossed },
  { name: 'Salad', label: 'Veg / Greens', icon: Salad },
  { name: 'Fish', label: 'Fish / Seafood', icon: Fish },
  { name: 'CookingPot', label: 'Rice / Biryani', icon: CookingPot },
  { name: 'Sandwich', label: 'Bread / Roti', icon: Sandwich },
  { name: 'Disc', label: 'Papad / Crisps', icon: Disc },
  { name: 'Egg', label: 'Egg Special', icon: Egg },
  { name: 'Sparkles', label: 'Special / Premium', icon: Sparkles },
  { name: 'Soup', label: 'Soup / Broth', icon: Soup },
  { name: 'CupSoda', label: 'Cold Drink / Soda', icon: CupSoda },
  { name: 'GlassWater', label: 'Water / Beverages', icon: GlassWater },
  { name: 'Utensils', label: 'General / Dining', icon: Utensils },
  { name: 'Layers', label: 'Noodles / Chinese', icon: Layers },
  { name: 'Cake', label: 'Desserts / Bakery', icon: Cake },
  { name: 'Coffee', label: 'Coffee / Tea', icon: Coffee },
  { name: 'Pizza', label: 'Pizza / Fast Food', icon: Pizza },
  { name: 'Wine', label: 'Mocktails / Bar', icon: Wine },
  { name: 'Beer', label: 'Beer / Chilled', icon: Beer },
  { name: 'Apple', label: 'Fruits / Healthy', icon: Apple },
  { name: 'Popcorn', label: 'Snacks / Starters', icon: Popcorn },
  { name: 'Beef', label: 'Steak / Red Meat', icon: Beef },
  { name: 'IceCream', label: 'Ice Cream / Sundae', icon: IceCream },
  { name: 'Croissant', label: 'Pastry / Breakfast', icon: Croissant },
  { name: 'Grape', label: 'Juices / Shakes', icon: Grape }
];

export function getCategoryIcon(iconName?: string): React.ElementType {
  if (!iconName) return Utensils;
  const match = CATEGORY_ICON_OPTIONS.find(
    (opt) => opt.name.toLowerCase() === iconName.toLowerCase()
  );
  return match ? match.icon : Utensils;
}
