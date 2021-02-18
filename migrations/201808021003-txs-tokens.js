module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('txs-tokens', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    blockHash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    blockNumber: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    from: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    to: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    value: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    hash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    timestamp: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('txs-tokens'),
}

// { address: '0xA887adb722cf15bc1EFE3c6A5D879e0482e8d197',
//     blockNumber: 1357952,
//     transactionHash: '0x206915815d3053ece903bcd250cbe22cee84b83bac8277e003055900112702fa',
//     transactionIndex: 5,
//     blockHash: '0x5110eccc31ad9767b968b300ee595f8e571a11e1f05823844048c7f887173f82',
//     logIndex: 2,
//     removed: false,
//     id: 'log_73462840',
//     returnValues:
//      Result {
//        '0': '0x31aEBb8c27e3A5600Db88D49DFEbC5A35B48AEd3',
//        '1': '0xE8E2723aFa9B07641E6e02B7820B76593553C355',
//        '2': '100000000000000000000',
//        _from: '0x31aEBb8c27e3A5600Db88D49DFEbC5A35B48AEd3',
//        _to: '0xE8E2723aFa9B07641E6e02B7820B76593553C355',
//        _value: '100000000000000000000' },
//     event: 'Transfer',
//     signature: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//     raw:
//      { data: '0x0000000000000000000000000000000000000000000000056bc75e2d63100000'
