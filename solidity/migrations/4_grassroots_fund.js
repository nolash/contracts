let EtherToken = artifacts.require('EtherToken');
let BancorConverterRegistry = artifacts.require('BancorConverterRegistry');
let BancorConverter = artifacts.require('BancorConverter');
let BancorConverterFactory = artifacts.require('BancorConverterFactory');
let ContractRegistry = artifacts.require('ContractRegistry');
let BancorNetworkPathFinder = artifacts.require('BancorNetworkPathFinder');

let amount_initial_reserve = '10000000000000';
let amount_initial_reserve_token = 1000000;
let amount_initial_minted_token = 4000000;

module.exports = async function(deployer, network, accounts) {
	if (network == 'development') {
		deployer.then(async () => {

			console.log(">>>> deploying with account " + accounts[0])
			let etherToken = await EtherToken.deployed();
			let smartToken = await SmartToken.deployed();
			let converterRegistry = await BancorConverterRegistry.deployed();
			let converterFactory = await BancorConverterFactory.deployed();
			let registry = await ContractRegistry.deployed();
			let pathFinder = await BancorNetworkPathFinder.deployed();

					let tx = await web3.eth.sendTransaction({from: accounts[0], to: etherToken.address, value: amount_initial_reserve});
			console.log('sent', tx);

			await etherToken.transfer(converter.address, amount_initial_reserve_token);
			console.log('transfer');

			await smartToken.issue(accounts[0], amount_initial_minted_token);
			console.log('issue');

			await smartToken.transferOwnership(converter.address);
			console.log('transferowner');

			let t = await converter.acceptTokenOwnership();
			console.log('acceptowner');

			let r = await converterRegistry.addConverter(converter.address);
			console.log('addconverter');

			console.log('setanchor');
		});
	}
}
