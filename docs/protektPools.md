# Protekt Pools
Protekt pools are configurable insurance contracts that can be set up on top of ANY DeFi pool, whether it's a lending pool, market making pool, staking pool, etc. They consist of 3 modules:
1. Coverage Pool
2. Protekt Contract
3. Staking Pool

![Protekt Pool Image](/img/ProtektPool.png)

## Coverage Pool
As an example, users can deposit Dai that gets forwarded into the Compound cDAI pool and get pTokens in return. The cDai tokens are held by the Coverage pool. pcDai tokens can be redeemed for underlying cDai 1:1.

Parameters
* Underlying token

## Staking Pool
As an example, users can stake ETH and take on the liability of the cDAI pool. In return for the risk of potentially getting liquidated, stakers earn fees from the Coverage pool. Furthermore, the deposits can be invested to build up cash

Parameters
* Reserve token
* Withdraw delay (if any)
* Strategy

## Protekt Contract
Protekt contracts are configurable insurance contracts that define the terms of the market including:
* What fees are takens and how
* Underlying pool appraisal and coverage percentage
* What rules define an incident on that pool?
    * A smart contract query
    * DAO vote
    * Central actor
* Claims process
	* Who can submit a claim?
	* How long is the claim investigated?
	* Are payouts payment-in-kind or in ETH/DAI/USDC?
