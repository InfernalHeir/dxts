"use strict";

module.exports = (sequelize, DataTypes) => {
  const News_banner = sequelize.define("News_banner", {
    news: DataTypes.STRING
  }, {});
  News_banner.associate = function (models) {
    // associations can be defined here
  };
  return News_banner;
};