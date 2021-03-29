const Web3 = require('web3');
const { argv } = require('yargs');
const dotenv = require("dotenv");
const axios = require('axios');

// config
dotenv.config();


if (!argv.network) {
  console.log(
      'Usage: node scripts/uncapContract --network kovan' 
  );
  process.exit();
}


// Variable endpoints based on network
var WS_ENDPOINT = null
var CHAIN_ID = null
var PUBLIC_KEY= null
var PRIVATE_KEY=null

if(argv.network === "kovan"){
  HTTP_ENDPOINT = process.env.INFURA_KOVAN_URL;
  WS_ENDPOINT = process.env.INFURA_KOVAN_WS
  CHAIN_ID = 42
  PRIVATE_KEY = process.env.PRIVATE_KEY_KOVAN
  PUBLIC_KEY = process.env.PUBLIC_KEY_KOVAN
}

if(argv.network === "mainnet"){
  HTTP_ENDPOINT = process.env.INFURA_MAINNET_URL;
  WS_ENDPOINT = process.env.INFURA_MAINNET_WS
  CHAIN_ID = 1
  PRIVATE_KEY = process.env.PRIVATE_KEY_MAINNET
  PUBLIC_KEY = process.env.PUBLIC_KEY_MAINNET
}


const createTx = async (contract, method, from, to, args, web3) => {
    const methodCall = contract['methods'][method]

    const gasPrice = Number(await getFastestGasPriceWei());
    // const gas = await methodCall.apply(null,args).estimateGas({ from: from })
    //     .catch((e) => {
    //         throw Error(`Error calculating gas: ${e.message}`)
    //     })
    //100000
    const gas = "1000000" // estimate gas price as the max gas as above call seems to be broke
    const tx = {
        from: from,
        to: to,
        data: methodCall.apply(null,args).encodeABI(),
        gas,
        gasPrice,
        gasLimit: gas * gasPrice,
    };
    return tx;
}

async function getFastestGasPriceWei(){
  try{
      let response = await axios.get('https://www.gasnow.org/api/v3/gas/price?utm_source=85734')
      let gasCost = response.data.data.standard
      return gasCost
  }catch(e){
      return e
  }
}

/**
 * Method to sign the transaction and send to the smart contrac
 * 
 * @param {transaction to send} tx 
 * @param {privateKey of the account that create the transaction} privateKey 
 */
const signAndSendTransaction = async (tx, privateKey, web3) => {
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    return web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
}

const capContract = async (contractAddress, contractABI, args, from, privateKey, web3, network) => {
  try{
      let protektContract = new web3.eth.Contract(contractABI, contractAddress)
      let tx = await createTx(protektContract, 'uncapDeposits' ,from,contractAddress,args,web3)
      console.log('got tx...')
      console.log(tx)
      let result = await signAndSendTransaction(tx, privateKey, web3)
      console.log('got result...')
      console.log(result)
      return result
  }catch(e){
      console.log('failed in capContracts')
      console.log(e)
      return e
  }
  
}  

const web3 = new Web3(new Web3.providers.WebsocketProvider(WS_ENDPOINT));


(async function(){

   
  const contractAddress = "0x0584815FA77F397e79E31E7663FE0543d03a5EDD"
  const ABI = [{"inputs": [{"internalType": "address", "name": "_depositToken", "type": "address"},{"internalType": "address", "name": "_feeModel", "type": "address"},{"internalType": "address", "name": "_claimsManager", "type": "address"}], "payable": false, "stateMutability": "nonpayable", "type": "constructor"},{"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"},{"indexed": true, "internalType": "address", "name": "spender", "type": "address"},{"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}], "name": "Approval", "type": "event"},{"anonymous": false, "inputs": [{"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "HarvestRewards", "type": "event"},{"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"},{"indexed": true, "internalType": "address", "name": "to", "type": "address"},{"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}], "name": "Transfer", "type": "event"},{"constant": true, "inputs": [{"internalType": "address", "name": "owner", "type": "address"},{"internalType": "address", "name": "spender", "type": "address"}], "name": "allowance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": false, "inputs": [{"internalType": "address", "name": "spender", "type": "address"},{"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "approve", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": true, "inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": true, "inputs": [], "name": "cDaiTokenAddress", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": true, "inputs": [], "name": "claimsManager", "outputs": [{"internalType": "contract IClaimsManagerCore", "name": "", "type": "address"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": true, "inputs": [], "name": "comp", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": true, "inputs": [], "name": "compComptroller", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": true, "inputs": [], "name": "daiTokenAddress", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": true, "inputs": [], "name": "decimals", "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": false, "inputs": [{"internalType": "address", "name": "spender", "type": "address"},{"internalType": "uint256", "name": "subtractedValue", "type": "uint256"}], "name": "decreaseAllowance", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": true, "inputs": [], "name": "depositToken", "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": true, "inputs": [], "name": "feeModel", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": true, "inputs": [], "name": "governance", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": false, "inputs": [{"internalType": "address", "name": "spender", "type": "address"},{"internalType": "uint256", "name": "addedValue", "type": "uint256"}], "name": "increaseAllowance", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": true, "inputs": [], "name": "isCapped", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": true, "inputs": [], "name": "maxDeposit", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": true, "inputs": [], "name": "name", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": true, "inputs": [], "name": "symbol", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": true, "inputs": [], "name": "totalSupply", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": false, "inputs": [{"internalType": "address", "name": "recipient", "type": "address"},{"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "transfer", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": false, "inputs": [{"internalType": "address", "name": "sender", "type": "address"},{"internalType": "address", "name": "recipient", "type": "address"},{"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "transferFrom", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": true, "inputs": [], "name": "balance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": false, "inputs": [{"internalType": "address", "name": "_governance", "type": "address"}], "name": "setGovernance", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": false, "inputs": [{"internalType": "address", "name": "_feeModel", "type": "address"}], "name": "setFeeModel", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": false, "inputs": [], "name": "depositAll", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": false, "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}], "name": "deposit", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": false, "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"},{"internalType": "address", "name": "depositor", "type": "address"}], "name": "depositCoreTokens", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": false, "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}], "name": "depositCoreTokens", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": false, "inputs": [], "name": "withdrawAll", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": false, "inputs": [], "name": "harvestRewards", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": false, "inputs": [{"internalType": "address", "name": "_feeModel", "type": "address"}], "name": "harvestRewards", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": false, "inputs": [{"internalType": "uint256", "name": "_shares", "type": "uint256"}], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": true, "inputs": [], "name": "getPricePerFullShare", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"},{"constant": false, "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}], "name": "capDeposits", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function"},{"constant": false, "inputs": [], "name": "uncapDeposits", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function"}];


  console.log(`un capping contract ${contractAddress}`)

  try{
    let result = capContract(contractAddress,ABI,[],PUBLIC_KEY,PRIVATE_KEY,web3,1)
    console.log(result)
  }catch(e){
    console.log(e)
  }
  // check results
  
  // uncap it 

  // check it still works
  


  // provider.engine.stop();
   
})();



