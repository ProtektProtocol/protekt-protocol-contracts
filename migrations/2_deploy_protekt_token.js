const Token = artifacts.require("Token");
const pToken = artifacts.require("pToken");
const Controller = artifacts.require("Controller");
const ShieldStrategy = artifacts.require("StrategyHodl");
const ShieldToken = artifacts.require("ShieldToken");

module.exports = function (deployer) {
  let underlyingToken, reserveToken
  let protektToken
  let shieldController, shieldStrategy, shieldToken

  // Launch TestTokens
  deployer.deploy(Token).then(function(instance) {
    underlyingToken = instance 

    return deployer.deploy(Token);
  }).then(function(instance) {
    reserveToken = instance

  // Launch pToken
    return deployer.deploy(pToken, underlyingToken.address);
  }).then(function(instance) {
    protektToken = instance

  // Launch ShieldToken
    return deployer.deploy(Controller, reserveToken.address);
  }).then(function(instance) {
    shieldController = instance
    return deployer.deploy(ShieldStrategy, shieldController.address);
  }).then(function(instance) {
    shieldStrategy = instance
    shieldController.approveStrategy(reserveToken.address, shieldStrategy.address)
    shieldController.setStrategy(reserveToken.address, shieldStrategy.address)

    return deployer.deploy(ShieldToken, protektToken.address, reserveToken.address, shieldController.address);
  }).then(function(instance) {
    shieldToken = instance
    // Output
    console.log('Underlying Token: ', underlyingToken.address)
    console.log('Reserve Token: ', reserveToken.address)
    console.log('-----')
    console.log('Protekt Token: ', protektToken.address)
    console.log('-----')
    console.log('Shield Token: ', shieldToken.address)
    console.log('Shield Controller: ', shieldController.address)
    console.log('Shield Strategy: ', shieldStrategy.address)
  })

};
