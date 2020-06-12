"use strict";

module.exports = function(sequelize, DataTypes) {
  var Transactions = sequelize.define('Transactions', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    blockHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    blockNumber: {
      type: DataTypes.INTEGER,
      allowNull:  false
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gas: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gas_price: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    hash: {
      uniquie: true,
      type: DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    nonce: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
    // transactionIndex ?
    // v ? r ? s ?
  }, {
    tableName: 'transactions', timestamps : false
  });

  return Transactions;
};
