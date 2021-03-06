// truffle deploy --network kovan --f 5 --skip-dry-run --reset
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

  // Kovan cDAI address
  let underlyingTokenAddress = "0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad"

  // Kovan WETH address
  let reserveTokenAddress = "0xd0A1E359811322d97991E03f863a0C30C2cF029C"

  // 1) Check correct network =================================================
  if(network!=="kovan"){
      throw "********** \n !kovan network \n ****************"
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
  console.log('# Kovan cDAI / WETH Tokens')
  console.log('Underlying Token (cDAI): ', underlyingTokenAddress)
  console.log('Reserve Token (WETH): ', reserveTokenAddress)
  console.log('-----')
  console.log('-----')
  console.log('# Kovan pToken')
  console.log('Protekt Token: ', protektToken.address)
  let feeModelAddress = await protektToken.feeModel();
  console.log('Fee Model Contract: ', feeModelAddress)
  console.log('-----')
  console.log('-----')
  console.log('# Kovan ShieldToken')
  console.log('Shield Token: ', shieldToken.address)
  console.log('Controller: ', shieldController.address)
  console.log('Strategy: ', shieldStrategy.address)
  console.log('Claims Manager: ', claimsManager.address)
  console.log('-----')
  console.log('-----')

};
