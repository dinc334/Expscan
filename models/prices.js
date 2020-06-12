"use strict";

module.exports = function(sequelize, DataTypes) {
  var Prices = sequelize.define('Prices', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ticker: {
        type: DataTypes.STRING,
        allowNull: false
      },
      price_usd: {
        type: DataTypes.STRING,
        allowNull: false
      },
      price_btc: {
        type: DataTypes.STRING,
        allowNull: false
      },
      volume: {
        type: DataTypes.STRING,
        allowNull: true
      },
      marketcap: {
        type: DataTypes.STRING,
        allowNull: true
      },
  }, {
    tableName: 'prices', timestamps : false
  });

  return Prices;
};
