'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Get user IDs
    const usersRows = await queryInterface.sequelize.query(
      `SELECT id FROM users ORDER BY id`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Get menu item IDs + prices
    const menuRows = await queryInterface.sequelize.query(
      `SELECT id, name, price FROM menu_items ORDER BY id`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (usersRows.length === 0 || menuRows.length === 0) {
      console.log('Skipping orders seeder — no users or menu items found.');
      return;
    }

    const user1 = usersRows[0].id;
    const user2 = usersRows.length > 1 ? usersRows[1].id : usersRows[0].id;

    // Build a map for easy lookup
    const menuMap = {};
    menuRows.forEach((m) => (menuMap[m.name] = { id: m.id, price: parseFloat(m.price) }));

    const getItem = (name) => menuMap[name] || menuRows[0];

    // Order 1: Burger + Drink
    const burger = getItem('Classic Beef Burger');
    const coke = getItem('Coca Cola');
    const order1Total = burger.price * 2 + coke.price * 2;

    // Order 2: Pizza + Side + Dessert
    const pizza = getItem('Pepperoni Pizza');
    const fries = getItem('Seasoned Fries');
    const cake = getItem('Chocolate Lava Cake');
    const order2Total = pizza.price * 1 + fries.price * 1 + cake.price * 1;

    // Insert orders
    await queryInterface.bulkInsert('orders', [
      {
        user_id: user1,
        status: 'delivered',
        total_price: parseFloat(order1Total.toFixed(2)),
        notes: 'Extra sauce on the side please',
        createdAt: now,
        updatedAt: now,
      },
      {
        user_id: user2,
        status: 'pending',
        total_price: parseFloat(order2Total.toFixed(2)),
        notes: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Get the inserted order IDs
    const ordersRows = await queryInterface.sequelize.query(
      `SELECT id FROM orders ORDER BY id`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (ordersRows.length < 2) return;

    const order1Id = ordersRows[0].id;
    const order2Id = ordersRows[1].id;

    // Insert order items
    await queryInterface.bulkInsert('order_items', [
      // Order 1 items
      {
        order_id: order1Id,
        menu_item_id: burger.id,
        quantity: 2,
        unit_price: burger.price,
        createdAt: now,
        updatedAt: now,
      },
      {
        order_id: order1Id,
        menu_item_id: coke.id,
        quantity: 2,
        unit_price: coke.price,
        createdAt: now,
        updatedAt: now,
      },
      // Order 2 items
      {
        order_id: order2Id,
        menu_item_id: pizza.id,
        quantity: 1,
        unit_price: pizza.price,
        createdAt: now,
        updatedAt: now,
      },
      {
        order_id: order2Id,
        menu_item_id: fries.id,
        quantity: 1,
        unit_price: fries.price,
        createdAt: now,
        updatedAt: now,
      },
      {
        order_id: order2Id,
        menu_item_id: cake.id,
        quantity: 1,
        unit_price: cake.price,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
  },
};
