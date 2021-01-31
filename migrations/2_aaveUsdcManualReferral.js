// truffle deploy --network kovan --f 2 --skip-dry-run --reset
const TToken = artifacts.require("TToken");
const pTokenAave = artifacts.require("pTokenAave");
const ReferralToken = artifacts.require("ReferralToken");

module.exports = async function (deployer, network, accounts) {
  // Kovan cDAI address
  let coreTokenAddress = "0xe22da380ee6b445bb8273c81944adeb6e8450422"
  let underlyingTokenAddress = "0xe12afec5aa12cf614678f9bfeeb98ca9bb95b5b0"
  let testToken = await TToken.new("aUSDC", "aUSDC", 6, {from: accounts[0]});
  underlyingTokenAddress = testToken.address;

  // 1) Check correct network =================================================
  // if(network!=="kovan"){
  //     throw "********** \n !kovan network \n ****************"
  // }
  // ===================================================================



  // 2) Launch pToken =====================================================
  let protektToken = await pTokenAave.new(underlyingTokenAddress, {from: accounts[0]});
  let protektTokenAddress = protektToken ? protektToken.address : '0x22D2F409760Dc1bF3dA2D6Fd25580b028ef1C800';
  // let protektToken = await pTokenAave.at(protektTokenAddress);
  // ===================================================================



  // 3) Launch ReferralToken =============================================
  let referralToken = await ReferralToken.new(
    protektTokenAddress,
    underlyingTokenAddress,
    {from: accounts[0]}
  );
  let referralTokenAddress = referralToken ? referralToken.address : '0x5422956Dd4bB490150912f0fE587604dFA3b9199';
  // let referralTokenAddress = '0x5422956Dd4bB490150912f0fE587604dFA3b9199';
  // ===================================================================



  // 4) Set ReferralToken =============================================
  await protektToken.setReferralToken(referralTokenAddress, {from: accounts[0]})
  // ===================================================================


	    
  // Output ==============================================================
  console.log('# Kovan aUSDC pToken / Referral Tokens')
  console.log('-----')
  console.log('-----')
  console.log('Core Token (USDC): ', coreTokenAddress)
  console.log('Underlying Token (aUSDC): ', underlyingTokenAddress)
  console.log('Protekt Token: ', protektTokenAddress)
  console.log('Referral Token: ', referralToken.address)
  console.log('-----')
  console.log('-----')
};
