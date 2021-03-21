"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("User_tokenTransfers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      senderAddress: {
        type: Sequelize.STRING,
      },
      receiverAddress: {
        type: Sequelize.STRING,
      },
      token_transfered: {
        type: Sequelize.FLOAT,
      },
      trx_blockchain_txid: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("User_tokenTransfers");
  },
};
