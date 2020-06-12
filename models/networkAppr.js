"use strict";

module.exports = function(sequelize, DataTypes) {
  const NetworkAppr = sequelize.define('NetworkAppr', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      difficulty: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      hashrate: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      txs: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      txs_fee: {
        type: DataTypes.DOUBLE,
        allowNull: true
      }
  }, {
    tableName: 'networkAppr', timestamps : false
  });

  return NetworkAppr;
};
