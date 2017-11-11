
var ServiceContract = artifacts.require("ServiceContract");
var ServiceContractFactory = artifacts.require("ServiceContractFactory");



contract('ServiceContractFactory', function(accounts) {
	it("should have been deployed to the test chain", function() {
		return ServiceContractFactory.deployed().then(function(instance) {

		});
	});

	it("should create and store serviceContracts", function() {
		var contractInstance;
		return ServiceContractFactory.deployed().then(function(instance) {
			contractInstance = instance;
			return contractInstance.deployNewContract("test app contract", "testurl1", web3.toWei(0.3, 'ether'), 0, 
				{from: accounts[0]});
		}).then(function(result) {
			return contractInstance.numberOfDeployedContracts();
		}).then(function(result) {
			assert.equal(result, 1, "One contract should be deployed");
		});
	});

	it("should correctly assign owner address to generated contract", function() {
		var contractInstance;
		return ServiceContractFactory.deployed().then(function(instance) {
			contractInstance = instance;
			return contractInstance.deployNewContract("test app contract", "testurl2", web3.toWei(0.3, 'ether'), 0, 
				{from: accounts[0]});
		}).then(function(result) {
			return contractInstance.getDeployedContractAtIndex(0);
		}).then(function(deployedContractAddress) {
			return ServiceContract.at(deployedContractAddress);
		}).then(function(deployedContract) {
			return deployedContract.owner();
		}).then(function(ownerAddress) {
			assert.equal(ownerAddress, accounts[0]); 
		});
	});

	it("should be able to retrieve a contract by urlName", function() {
		var contractInstance;
		return ServiceContractFactory.deployed().then(function(instance) {
			contractInstance = instance;
			return contractInstance.deployNewContract("test123", "testurl3", web3.toWei(0.3, 'ether'), 0, 
				{from: accounts[0]});
		}).then(function(result) {
			return contractInstance.getDeployedContractByUrlName("testurl3");
		}).then(function(address) {
			return ServiceContract.at(address);
		}).then(function(serviceContract) {
			return serviceContract.serviceName();
		}).then(function(name) {
			assert.equal(web3.toAscii(name).replace(/\0/g, ''), "test123", "Should have the name the contract was created with");
		});
	});
});