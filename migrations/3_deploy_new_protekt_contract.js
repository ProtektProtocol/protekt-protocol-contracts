const ReserveToken = artifacts.require("ReserveToken");
const UnderlyingToken = artifacts.require("UnderlyingToken");
const pToken = artifacts.require("pToken");
const Controller = artifacts.require("Controller");
const ShieldStrategy = artifacts.require("StrategyHodl");
const ClaimsManager = artifacts.require("ClaimsManagerSingleAccount");
const ShieldToken = artifacts.require("ShieldToken");


// truffle deploy --network rinkeby --skip-dry-run --reset

module.exports = async function (deployer, network, accounts) {
  let underlyingToken, reserveToken
  let protektToken
  let shieldController, shieldStrategy, shieldToken, claimsManager


  // 1) Get TestTokens =================================================
  // if(network === 'development') {
    underlyingToken = await UnderlyingToken.deployed()
    reserveToken = await ReserveToken.deployed()  
    var underlyingTokenAddress = underlyingToken.address
    var reserveTokenAddress = reserveToken.address
  // }
  // ===================================================================

  if(network === 'rinkeby'){
    underlyingTokenAddress = "0x6d7f0754ffeb405d23c51ce938289d4835be3b14" // cDAI
    reserveTokenAddress = "0xc778417e063141139fce010982780140aa0cd5ab" // WETH
  }

  if(network === 'kovan'){
    underlyingTokenAddress = "0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad" // cDAI - https://compound.finance/docs/
    reserveTokenAddress = "0xd0a1e359811322d97991e03f863a0c30c2cf029c" // WETH - https://kovan.etherscan.io/token/0xd0a1e359811322d97991e03f863a0c30c2cf029c
  }




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
  console.log('# TestTokens')
  console.log('Underlying Token: ', underlyingTokenAddress)
  console.log('Reserve Token: ', reserveTokenAddress)
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
