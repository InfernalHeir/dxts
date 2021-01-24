//1. Import coingecko-api
const CoinGecko = require("coingecko-api");
var ethers = require("ethers");
var models = require("../models");
const userModel = models.User;
const userEthmanagmentmodel = models.Eth_Managment;
const axios = require("axios");

var Wallet = ethers.Wallet;
var utils = ethers.utils;
var providers = ethers.providers;
var Web3 = require("web3");
var fs = require("fs");
const {
  getDxtsBalance,
  dxtsDecimals,
  toDxtsSun,
  fromDxtsSun,
  getTronPriceInUSD,
  getDxtsPriceInTrx,
} = require("./tronWallet");
const options = { transactionConfirmationBlocks: 1 };
var web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://mainnet.infura.io/v3/d2a4bb4e9b864b74bed287ba67ceebb5",
    null,
    options
  )
); // process.env.ETHNODE_URL
//var web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/d2a4bb4e9b864b74bed287ba67ceebb5',null,options));  // process.env.ETHNODE_URL //ROPSTEN TESTNET
//const CONTRACT_ADDRESS = '0x732e964E5488906ce171E417a4A58c68df525fE7' //process.env.CONTRACT_ADDRESS; TESTNET
const CONTRACT_ADDRESS = "0x36c85687eedae01c50eb7d04d74c0ec74f930c54"; //process.env.CONTRACT_ADDRESS; MAINNET
// const TOKEN_AMOUNT = 4000000000000000
// const senderAdminAddress = '0x0bcfA0f4A192701eFD0F8DA67Efb338E5740104B'
// const PRIVAtE_KEY_ADMIN_SENDER = '925BFF8C289BBF8716B4F79667AE02797226CCEA23A1BD471E8FE93B6F4BD2B2'
const abi = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "_upgradedAddress", type: "address" }],
    name: "deprecate",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "deprecated",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "_evilUser", type: "address" }],
    name: "addBlackList",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_from", type: "address" },
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "upgradedAddress",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "balances",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "maximumFee",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "_totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "unpause",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_maker", type: "address" }],
    name: "getBlackListStatus",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "address" },
    ],
    name: "allowed",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "paused",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "who", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "pause",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "getOwner",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "newBasisPoints", type: "uint256" },
      { name: "newMaxFee", type: "uint256" },
    ],
    name: "setParams",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "amount", type: "uint256" }],
    name: "issue",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "amount", type: "uint256" }],
    name: "redeem",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "remaining", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "basisPointsRate",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "isBlackListed",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "_clearedUser", type: "address" }],
    name: "removeBlackList",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "MAX_UINT",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "_blackListedUser", type: "address" }],
    name: "destroyBlackFunds",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_initialSupply", type: "uint256" },
      { name: "_name", type: "string" },
      { name: "_symbol", type: "string" },
      { name: "_decimals", type: "uint256" },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "amount", type: "uint256" }],
    name: "Issue",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "amount", type: "uint256" }],
    name: "Redeem",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "newAddress", type: "address" }],
    name: "Deprecate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "feeBasisPoints", type: "uint256" },
      { indexed: false, name: "maxFee", type: "uint256" },
    ],
    name: "Params",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "_blackListedUser", type: "address" },
      { indexed: false, name: "_balance", type: "uint256" },
    ],
    name: "DestroyedBlackFunds",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "_user", type: "address" }],
    name: "AddedBlackList",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "_user", type: "address" }],
    name: "RemovedBlackList",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  { anonymous: false, inputs: [], name: "Pause", type: "event" },
  { anonymous: false, inputs: [], name: "Unpause", type: "event" },
];

const ERROR_PENDINGTRANSACTION =
  "Error: Returned error: replacement transaction underpriced";
const ERROR_UNANLETOFETCHTRANSACTIONRECEIPT =
  "Error: Failed to check for transaction receipt:";
const ERROR_LOWGAS = "Error: Signer Error: gas limit is too low";
var gasRequired;

//2. Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko();

var contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
//@TODO store all the blockchain trabsaction in a database.
const tranferTokens = async (
  receiverAddress,
  tokenAmount,
  senderAddress,
  PRIVATE_KEY_SENDER,
  isprivatekey
) => {
  let txId;
  // let receiverAddress, tokenAmount ,senderAddress
  try {
    var iscorrecReceiverAddress = await checkAddress(receiverAddress);
    var iscorrecSenderAddress = await checkAddress(senderAddress);

    if (!(iscorrecReceiverAddress && iscorrecSenderAddress)) {
      return {
        status: false,
        message: "Incorrect Address is obatined",
      };
    }

    if (!tokenAmount || tokenAmount <= 0) {
      return {
        status: false,
        message: "Incorrect token amount",
      };
    }
    var accounts;
    console.log("isprivatekey", isprivatekey);
    console.log("PRIVATE_KEY_SENDER", PRIVATE_KEY_SENDER);
    if (isprivatekey == false) {
      var wallet = new ethers.Wallet.fromMnemonic(PRIVATE_KEY_SENDER);
      console.log("wallet---from ethers--mnemanic ----", wallet);
      accounts = await web3.eth.accounts.wallet.add(wallet.privateKey);
    } else {
      accounts = await web3.eth.accounts.wallet.add(PRIVATE_KEY_SENDER);
    }
    var senderEtherbalance = await getEthBalance(senderAddress);

    if (!senderEtherbalance) {
      return {
        status: false,
        message: "Insufficeint funds : Ethers unavailable",
      };
    }

    var senderTokenBalance = await getTokenBalance(senderAddress);
    console.log("senderTokenBalance", senderTokenBalance);
    console.log("tokenAmount", tokenAmount);
    if (!senderTokenBalance < tokenAmount) {
      await contract.methods
        .transfer(receiverAddress, tokenAmount)
        .estimateGas({ from: senderAddress }, function (error, gasAmount) {
          gasRequired = gasAmount;
          console.log("gasRequired", gasRequired);
        })
        .catch((error) => {
          console.log(error);
          return {
            status: false,
            message: "Something went wrong !",
          };
        });

      await contract.methods
        .transfer(receiverAddress, tokenAmount)
        .send({ from: senderAddress, gas: gasRequired })
        .on("transactionHash", function (transactionHash, error) {
          console.log("Transaction Hash" + transactionHash);
          txId = transactionHash;
        })
        .catch((error) => {
          if (error.toString() == ERROR_PENDINGTRANSACTION) {
            console.log(
              "sender have already a transaction in pending state please retry after some time "
            );
          }
          if (
            error.toString().includes(ERROR_UNANLETOFETCHTRANSACTIONRECEIPT)
          ) {
            console.log(
              "unable to fetch the transaction receipt please check the status from transaction id stored in database "
            );
          }
          return {
            status: false,
            message: "Something went wrong!",
          };
        });
      console.log("----after transaction-----");
      if (txId) {
        console.log("----txId-----", txId);
        return {
          status: true,
          message: "Transaction ID!",
          data: txId,
        };
      }
    } else {
      return {
        status: false,
        message: "Insufficeint funds : tokens unavailable!",
      };
    }
  } catch (e) {
    console.log("----e-----", e);
    return {
      status: false,
      message: "Something went wrong!",
    };
  }
};

//Return the euivakent amount of tokens to be deposited in for usd investment.

var tokenAmountEqUSDdeposit = async (req, res) => {
  const { usdAmount } = req.query;

  if (!usdAmount || usdAmount <= 0) {
    return res.json({
      status: false,
      message: "Please provide valid amount usd",
    });
  }

  let pinginfo = await CoinGeckoClient.ping();
  if (!pinginfo.code === 200) {
    return res.json({
      status: false,
      message: "Unable to fetch the amount from API",
    });
  }

  // curl -X GET "https://api.coingecko.com/api/v3/coins/destiny-success" -H "accept: applicatiojson"
  //https://api.coingecko.com/api/v3/coins/destiny-success

  /**
     *  {
        "id": "destiny-success",
        "symbol": "dxts",
        "name": "Destiny Success"
      },
     */

  var response = await axios.get(
    "https://api.coingecko.com/api/v3/coins/destiny-success"
  );

  if (!response.code === 200) {
    return res.json({
      status: false,
      message: "Unable to fetch the amount from API",
    });
  }

  var tokenPrice = response.data.market_data.current_price.usd;

  // let coinInfo = await CoinGeckoClient.coins.fetch('destiny-success', {});
  // if (coinInfo.code === 200) {
  //     tokenPrice = coinInfo.data.market_data.current_price.usd;
  // }

  var tokenAmount = await usdtotokenconversion(usdAmount, tokenPrice);

  return res.json({
    status: true,
    message: "Token price Info",
    data: {
      tokenAmount: tokenAmount,
      usdAmount: usdAmount,
      tokenPrice: tokenPrice,
      // coinInfo : coinInfo
    },
  });
};

