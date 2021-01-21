"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          password: "password321",
          uuid: "12345678",
          trx_user_walletaddress: null,
          trx_user_keys: null,
          parent_id: 0,
          dollar_amount_invested: 0,
          token_market_price: 0,
          token_deposited: 0,
          account_status: "INITIAL",
          user_application_wallet: 0,
          trx_blockchain_txid: null,
          user_referal_id: "initial@123654",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // mobile_no: "123456789",
    // firstName: 'initial',
    // lastName: "user",

    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  },
};
