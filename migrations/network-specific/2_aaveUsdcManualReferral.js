// truffle deploy --network kovan --f 2 --skip-dry-run --reset
const TToken = artifacts.require("TToken");
const pTokenAave = artifacts.require("pTokenAave");
const ReferralToken = artifacts.require("ReferralToken");

module.exports = async function (deployer, network, accounts) {
  // Kovan cDAI address
  let coreTokenAddress = "0xe22da380ee6b445bb8273c81944adeb6e8450422"
  let underlyingTokenAddress = "0xe12afec5aa12cf614678f9bfeeb98ca9bb95b5b0"
  // let testToken = await TToken.new("aUSDC", "aUSDC", 6, {from: accounts[0]});
  // underlyingTokenAddress = testToken.address;

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
  console.log('# Kovan aUSDC pToken / Referral Tokens')
  console.log('-----')
  console.log('-----')
  console.log('Core Token (USDC): ', coreTokenAddress)
  console.log('Underlying Token (aUSDC): ', underlyingTokenAddress)
  console.log('Protekt Token: ', protektToken.address)
  console.log('Referral Token: ', referralToken.address)
  console.log('-----')
  console.log('-----')
};
