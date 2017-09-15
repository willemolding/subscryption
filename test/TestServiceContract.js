
var ServiceContract = artifacts.require("ServiceContract");
var ServiceContractFactory = artifacts.require("ServiceContractFactory");


contract('ServiceContract', function(accounts) {

	it("should have zero balance initially", function() {
		return ServiceContract.deployed().then(function(instance) {
			assert.equal(web3.eth.getBalance(instance.address).toNumber(), 0, "Balance should intitially be zero");
		});
	});

	it("should accept payments using the addEther function and distribute", function() {
		var contractInstance;

		var userID = "123456";
		var weiToSend = web3.toWei(2.123, 'ether');

		var acc0InitialBalance = web3.eth.getBalance(accounts[1]).toNumber();
		var acc1InitialBalance = web3.eth.getBalance(accounts[2]).toNumber();

		// console.log("account 0 initial balance "+acc0InitialBalance);
		// console.log("account 1 initial balance "+acc1InitialBalance);

		var benefShareFraction = web3.toWei(10, 'finney') / web3.toWei(1, 'ether');
		console.log("beneficiary share is "+benefShareFraction);

		return ServiceContract
		.new(
			"name",
			accounts[1],
			accounts[2],
			web3.toWei(1, 'ether'),
			web3.toWei(10, 'finney')
			)
		.then(function(instance) {
			contractInstance = instance;
			return contractInstance.addEther(userID, {from: accounts[0], value: weiToSend});
		})
		.then(function(result) {
			var acc0FinalBalance = web3.eth.getBalance(accounts[1]).toNumber()
			var acc1FinalBalance = web3.eth.getBalance(accounts[2]).toNumber()

			// console.log("account 0 final balance "+acc0FinalBalance);
			// console.log("account 1 final balance "+acc1FinalBalance);

			assert.equal(web3.eth.getBalance(contractInstance.address).toNumber(), 0, "Transferred value should have been distributed");
			assert.equal(acc0FinalBalance, acc0InitialBalance + weiToSend*(1.0-benefShareFraction), "Account 0 should receive owners cut");
			assert.equal(acc1FinalBalance, acc1InitialBalance + weiToSend*benefShareFraction, "Account 1 should beneficiarys cut");
		});
	});
});


contract('ServiceContractFactory', function(accounts) {
	it("should have been deployed to the test chain", function() {
		return ServiceContractFactory.deployed().then(function(instance) {

		});
	});

	it("should create and store serviceContracts", function() {
		var contractInstance;
		return ServiceContractFactory.deployed().then(function(instance) {
			contractInstance = instance;
			return contractInstance.deployNewContract("test app contract", web3.toWei(0.3, 'ether'), web3.toWei(0.01, 'ether'), 
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
			return contractInstance.deployNewContract("test app contract", web3.toWei(0.3, 'ether'), web3.toWei(0.01, 'ether'), 
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
});