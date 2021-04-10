"use strict";

const { Op, QueryTypes } = require("sequelize");
const db = require("../models");
let jwt = require("jsonwebtoken");
const constant = require("../auth/constants");
const APPLEVEL = constant.appLevel;
const QRCode = require("qrcode");
var models = require("../models");
var moment = require("moment");
const userRealtionModel = models.user_Realtion;
const userModel = models.User;
const rewardModel = models.Reward;
const airdropModel = models.airDrop;
const newsbannerModel = models.News_banner;
const monthlyreturnModel = models.Monthly_return;
const {
  userWalletExist,
  checkAddress,
  walletImportMnemonic,
  walletImportPrivateKey,
  walletCreate,
  getTokenBalance,
  getEthBalance,
  weitoEth,
  tokenEqAmount
} = require("./wallet");

const {
  createWallet,
  importWalletMnemonics,
  importPrivateKey,
  validateAddress,
  getDxtsBalance,
  getTrxBalance,
  dxtsDecimals,
  fromDxtsSun
} = require("./tronWallet");

const { insertuserTablescheme } = require("./tableIncome");
const max = 999999999;
const min = 111111111;
const PRINCIPALAMOUNT = "PRINCIPALAMOUNT";
const PROFITBONOUS = "PROFITBONOUS";
const COLDWALLET = "COLDWALLET";
const RETUEN_MAX_MONTHLY = "RETUEN_MAX_MONTHLY";
const PROHIBITIONPERIOD = 30;

// generate Sample UUID

const generatesampleuuid = async (req, res) => {
  console.log("---1-----");
  // var randomId =  generateRerferalcode((Math.floor(Math.random()*( max -min + 1))+ min)).toString()
  var randomId = generateRerferalcode((Math.floor(Math.random() * (max - min + 1)) + min).toString());

  console.log("randomId", randomId);
  var isUUIDexist = await checkUUID(randomId);
  console.log("inital uuid already ---no ---0-----", isUUIDexist);
  while (!isUUIDexist) {
    //randomId
    console.log("regenerate ---no ---1-----");
    // randomId =  (generateRerferalcode(Math.random().toString()))
    randomId = generateRerferalcode((Math.floor(Math.random() * (max - min + 1)) + min).toString());
    console.log("regenerated--no -2--", randomId);
    isUUIDexist = await checkUUID(randomId);
    console.log("lloop uuid ---3-----", isUUIDexist);
  }

  return res.status(200).json({
    status: true,
    message: "Random no",
    data: {
      sample_no: randomId
    }
  });
};

// is Referral Exist method to check referral
const isReferralExist = async (req, res) => {
  const { parent_referal_id } = req.query;
  console.log(" req.params", req.query);
  if (!parent_referal_id || parent_referal_id.length <= 0) return res.status(500).json({
    status: false,
    message: "Given provide a valid referal id"
  });

  var parent_userExist = await userModel.findOne({
    where: {
      user_referal_id: parent_referal_id
    }
  });

  if (!parent_userExist) {
    return res.status(500).json({
      status: false,
      message: "Please provide a valid referal id"
    });
  }

  return res.status(200).json({
    status: true,
    message: "Given referal id exist in system"
  });
};

// registration here
const registration = async (req, res) => {
  try {
    // firstName, lastName, mobile_no,
    const { password, uuid, parent_referal_id, withdrawalpassword } = req.body;
    // if (!firstName || firstName.length <= 0)
    //     return res.status(500).json({
    //         status: false,
    //         message: "Please provide a valid firstName"
    //     });

    if (!uuid || uuid.length <= 0) return res.status(500).json({
      status: false,
      message: "Please provide a valid UUID."
    });

    if (!password || password.length <= 0) return res.status(500).json({
      status: false,
      message: "Please provide a valid password"
    });

    if (!withdrawalpassword || withdrawalpassword.length <= 0) return res.status(500).json({
      status: false,
      message: "Please provide a valid withdrawalpassword"
    });

    if (!parent_referal_id || parent_referal_id.length <= 0) return res.status(500).json({
      status: false,
      message: "Please provide a valid referal id"
    });

    // if (!mobile_no || mobile_no.length <= 0 || !Number.isInteger(parseInt(mobile_no)))
    //     return res.status(500).json({
    //         status: false,
    //         message: "Please provide a valid mobile_no"
    //     });

    var user_alreadyExist = await userModel.findOne({
      where: {
        [Op.or]: [{
          uuid: uuid
        }]
      }
    });
    if (user_alreadyExist && user_alreadyExist.dataValues && Object.keys(user_alreadyExist.dataValues).length > 0) {
      return res.status(500).json({
        status: false,
        message: "User uuid already exits"
      });
    }

    var parent_userExist = await userModel.findOne({
      where: {
        user_referal_id: parent_referal_id
      }
    });

    if (!parent_userExist) {
      return res.status(500).json({
        status: false,
        message: "Please provide a valid referal id"
      });
    }

    // var new_user_referalId = generateRerferalcode(uuid)
    const airdropinfo = await airdropModel.findOne({
      raw: true
    });
    const AIRDROP_DOLLAR_AMOUNT = airdropinfo.airdropDollarAmoount;
    await userModel.create({
      // firstName: firstName,
      // lastName: lastName,
      password: password,
      uuid: uuid,
      // mobile_no: mobile_no,
      parent_id: parent_userExist.id,
      account_status: "INITIAL",
      user_application_wallet: AIRDROP_DOLLAR_AMOUNT, //Airdrop
      airDropDOllarAmount: AIRDROP_DOLLAR_AMOUNT,
      user_referal_id: uuid,
      // user_application_wallet: 0 ,
      user_withdrawal_password: withdrawalpassword
    });
    await multiParentChildLevelRelation(uuid);

    await insertuserTablescheme(uuid);

    var userExist = await userModel.findOne({
      where: {
        uuid: uuid
      }
    });
    if (!userExist) {
      return res.status(500).json({
        status: false,
        message: "Something went wrong"
      });
    }
    let token = jwt.sign({ uuid: uuid }, constant.secret, {
      // expiresIn: '24h' // expires in 24 hours
    });
    // return the JWT token for the future API calls
    return res.json({
      status: true,
      message: "Authentication successful!",
      token: token,
      data: userExist
    });

    // return res.status(200).json({
    //     status: true,
    //     message: "User has sucessfully been registered"
    // });
  } catch (e) {
    console.log("e", e);
  }
};

