const ReserveToken = artifacts.require("ReserveToken");
const UnderlyingToken = artifacts.require("UnderlyingToken");
const pToken = artifacts.require("pToken");
const Controller = artifacts.require("Controller");
const ShieldStrategy = artifacts.require("StrategyHodl");
const ClaimsManager = artifacts.require("ClaimsManagerSingleAccount");
const ShieldToken = artifacts.require("ShieldToken");

module.exports = function (deployer, network, accounts) {
  let underlyingToken, reserveToken
  let protektToken
  let shieldController, shieldStrategy, shieldToken, claimsManager

  // 1) Launch TestTokens =================================================
  deployer.deploy(UnderlyingToken).then(function(instance) {
    underlyingToken = instance 

    return deployer.deploy(ReserveToken);
  }).then(function(instance) {
    reserveToken = instance
  // ===================================================================


    /*
        Move claims manager before pToken so could use it when deploying
    */

    // 4) Launch ClaimsManager (ClaimsManagerSingleAccount) ==============
    return deployer.deploy(ClaimsManager);
    }).then(function(instance) {
      claimsManager = instance
    // ===================================================================



  // 2) Launch pToken =====================================================
  // Fee model contract = governance address
    return deployer.deploy(pToken, underlyingToken.address, accounts[0],claimsManager.address);
  }).then(function(instance) {
    protektToken = instance
  // ===================================================================



  // 3) Launch Investment Strategy (StrategyHodl) ======================
    return deployer.deploy(Controller, reserveToken.address);
  }).then(function(instance) {
    shieldController = instance
    return deployer.deploy(ShieldStrategy, shieldController.address);
  }).then(function(instance) {
    shieldStrategy = instance
    shieldController.approveStrategy(reserveToken.address, shieldStrategy.address)
    shieldController.setStrategy(reserveToken.address, shieldStrategy.address)
  // ===================================================================




  // 5) Launch ShieldToken =============================================
    return deployer.deploy(
      ShieldToken,
      protektToken.address,
      reserveToken.address,
      shieldController.address,
      claimsManager.address
    );
  }).then(function(instance) {
    shieldToken = instance
    claimsManager.setShieldToken(shieldToken.address)
  // ===================================================================


    
    // Output ==============================================================
    console.log('# TestTokens')
    console.log('Underlying Token: ', underlyingToken.address)
    console.log('Reserve Token: ', reserveToken.address)
    console.log('-----')
    console.log('-----')
    console.log('# pToken')
    console.log('Protekt Token: ', protektToken.address)
    console.log('Fee Model Contract: ', protektToken.address)
    console.log('-----')
    console.log('-----')
    console.log('# ShieldToken')
    console.log('Shield Token: ', shieldToken.address)
    console.log('Controller: ', shieldController.address)
    console.log('Strategy: ', shieldStrategy.address)
    console.log('Claims Manager: ', claimsManager.address)
    console.log('-----')
    console.log('-----')
  })

};
