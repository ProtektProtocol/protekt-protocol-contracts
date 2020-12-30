// Usage example:
// truffle exec ./script/disburse /Users/corbinpage/zdev/protekt-protocol-contracts/tests/sampleData/10_totals.json 1 100

const { MerkleTree } = require("./merkleTree");
const { utils } = web3;
const { loadTree } = require("./loadTree");
const fs = require("fs");
const Token = artifacts.require("Token");
const ProtektRedeem = artifacts.require("ProtektRedeem");

module.exports = async function(callback) {
  console.log("File Path Arg (must be absolute):", process.argv[4]);

  const merkleTree = loadTree(utils, process.argv[4]);
  const weekNum = process.argv[5];
  const totalAllocation = process.argv[6];
  const shouldExecute = process.argv[6];

  console.log("Week Num: ", weekNum);
  console.log("Amount: ", totalAllocation);

  const root = merkleTree.getHexRoot();
  console.log("Tree: ", root);

  let redeemAddress = '0x6FfCE98Dc7284292656FA049855d70907A094B06';
  let rewardTokenAddress = '0xDD45fc356a0ac7296f24349e1F5CDaA4D20597fB';

  console.log(`\n\n// TO FINISH THIS WEEK`);
  console.log(`let redeem = await ProtektRedeem.at(${redeemAddress});`);
  console.log(`let rewardToken = await Token.at(${rewardTokenAddress});`);
  console.log(`let approvalTx = await rewardToken.approve(redeem.address, totalAllocation)`);
  console.log(`let tx = await redeem.seedAllocations(${weekNum}, ${root}, ${totalAllocation})`);

  // -----Execute-----
  let redeem = await ProtektRedeem.at(redeemAddress);
  let rewardToken = await Token.at(rewardTokenAddress);

  let approvalTx = await rewardToken.approve(redeem.address, utils.toWei(totalAllocation));
  console.log(approvalTx);

  let tx = await redeem.seedAllocations(weekNum, root, utils.toWei(totalAllocation));
  console.log(tx);

};