// this is for login
const login = async (req, res) => {
  const { uuid, password } = req.body;

  var userExist = await userModel.findOne({
    where: {
      uuid: uuid,
      password: password
    }
  });
  if (!userExist) {
    return res.status(500).json({
      status: false,
      message: "Invalid credentials"
    });
  }

  if (!userExist.isActive) {
    return res.status(500).json({
      status: false,
      message: "User Deactivated ! Please contact Admin"
    });
  }

  let token = jwt.sign({ uuid: uuid }, constant.secret, {
    // expiresIn: '24h' // expires in 24 hours
  });
  // return the JWT token for the future API calls
  return res.json({
    status: true,
    message: "Authentication successful!",
    token: token,
    data: userExist
  });
};

// get userMnemonics

const userMnemonicKeys = async (req, res) => {
  var userExist = await userModel.findOne({
    raw: true,
    where: {
      uuid: req.uuid
    }
  });

  if (!userExist) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }

  return res.status(200).json({
    status: true,
    message: "Mnemanic / private Keys",
    data: userExist.wallet_mnemanic
  });
};

// profile list
const alluserProfileList = async (req, res) => {
  var userExist = await userModel.findAll({
    attributes: {
      exclude: ["trx_user_keys", "trx_blockchain_txid", "isprivatekey"]
    },
    raw: true
  });

  // return the JWT token for the future API calls
  return res.json({
    status: true,
    message: "All users profile list",
    data: userExist
  });
};

// updater call by admin
const updateaccesstatus = async (req, res) => {
  const { uuid } = req.body;
  var userExist = await userModel.findOne({
    attributes: {
      exclude: ["trx_user_keys"]
    },
    raw: true
  });

  if (!userExist) {
    return res.status(500).json({
      status: false,
      message: "User not exit"
    });
  }

  var updateStatus = await userModel.update({
    isActive: !userExist.isActive
  }, { where: { uuid: uuid } });

  return res.json({
    status: true,
    message: "All users acess updated"
  });
};

//check if user already has a existing wallet
const isWalletExist = async (req, res) => {
  return res.json((await userWalletExist(req.uuid)));
};

// reset import wallet mnemonics
const reset = async (req, res) => {
  try {
    const { resetphrase } = req.body;
    if (!resetphrase || resetphrase.length <= 0) {
      return res.json({
        status: false,
        message: "Please provide required fields!"
      });
    }
    const wallet = await importWalletMnemonics(resetphrase);
    if (wallet instanceof Error) {
      return res.json({
        status: false,
        message: wallet.message
      });
    }

    console.log("wallet--1---", wallet);
    if (wallet) {
      var walletinfo = await isTrxwalletExist(wallet.tronAccount);
      console.log("walletinfo", walletinfo);
      if (walletinfo.status) {
        var password = walletinfo.data.password;
        var uuid = walletinfo.data.uuid;
        login({
          body: {
            uuid: uuid,
            password: password
          }
        }, res);
      } else {
        return res.json({
          status: false,
          message: "Users with given key phrase does not exist!"
        });
      }
    } else {
      return res.json({
        status: false,
        message: "Invalid reset key phrase!"
      });
    }
  } catch (e) {
    console.log("e", e);
    return res.json({
      status: false,
      message: "Something went wrong!"
    });
  }
};

