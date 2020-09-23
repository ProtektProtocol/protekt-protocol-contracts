# Protekt Protocol
Protekt Protocol puts crypto to work insuring users against hacks, bugs, and exploits of any DeFi protocol. Just as [Uniswap](https://uniswap.org/) allows any token to have a spot market, Protekt allows any pooled capital to be insured by stakers. The goal is to support and catalyze the growth of the DeFi ecosystem by protecting users from getting rekt.

Along with being a smart contract protocol, an allocation of protocol treasury will be used for grants to continually audit and secure other DeFi moeny legos, so the ecosystem can all grow safely together!

![Banner](/img/banner.jpg)

Building on the work of awesome projects like [DeFi Score](https://defiscore.io/), [Nexus Mutual](https://nexusmutual.io/), [Aave's Safety Modules](https://docs.aave.com/aavenomics/safety-module), and others, we believe that large vulnerabilities are the **biggest risk to a thriving DeFi community** over the next few years. Especially as new money legos are created and remixed weekly, smart contract bugs, collateral failures, centralization risk, and oracle risk are a massive concern and bottleneck to more capital flowing into the space. New entrants need signaling and assurance of the projects they can trust and commit capital as well as recapitalization if a [Shortfall Event](https://docs.aave.com/aavenomics/terminology#shortfall-event-se) occurs.

To fulfill this need, Protekt Protocol introduces a new insurance marketplace with several innovative features:
* Anyone can back any capital pool with a customizable insurance contract
* Wrapped tokens with built in coverage (never "buy cover")
* Staking pools with shield farming incentives
* Claims processing via automated rules or a DAO
* Final liquidation pool owned and governed by a DAO.

The protocol  was inspired and uses money legos from yearn, Aave, Compound, Balancer, Maker, rDAi, and others. The very best in DeFi.

## How it works
### pTokens, like cTokens but with cover
Users can deposit Dai that gets forwarded into the Compound cDAI pool and get pTokens in return. The pToken represents your underlying cToken 1:1 plus 90% of the COMP farming rewards, while the other 10% goes to the Protekt pool stakers as rewards. This fee is the user's ongoing "premium" for purchasing cover. pTokens can be minted at any time and redeemed for your cTokens + adjusted COMP rewards at any time.

**In short, by holding a pToken, you pay 10% of your yield farming returns to be insured against a hacks, bugs, and exploits of the underlying capital pool.**

![pToken Image](/img/pTokenDiagram.png)

### Protekt Pools
Protekt pools can be set up on top of ANY DeFi pool to insure it against risk, whether it's a lending pool, market making pool, staking pool, etc. Stakers can add capital to the Protekt pool to cover the liability of the underlying pool from a Shortfall event and earn a portion of the yield farming rewards in return. Stakers should only stake on capital pools they are confident are secure and can ask for audits, reviews, timelocks, etc before depositing value.

![Protekt Pool Image](/img/ProtektPool.png)

### The PKT Mothership Vault
The PKT Mothership Vault is the backstop that covers all Protekt pools, governs which underlying pools are added and when, and will eventually earn cashflow. New Protekt pools can only be added through the Mothership. She creates life and give security.

![Full Protocol Image](/img/ProtektProtocolDiagram.png)

## The PKT Token
The PKT token is the governance and rewards token of the Protekt Protocol. It will be used to stake for assuming protocol liability, make governance decisions, receive rewards from protocol fees, provided as protocol incentives, and used to fund grants and audit reports for DeFi protocols that are covered by Protekt.

### Protocol Incentives (Yield Farming)
Every Wednesday, new rounds of PKT will be claimable by those providing capital or work into the protocol. Tasks that earn weekly PKT include:
* Shield Farming in a Protekt pool
* Staking PKT, ETH, or DAI in the Mothership Vault
* Rewards for fulfilling open grants
* Rewards for creating audit reports on other DeFi protocols

### Governance
Governance will start and end with the Protekt community. The community will be not only be PKT holders but also the hackers, devs, auditors, analysts, and actuaries that contribute their blood, sweat, and tears to DeFi. They will be the ones to propose coverage of new DeFi pools, adjust and critique settings, and keep DeFi safe at night. The protocol will maintain some level of centralization at the beginning so it can iterate quickly but will pursue a pathway of [progressive decentralization](https://a16z.com/2020/01/09/progressive-decentralization-crypto-product-management/) over time.

## Shortfall Events & Liquidations




## References
* Twitter for announcements: [@protektprotocol](https://twitter.com/home)
* Discord for discussions: [TBD](/)
* Snapshot for governance: [TBD](/)
* Github for code & docs: [Repo](https://github.com/corbinpage/protekt-protocol)