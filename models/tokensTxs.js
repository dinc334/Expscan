module.exports = function (sequelize, DataTypes) {
  const TokensTxs = sequelize.define('TokensTxs', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    blockHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    blockNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'tokensTxs', timestamps: false,
  })

  return TokensTxs
}