//check if eth address already existing in db
const isTrxwalletExist = async trx_address => {
  var user_wallet_Exist = await userModel.findOne({
    raw: true,
    where: {
      trx_user_walletaddress: trx_address
    }
  });
  if (!user_wallet_Exist || user_wallet_Exist.length <= 0) {
    return {
      status: false
    };
  } else {
    return {
      status: true,
      data: user_wallet_Exist
    };
  }
};

// create wallet in tron
const createWalletInfo = async (req, res) => {
  try {
    var isWalletAllreadyExist = await userWalletExist(req.uuid);
    if (isWalletAllreadyExist.status) {
      return res.json({
        status: false,
        message: "Wallet already exists!"
      });
    }
    // add mnemonics into Database
    var wallet = await createWallet();

    var updateStatus = await userModel.update({
      trx_user_walletaddress: wallet.tronAccount,
      trx_user_keys: wallet.privateKey,
      isprivatekey: true,
      wallet_mnemanic: wallet.mnemonics
    }, { where: { uuid: req.uuid } });

    return res.json({
      status: true,
      message: "Info updated.",
      data: {
        trx_address: wallet.tronAccount,
        trx_phrases: wallet.mnemonics
      }
    });
  } catch (err) {
    return res.json({
      status: false,
      message: "something wrong went"
    });
  }
};

// import wallet info through mnemonics or private key.

const importWalletInfo = async (req, res) => {
  try {
    var { key, isprivateKey } = req.body;

    if (!key || key.length <= 0 || isprivateKey.length <= 0) {
      return res.json({
        status: false,
        message: "Please provide required fields!"
      });
    }

    var user_wallet;
    var wallet_mnemanic;

    if (isprivateKey == "true") {
      user_wallet = await importPrivateKey(key);
      wallet_mnemanic = user_wallet.privateKey;
    } else {
      user_wallet = await importWalletMnemonics(key);
      wallet_mnemanic = user_wallet.mnemonics;
    }

    // validate Address from Mnemonics or Private Key.
    if (!validateAddress(user_wallet.tronAccount)) {
      return res.json({
        status: false,
        message: "Invalid address field!"
      });
    }

    // trx address existance
    var trx_address_exist = await isTrxwalletExist(user_wallet.tronAccount);
    if (trx_address_exist.status) {
      return res.json({
        status: false,
        message: "Already exist: Please try a different phrase!"
      });
    }

    // check user Wallet existance
    var isWalletAlready = await userWalletExist(req.uuid);
    if (isWalletAlready.status) {
      return res.json({
        status: false,
        message: "Already exist: key & address !"
      });
    }

    // update the keys of users
    var updateStatus = await userModel.update({
      trx_user_walletaddress: user_wallet.tronAccount,
      trx_user_keys: user_wallet.privateKey,
      isprivatekey: JSON.parse(isprivateKey.toLowerCase()) ? true : false,
      wallet_mnemanic: wallet_mnemanic
    }, { where: { uuid: req.uuid } });

    return res.json({
      status: true,
      message: "Info updated."
    });
  } catch (err) {
    return res.json({
      status: false,
      message: err.message
    });
  }
};

// Return the list of users according to the level beloning to my team
const userLevelList = async (req, res) => {
  var uuid = req.uuid;
  console.log(" req.query", req.query);
  var isSingle_user = false;
  var user_info;
  var alluserInfo = await userModel.findAll({
    raw: true,
    attributes: ["id", "uuid"]
  });
  if (req.query && Object.keys(req.query).length > 0) {
    req.uuid = req.query.uuid;
    isSingle_user = true;
    user_info = await userModel.findOne({
      attributes: ["id"],
      raw: true,
      where: {
        uuid: req.uuid
      }
    });
    if (!user_info) {
      return res.json({
        status: false,
        message: "No such user exist with given uuid"
      });
    }
    uuid = req.uuid;
  }
  var userInfo = await userModel.findOne({
    attributes: ["id"],
    where: {
      uuid: uuid
    }
  });

  if (!userInfo.dataValues && Object.keys(userInfo.dataValues).length < 0) {
    return res.json({
      status: false,
      message: "No such user exist"
    });
  }
  var userList = await getMuliLevelUsers(userInfo.dataValues.id);
  userList.forEach(user => {
    user["parent_uuid"] = uuid;
    let sponserinfo = alluserInfo.find(x => x.id == user.sponserId);
    user["sponseruuid"] = sponserinfo.uuid;
  });

  return res.json({
    status: true,
    message: "Level wise Team user list",
    data: userList,
    count: userList.length
  });
};

// Return the list of all users according to the level's
const alluserLevelList = async (req, res) => {
  var alluserList = await getAllMuliLevelUserList();

  return res.json({
    status: true,
    message: "Level wise user list",
    data: alluserList
  });
};

