// truffle deploy --network kovan --f 8 --skip-dry-run --reset
const pTokenAave = artifacts.require("pTokenAave");
const ReferralToken = artifacts.require("ReferralToken");

module.exports = async function (deployer, network, accounts) {
  // Kovan cDAI address
  let underlyingTokenAddress = "0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad"

  // 1) Check correct network =================================================
  if(network!=="kovan"){
      throw "********** \n !kovan network \n ****************"
  }
  // ===================================================================



  // 2) Launch pToken =====================================================
  // msg.sender = governance address
  let protektToken = await deployer.deploy(pTokenAave, underlyingTokenAddress);
  // ===================================================================

  let protektTokenAddress = protektToken ? protektToken.address : '0x0E59208EfCc2A55334C905De90760366b1959e30';

  // 3) Launch ShieldToken =============================================
  let referralToken = await deployer.deploy(
      ReferralToken,
      protektTokenAddress,
      underlyingTokenAddress
    );
  await referralToken.setProtektToken(protektTokenAddress)
  // ===================================================================


    
  // Output ==============================================================
  console.log('# Kovan aUSDC pToken / Referral Tokens')
  console.log('-----')
  console.log('-----')
  console.log('Underlying Token (cDAI): ', underlyingTokenAddress)
  console.log('Protekt Token: ', protektTokenAddress)
  console.log('Referral Token: ', referralToken.address)
  console.log('-----')
  console.log('-----')

};
