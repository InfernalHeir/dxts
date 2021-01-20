'use strict';
module.exports = (sequelize, DataTypes) => {
  const airDrop = sequelize.define('airDrop', {
    airdropDollarAmoount: DataTypes.FLOAT
  }, {});
  airDrop.associate = function(models) {
    // associations can be defined here
  };
  return airDrop;
};