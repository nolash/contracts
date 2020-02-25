/* global artifacts */
/* eslint-disable prefer-reflect */

const noowner = "0x0000000000000000000000000000000000000001";
const noaddr = "0x0000000000000000000000000000000000000000000000000000000000000002";

const Utils = artifacts.require('Utils');
const Owned = artifacts.require('Owned');
const Managed = artifacts.require('Managed');
const TokenHolder = artifacts.require('TokenHolder');
const ERC20Token = artifacts.require('ERC20Token');
const EtherToken = artifacts.require('EtherToken');
const ContractRegistry = artifacts.require('ContractRegistry');
const ContractFeatures = artifacts.require('ContractFeatures');
const Whitelist = artifacts.require('Whitelist');
const SmartToken = artifacts.require('SmartToken');
const SmartTokenTwo = artifacts.require('SmartToken');
const SmartTokenController = artifacts.require('SmartTokenController');
const BancorNetwork = artifacts.require('BancorNetwork');
const BancorX = artifacts.require('BancorX');
const XTransferRerouter = artifacts.require('XTransferRerouter');
const BancorFormula = artifacts.require('BancorFormula');
const BancorGasPriceLimit = artifacts.require('BancorGasPriceLimit');
const BancorConverter = artifacts.require('BancorConverter');
const BancorConverterFactory = artifacts.require('BancorConverterFactory');
const BancorConverterUpgrader = artifacts.require('BancorConverterUpgrader');
const BancorConverterRegistry = artifacts.require('BancorConverterRegistry');
const CrowdsaleController = artifacts.require('CrowdsaleController');

// sequence https://github.com/trufflesuite/truffle/issues/501
//
module.exports = function(deployer, network, accounts) {
	console.log(accounts);
	if (network == "production") {
		deployer.then(async() => {
			await deployer.deploy(ContractRegistry);
			await deployer.link(ContractRegistry, [SmartToken, BancorNetwork, BancorConverter, BancorConverterUpgrader]);
			let r = await deployer.deploy(SmartToken, 'Token1', 'TKN1', 2)
			console.log("one", r.address);	
			await deployer.link(SmartToken, [SmartTokenController, BancorConverter, CrowdsaleController]);
			await deployer.deploy(Utils);
			await deployer.deploy(Owned);
			await deployer.deploy(Managed);
			await deployer.deploy(TokenHolder);
			await deployer.deploy(ERC20Token, 'DummyToken', 'DUM', 0);
			await deployer.deploy(EtherToken);
			await deployer.link(EtherToken, [BancorConverter]);
			await deployer.deploy(ContractFeatures);
			await deployer.deploy(Whitelist);
			await deployer.deploy(SmartTokenController, SmartToken.address)
			await deployer.deploy(BancorFormula);
			await deployer.deploy(BancorGasPriceLimit, '22000000000');
			await deployer.deploy(BancorNetwork, ContractRegistry.address);
			await deployer.deploy(BancorConverter, SmartToken.address, ContractRegistry.address, 0, EtherToken.address, 250000);

			await deployer.deploy(BancorConverterFactory);
			await deployer.deploy(BancorConverterUpgrader, ContractRegistry.address);

			await deployer.deploy(BancorConverterRegistry);

			//await deployer.deploy(CrowdsaleController, SmartToken.address, 4102444800, '0x125', '0x126', 1);
			await deployer.deploy(CrowdsaleController, SmartToken.address, 114102444800, noowner, noowner, noaddr);
			await deployer.deploy(XTransferRerouter, true);
    		});
	}
};

