const axios = require("axios")
const PToken = artifacts.require("pToken");
const ComptrollerInterface = artifacts.require("ComptrollerInterface");

module.exports = async (callback) => {
  // const pTokenAddress = '0x52216D3084cB4403425dD2D3d463b9dc117EEcc1'
  // let pToken = await PToken.at(pTokenAddress);

  const comptrollerInterfaceAddress = '0x5eAe89DC1C671724A672ff0630122ee834098657'
  let comptroller = await ComptrollerInterface.at(comptrollerInterfaceAddress);

  // console.log('pToken: ', pToken)

  let tx
  try {
    // tx = await pToken.harvestRewards();
    tx = await comptroller.claimComp('0x869eC00FA1DC112917c781942Cc01c68521c415e')
    console.log(tx);
    callback();
  } catch (error) {
    callback(error);
  }
}