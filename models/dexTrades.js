module.exports = function (sequelize, DataTypes) {
  const DexTrades = sequelize.define('dextrades', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hash_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    token_in: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token_out: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount_in: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    amount_out: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    swapped_rate: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    dex: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'dextrades', timestamps: false,
  })

  return DexTrades
}
