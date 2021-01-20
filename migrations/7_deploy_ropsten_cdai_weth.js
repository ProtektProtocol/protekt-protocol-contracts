// truffle deploy --network ropsten --f 7 --skip-dry-run --reset
const ReserveToken = artifacts.require("ReserveToken");
const UnderlyingToken = artifacts.require("UnderlyingToken");
const pToken = artifacts.require("pToken");
const Controller = artifacts.require("Controller");
const ShieldStrategy = artifacts.require("StrategyHodl");
const ClaimsManager = artifacts.require("ClaimsManagerSingleAccount");
const ShieldToken = artifacts.require("ShieldToken");

module.exports = async function (deployer, network, accounts) {
  let protektToken
  let shieldController, shieldStrategy, shieldToken, claimsManager
  let underlyingToken, reserveToken

  // Not used. cDAI and WETH are used instead.
  underlyingToken = await UnderlyingToken.deployed();
  reserveToken = await ReserveToken.deployed();

  // Ropsten cDAI address
  let underlyingTokenAddress = "0x8354c3a332ffb24e3a27be252e01acfe65a33b35"

  // Ropsten WETH address
  let reserveTokenAddress = "0xb603cea165119701b58d56d10d2060fbfb3efad8"

  // 1) Check correct network =================================================
  if(network!=="ropsten"){
      throw "********** \n !ropsten network \n ****************"
  }
  // ===================================================================


  // 2) Launch ClaimsManager (ClaimsManagerSingleAccount) ==============
  claimsManager = await deployer.deploy(ClaimsManager);
  // ===================================================================

  // 3) Launch pToken =====================================================
  // Fee model contract = governance address
  protektToken = await deployer.deploy(pToken, underlyingTokenAddress, accounts[0], claimsManager.address);
  // ===================================================================



  // 4) Launch Investment Strategy (StrategyHodl) ======================
  shieldController = await deployer.deploy(Controller, reserveTokenAddress);
  shieldStrategy = await deployer.deploy(ShieldStrategy, shieldController.address);
  await shieldController.approveStrategy(reserveTokenAddress, shieldStrategy.address)
  await shieldController.setStrategy(reserveTokenAddress, shieldStrategy.address)
  // ===================================================================



  // 5) Launch ShieldToken =============================================
  shieldToken = await deployer.deploy(
      ShieldToken,
      protektToken.address,
      reserveTokenAddress,
      shieldController.address,
      claimsManager.address
    );
  await claimsManager.setShieldToken(shieldToken.address)
  // ===================================================================


    
  // Output ==============================================================
  console.log('# Ropsten cDAI / WETH Tokens')
  console.log('Underlying Token (cDAI): ', underlyingTokenAddress)
  console.log('Reserve Token (WETH): ', reserveTokenAddress)
  console.log('-----')
  console.log('-----')
  console.log('# Ropsten pToken')
  console.log('Protekt Token: ', protektToken.address)
  let feeModelAddress = await protektToken.feeModel();
  console.log('Fee Model Contract: ', feeModelAddress)
  console.log('-----')
  console.log('-----')
  console.log('# Ropsten ShieldToken')
  console.log('Shield Token: ', shieldToken.address)
  console.log('Controller: ', shieldController.address)
  console.log('Strategy: ', shieldStrategy.address)
  console.log('Claims Manager: ', claimsManager.address)
  console.log('-----')
  console.log('-----')

};