// dashboard info
const dashBoardInfo = async (req, res) => {
  if (req.query.length <= 0) {
    req.uuid = req.query.uuid;
  }

  var userExist = await userModel.findOne({
    raw: true,
    where: {
      uuid: req.uuid
    }
  });

  if (!userExist) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }

  // console.log("userExist", userExist);

  var ReferalCount = await userRealtionModel.findAndCountAll({
    raw: true,
    where: {
      parent_id: userExist.id,
      level: "1"
    }
  });

  //console.log("ReferalCount", ReferalCount);

  var sumreferalIncome = await db.sequelize.query(' select sum(rewardAmount) as rewardAmount from Rewards where Rewards.to = (:id) and type = "REFERRAL"', {
    type: QueryTypes.SELECT,
    replacements: { id: userExist.id }
  });

  //  var sumwithdrawIncome = await db.sequelize.query(' select sum(rewardAmount) from Rewards where Rewards.to = 1 and type = "REFERRAL";', {
  //    type: QueryTypes.SELECT
  // });

  var pricipalamoutTotal = await db.sequelize.query("select IFNULL(sum( principal_returns_wallet ) , 0)  as pricipalamoutTotal from Monthly_returns where userId = (:id) AND isprincipalWithdrawal  = false   ", {
    replacements: { id: userExist.id },
    type: QueryTypes.SELECT
  });

  console.log("pricipalamoutTotal", pricipalamoutTotal);

  var coldwalletamountTotal = await db.sequelize.query("select IFNULL(sum( cold_wallet ), 0) as coldwalletamountTotal from Monthly_returns where userId = (:id)  ", {
    replacements: { id: userExist.id },
    type: QueryTypes.SELECT
  });

  console.log("coldwalletamountTotal", coldwalletamountTotal);

  var profitbonousamountTotal = await db.sequelize.query("select IFNULL(sum( profit_bonus_wallet ), 0) as profitbonousamountTotal from Monthly_returns where userId = (:id) AND isprofitBonousWithdrawal = false  ", {
    replacements: { id: userExist.id },
    type: QueryTypes.SELECT
  });

  console.log("profitbonousamountTotal", profitbonousamountTotal);

  var monthlyIncome = parseFloat(pricipalamoutTotal[0].pricipalamoutTotal + profitbonousamountTotal[0].profitbonousamountTotal + coldwalletamountTotal[0].coldwalletamountTotal);

  var withdrawalIncome = await db.sequelize.query("select IFNULL(sum( dollaramountWithdraw ), 0) as dollaramountWithdraw from WithdrawalRequests where requesteduserId = (:id) AND status = (:WITHDRAWN) ", {
    replacements: { WITHDRAWN: "WITHDRAWN", id: userExist.id },
    type: QueryTypes.SELECT
  });

  var tokenBalance = await getDxtsBalance(userExist.trx_user_walletaddress);

  var decimals = await dxtsDecimals();
  var balance = fromDxtsSun(tokenBalance, decimals);

  let tokensInfo = await tokenEqAmount("1");

  let usdprice, btcprice, trxPrice;
  if (tokensInfo.status) {
    usdprice = tokensInfo.usdPrice, btcprice = tokensInfo.btcPrice, trxPrice = tokensInfo.trxPrice;
  }
  var walletTrx = await getTrxBalance(userExist.trx_user_walletaddress);

  console.log("walletTrx", walletTrx);

  const generateQR = await QRCode.toDataURL(userExist.trx_user_walletaddress);
  var response = {
    status: userExist.account_status,
    walletBalance: balance,
    amountInvested: userExist.dollar_amount_invested,
    incomeReferal: sumreferalIncome[0].rewardAmount,
    tableIncome: 0,
    monthlyROI: monthlyIncome,
    withdrawalIncome: withdrawalIncome[0].dollaramountWithdraw, // sumreferalIncome,
    principal_wallet: pricipalamoutTotal[0].pricipalamoutTotal,
    profitbonous_wallet: profitbonousamountTotal[0].profitbonousamountTotal,
    coold_wallet: coldwalletamountTotal[0].coldwalletamountTotal,
    referalId: userExist.user_referal_id,
    directReferalCount: ReferalCount.count,
    totalIncome: userExist.user_application_wallet,
    airDropDOllarAmount: userExist.airDropDOllarAmount,
    userUiid: userExist.uuid,
    dxtusdrates: usdprice.toString(),
    dxtbtcrates: btcprice.toString(),
    dxtstrxrates: trxPrice.toString(),
    walletTrx: walletTrx.toString(),
    qraddress: generateQR,
    isActive: userExist.isActive
  };

  return res.status(200).json({
    status: true,
    message: "Dashboard Info",
    data: response
  });
};

