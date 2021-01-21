const TronWeb = require("tronweb");
const bip39 = require("bip39");
const HDKey = require("hdkey");
const fs = require("fs");

const fullNode = new TronWeb.providers.HttpProvider(
  "https://api.shasta.trongrid.io/"
);

const solidityNode = new TronWeb.providers.HttpProvider(
  "https://api.shasta.trongrid.io/"
);

const eventNode = new TronWeb.providers.HttpProvider(
  "https://api.shasta.trongrid.io/"
);

const privateKeyOfMaintainer = process.env.ADMIN_PRIVATE_KEY;

const tronWeb = new TronWeb(
  fullNode,
  solidityNode,
  eventNode,
  privateKeyOfMaintainer
);

// contract interaction in tronweb

const triggerSmartContract = async () => {
  // intreact with ABI files
  const abiRaw = fs.readFileSync("../constants/ABI.json");
  const abi = json.parse(abiRaw);

  const contractAddress = "THcQ2jUys38gp46M8p3HwwZ2dxivA8fvgK";
  const contract = await tronWeb.contract(abi);
  return contract;
};

const coinCode = 195;

// please be care full to use this use at your own risk.
const getPrivateKeyFromMnemonics = async (mnemonics) => {
  // dereive seed from mnemonics
  const seed = await bip39.mnemonicToSeed(mnemonics);
  const seedHex = seed.toString("hex");
  const masterHdkey = HDKey.fromMasterSeed(seedHex);
  const path = `m/44'/${coinCode}'/0'/0/0`;
  const hdKey = masterHdkey.derive(path);
  const privateKey = hdKey.privateKey.toString("hex");
  return privateKey;
};

const createWallet = async () => {
  // generate mnemonics with specific lang
  const mnemonics = bip39.generateMnemonic();

  // dereive seed from mnemonics
  const privateKey = await getPrivateKeyFromMnemonics(mnemonics);

  const tronAccount = await TronWeb.address.fromPrivateKey(privateKey);
  const tronAddress = tronWeb.address.toHex(tronAccount);

  return {
    mnemonics,
    privateKey,
    tronAccount,
    tronAddress,
  };
};

const validateAddress = (address) => {
  return tronWeb.isAddress(address);
};

// import privateKey into this wallet.

const importPrivateKey = async (privateKey) => {
  const tronAccount = await tronWeb.address.fromPrivateKey(privateKey);
  return {
    privateKey,
    tronAccount,
  };
};

// import mnemonics into this wallet
const importWalletMnemonics = async (mnemonic) => {
  if (!bip39.validateMnemonic(mnemonic)) {
    return new Error("bip39: wrong mnemonics code?");
  }
  try {
    const privateKey = await getPrivateKeyFromMnemonics(mnemonic);
    const tronAccount = await TronWeb.address.fromPrivateKey(privateKey);
    return {
      mnemonic,
      privateKey,
      tronAccount,
    };
  } catch (err) {
    return err;
  }
};

// get TRX balance
const getTrxBalance = async (address) => {
  const toSun = await tronWeb.trx.getBalance(address);
  const trxBalance = tronWeb.fromSun(toSun);
  return trxBalance;
};

// get decimals of dxts token
const dxtsDecimals = async () => {
  const instance = await triggerSmartContract();
  const decimals = await instance.methods.decimals().call();
  return decimals;
};

// fromDxtsSun converter
const fromDxtsSun = (unit, decimals) => {
  return uint / 10 ** decimals;
};

//toDxtsSun converter
const toDxtsSun = (uint, decimals) => {
  return uint * 10 ** decimals;
};
// get DXTS token Balance

const getDxtsBalance = async (dxtsHodlAddress) => {
  const instance = await triggerSmartContract();
  const toDxtsSunBal = await instance.methods.balanceOf(dxtsHodlAddress).call();
  const decimals = await dxtsDecimals();
  const dxtsBal = fromDxtsSun(toDxtsSunBal, decimals);
  return parseFloat(dxtsBal);
};

// token Transfer

const tokenTransfer = async (
  receiverAddress,
  tokenAmount,
  senderAddress,
  PRIVATE_KEY_SENDER
) => {
  // check both address
  const sender = validateAddress(senderAddress);
  const receiver = validateAddress(receiverAddress);
  if (!(sender && receiver)) {
    return {
      status: false,
      message: "Invalid Address.",
    };
  }
  // verify token Amount and tokenBalance Avail

  const senderAvailTokenBalance = await getDxtsBalance(senderAddress);
  if (tokenAmount <= 0 || senderAvailTokenBalance < tokenAmount) {
    return {
      status: false,
      message: "Incorrect token amount or Insufficeint Balance",
    };
  }

  // now you can send the tokens from with to.
  const instance = await triggerSmartContract();
  // send tokens but first set the privateKey of Sender to sign transaction.
  tronWeb.setPrivateKey(PRIVATE_KEY_SENDER);

  // now you can invoke contract methods
  try {
    const txObj = await instance.methods
      .transfer(receiverAddress, tokenAmount)
      .send({
        from: senderAddress,
      });

    return {
      status: "success",
      message: txObj,
    };
  } catch (err) {
    return {
      status: "failed",
      message: err.message,
    };
  }
};

module.exports = {
  createWallet,
  validateAddress,
  importPrivateKey,
  importWalletMnemonics,
  getTrxBalance,
  getDxtsBalance,
  tokenTransfer,
  fromDxtsSun,
  toDxtsSun,
};
