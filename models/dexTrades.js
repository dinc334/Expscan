module.exports = function (sequelize, DataTypes) {
  const DexTrades = sequelize.define('DexTrades', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    tokenAmountIn: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tokenAmountOut: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    swappedRate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    txnValue: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dex: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'dexTrades', timestamps: false,
  })

  return DexTrades
}
