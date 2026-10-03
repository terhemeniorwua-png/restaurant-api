'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class order_items extends Model {
    static associate(models) {
      // An order_item belongs to an order
      order_items.belongsTo(models.orders, {
        foreignKey: 'order_id',
        as: 'order',
      });

      // An order_item belongs to a menu_item
      order_items.belongsTo(models.menu_items, {
        foreignKey: 'menu_item_id',
        as: 'menuItem',
      });
    }
  }

  order_items.init(
    {
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      menu_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'order_items',
    }
  );

  return order_items;
};
