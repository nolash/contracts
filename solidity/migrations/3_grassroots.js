let ContractRegistry = artifacts.require('ContractRegistry');
let BancorNetwork = artifacts.require('BancorNetwork');
let BancorNetworkPathFinder = artifacts.require('BancorNetworkPathFinder');
let BancorConverter = artifacts.require('BancorConverter');
let BancorConverterFactory = artifacts.require('BancorConverterFactory');
let BancorConverterRegistry = artifacts.require('BancorConverterRegistry');
let BancorConverterRegistryData = artifacts.require('BancorConverterRegistryData');
let EtherToken = artifacts.require('EtherToken');
let SmartTokenController = artifacts.require('SmartTokenController');
let BancorFormula = artifacts.require('BancorFormula');
let ContractFeatures = artifacts.require('ContractFeatures');
let Whitelist = artifacts.require('Whitelist');

let web3 = require('web3');

let amount_initial_reserve = '10000000000000';
let amount_initial_reserve_token = 1000000;
let amount_initial_minted_token = 4000000;

module.exports = async function(deployer, network, accounts) {
	deployer.then(async () => {
		// deploy all necessary contracts
		let registry = await deployer.deploy(ContractRegistry);
		deployer.link(ContractRegistry, [BancorConverterRegistry, BancorConverterRegistryData]);
		let converterRegistry = await deployer.deploy(BancorConverterRegistry, registry.address);
		let converterRegistryData = await deployer.deploy(BancorConverterRegistryData, registry.address);
		let network = await deployer.deploy(BancorNetwork, registry.address);
		let etherToken = await deployer.deploy(EtherToken, "Grassroots XDAI Reserve Token", "XDAIGR");
		let converterFactory = await deployer.deploy(BancorConverterFactory);
		let features = await deployer.deploy(ContractFeatures);
		let formula = await deployer.deploy(BancorFormula);
		let networkPathFinder = await deployer.deploy(BancorNetworkPathFinder, registry.address);


		// set up the registry
		name = web3.utils.asciiToHex('ContractRegistry')
		await registry.registerAddress(name, registry.address);
		console.log("contractregistry has " + name);
		name = web3.utils.asciiToHex('BancorNetwork')
		await registry.registerAddress(name, network.address);
		name = web3.utils.asciiToHex('ContractFeatures')
		await registry.registerAddress(name, features.address);
		name = web3.utils.asciiToHex('BancorConverterRegistry')
		await registry.registerAddress(name, converterRegistry.address);
		name = web3.utils.asciiToHex('BancorConverterFactory')
		await registry.registerAddress(name, converterFactory.address);
		name = web3.utils.asciiToHex('BancorConverterRegistryData')
		await registry.registerAddress(name, converterRegistryData.address);
		name = web3.utils.asciiToHex('BancorNetworkPathFinder')
		await registry.registerAddress(name, networkPathFinder.address);
		name = web3.utils.asciiToHex('BancorFormula')
		await registry.registerAddress(name, formula.address);

		// register the reserve token
		await network.registerEtherToken(etherToken.address, true);

		await networkPathFinder.setAnchorToken(etherToken.address)
		
		if (network == 'development') {
			console.log(">>>> deploying with account " + accounts[0])
			let smartToken = await SmartToken.deployed();

			let converterAddress = await converterFactory.createConverter(smartToken.address, registry.address, 0, etherToken.address, 25000);
			let converter = await BancorConverter.at(converterAddress.logs[0].args._converter);
			await converter.acceptOwnership();

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
		}

	});
}
