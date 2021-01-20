'use strict';
module.exports = (sequelize, DataTypes) => {
  const Income_scheme = sequelize.define('Income_scheme', {
    level: DataTypes.INTEGER,
    type: DataTypes.STRING,
    percentage: DataTypes.FLOAT, 
    member:  DataTypes.INTEGER,
    tokenAmount :DataTypes.FLOAT
  }, {});
  Income_scheme.associate = function(models) {
    // associations can be defined here
  };
  return Income_scheme;
};