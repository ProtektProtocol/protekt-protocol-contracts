const ReserveToken = artifacts.require("ReserveToken");
const UnderlyingToken = artifacts.require("UnderlyingToken");
const pToken = artifacts.require("pToken");
const Controller = artifacts.require("Controller");
const ShieldStrategy = artifacts.require("StrategyHodl");
const ClaimsManager = artifacts.require("ClaimsManagerSingleAccount");
const ShieldToken = artifacts.require("ShieldToken");

module.exports = async function (deployer, network, accounts) {
  let underlyingToken, reserveToken
  let protektToken
  let shieldController, shieldStrategy, shieldToken, claimsManager


  // 1) Get TestTokens =================================================
  // if(network === 'development') {
    underlyingToken = await UnderlyingToken.deployed()
    reserveToken = await ReserveToken.deployed()    
  // }
  // ===================================================================



  // 2) Launch ClaimsManager (ClaimsManagerSingleAccount) ==============
    claimsManager = await deployer.deploy(ClaimsManager);
  // ===================================================================



  // 3) Launch pToken =====================================================
  // Fee model contract = governance address
  protektToken = await deployer.deploy(pToken, underlyingToken.address, accounts[0], claimsManager.address);
  // ===================================================================



  // 4) Launch Investment Strategy (StrategyHodl) ======================
  shieldController = await deployer.deploy(Controller, reserveToken.address);
  shieldStrategy = await deployer.deploy(ShieldStrategy, shieldController.address);
  await shieldController.approveStrategy(reserveToken.address, shieldStrategy.address)
  await shieldController.setStrategy(reserveToken.address, shieldStrategy.address)
  // ===================================================================



  // 5) Launch ShieldToken =============================================
  shieldToken = await deployer.deploy(
      ShieldToken,
      protektToken.address,
      reserveToken.address,
      shieldController.address,
      claimsManager.address
    );
  await claimsManager.setShieldToken(shieldToken.address)
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

};
