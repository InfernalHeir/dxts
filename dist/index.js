"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
const cron = require("node-cron");
var basename = path.basename(module.filename);

var db = {};
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
// This will be our application entry. We'll setup our server here.
const http = require("http");
var cors = require("cors");

// asyncify for express router
//const asyncify = require("express-asyncify");
const { config } = require("dotenv");
config();
// Set up the express app

const app = express();
//var dotenv = require('dotenv');

const {
  registration,
  login,
  isWalletExist,
  importWalletInfo,
  createWalletInfo,
  userLevelList,
  alluserLevelList,
  isReferralExist,
  generatesampleuuid,
  dashBoardInfo,
  reset,
  addnews,
  getlatestnews,
  getallnewslist,
  alluserProfileList,
  updateaccesstatus,
  profitbonuswalletWithdrawal,
  principalwalletWithdrawal,
  admindashBoardInfo,
  usertotalIncome,
  coldwalletWithdrawal,
  userwalletBalance,
  userwithdrawableAmount,
  userMnemonicKeys
} = require("./controller/user");

const {
  LevelReferalIncome,
  initialInvestement,
  allIncomeTxlist,
  allIncomeschemes,
  allusermonthlyrewardList,
  alluserrefralrewardList,
  alluserwithdrawrewardList,
  minmaxdollarInvestment,
  allusertablerewardList,
  alluserinvestmentrewardList,
  updateAirdrop,
  alluserrefrallist,
  getAirDrop,
  usertokenTranster,
  trxtoTokenconversion,
  ethConversionRateInfo,
  trxConversionRateInfo
} = require("./controller/reward");

const {
  tokenAmountEqUSDdeposit,
  tranferTokens
} = require("./controller/wallet");
const {
  addsupportTicket,
  listAllTicketSupport,
  resolveTicket,
  userAllTickets
} = require("./controller/supportTicket");

const checkToken = require("./auth/middleware");

const {
  addwithdrawalRequest,
  withdrawalUserList,
  getpendingwithdrawalList,
  updatependingwithdrawalstatus
} = require("./controller/withdrawal");

const { receiveTodaysInvestment } = require("./controller/monthlyReward");

const {
  insertuserTablescheme,
  distributeTableReward
} = require("./controller/tableIncome");
const {
  getTrxPriceUSD,
  getTrxCoversionInDestiny
} = require("./controller/tronWallet");

// Log requests to the console.
app.use(logger("dev"));
app.use(cors());

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

fs.readdirSync(__dirname).filter(function (file) {
  return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
}).forEach(function (file) {
  var model = sequelize["import"](path.join(__dirname, file));
  db[model.name] = model;
});

Object.keys(db).forEach(function (modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// setup cron job 5 min  */5 * * * *
// every 23:01" 1 23 * * *
cron.schedule(" 1 23 * * * ", function () {
  try {
    console.log("running a task every 23:01 of day");
    receiveTodaysInvestment();
  } catch (e) {
    console.log("---e---", e);
  }
});

// get Sample UUID
app.get("/getsampleuuid", generatesampleuuid);

// check referral Exist
app.get("/referralexist", isReferralExist);

// registration with valid credentials
app.post("/registration", registration);

// reset login with phasepharse.
app.post("/reset", reset);

// login with valid credentials.
app.post("/login", login);

// check if user wallet exist or not.
app.get("/walletexist", checkToken, isWalletExist);

// wallet import it will carry logic
app.put("/walletimport", checkToken, importWalletInfo);

// create wallet
app.post("/walletcreate", checkToken, createWalletInfo);

// get secure wallet keys.
app.get("/walletkeys", checkToken, userMnemonicKeys);

// get user team
app.get("/userteam", checkToken, alluserrefrallist);

//@TODO only admin yeah :)
app.get("/alluserprofile", checkToken, alluserProfileList);

//@TODO only admin yeah :) for unlocked id.
app.put("/reactivate", checkToken, updateaccesstatus);

// get user level list
app.get("/userlevellist", checkToken, userLevelList);

// get all user level list
app.get("/alluserlevellist", checkToken, alluserLevelList);

// token Price information
// req.query = usdAmount;
app.get("/tokenpriceinfo", checkToken, tokenAmountEqUSDdeposit);

// get user token wallet balance
// response shape
/**
 {
  "status": true,
  "message": "Wallet Token Balance",
  "tokenBalance": 1000
}
 */
app.get("/userwalletbalance", checkToken, userwalletBalance);

// get user withdrawal amount
app.get("/userwithdrawableAmount", checkToken, userwithdrawableAmount);

// token transfer with each other.
// body receiverAddress
// body tokentrasnsferAmount
// it will through error for now.
app.post("/tokentransfer", checkToken, usertokenTranster);

// user can buy token with trx this will not done yet,
app.post("/dxtsconversion", checkToken, trxtoTokenconversion);

// this will give you conversion history
// dxts conversion info
app.get("/dxtsconversioninfo", checkToken, trxConversionRateInfo);

app.post("/investment", checkToken, initialInvestement);
//app.get("/trxPrice", getTrxCoversionInDestiny);

//@UPDATED endpoint
// app.post('/referalpayment', function (req, res) {
//     LevelReferalIncome(req, res)
// })
//@TODO  only Admin
app.get("/admindashboard", checkToken, admindashBoardInfo);

app.get("/dashboard", checkToken, dashBoardInfo);

app.post("/addticket", checkToken, addsupportTicket);

app.get("/usertotalincome", checkToken, usertotalIncome);

app.post("/profitbonouswithdrawal", checkToken, profitbonuswalletWithdrawal);

app.post("/principalwithdrawal", checkToken, principalwalletWithdrawal);

app.post("/coldlwithdrawal", checkToken, coldwalletWithdrawal);

app.get("/userticketslist", checkToken, userAllTickets);

app.get("/alltickets", checkToken, listAllTicketSupport);
//@TODO only admin
app.put("/resolveticket", checkToken, resolveTicket);
app.get("/allrewardscheme", checkToken, allIncomeschemes);

app.get("/allrewardlist", checkToken, allIncomeTxlist);

app.post("/addwithdrawalrequest", checkToken, addwithdrawalRequest);

app.get("/userwithdrawallist", checkToken, withdrawalUserList);
//@TODO only admin
app.put("/withdrawstatus", checkToken, updatependingwithdrawalstatus);

app.get("/pendingwithdrawlist", checkToken, getpendingwithdrawalList);

app.get("/monthlyrewards", checkToken, allusermonthlyrewardList);

app.get("/withdrawrewards", checkToken, alluserwithdrawrewardList);

app.get("/referalrewards", checkToken, alluserrefralrewardList);

app.get("/tablerewards", checkToken, allusertablerewardList);

app.get("/investmentlist", checkToken, alluserinvestmentrewardList);

app.get("/minmaxdollarinvestments", checkToken, minmaxdollarInvestment);
//@TODO only Admin validation need to be applied.
app.put("/airdrop", checkToken, updateAirdrop);

app.get("/airdrop", checkToken, getAirDrop);
//@TODO only Admin validation need to be applied.
app.post("/news", checkToken, addnews);

app.get("/news", checkToken, getlatestnews);

app.get("/allnews", checkToken, getallnewslist);

cron.schedule(" 1 23 * * * ", function () {
  distributeTableReward();
  //insertuserTablescheme(req,res)
});

const port = process.env.PORT || 3000;

const server = http.createServer(app);
server.listen(port, () => {
  const pid = process.pid;
  console.log(`server started at ${port} and process-id is ${pid}`);
});

db.Sequelize = Sequelize;
module.exports = db;