// admin dashbaord info for admin
const admindashBoardInfo = async (req, res) => {
  console.log("------admin---dashboard----");

  var sumreferalIncome = await db.sequelize.query(' select sum(rewardAmount) as rewardAmount from Rewards where  type = "REFERRAL"', {
    type: QueryTypes.SELECT
  });
  console.log("sumreferalIncome", sumreferalIncome);

  //  var sumwithdrawIncome = await db.sequelize.query(' select sum(rewardAmount) from Rewards where Rewards.to = 1 and type = "REFERRAL";', {
  //    type: QueryTypes.SELECT
  // });

  var pricipalamoutTotal = await db.sequelize.query("select IFNULL(sum( principal_returns_wallet ) , 0)  as pricipalamoutTotal from Monthly_returns  ", {
    type: QueryTypes.SELECT
  });

  console.log("pricipalamoutTotal", pricipalamoutTotal);

  var coldwalletamountTotal = await db.sequelize.query("select IFNULL(sum( cold_wallet ), 0) as coldwalletamountTotal from Monthly_returns ", {
    type: QueryTypes.SELECT
  });

  console.log("coldwalletamountTotal", coldwalletamountTotal);
  var profitbonousamountTotal = await db.sequelize.query("select IFNULL(sum( profit_bonus_wallet ), 0) as profitbonousamountTotal from Monthly_returns ", {
    type: QueryTypes.SELECT
  });

  console.log("profitbonousamountTotal", profitbonousamountTotal);

  var monthlyIncome = parseFloat(pricipalamoutTotal[0].pricipalamoutTotal + profitbonousamountTotal[0].profitbonousamountTotal + coldwalletamountTotal[0].coldwalletamountTotal);

  var withdrawalIncome = await db.sequelize.query("select IFNULL(sum( dollaramountWithdraw ), 0) as dollaramountWithdraw from WithdrawalRequests where  status = (:WITHDRAWN) ", {
    replacements: { WITHDRAWN: "WITHDRAWN" },
    type: QueryTypes.SELECT
  });

  var airdropinfo = await db.sequelize.query(" select airdropDollarAmoount  from airDrops  LIMIT 1;  ", {
    type: QueryTypes.SELECT
  });

  // var tokenBalance = await getTokenBalance(userExist.eth_user_walletaddress)

  let tokensInfo = await tokenEqAmount("1");
  let usdprice, btcprice;
  if (tokensInfo.status) {
    usdprice = tokensInfo.usdPrice, btcprice = tokensInfo.btcPrice;
  }
  var respone = {
    incomeReferal: sumreferalIncome[0].rewardAmount,
    tableIncome: 0,
    withdrawanAmount: withdrawalIncome[0].dollaramountWithdraw, // sumreferalIncome,
    monthlyROI: monthlyIncome,
    cold_wallet: coldwalletamountTotal[0].coldwalletamountTotal,
    profit_bonous_wallet: profitbonousamountTotal[0].profitbonousamountTotal,
    principal_wallet: pricipalamoutTotal[0].pricipalamoutTotal,
    airDropDOllarAmount: airdropinfo.airDropDOllarAmount,
    dxtusdrates: usdprice,
    dxtbtcrates: btcprice
  };

  return res.status(200).json({
    status: true,
    message: "Dashboard Info",
    data: respone
  });
};

// user Wallet Balance
const userwalletBalance = async (req, res) => {
  try {
    // check user exist or not
    var userExist = await userModel.findOne({
      raw: true,
      where: {
        uuid: req.uuid
      }
    });

    // give expection here for when wallet not exist
    if (!userExist || !userExist.trx_user_walletaddress) {
      return res.status(500).json({
        status: false,
        message: "Something went wrong"
      });
    }

    // get token Balance
    var tokenBalance = await getDxtsBalance(userExist.trx_user_walletaddress);
    var decimals = await dxtsDecimals();
    var balance = fromDxtsSun(tokenBalance, decimals);
    return res.status(200).json({
      status: true,
      message: "Wallet Token Balance",
      tokenBalance: balance
    });
    // the end of try block.
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message
    });
  }
};

const userwithdrawableAmount = async (req, res) => {
  var userExist = await userModel.findOne({
    raw: true,
    where: {
      uuid: req.uuid
    }
  });

  if (!userExist) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }

  return res.json({
    status: true,
    message: "withdrawable dollar amount",
    data: userExist.user_application_wallet
  });
};

