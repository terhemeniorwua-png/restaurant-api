'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('categories', [
      {
        name: 'Burgers',
        description: 'Juicy beef and chicken burgers served with fries',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Pizzas',
        description: 'Hand-tossed wood-fired pizzas with fresh toppings',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Drinks',
        description: 'Cold beverages, juices, sodas and smoothies',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Sides',
        description: 'Fries, onion rings, salads and dipping sauces',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Desserts',
        description: 'Ice cream, cakes, and sweet treats',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
