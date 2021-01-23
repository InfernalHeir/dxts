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
  userMnemonicKeys,
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
} = require("./controller/reward");

const {
  tokenAmountEqUSDdeposit,
  tranferTokens,
} = require("./controller/wallet");
const {
  addsupportTicket,
  listAllTicketSupport,
  resolveTicket,
  userAllTickets,
} = require("./controller/supportTicket");

const checkToken = require("./auth/middleware");

const {
  addwithdrawalRequest,
  withdrawalUserList,
  getpendingwithdrawalList,
  updatependingwithdrawalstatus,
} = require("./controller/withdrawal");

const { receiveTodaysInvestment } = require("./controller/monthlyReward");

const {
  insertuserTablescheme,
  distributeTableReward,
} = require("./controller/tableIncome");
const {
  getTrxPriceUSD,
  getTrxCoversionInDestiny,
} = require("./controller/tronWallet");

// Log requests to the console.
app.use(logger("dev"));
app.use(cors());

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

fs.readdirSync(__dirname)
  .filter(function (file) {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach(function (file) {
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

app.get("/getsampleuuid", generatesampleuuid);

app.get("/referralexist", isReferralExist);

app.post("/registration", registration);

app.post("/reset", reset);

app.post("/login", login);

app.get("/walletexist", checkToken, isWalletExist);

app.put("/walletimport", checkToken, importWalletInfo);

app.post("/walletcreate", checkToken, createWalletInfo);

app.get("/walletkeys", checkToken, userMnemonicKeys);

app.get("/userteam", checkToken, alluserrefrallist);

//@TODO only admin
app.get("/alluserprofile", checkToken, alluserProfileList);

//@TODO only admin
app.put("/reactivate", checkToken, updateaccesstatus);
app.get("/userlevellist", checkToken, userLevelList);

app.get("/alluserlevellist", checkToken, alluserLevelList);

app.get("/tokenpriceinfo", checkToken, tokenAmountEqUSDdeposit);

app.get("/userwalletbalance", checkToken, userwalletBalance);

app.get("/userwithdrawableAmount", checkToken, userwithdrawableAmount);

app.post("/tokentransfer", checkToken, usertokenTranster);

app.post("/dxtsconversion", checkToken, trxtoTokenconversion);

//app.get("/dxtsconversioninfo", checkToken, ethConversionRateInfo);

app.post("/investment", checkToken, initialInvestement);
app.get("/trxPrice", getTrxCoversionInDestiny);

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

// tron api checking

/* app.get("/createTronAccount", async (req, res) => {
  try {
    const keyStore = await createWallet();
    console.log("keyStore", keyStore);
    res.json(keyStore);
  } catch (err) {
    console.log(err);
  }
});

app.get("/getTrxBal/:address", async (req, res) => {
  const tronAccount = req.params.address;
  console.log(tronAccount);
  const getBalance = await getTrxBalance(tronAccount);
  res.send(`${getBalance} TRX`);
});

app.get("/importPriv/:privateKey", async (req, res) => {
  const privateKey = req.params.privateKey;
  console.log(privateKey);
  const keyStore = await importPrivateKey(privateKey);
  res.json(keyStore);
}); */

/* app.get("/importMnemonics", async (req, res) => {
  const mnemonics = req.query.mnemonices;
  console.log(mnemonics);
  const keyStore = await importWalletMnemonics(mnemonics, (err, result) => {
    if (err) {
      return res.send(err.message);
    }
    res.json(result);
  });
}); */

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
