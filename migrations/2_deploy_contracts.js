var ServiceContract = artifacts.require("./ServiceContract.sol");

module.exports = function(deployer) {
  deployer.deploy(ServiceContract);
};
