"use strict";

module.exports = function(sequelize, DataTypes) {
  const Tokens = sequelize.define('Tokens', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ticker: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    holders: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transfers: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    twitter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cmc: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bitcointalk: {
      type: DataTypes.STRING,
      allowNull: true
    },
    decimals: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalSupply: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tokens', timestamps : false
  });
  return Tokens;
};
