"use strict";

module.exports = (sequelize, DataTypes) => {
  const support_Ticket = sequelize.define("support_Ticket", {
    userId: DataTypes.INTEGER,
    subject: DataTypes.STRING,
    description: DataTypes.STRING,
    STATUS: DataTypes.BOOLEAN,
    admin_reply: DataTypes.STRING,
    review: DataTypes.STRING
  }, {});
  support_Ticket.associate = function (models) {
    // associations can be defined here
  };
  return support_Ticket;
};