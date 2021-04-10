"use strict";

let jwt = require("jsonwebtoken");
const constant = require("./constants");
var models = require("../models");
const userModel = models.User;

const checkToken = async (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"]; // Express headers are auto converted to lowercase
  if (token.startsWith("Bearer ")) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, constant.secret, async (err, decoded) => {
      if (err) {
        return res.json({
          status: false,
          message: "Token is not valid"
        });
      } else {
        console.log("decoded--->", decoded);
        req.decoded = decoded;
        req.uuid = decoded.uuid;

        var userExist = await userModel.findOne({
          raw: true,
          where: {
            uuid: req.uuid
          }
        });
        console.log("---middleware---", userExist);
        if (!userExist.isActive) {
          return res.status(500).json({
            status: false,
            message: "User Deactivated ! Please contact Admin"
          });
        }

        next();
      }
    });
  } else {
    return res.json({
      status: false,
      message: "Auth token is not supplied"
    });
  }
};

module.exports = checkToken;