var tokenEqAmount = async (usdAmount) => {
  let pinginfo = await CoinGeckoClient.ping();
  if (!pinginfo.code === 200) {
    return {
      status: false,
      message: "Unable to fetch the amount from API",
    };
  }

  var response = await axios.get(
    "https://api.coingecko.com/api/v3/coins/destiny-success"
  );
  if (!response.code === 200) {
    return {
      status: false,
      message: "Unable to fetch the amount from API",
    };
  }

  var tokenPrice = response.data.market_data.current_price.usd;
  var btctokenPrice = response.data.market_data.current_price.btc;
  var ethtokenPrice = response.data.market_data.current_price.eth;
  var tokenAmount = await usdtotokenconversion(usdAmount, tokenPrice);

  var tronUsd = await getTronPriceInUSD();
  var tronPrinceInDestiny = getDxtsPriceInTrx(tronUsd, tokenPrice);
  console.log(tronPrinceInDestiny);
  return {
    status: true,
    message: "token Info",
    tokenAmount: tokenAmount,
    usdPrice: tokenPrice,
    btcPrice: btctokenPrice,
    trxPrice: tronPrinceInDestiny,
  };
};

//1 dxts= x usd;
//Return the euivakent amount of tokens to be deposited in for usd investment.
//usd_amount Amount of the usd dollar to invest
//token_price price of token to usd
var usdtotokenconversion = (usd_amount, token_price) => {
  // return (usd_amount / token_price).toFixed(10);
  return Number.parseFloat(usd_amount / token_price).toFixed(10);
};

var walletCreate = async () => {
  const wallet = ethers.Wallet.createRandom();
  return {
    key: wallet.privateKey,
    address: wallet.address,
    phrases: wallet._mnemonic().phrase,
  };
};

var walletImportMnemonic = async (mnemonic) => {
  var wallet = new ethers.Wallet.fromMnemonic(mnemonic);
  return {
    key: mnemonic,
    address: wallet.address,
  };
};

var walletImportPrivateKey = async (privateKey) => {
  let wallet = new ethers.Wallet(privateKey);

  return {
    key: wallet.privateKey,
    address: wallet.address,
  };
};

var userWalletExist = async (uuid) => {
  var user_wallet_Exist = await userModel.findOne({
    attributes: ["trx_user_walletaddress"],
    where: {
      uuid: uuid,
    },
  });
  if (
    !user_wallet_Exist.dataValues.trx_user_walletaddress ||
    user_wallet_Exist.dataValues.length <= 0
  ) {
    return {
      status: false,
    };
  }
  var tokenBalance = await getDxtsBalance(
    user_wallet_Exist.dataValues.trx_user_walletaddress
  );

  const decimals = await dxtsDecimals();
  const toSunBalance = await fromDxtsSun(tokenBalance, decimals);
  return {
    status: true,
    walletAddress: user_wallet_Exist.dataValues.trx_user_walletaddress,
    //@TODO hard coded decimal value of tokens
    tokenBalance: toSunBalance,
  };
};

var checkAddress = async (address) => {
  return await ethers.utils.isAddress(address);
};

var getEthBalance = async (address) => {
  var Etherbalance = await web3.eth.getBalance(address); //Will give value in.
  return Etherbalance;
};

var getTokenBalance = async (address) => {
  var TokenBalance = await contract.methods.balanceOf(address).call();
  return TokenBalance;
};

