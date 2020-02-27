/* global artifacts */
/* eslint-disable prefer-reflect */

const SmartTokenTwo = artifacts.require('SmartToken');

module.exports = function(deployer, network, accounts) {
	if (network == "production") {
		deployer.then(async() => {
			let r = await deployer.new(SmartTokenTwo, 'Token2', 'TKN2', 2);
			console.log(r.address);	
		});
	}
};

