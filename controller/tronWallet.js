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
  if (bip39.validateMnemonic(mnemonic)) {
    return new Error("bip39: wrong mnemonics code?");
  }
  const privateKey = await getPrivateKeyFromMnemonics(mnemonic);
  const tronAccount = await TronWeb.address.fromPrivateKey(privateKey);
  return {
    privateKey,
    tronAccount,
  };
};

const getTrxBalance = async (address) => {
  const toSun = await tronWeb.trx.getBalance(address);
  const trxBalance = tronWeb.fromSun(toSun);
  return trxBalance;
};

const getDxtsBalance = async (dxtsHodlAddress) => {
  const instance = triggerSmartContract();
  const toDxtsSunBal = await instance.methods.balanceOf(dxtsHodlAddress).call();
  const dxtsBal = tronWeb.fromSun(toDxtsSunBal);
  return parseFloat(dxtsBal);
};

module.exports = {
  createWallet,
  validateAddress,
  importPrivateKey,
  importWalletMnemonics,
  getTrxBalance,
  getDxtsBalance,
};
