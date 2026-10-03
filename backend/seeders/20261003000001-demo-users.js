'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('Admin1234!', 10);
    const userPassword = await bcrypt.hash('User1234!', 10);
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin User',
        email: 'admin@restaurant.com',
        phone: '08012345678',
        password: hashedPassword,
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '08087654321',
        password: userPassword,
        role: 'user',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '09011223344',
        password: userPassword,
        role: 'user',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
