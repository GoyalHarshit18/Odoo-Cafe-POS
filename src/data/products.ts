import { Product } from '@/types/pos';

import pizzaImg from '@/assets/food/pizza.jpg';
import burgerImg from '@/assets/food/burger.jpg';
import pastaImg from '@/assets/food/pasta.jpg';
import friesImg from '@/assets/food/fries.jpg';
import coffeeImg from '@/assets/food/coffee.jpg';
import dessertImg from '@/assets/food/dessert.jpg';
import saladImg from '@/assets/food/salad.jpg';
import juiceImg from '@/assets/food/juice.jpg';

export const products: Product[] = [
  // Pizza
  {
    id: 'pizza-1',
    name: 'Margherita Pizza',
    price: 299,
    category: 'pizza',
    image: pizzaImg,
    description: 'Classic tomato, mozzarella & fresh basil'
  },
  {
    id: 'pizza-2',
    name: 'Pepperoni Pizza',
    price: 399,
    category: 'pizza',
    image: pizzaImg,
    description: 'Loaded with spicy pepperoni'
  },
  {
    id: 'pizza-3',
    name: 'BBQ Chicken Pizza',
    price: 449,
    category: 'pizza',
    image: pizzaImg,
    description: 'Smoky BBQ sauce with grilled chicken'
  },
  
  // Burgers
  {
    id: 'burger-1',
    name: 'Classic Cheeseburger',
    price: 249,
    category: 'burgers',
    image: burgerImg,
    description: 'Beef patty with cheddar & pickles'
  },
  {
    id: 'burger-2',
    name: 'Bacon Deluxe',
    price: 329,
    category: 'burgers',
    image: burgerImg,
    description: 'Double patty with crispy bacon'
  },
  {
    id: 'burger-3',
    name: 'Veggie Burger',
    price: 199,
    category: 'burgers',
    image: burgerImg,
    description: 'Plant-based patty with fresh veggies'
  },

  // Pasta
  {
    id: 'pasta-1',
    name: 'Spaghetti Bolognese',
    price: 279,
    category: 'pasta',
    image: pastaImg,
    description: 'Rich meat sauce with parmesan'
  },
  {
    id: 'pasta-2',
    name: 'Creamy Alfredo',
    price: 299,
    category: 'pasta',
    image: pastaImg,
    description: 'Fettuccine in creamy garlic sauce'
  },
  {
    id: 'pasta-3',
    name: 'Penne Arrabbiata',
    price: 249,
    category: 'pasta',
    image: pastaImg,
    description: 'Spicy tomato sauce with chili flakes'
  },

  // Sides
  {
    id: 'sides-1',
    name: 'French Fries',
    price: 99,
    category: 'sides',
    image: friesImg,
    description: 'Crispy golden fries with seasoning'
  },
  {
    id: 'sides-2',
    name: 'Garden Salad',
    price: 149,
    category: 'sides',
    image: saladImg,
    description: 'Fresh greens with feta & olives'
  },
  {
    id: 'sides-3',
    name: 'Garlic Bread',
    price: 129,
    category: 'sides',
    image: friesImg,
    description: 'Toasted bread with garlic butter'
  },

  // Beverages
  {
    id: 'bev-1',
    name: 'Cappuccino',
    price: 149,
    category: 'beverages',
    image: coffeeImg,
    description: 'Espresso with steamed milk foam'
  },
  {
    id: 'bev-2',
    name: 'Fresh Orange Juice',
    price: 129,
    category: 'beverages',
    image: juiceImg,
    description: 'Freshly squeezed oranges'
  },
  {
    id: 'bev-3',
    name: 'Iced Latte',
    price: 169,
    category: 'beverages',
    image: coffeeImg,
    description: 'Cold espresso with chilled milk'
  },

  // Desserts
  {
    id: 'dessert-1',
    name: 'Chocolate Lava Cake',
    price: 199,
    category: 'desserts',
    image: dessertImg,
    description: 'Warm cake with molten center'
  },
  {
    id: 'dessert-2',
    name: 'Tiramisu',
    price: 229,
    category: 'desserts',
    image: dessertImg,
    description: 'Classic Italian coffee dessert'
  },
  {
    id: 'dessert-3',
    name: 'Ice Cream Sundae',
    price: 179,
    category: 'desserts',
    image: dessertImg,
    description: 'Three scoops with toppings'
  },
];

export const categories = [
  { id: 'all', name: 'All Items', icon: '🍽️' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'burgers', name: 'Burgers', icon: '🍔' },
  { id: 'pasta', name: 'Pasta', icon: '🍝' },
  { id: 'sides', name: 'Sides', icon: '🍟' },
  { id: 'beverages', name: 'Beverages', icon: '☕' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
];
