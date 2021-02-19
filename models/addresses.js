module.exports = function (sequelize, DataTypes) {
  const Addresses = sequelize.define('Addresses', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    balance_EXP: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    last_active: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    count: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  }, {
    tableName: 'addresses', timestamps: false,
  })

  return Addresses
}
