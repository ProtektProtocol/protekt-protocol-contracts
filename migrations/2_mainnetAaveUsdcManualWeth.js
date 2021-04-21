// truffle deploy --network kovan --f 4 --to 4 --skip-dry-run --reset
const pToken = artifacts.require("pTokenAave");
const Controller = artifacts.require("Controller");
const ShieldStrategy = artifacts.require("StrategyHodl");
const ClaimsManager = artifacts.require("ClaimsManagerSingleAccount");
const ShieldToken = artifacts.require("ShieldToken");

module.exports = async function (deployer, network, accounts) {
  let protektToken
  let shieldController, shieldStrategy, shieldToken, claimsManager
  let underlyingToken, reserveToken

  // Mainnet USDC
  let coreTokenAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"

  // Mainnet aUSDC
  let underlyingTokenAddress = "0xBcca60bB61934080951369a648Fb03DF4F96263C"

  // Mainnet weth
  let reserveTokenAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

  // 1) Check correct network =================================================
  if(network!=="mainnet"){
      throw "********** \n !mainnet network \n ****************"
  }
  // ===================================================================


  // 2) Launch ClaimsManager (ClaimsManagerSingleAccount) ==============
  claimsManager = await ClaimsManager.new();
  // ===================================================================

  // 3) Launch pToken =====================================================
  // Fee model contract = governance address
  protektToken = await pToken.new(underlyingTokenAddress, accounts[0], claimsManager.address);
  // ===================================================================



  // 4) Launch Investment Strategy (StrategyHodl) ======================
  shieldController = await Controller.new(reserveTokenAddress);
  shieldStrategy = await ShieldStrategy.new(shieldController.address);
  await shieldController.approveStrategy(reserveTokenAddress, shieldStrategy.address);
  await shieldController.setStrategy(reserveTokenAddress, shieldStrategy.address);
  // ===================================================================



  // 5) Launch ShieldToken =============================================
  shieldToken = await ShieldToken.new(
      protektToken.address,
      reserveTokenAddress,
      shieldController.address,
      claimsManager.address
    );
  await claimsManager.setShieldToken(shieldToken.address);
  await protektToken.setShieldToken(shieldToken.address);
  // ===================================================================


    
  // Output ==============================================================
  console.log('# Kovan aUSDC / WETH Tokens')
  console.log('Underlying Token (aUSDC): ', underlyingTokenAddress)
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
