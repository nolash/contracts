let ContractRegistry = artifacts.require('ContractRegistry');
let BancorNetwork = artifacts.require('BancorNetwork');
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
		//let smartTokenB = await deployer.deploy(SmartTokenB, 'Sarafoo', 'SFO', 18);
		let converterFactory = await deployer.deploy(BancorConverterFactory);
		let features = await deployer.deploy(ContractFeatures);
		let formula = await deployer.deploy(BancorFormula);


		// set up the registry
		registry.registerAddress("ContractRegistry", registry.address);
		registry.registerAddress("BancorNetwork", network.address);
		registry.registerAddress("ContractFeatures", features.address);
		registry.registerAddress("BancorConverterRegistry", converterRegistry.address);
		registry.registerAddress("BancorConverterRegistryData", converterRegistryData.address);
		registry.registerAddress("BancorFormula", formula.address);

		// register the reserve token
		await network.registerEtherToken(etherToken.address, true);

		// fund the reserve ethertoken
		let converterAddress = await converterFactory.createConverter(smartToken.address, registry.address, 0, etherToken.address, 25000);
		//let converterAddressB = await converterFactory.createConverter(smartTokenB.address, registry.address, 0, etherToken.address, 25000);

		let converter = await BancorConverter.at(converterAddress.logs[0].args._converter);
		await converter.acceptOwnership();
		//let converterB = await BancorConverter.at(converterAddressB.logs[0].args._converter);
		//await converterB.acceptOwnership();

		// give eth to converter and approve its use of the eth (? - why is the approve necessary?)
		//let b = await converter.getConnectorBalance(etherToken.address);
		//console.log("conn balance ether", b);
		let s = await smartToken.totalSupply();
		let e = await etherToken.totalSupply();
		console.log("token supply", s, e);

		//s = await smartTokenB.totalSupply();
		//console.log("tokenB supply", s, e);
		
		await web3.eth.sendTransaction({from: accounts[0], to: etherToken.address, value: amount_initial_reserve_token});
		await web3.eth.sendTransaction({from: accounts[1], to: etherToken.address, value: amount_initial_reserve_token});
		await etherToken.approve(converter.address, amount_initial_reserve_token);
		//await etherToken.approve(converterB.address, amount_initial_reserve_token);
		await etherToken.transfer(converter.address, amount_initial_reserve_token);
		//await etherToken.transfer(converterB.address, amount_initial_reserve, {from: accounts[1]});

		await smartToken.issue(accounts[0], amount_initial_minted_token);	
		await smartToken.transferOwnership(converter.address);
		let t = await converter.acceptTokenOwnership();

		//await smartTokenB.issue(accounts[1], amount_initial_minted_token);	
		//await smartTokenB.transferOwnership(converterB.address);
		//t = await converterB.acceptTokenOwnership();

		e = await etherToken.totalSupply();
		console.log("ether supply", e);
		s = await smartToken.totalSupply();
		o = await smartToken.owner();
		console.log("token supply", s, e, o, converter.address);
		let c = await converter.connectorTokenCount();
		console.log("reserve", c);

		//s = await smartTokenB.totalSupply();
		//o = await smartTokenB.owner();
		//console.log("tokenB supply", s, e, o, converterB.address);
		//c = await converterB.connectorTokenCount();
		//console.log("reserve", c);

		//console.log("isvalid", await converterRegistry.isConverterValid(converter.address), await converterRegistry.isConverterValid(converterB.address));
		console.log("isvalid", await converterRegistry.isConverterValid(converter.address));

		let r = await converterRegistry.addConverter(converter.address);
		console.log("converter added to registry", r);
		//r = await converterRegistry.addConverter(converterB.address);
		//console.log("converterB added to registry", r);
	});
}
