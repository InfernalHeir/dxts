"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.addColumn("Users", "user_withdrawal_password", {
      type: Sequelize.STRING
    })]);

    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
       Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
       Example:
      return queryInterface.dropTable('users');
    */
  }
};