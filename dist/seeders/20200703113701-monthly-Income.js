'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.bulkInsert('Income_schemes', [{
      level: 1,
      type: "PRINCIPALAMOUNT",
      percentage: 3.33 / 100, // Equivalent to 3.33% 
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      level: 2,
      type: "PROFITBONOUS",
      percentage: 3.33 / 100, // Equivalent to 3.33% 
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      level: 3,
      type: "COLDWALLET",
      percentage: 3.33 / 100, // Equivalent to 3.33% 
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      level: 3,
      type: "RETUEN_MAX_MONTHLY",
      percentage: 300 / 100, // Equivalent to 3.33% 
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
       Example:      return queryInterface.bulkDelete('People', null, {});
    */
  }
};