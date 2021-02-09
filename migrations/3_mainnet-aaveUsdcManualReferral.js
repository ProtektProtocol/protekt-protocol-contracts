// truffle deploy --network kovan --f 2 --skip-dry-run --reset
const TToken = artifacts.require("TToken");
const pTokenAave = artifacts.require("pTokenAave");
const ReferralToken = artifacts.require("ReferralToken");

module.exports = async function (deployer, network, accounts) {
  // Kovan cDAI address
  let coreTokenAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  let underlyingTokenAddress = "0xbcca60bb61934080951369a648fb03df4f96263c"

  // 1) Check correct network =================================================
  // if(network!=="kovan"){
  //     throw "********** \n !kovan network \n ****************"
  // }
  // ===================================================================



  // 2) Launch pToken =====================================================
  let protektToken = await pTokenAave.new(underlyingTokenAddress, {from: accounts[0]});
  // let protektToken = await pTokenAave.at('');
  // ===================================================================



  // 3) Launch ReferralToken =============================================
  let referralToken = await ReferralToken.new(
    protektToken.address,
    underlyingTokenAddress,
    {from: accounts[0]}
  );
  // let referralToken = await ReferralToken.at('');
  await referralToken.pause({from: accounts[0]});
  // ===================================================================



  // 4) Set ReferralToken =============================================
  await protektToken.setReferralToken(referralToken.address, {from: accounts[0]})
  // ===================================================================


      
  // Output ==============================================================
  console.log('# aUSDC pToken / Referral Tokens')
  console.log('-----')
  console.log('-----')
  console.log('Core Token (USDC): ', coreTokenAddress)
  console.log('Underlying Token (aUSDC): ', underlyingTokenAddress)
  console.log('Protekt Token: ', protektToken.address)
  console.log('Referral Token: ', referralToken.address)
  console.log('-----')
  console.log('-----')
};