const usertotalIncome = async (req, res) => {
  var userExist = await userModel.findOne({
    raw: true,
    where: {
      uuid: req.uuid
    }
  });

  if (!userExist) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
  console.log("userExist", userExist);

  var finalIncome = 0;
  var sumreferalIncome = await db.sequelize.query(' select sum(rewardAmount) as rewardAmount from Rewards where Rewards.to = (:id) and type = "REFERRAL"', {
    type: QueryTypes.SELECT,
    replacements: { id: userExist.id }
  });

  var airDropIncome = userExist.airDropDOllarAmount;

  var pricipalamoutTotal = await db.sequelize.query("select IFNULL(sum( principal_returns_wallet ) , 0)  as pricipalamoutTotal from Monthly_returns where userId = (:id)  ", {
    replacements: { id: userExist.id },
    type: QueryTypes.SELECT
  });

  console.log("pricipalamoutTotal", pricipalamoutTotal);

  var coldwalletamountTotal = await db.sequelize.query("select IFNULL(sum( cold_wallet ), 0) as coldwalletamountTotal from Monthly_returns where userId = (:id)  ", {
    replacements: { id: userExist.id },
    type: QueryTypes.SELECT
  });

  console.log("coldwalletamountTotal", coldwalletamountTotal);

  var profitbonousamountTotal = await db.sequelize.query("select IFNULL(sum( profit_bonus_wallet ), 0) as profitbonousamountTotal from Monthly_returns where userId = (:id)  ", {
    replacements: { id: userExist.id },
    type: QueryTypes.SELECT
  });

  console.log("profitbonousamountTotal", profitbonousamountTotal);

  var monthlyIncome = parseFloat(pricipalamoutTotal[0].pricipalamoutTotal + profitbonousamountTotal[0].profitbonousamountTotal + coldwalletamountTotal[0].coldwalletamountTotal);

  var withdrawalIncome = await db.sequelize.query("select IFNULL(sum( dollaramountWithdraw ), 0) as dollaramountWithdraw from WithdrawalRequests where requesteduserId = (:id) AND status = (:WITHDRAWN) ", {
    replacements: {
      WITHDRAWN: "WITHDRAWN",
      id: userExist.id
    },
    type: QueryTypes.SELECT
  });

  console.log("monthlyIncome", monthlyIncome);

  var availabletablerewards = await rewardModel.findAll({
    attributes: [["rewardAmount", "tokenAmount"], ["TableIncome_Singletokenrpice", "tokenPrice"]],
    raw: true,
    where: {
      isWithdrawal: true,
      type: "TABLE",
      to: userExist.id
    }
  });
  var totalTableIncome = 0;
  console.log("availabletablerewards", availabletablerewards);

  for (let index = 0; index < availabletablerewards.length; index++) {
    const tableIncome = availabletablerewards[index];
    console.log("tableIncome", tableIncome);
    totalTableIncome = totalTableIncome + tableIncome["tokenAmount"] * tableIncome["tokenPrice"];
  }

  finalIncome = parseFloat(sumreferalIncome + monthlyIncome + withdrawalIncome + totalTableIncome + airDropIncome);
  return res.status(200).json({
    status: true,
    message: "Total Income Info",
    data: finalIncome ? finalIncome : 0
  });
};
const profitbonuswalletWithdrawal = async (req, res) => {
  let { uuid } = req.uuid;

  var userExist = await userModel.findOne({
    raw: true,
    where: {
      uuid: req.uuid
    }
  });

  if (userExist.length <= 0) {
    return res.json({
      status: false,
      message: "No such user exist"
    });
  }

  var profitbonouswalletamountTotal = await db.sequelize.query("select IFNULL(sum( profit_bonus_wallet ), 0) as profitbonouswalletamountTotal from Monthly_returns where userId = (:id)  AND isprofitBonousWithdrawal = false ", {
    replacements: { id: userExist.id },
    type: QueryTypes.SELECT
  });

  console.log("profitbonouswalletamountTotal", profitbonouswalletamountTotal[0].profitbonouswalletamountTotal);

  if (profitbonouswalletamountTotal[0].profitbonouswalletamountTotal <= 0) {
    return res.json({
      status: false,
      message: "No amount avaialble to withdraw"
    });
  }
  var profitbonous_monthlty_reward_ids = await db.sequelize.query("select id from Monthly_returns where userId = (:id)  AND isprofitBonousWithdrawal = false ", {
    replacements: { id: userExist.id },
    type: QueryTypes.SELECT
  });
  console.log("profitbonous_monthlty_reward_ids", profitbonous_monthlty_reward_ids);

  var withdrawalIds = [];
  profitbonous_monthlty_reward_ids.forEach(returnid => {
    withdrawalIds.push(returnid.id);
  });
  var finalwalletAmount = parseFloat(userExist.user_application_wallet + profitbonouswalletamountTotal[0].profitbonouswalletamountTotal);
  console.log("finalwalletAmount", finalwalletAmount);
  var updateStatus = await userModel.update({
    user_application_wallet: finalwalletAmount
  }, {
    where: {
      uuid: req.uuid
    }
  });

  var updateStatus = await monthlyreturnModel.update({
    isprofitBonousWithdrawal: true
  }, {
    where: {
      userId: userExist.id,
      id: withdrawalIds
    }
  });
  return res.json({
    status: true,
    message: " New final Amount " + finalwalletAmount
  });
};

