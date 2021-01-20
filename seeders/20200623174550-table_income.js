'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => { 


    return queryInterface.bulkInsert('Income_schemes', [
      {
        level: 1,
        type: "TABLE",
        member: 5,
        tokenAmount: 1,
        percentage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level: 2,
        type: "TABLE",
        member: 25,
        tokenAmount: 5,
        percentage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level: 3,
        type: "TABLE",
        member: 125,
        tokenAmount: 50, 
        percentage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level: 4,
        type: "TABLE",
        member: 625 ,
        tokenAmount: 250,
        percentage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level: 5,
        type: "TABLE",
        member: 3125,
        tokenAmount: 500,
        percentage: null, 
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
