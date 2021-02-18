module.exports = function (sequelize, DataTypes) {
  const Blocks = sequelize.define('Blocks', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    extraData: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gasLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gasUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tx_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    miner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parentHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nonce: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sha3Uncle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalDifficulty: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'blocks', timestamps: false,
  })

  return Blocks
}
