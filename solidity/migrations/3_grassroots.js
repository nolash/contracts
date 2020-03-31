let ContractRegistry = artifacts.require('ContractRegistry');
let BancorNetwork = artifacts.require('BancorNetwork');
let BancorNetworkPathFinder = artifacts.require('BancorNetworkPathFinder');
let BancorConverter = artifacts.require('BancorConverter');
let BancorConverterFactory = artifacts.require('BancorConverterFactory');
let BancorConverterRegistry = artifacts.require('BancorConverterRegistry');
let BancorConverterRegistryData = artifacts.require('BancorConverterRegistryData');
let EtherToken = artifacts.require('EtherToken');
let SmartTokenController = artifacts.require('SmartTokenController');
let SmartToken = artifacts.require('SmartToken');
let BancorFormula = artifacts.require('BancorFormula');
let ContractFeatures = artifacts.require('ContractFeatures');
let Whitelist = artifacts.require('Whitelist');

let w3 = require('web3');

let amount_initial_reserve = '10000000000000000000000';
let amount_initial_reserve_token = 1000000000000000000000;
let reserve_multiplier = 4000000000000000000000;
let reserve_ratio = 1000000 / reserve_multiplier;
let amount_initial_minted_token = amount_initial_reserve_token * reserve_multiplier;

module.exports = async function(deployer, network, accounts) {
	deployer.then(async () => {
		// deploy all necessary contracts
		let registry = await deployer.deploy(ContractRegistry);
		deployer.link(ContractRegistry, [BancorConverterRegistry, BancorConverterRegistryData]);
		let converterRegistry = await deployer.deploy(BancorConverterRegistry, registry.address);
		let converterRegistryData = await deployer.deploy(BancorConverterRegistryData, registry.address);
		let converterNetwork = await deployer.deploy(BancorNetwork, registry.address);
		let etherToken = await deployer.deploy(EtherToken, "Grassroots XDAI Reserve Token", "XDAIGR");
		let converterFactory = await deployer.deploy(BancorConverterFactory);
		let features = await deployer.deploy(ContractFeatures);
		let formula = await deployer.deploy(BancorFormula);
		let converterNetworkPathFinder = await deployer.deploy(BancorNetworkPathFinder, registry.address);


		// set up the registry
		name = w3.utils.asciiToHex('ContractRegistry')
		await registry.registerAddress(name, registry.address);
		console.log("contractregistry has " + name);
		name = w3.utils.asciiToHex('BancorNetwork')
		await registry.registerAddress(name, converterNetwork.address);
		name = w3.utils.asciiToHex('ContractFeatures')
		await registry.registerAddress(name, features.address);
		name = w3.utils.asciiToHex('BancorConverterRegistry')
		await registry.registerAddress(name, converterRegistry.address);
		name = w3.utils.asciiToHex('BancorConverterFactory')
		await registry.registerAddress(name, converterFactory.address);
		name = w3.utils.asciiToHex('BancorConverterRegistryData')
		await registry.registerAddress(name, converterRegistryData.address);
		name = w3.utils.asciiToHex('BancorNetworkPathFinder')
		await registry.registerAddress(name, converterNetworkPathFinder.address);
		name = w3.utils.asciiToHex('BancorFormula')
		await registry.registerAddress(name, formula.address);

		// register the reserve token
		await converterNetwork.registerEtherToken(etherToken.address, true);

		await converterNetworkPathFinder.setAnchorToken(etherToken.address)
	
		console.log('network', network);
		if (network == 'development') {
			let smartToken = await deployer.deploy(SmartToken, 'SARAFU', 'SFU', 18);

			let converterAddress = await converterFactory.createConverter(smartToken.address, registry.address, 0, etherToken.address, reserve_ratio);
			let converter = await BancorConverter.at(converterAddress.logs[0].args._converter);
			await converter.acceptOwnership();

			let tx = await web3.eth.sendTransaction({from: accounts[0], to: etherToken.address, value: amount_initial_reserve});
			await etherToken.transfer(converter.address, amount_initial_reserve_token);

			await smartToken.issue(accounts[0], amount_initial_minted_token);

			await smartToken.transferOwnership(converter.address);

			let t = await converter.acceptTokenOwnership();

			let r = await converterRegistry.addConverter(converter.address);
		}

	});
}
