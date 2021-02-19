module.exports = function (sequelize, DataTypes) {
  const TokensBalances = sequelize.define('TokensBalances', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tokenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lastActive: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'tokensBalances', timestamps: false,
  })

  return TokensBalances
}
