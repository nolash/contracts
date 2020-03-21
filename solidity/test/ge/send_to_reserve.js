let assert = require('assert');
let BancorNetwork = artifacts.require('BancorNetwork');
let EtherToken = artifacts.require('EtherToken');
let SmartToken = artifacts.require('SmartToken');
let SmartTokenB = artifacts.require('SmartToken');
let ContractRegistry = artifacts.require('ContractRegistry');
let BancorConverterRegistry = artifacts.require('BancorConverterRegistry');
let BancorConverterRegistryData = artifacts.require('BancorConverterRegistryData');
let contract_network = undefined;

contract('convert', accounts => {
	it('smart to reserve', async () => {

		// make sure all necessary contracts are deployed
		contract_network = await BancorNetwork.deployed();
		contract_registry = await ContractRegistry.deployed();
		bancor_network = await BancorNetwork.deployed();
		bancor_converter_registry = await BancorConverterRegistry.deployed();
		etherToken = await EtherToken.deployed();
		smartToken = await SmartToken.deployed();
		bancor_converter_registry_data = await BancorConverterRegistryData.deployed();
															
		let b = await smartToken.balanceOf(accounts[0]);
		let e = await web3.eth.getBalance(accounts[2]);
		console.log("smart balance", b, e.toString());
		let converter = await smartToken.owner();
		console.log(accounts);
		let r = await bancor_network.getReturnByPath([smartToken.address, smartToken.address, etherToken.address], 100000);
		console.log("returnbypath", r);
		await smartToken.approve(bancor_network.address, 100000, {from: accounts[0]});
		r = await bancor_network.claimAndConvertFor2([smartToken.address, smartToken.address, etherToken.address], 100000, 1, accounts[2], "0x0000000000000000000000000000000000000000", 0);
		console.log("convert2", r.logs);
		b = await smartToken.balanceOf(accounts[0]);
		e = await web3.eth.getBalance(accounts[2]);
		console.log("smart balance after", b, e.toString());
		r = await bancor_network.getReturnByPath([smartToken.address, smartToken.address, etherToken.address], 100000);
		console.log("returnbypath after", r);
	});
});
