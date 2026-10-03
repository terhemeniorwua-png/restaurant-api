'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class categories extends Model {
    static associate(models) {
      // A category has many menu items
      categories.hasMany(models.menu_items, {
        foreignKey: 'category_id',
        as: 'menuItems',
      });
    }
  }

  categories.init(
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
    },
    {
      sequelize,
      modelName: 'categories',
    }
  );

  return categories;
};
