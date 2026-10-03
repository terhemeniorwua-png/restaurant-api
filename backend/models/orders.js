'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class orders extends Model {
    static associate(models) {
      // An order belongs to a user
      orders.belongsTo(models.users, {
        foreignKey: 'user_id',
        as: 'user',
      });

      // An order has many order_items
      orders.hasMany(models.order_items, {
        foreignKey: 'order_id',
        as: 'orderItems',
      });
    }
  }

  orders.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'orders',
    }
  );

  return orders;
};
