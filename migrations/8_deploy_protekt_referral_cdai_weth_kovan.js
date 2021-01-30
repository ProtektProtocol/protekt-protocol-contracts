// truffle deploy --network kovan --f 8 --skip-dry-run --reset
const pToken = artifacts.require("pTokenAave");
const ReferralToken = artifacts.require("ReferralToken");

module.exports = async function (deployer, network, accounts) {
  let protektToken, referralToken, underlyingToken

  // Kovan cDAI address
  let underlyingTokenAddress = "0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad"

  // 1) Check correct network =================================================
  if(network!=="kovan"){
      throw "********** \n !kovan network \n ****************"
  }
  // ===================================================================



  // 2) Launch pToken =====================================================
  // msg.sender = governance address
  protektToken = await deployer.deploy(pToken, underlyingTokenAddress);
  // ===================================================================



  // 3) Launch ShieldToken =============================================
  referralToken = await deployer.deploy(
      ReferralToken,
      protektToken.address,
      underlyingTokenAddress
    );
  await referralToken.setProtektToken(protektToken.address)
  // ===================================================================


    
  // Output ==============================================================
  console.log('# Kovan aUSDC pToken / Referral Tokens')
  console.log('-----')
  console.log('-----')
  console.log('Underlying Token (cDAI): ', underlyingTokenAddress)
  console.log('Protekt Token: ', protektToken.address)
  console.log('Referral Token: ', referralToken.address)
  console.log('-----')
  console.log('-----')

};
