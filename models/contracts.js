"use strict";

module.exports = function(sequelize, DataTypes) {
  var Contracts = sequelize.define('Contracts', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    hash : {
      type: DataTypes.STRING,
      allowNull: false
    },
    contractAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    creator: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'contracts', timestamps : false
  });

  return Contracts;
};
