'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class menu_items extends Model {
    static associate(models) {
      // A menu item belongs to a category
      menu_items.belongsTo(models.categories, {
        foreignKey: 'category_id',
        as: 'category',
      });

      // A menu item can appear in many order_items
      menu_items.hasMany(models.order_items, {
        foreignKey: 'menu_item_id',
        as: 'orderItems',
      });
    }
  }

  menu_items.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'menu_items',
    }
  );

  return menu_items;
};
