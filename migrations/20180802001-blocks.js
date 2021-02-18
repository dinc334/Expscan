module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('blocks', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    number: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    },
    extraData: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    hash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    gasLimit: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    gasUsed: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    tx_count: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    miner: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    difficulty: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    timestamp: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    size: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    parentHash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    nonce: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    sha3Uncle: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    totalDifficulty: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }),

  down: (queryInterface) => queryInterface.dropTable('blocks'),
}