var weitoEth = async (weivalue) => {
  var Etheq = await web3.utils.fromWei(weivalue, "ether");
  return Etheq;
};
//@TODO  not working
var tokenBignumberConversion = async (tokenAmount) => {
  try {
    const decimals = await contract.methods.decimals().call();
    console.log("----inside ---conversion ---decimals--", decimals);
    console.log("-----inside ---conversion---tokenAmount", tokenAmount);
    const amountToSendinDecimal = tokenAmount * 10 ** decimals;
    console.log(
      "--inside ---conversion---amountToSendinDecimal",
      amountToSendinDecimal
    );
    return amountToSendinDecimal;
  } catch (e) {
    console.log("---e---", e);
  }
};
const transferEthers = async (
  receiverAddress,
  senderAddress,
  ethAmount,
  PRIVATE_KEY_USER_SENDER,
  isprivatekey,
  ADMIN_TOKEN_TRANSFER_ADDR,
  ADMIN_TOKEN_TRANSFER_ADDR_PY_KEY,
  tokenAmount,
  userId
) => {
  var iscorrecReceiverAddress = await checkAddress(receiverAddress);
  var iscorrecSenderAddress = await checkAddress(senderAddress);

  if (!(iscorrecReceiverAddress && iscorrecSenderAddress)) {
    return {
      status: false,
      message: "Incorrect Address is obatined",
    };
  }

  if (!ethAmount || ethAmount <= 0) {
    return {
      status: false,
      message: "Incorrect eth amount",
    };
  }
  console.log("wallet---ethAmount ----", ethAmount);

  var accounts, transactionHash;
  if (isprivatekey == false) {
    var wallet = new ethers.Wallet.fromMnemonic(PRIVATE_KEY_USER_SENDER);
    console.log("wallet---from ethers--mnemanic ----", wallet);
    accounts = await web3.eth.accounts.wallet.add(wallet.privateKey);
  } else {
    accounts = await web3.eth.accounts.wallet.add(PRIVATE_KEY_USER_SENDER);
  }
  // using the event emitter
  web3.eth
    .sendTransaction({
      from: senderAddress,
      to: receiverAddress,
      value: ethAmount,
      gasLimit: 21000,
    })
    .on("transactionHash", async function (hash) {
      transactionHash = hash;

      await userEthmanagmentmodel.create({
        userId: userId,
        ether_transfer_txid: hash,
        ether_tx_status: "PENDING",
      });
    })
    .on("receipt", async function (receipt) {
      console.log("receipt", receipt);
      var txinfo;
      if (receipt.status) {
        await userEthmanagmentmodel.update(
          { ether_tx_status: receipt.status },
          { where: { ether_transfer_txid: transactionHash } }
        );

        txinfo = await tranferTokens(
          senderAddress,
          tokenAmount,
          ADMIN_TOKEN_TRANSFER_ADDR,
          ADMIN_TOKEN_TRANSFER_ADDR_PY_KEY,
          (isprivatekey = true)
        );
      } else {
        await userEthmanagmentmodel.update(
          {
            ether_tx_status: "FAILED",
          },
          { where: { ether_transfer_txid: transactionHash } }
        );
      }
      console.log("---------------8----------------------", txinfo);
      if (txinfo && txinfo.status && txinfo.data) {
        console.log("---------------9--------------------", txinfo);
        await userEthmanagmentmodel.update(
          {
            token_transfer_txid: txinfo.data,
          },
          { where: { ether_transfer_txid: transactionHash } }
        );
      } else {
        await userEthmanagmentmodel.update(
          {
            token_transfer_status: "ERROR",
          },
          { where: { ether_transfer_txid: transactionHash } }
        );
      }
    })
    .on("error", (error) => {
      console.log("----err-r--", error);
    }); // If a out of gas error, the second parameter is the receipt.
};

module.exports = {
  userWalletExist,
  checkAddress,
  walletImportPrivateKey,
  walletImportMnemonic,
  walletCreate,
  tokenAmountEqUSDdeposit,
  tranferTokens,
  getEthBalance,
  getTokenBalance,
  tokenEqAmount,
  tokenBignumberConversion,
  weitoEth,
  transferEthers,
};
