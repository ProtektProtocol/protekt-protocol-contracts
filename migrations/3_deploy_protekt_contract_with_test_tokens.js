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


  // 1) Deploy test tokens - BUT set address to mainnet tokens ============
  underlyingToken = await UnderlyingToken.deployed();
  reserveToken = await ReserveToken.deployed();

  if(network === "test" || network === "develop"){
    underlyingTokenAddress = underlyingToken.address // TESTU
    reserveTokenAddress = reserveToken.address // TESTR
  }

  if(network ==="main"){
    underlyingTokenAddress = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643" //mainnet cDAI
    reserveTokenAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" // mainnet WETH
  }
  

  // }
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
  console.log('# REAL TOKENS - MAINNET')
  console.log('Underlying Token (cDAI): ', underlyingTokenAddress)
  console.log('Reserve Token: (WETH)', reserveTokenAddress)
  console.log('-----')
  console.log('-----')
  console.log('# pToken')
  console.log('Protekt Token: ', protektToken.address)
  let feeModelAddress = await protektToken.feeModel();
  console.log('Fee Model Contract: ', feeModelAddress)
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
