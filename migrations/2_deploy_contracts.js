var ServiceContract = artifacts.require("./ServiceContract.sol");
var ServiceContractFactory = artifacts.require("./ServiceContractFactory.sol");


module.exports = function(deployer) {
	deployer.deploy(ServiceContract);
	deployer.deploy(ServiceContractFactory);

};
