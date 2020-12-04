const TToken = artifacts.require("TToken");
const Redeem = artifacts.require("ProtektRedeem");
const { utils } = web3;

module.exports = (deployer, network, accounts) => {
  const admin = accounts[0];
  deployer.then(async () => {
    await deployer.deploy(TToken, "Test COMP", "TCOMP", 18);
    const token = await TToken.deployed();
    await token.mint(admin, utils.toWei("145000"));

    await deployer.deploy(Redeem, token.address);
    const redeem = await Redeem.deployed();

    await token.transfer(redeem.address, utils.toWei("20000"));
  });
};