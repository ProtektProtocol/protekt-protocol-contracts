// Usage example:
// truffle exec ./scripts/disburse.js TPTK 1 100 --network kovan

const { MerkleTree } = require("./merkleTree");
const { utils } = web3;
const { loadTree } = require("./loadTree");
const fs = require("fs");
const axios = require("axios")
const Token = artifacts.require("Token");
const ProtektRedeem = artifacts.require("ProtektRedeem");

module.exports = async function(callback) {
  const tokenSymbol = process.argv[4]
  const weekNum = process.argv[5];
  const totalAllocation = process.argv[6];

  const report = await getReport(tokenSymbol, 1);
  const merkleTree = loadTree(utils, report);

  console.log("Week Num: ", weekNum);
  console.log("Amount: ", totalAllocation);
  console.log(`${tokenSymbol} Balance Length: `, report.length);
  console.log(`Balances: `, report);
  console.log(`\n`);

  const root = merkleTree.getHexRoot();
  console.log("Tree: ", root);

  let rewardTokenAddress, redeemAddress
  switch (tokenSymbol) {
    case 'TPTK':
      rewardTokenAddress = '0xccfbdc0592710892b06a2261bc52adc625eb4645';
      redeemAddress  = '0xC7a419Fd25A91A11f45dad873eaCE65bbC95A53A';
      break;
    case 'TCOMP':
      rewardTokenAddress = '0xc00e94Cb662C3520282E6f5717214004A7f26888';
      redeemAddress  = '0x1EEfB801C34348136B49704f18C66B38bB541fC7';
      break;
    default:
      console.log(`Sorry, no addresses available for ${tokenSymbol}.`);
  }

  // // -----Execute-----
  try {
    let redeem = await ProtektRedeem.at(redeemAddress);
    let rewardToken = await Token.at(rewardTokenAddress);

    let approvalTx = await rewardToken.approve(redeem.address, utils.toWei(totalAllocation));
    console.log(approvalTx);

    let tx = await redeem.seedAllocations(weekNum, root, utils.toWei(totalAllocation));
    console.log(tx);
    callback();
  } catch (error) {
    callback(error);
  }

};

async function getReport(tokenSymbol, weekNum) {
  let repo = `https://raw.githubusercontent.com/ProtektProtocol/protekt-mining-scripts/master`
  let report = {};
  let response
  try {
    response = await axios.get(`${repo}/reports/${tokenSymbol}/${weekNum}/_totals.json`);
    report = response.data
  } catch (error) {
    report = {}
    console.error(error);
  }
  return report;
}