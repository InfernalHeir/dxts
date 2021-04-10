"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_referal_id: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      uuid: {
        type: Sequelize.STRING
      },
      trx_user_walletaddress: {
        type: Sequelize.STRING
      },
      trx_user_keys: {
        type: Sequelize.STRING
      },
      parent_id: {
        type: Sequelize.STRING
      },
      dollar_amount_invested: {
        type: Sequelize.FLOAT
      },
      token_market_price: {
        type: Sequelize.FLOAT
      },
      token_deposited: {
        type: Sequelize.FLOAT
      },
      account_status: {
        type: Sequelize.STRING
      },
      user_application_wallet: {
        type: Sequelize.FLOAT
      },
      trx_blockchain_txid: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Users");
  }
};

// firstName: {
//   type: Sequelize.STRING
// },
// lastName: {
//   type: Sequelize.STRING
// },
// mobile_no: {
//   type: Sequelize.INTEGER
// },