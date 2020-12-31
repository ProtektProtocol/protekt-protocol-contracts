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

  let redeemAddress = '0xa67fC90d27f4901DF1AA23EFb0E7a14248E64d76';
  let rewardTokenAddress = '0x235354F906fcaDE94b9d8d1E4a91153628CFd90C';

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