'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.bulkInsert('Income_schemes', [{
      level: 1,
      type: "REFERRAL",
      percentage: 5 / 100, // Equivalent to 5% 
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      level: 2,
      type: "REFERRAL",
      percentage: 2 / 100, // Equivalent to 2% 
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      level: 3,
      type: "REFERRAL",
      percentage: 1 / 100, // Equivalent to 1% 
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      level: 4,
      type: "REFERRAL",
      percentage: 2 / 100, // Equivalent to 2% 
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      level: 5,
      type: "REFERRAL",
      percentage: 1 / 100, // Equivalent to 1% 
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

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
  }
};