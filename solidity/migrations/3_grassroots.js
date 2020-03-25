let ContractRegistry = artifacts.require('ContractRegistry');
let BancorNetwork = artifacts.require('BancorNetwork');
let BancorNetworkPathFinder = artifacts.require('BancorNetworkPathFinder');
let BancorConverter = artifacts.require('BancorConverter');
let BancorConverterFactory = artifacts.require('BancorConverterFactory');
let BancorConverterRegistry = artifacts.require('BancorConverterRegistry');
let BancorConverterRegistryData = artifacts.require('BancorConverterRegistryData');
let EtherToken = artifacts.require('EtherToken');
let SmartToken = artifacts.require('SmartToken');
let SmartTokenB = artifacts.require('SmartToken');
let SmartTokenController = artifacts.require('SmartTokenController');
let BancorFormula = artifacts.require('BancorFormula');
let ContractFeatures = artifacts.require('ContractFeatures');
let Whitelist = artifacts.require('Whitelist');

let amount_initial_reserve = 100000000;
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
		let etherToken = await deployer.deploy(EtherToken, "Sarafu Ether token", "SFUETH");
		let smartToken = await deployer.deploy(SmartToken, 'Sarafu', 'SFU', 18);
		let converterFactory = await deployer.deploy(BancorConverterFactory);
		let features = await deployer.deploy(ContractFeatures);
		let formula = await deployer.deploy(BancorFormula);
		let networkPathFinder = await deployer.deploy(BancorNetworkPathFinder, registry.address);


		// set up the registry
		registry.registerAddress("ContractRegistry", registry.address);
		registry.registerAddress("BancorNetwork", network.address);
		registry.registerAddress("ContractFeatures", features.address);
		registry.registerAddress("BancorConverterRegistry", converterRegistry.address);
		registry.registerAddress("BancorConverterFactory", converterFactory.address);
		registry.registerAddress("BancorConverterRegistryData", converterRegistryData.address);
		registry.registerAddress("BancorNetworkPathFinder", networkPathFinder.address);
		registry.registerAddress("BancorFormula", formula.address);

		// register the reserve token
		await network.registerEtherToken(etherToken.address, true);

		// fund the reserve ethertoken
		let converterAddress = await converterFactory.createConverter(smartToken.address, registry.address, 0, etherToken.address, 25000);

		let converter = await BancorConverter.at(converterAddress.logs[0].args._converter);
		await converter.acceptOwnership();

		await web3.eth.sendTransaction({from: accounts[0], to: etherToken.address, value: amount_initial_reserve});
		await etherToken.transfer(converter.address, amount_initial_reserve_token);

		await smartToken.issue(accounts[0], amount_initial_minted_token);	
		await smartToken.transferOwnership(converter.address);
		let t = await converter.acceptTokenOwnership();

		let r = await converterRegistry.addConverter(converter.address);
		await networkPathFinder.setAnchorToken(etherToken.address)
	});
}
