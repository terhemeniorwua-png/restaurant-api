'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Fetch category IDs dynamically so the seeder works regardless of auto-increment start
    const cats = await queryInterface.sequelize.query(
      `SELECT id, name FROM categories ORDER BY id`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const catMap = {};
    cats.forEach((c) => (catMap[c.name] = c.id));

    await queryInterface.bulkInsert('menu_items', [
      // Burgers
      {
        name: 'Classic Beef Burger',
        description: 'Juicy beef patty with lettuce, tomato, and special sauce',
        price: 2500.00,
        category_id: catMap['Burgers'],
        is_available: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Crispy Chicken Burger',
        description: 'Golden crispy chicken fillet with coleslaw and mayo',
        price: 2200.00,
        category_id: catMap['Burgers'],
        is_available: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Double Smash Burger',
        description: 'Two smashed beef patties with cheese, pickles, and mustard',
        price: 3500.00,
        category_id: catMap['Burgers'],
        is_available: true,
        createdAt: now,
        updatedAt: now,
      },
      // Pizzas
      {
        name: 'Margherita Pizza',
        description: 'Classic tomato sauce with fresh mozzarella and basil',
        price: 4000.00,
        category_id: catMap['Pizzas'],
        is_available: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Loaded with pepperoni slices and mozzarella cheese',
        price: 4500.00,
        category_id: catMap['Pizzas'],
        is_available: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'BBQ Chicken Pizza',
        description: 'BBQ sauce base with grilled chicken, onions, and cheese',
        price: 5000.00,
        category_id: catMap['Pizzas'],
        is_available: true,
        createdAt: now,
        updatedAt: now,
      },
      // Drinks
      {
        name: 'Coca Cola',
        description: 'Ice-cold 50cl bottle of Coca-Cola',
        price: 300.00,
        category_id: catMap['Drinks'],
        is_available: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice, no added sugar',
        price: 800.00,
        category_id: catMap['Drinks'],
        is_available: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Chilled Water',
        description: '50cl bottle of still water',
        price: 150.00,
        category_id: catMap['Drinks'],
        is_available: true,
        createdAt: now,
        updatedAt: now,
      },
      // Sides
      {
        name: 'Seasoned Fries',
        description: 'Crispy golden fries seasoned with our house blend',
        price: 700.00,
        category_id: catMap['Sides'],
        is_available: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Onion Rings',
        description: 'Beer-battered onion rings served with dipping sauce',
        price: 900.00,
        category_id: catMap['Sides'],
        is_available: true,
        createdAt: now,
        updatedAt: now,
      },
      // Desserts
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a gooey molten center',
        price: 1500.00,
        category_id: catMap['Desserts'],
        is_available: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Vanilla Ice Cream',
        description: 'Two scoops of creamy vanilla ice cream',
        price: 1000.00,
        category_id: catMap['Desserts'],
        is_available: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('menu_items', null, {});
  },
};
