module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('tokens', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ticker: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    website: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    holders: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    transfers: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    twitter: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    cmc: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    bitcointalk: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    decimals: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    totalSupply: {
      type: Sequelize.BIGINT,
      allowNull: true,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  }),
  down: (queryInterface, DataTypes) => queryInterface.dropTable('tokens'),
}