const principalwalletWithdrawal = async (req, res) => {
  let { uuid } = req.uuid;

  var userExist = await userModel.findOne({
    raw: true,
    where: {
      uuid: req.uuid
    }
  });

  if (userExist.length <= 0) {
    return res.json({
      status: false,
      message: "No such user exist"
    });
  }

  var principalwalletamountTotal = await db.sequelize.query("select IFNULL(sum( principal_returns_wallet ), 0) as principalwalletamountTotal from Monthly_returns where userId = (:id)  AND isprincipalWithdrawal = false ", {
    replacements: { id: userExist.id },
    type: QueryTypes.SELECT
  });

  console.log("principalwalletamountTotal", principalwalletamountTotal[0].principalwalletamountTotal);

  if (principalwalletamountTotal[0].principalwalletamountTotal <= 0) {
    return res.json({
      status: false,
      message: "No amount avaialble to withdraw"
    });
  }
  var principal_monthlty_reward_ids = await db.sequelize.query("select id from Monthly_returns where userId = (:id)  AND isprincipalWithdrawal = false ", {
    replacements: { id: userExist.id },
    type: QueryTypes.SELECT
  });
  console.log("principal_monthlty_reward_ids", principal_monthlty_reward_ids);

  var withdrawalIds = [];
  principal_monthlty_reward_ids.forEach(returnid => {
    withdrawalIds.push(returnid.id);
  });
  var finalwalletAmount = parseFloat(userExist.user_application_wallet + principalwalletamountTotal[0].principalwalletamountTotal);
  console.log("finalwalletAmount", finalwalletAmount);
  var updateStatus = await userModel.update({
    user_application_wallet: finalwalletAmount
  }, {
    where: {
      uuid: req.uuid
    }
  });

  var updateStatus = await monthlyreturnModel.update({
    isprincipalWithdrawal: true
  }, {
    where: {
      userId: userExist.id,
      id: withdrawalIds
    }
  });
  return res.json({
    status: true,
    message: " New final Amount " + finalwalletAmount
  });
};

const coldwalletWithdrawal = async (req, res) => {
  let { uuid } = req.uuid;

  var userExist = await userModel.findOne({
    raw: true,
    where: {
      uuid: req.uuid
    }
  });

  if (userExist.length <= 0) {
    return res.json({
      status: false,
      message: "No such user exist"
    });
  }

  // select * from Monthly_returns where  userId =7 LIMIT 1,1;
  var coldrewarddate = await db.sequelize.query("select createdAt from Monthly_returns where  userId = (:id)  LIMIT 1  ", {
    replacements: { id: userExist.id },
    type: QueryTypes.SELECT
  });
  console.log("coldrewarddate", coldrewarddate[0].createdAt);
  if (!coldrewarddate) {
    return res.json({
      status: false,
      message: "Something went wrong"
    });
  }

  var startDate = moment(coldrewarddate[0].createdAt, "YYYY-MM-DD").format("YYYY-MM-DD");
  var endDate = moment(new Date());
  var totaldays = endDate.diff(startDate, "days");

  if (totaldays <= PROHIBITIONPERIOD) {
    return res.json({
      status: false,
      message: "Your waiting period is not over yet.Left Days : " + (PROHIBITIONPERIOD - totaldays)
    });
  }

  var coldwalletamountTotal = await db.sequelize.query("select IFNULL(sum( cold_wallet ), 0) as coldwalletamountTotal from Monthly_returns where userId = (:id)  AND iscoldWithdrawal = false ", {
    replacements: { id: userExist.id },
    type: QueryTypes.SELECT
  });

  console.log("coldwalletamountTotal", coldwalletamountTotal[0].coldwalletamountTotal);

  if (coldwalletamountTotal[0].coldwalletamountTotal <= 0) {
    return res.json({
      status: false,
      message: "No amount avaialble to withdraw"
    });
  }
  var cold_monthlty_reward_ids = await db.sequelize.query("select id from Monthly_returns where userId = (:id)  AND iscoldWithdrawal = false ", {
    replacements: { id: userExist.id },
    type: QueryTypes.SELECT
  });
  console.log("cold_monthlty_reward_ids", cold_monthlty_reward_ids);

  var withdrawalIds = [];
  cold_monthlty_reward_ids.forEach(returnid => {
    withdrawalIds.push(returnid.id);
  });
  var finalwalletAmount = parseFloat(userExist.user_application_wallet + coldwalletamountTotal[0].coldwalletamountTotal);
  console.log("finalwalletAmount", finalwalletAmount);
  var updateStatus = await userModel.update({
    user_application_wallet: finalwalletAmount
  }, {
    where: {
      uuid: req.uuid
    }
  });

  var updateStatus = await monthlyreturnModel.update({
    iscoldWithdrawal: true
  }, {
    where: {
      userId: userExist.id,
      id: withdrawalIds
    }
  });

  return res.json({
    status: true,
    message: " New final Amount " + finalwalletAmount
  });
};

