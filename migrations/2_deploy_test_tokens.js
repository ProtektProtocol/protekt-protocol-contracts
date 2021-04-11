// truffle deploy --network kovan --f 2 --skip-dry-run --reset

const ReserveToken = artifacts.require("ReserveToken");
const UnderlyingToken = artifacts.require("UnderlyingToken");
const CoreToken = artifacts.require("UnderlyingToken")

module.exports = function (deployer, network, accounts) {
  let underlyingToken, reserveToken, coreToken

  // 1) Launch TestTokens =================================================
  deployer.deploy(UnderlyingToken).then(function(instance) {
    underlyingToken = instance 

    return deployer.deploy(ReserveToken);
  }).then(function(instance) {
    reserveToken = instance
  // ===================================================================

    // Output ==============================================================
    console.log('# TestTokens')
    console.log('Underlying Token: ', underlyingToken.address)
    console.log('Reserve Token: ', reserveToken.address)
    console.log('-----')
    console.log('-----')
  })
};