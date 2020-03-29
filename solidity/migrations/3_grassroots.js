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

		//let converterAddress = await converterFactory.createConverter(smartToken.address, registry.address, 0, etherToken.address, 25000);
		//let converter = await BancorConverter.at(converterAddress.logs[0].args._converter);
		//await converter.acceptOwnership();

		await networkPathFinder.setAnchorToken(etherToken.address)
	});
}
