
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
		var weiToSend = web3.toWei(5, 'ether');

		var accInitialBalance = web3.eth.getBalance(accounts[1]);

		console.log("account initial balance "+accInitialBalance);


		return ServiceContract
		.new(
			"name",
			accounts[1],
			web3.toWei(1, 'ether'),
			0 //one-time-purchase contract
			)
		.then(function(instance) {
			contractInstance = instance;
			return contractInstance.addEther(userID, {from: accounts[0], value: weiToSend});
		})
		.then(function(result) {
			var accFinalBalance = web3.eth.getBalance(accounts[1])

			console.log("account final balance "+accFinalBalance);

			assert.equal(web3.eth.getBalance(contractInstance.address).toNumber(), 0, "Transferred value should have been distributed");
			assert.equal(accFinalBalance.toNumber(), accInitialBalance.add(weiToSend).toNumber(), "Account 0 should receive owners cut");
		});
	});

	it("should correctly calculate if a user is enabled based on the billing period and date", function() {
		var contractInstance;

		var userID = "123456";
		var price = web3.toWei(1, 'ether');
		var paidAmount = price;

		return ServiceContract
		.new(
			"name",
			accounts[0],
			price,
			100000, // billing period. 1 *price* gets you a subscription for this many seconds
			)
		.then(function(instance) {
			contractInstance = instance;
			return contractInstance.isEnabled(userID);
		})
		.then(function(isEnabled) {
			assert.equal(isEnabled, false, "The user should not be enabled as they have not paid"); 
		})
		.then(function() {
			return contractInstance.addEther(userID, {from: accounts[2], value: paidAmount});
		})
		.then(function(result) {
			return contractInstance.isEnabled(userID);
		})
		.then(function(isEnabled) {
			assert.equal(isEnabled, true, "The user should be enabled after paying"); 
			return contractInstance.getTotalPaid(userID);
		})
		.then(function(totalPaid) {
			assert.equal(totalPaid.toNumber(), paidAmount, "The users payments have been recorded"); 
			return contractInstance.getPaidUntil(userID);
		})
		.then(function(paidUntil) {
			console.log(paidUntil.toNumber());
			assert.equal(paidUntil.toNumber() > 0, true, 'Paid until should be positive (this is a bad test...)')
		});
	});

	it("Should allow price to be changed by the owner", function () {
		let contractInstance;
		let owner = accounts[1];

		return ServiceContract
		.new(
			"name",
			owner,
			web3.toWei(1, 'ether'),
			0)
		.then(function(instance) {
			contractInstance = instance;
			return contractInstance.price();
		})
		.then(function (price){
			return contractInstance.changePrice(web3.toWei(1, 'finney'), {from: owner});
		})
		.then(function(result) {
			return contractInstance.price();
		})
		.then(function(price) {
			assert.equal(price.toNumber(), web3.toWei(1, 'finney'), "New price should have been updated in contract");
		});
	});

	it("Should NOT allow price to be changed by another address", function () {
		let contractInstance;
		let owner = accounts[1];

		return ServiceContract
		.new(
			"name",
			owner,
			web3.toWei(1, 'ether'),
			0)
		.then(function(instance) {
			contractInstance = instance;
			return contractInstance.price();
		})
		.then(function (price){
			return contractInstance.changePrice(web3.toWei(1, 'finney'), {from: accounts[2]});
		})
		.then(assert.fail)
        .catch(function(error) {
            assert.include(
                error.message,
                'VM Exception while processing transaction: invalid opcode',
                'Should throw invalid opcode if non-owner attempts to change price'
            )
         })
        .then(function() {
        	return contractInstance.price();
        })
        .then(function(price) {
        	assert.equal(price.toNumber(), web3.toWei(1, 'ether'), "Price should be unchanged");
        });
	});


	it("Should allow billing period to be changed by the owner", function () {
		let contractInstance;
		let owner = accounts[1];

		return ServiceContract
		.new(
			"name",
			owner,
			web3.toWei(1, 'ether'),
			0)
		.then(function(instance) {
			contractInstance = instance;
			return contractInstance.billingPeriod();
		})
		.then(function (billingPeriod){
			return contractInstance.changeBillingPeriod(10, {from: owner});
		})
		.then(function(result) {
			return contractInstance.billingPeriod();
		})
		.then(function(billingPeriod) {
			assert.equal(billingPeriod.toNumber(), 10, "New billingPeriod should have been updated in contract");
		});
	});


	it("Should NOT allow billing period to be changed by another address", function () {
		let contractInstance;
		let owner = accounts[1];

		return ServiceContract
		.new(
			"name",
			owner,
			web3.toWei(1, 'ether'),
			0)
		.then(function(instance) {
			contractInstance = instance;
			return contractInstance.billingPeriod();
		})
		.then(function (billingPeriod){
			return contractInstance.changeBillingPeriod(10, {from: accounts[2]});
		})
		.then(assert.fail)
        .catch(function(error) {
            assert.include(
                error.message,
                'VM Exception while processing transaction: invalid opcode',
                'Should throw invalid opcode if non-owner attempts to change billing period'
            )
         })
        .then(function() {
        	return contractInstance.billingPeriod();
        })
        .then(function(billingPeriod) {
        	assert.equal(billingPeriod.toNumber(), 0, "billingPeriod should be unchanged");
        });
	});

});