const addnews = async (req, res) => {
  let { news } = req.body;
  if (!news || news.length <= 0) {
    return res.status(500).json({
      status: false,
      message: "Please provide a valid referal id"
    });
  }
  await newsbannerModel.create({
    news: news
  });

  return res.status(200).json({
    status: true,
    message: "News Added"
  });
};

const getlatestnews = async (req, res) => {
  const latestnews = await newsbannerModel.findOne({
    raw: true,
    order: [["createdAt", "ASC"]]
  });
  console.log("latestnews", latestnews);
  return res.status(200).json({
    status: true,
    message: "latest news",
    data: latestnews.news
  });
};

const getallnewslist = async (req, res) => {
  const allnews = await newsbannerModel.findAll({
    raw: true,
    order: [["createdAt", "ASC"]]
  });

  return res.status(200).json({
    status: true,
    message: "All news",
    data: allnews
  });
};
//return the list of all users(Team) ,  level wise
async function getAllMuliLevelUserList() {
  var LevelwiseAllUserList = await db.sequelize.query("SELECT `level`,`child_id`,`user_Realtions`.`parent_id`,`uuid` As `child_uuid` FROM `user_Realtions` inner join Users WHERE `user_Realtions`.`child_id` = `Users`.`id` ", {
    type: QueryTypes.SELECT
  });

  var alluserInfo = await userModel.findAll({
    raw: true,
    attributes: ["id", "uuid"]
  });
  for (let i = 0; i < LevelwiseAllUserList.length; i++) {
    let levelwiseuserinfo = LevelwiseAllUserList[i];
    let parentObj = alluserInfo.find(x => x.id == levelwiseuserinfo.parent_id);
    LevelwiseAllUserList[i]["parent_uuid"] = parentObj.uuid;
  }

  return LevelwiseAllUserList;
}

//return the list of child users/team-member (join joined by this user refral) level wise for a given user id
async function getMuliLevelUsers(user_id) {
  var LevelwiseUserList = await db.sequelize.query("SELECT `level`, `child_id`,`uuid` as `child_uuid` ,`isActive` ,`account_status`,`Users`.`parent_id` As  `sponserId`   FROM `user_Realtions` inner join Users WHERE   `user_Realtions`.`parent_id` = (:id) AND `user_Realtions`.`child_id` = `Users`.`id`  ORDER BY `level` ASC", {
    replacements: { id: user_id },
    type: QueryTypes.SELECT
  });
  return LevelwiseUserList;
}

function generateRerferalcode(uuid) {
  return String(uuid.substring(0, 2)).concat(String(Date.now()).substring(2, 8));
}

// return the parent & their sucessor (list) info
async function getsucessorParentList(user_id) {
  var level = 1;
  var user = user_id;
  //level , parent_id,child_id
  var parnet_level_list = [];
  for (let index = APPLEVEL; index > 0; index--) {
    var parentId = await getParentId(user);
    if (parentId == 0 || level > APPLEVEL) {
      break;
    } else {
      var parentInfo = await userModel.findOne({
        raw: true,
        attributes: ["user_application_wallet"],
        where: {
          id: parentId
        }
      });
      console.log("parentInfo", parentInfo);
      parnet_level_list.push({
        level: level,
        parent_id: parentId,
        child_id: user_id,
        user_application_wallet: parentInfo.user_application_wallet
      });
    }
    user = parentId;
    level++;
  }

  return parnet_level_list;
}

async function multiParentChildLevelRelation(uuid) {
  var new_user = await userModel.findOne({
    where: {
      uuid: uuid
    }
  });
  var user_id = new_user.dataValues.id;

  var level = 1;
  var user = user_id;
  for (let index = APPLEVEL; index > 0; index--) {
    var parentId = await getParentId(user);
    if (parentId == 0 || level > APPLEVEL) {
      break;
    } else {
      await insertRelationTable(level, parentId, user_id);
    }
    user = parentId;
    level++;
  }
}

async function getParentId(user_id) {
  var user = await userModel.findOne({
    where: {
      id: user_id
    }
  });
  return user.parent_id;
}

async function insertRelationTable(level, parentId, childId) {
  await userRealtionModel.create({
    parent_id: parentId,
    child_id: childId,
    level: level
  });
}

async function checkUUID(randomsampleuuid) {
  var user_alreadyExist = await userModel.findOne({
    where: {
      [Op.or]: [{
        uuid: randomsampleuuid
      }]
    }
  });
  if (user_alreadyExist && user_alreadyExist.dataValues && Object.keys(user_alreadyExist.dataValues).length > 0) {
    return false;
  }
  return true;
}

module.exports = {
  registration,
  login,
  isWalletExist,
  importWalletInfo,
  createWalletInfo,
  userLevelList,
  alluserLevelList,
  isReferralExist,
  getsucessorParentList,
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
};