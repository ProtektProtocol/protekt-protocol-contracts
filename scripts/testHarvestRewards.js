const axios = require("axios")
const PToken = artifacts.require("pToken");

module.exports = async (callback) => {
  const pTokenAddress = '0x52216D3084cB4403425dD2D3d463b9dc117EEcc1'
  let pToken = await PToken.at(pTokenAddress);

  // console.log('pToken: ', pToken)

  let tx
  try {
    tx = await pToken.harvestRewards();
    console.log(tx);
    callback();
  } catch (error) {
    callback(error);
  }
}