pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "../contracts/ServiceContract.sol";

contract TestServiceContract {

	uint public initialBalance = 10 ether;


	function testContructor() {
		bytes32 name = "testService";
		address owner = msg.sender;
		address beneficiary = msg.sender;
		uint256 price = 1 ether;
		uint256 billingPeriod = 1 days;
		uint256 share = 100 finney;
		ServiceContract sc = new ServiceContract(name, owner, beneficiary, price, billingPeriod, share);

		Assert.equal(price, sc.price(), "price should have been set by constructor");
		Assert.equal(name, sc.serviceName(), "service name should have been set by constructor");

	}

	function testEnablingUserWithExactPayment() {
		bytes32 name = "testService";
		address owner = msg.sender;
		address beneficiary = msg.sender;
		uint256 price = 1 ether;
		uint256 billingPeriod = 1 days;
		uint256 share = 100 finney;
		ServiceContract sc = new ServiceContract(name, owner, beneficiary, price, billingPeriod, share);

		bytes6 userID = "123456";
		Assert.equal(sc.isEnabled(userID), false, "User has not paid so function should return false");
		Assert.equal(sc.balance, 0, "No ether has been send so balance should be zero");
		sc.addEther.value(price)(userID);
		Assert.equal(sc.balance, 0, "Sent ether should have been distributed so balance should be zero");
		Assert.equal(sc.isEnabled(userID), true, "User has paid so function should return true");

	}

	function testEnablingUserWithExcessPayment() {
		bytes32 name = "testService";
		address owner = msg.sender;
		address beneficiary = msg.sender;
		uint256 price = 1 ether;
		uint256 billingPeriod = 1 days;
		uint256 share = 100 finney;
		ServiceContract sc = new ServiceContract(name, owner, beneficiary, price, billingPeriod, share);

		bytes6 userID = "123456";
		Assert.equal(sc.isEnabled(userID), false, "User has not paid so function should return false");
		Assert.equal(sc.balance, 0, "No ether has been send so balance should be zero");
		sc.addEther.value(price + 1 wei)(userID);
		Assert.equal(sc.isEnabled(userID), true, "User has paid so function should return true");
		Assert.equal(sc.balance, 0, "Sent ether should have been distributed so balance should be zero");


	}

	function testEnablingUserWithLessPayment() {
		bytes32 name = "testService";
		address owner = msg.sender;
		address beneficiary = msg.sender;
		uint256 price = 1 ether;
		uint256 billingPeriod = 1 days;
		uint256 share = 100 finney;
		ServiceContract sc = new ServiceContract(name, owner, beneficiary, price, billingPeriod, share);

		bytes6 userID = "123456";
		Assert.equal(sc.isEnabled(userID), false, "User has not paid so function should return false");
		Assert.equal(sc.balance, 0, "No ether has been send so balance should be zero");
		sc.addEther.value(price - 1 wei)(userID);
		Assert.equal(sc.isEnabled(userID), false, "User has paid insufficient funds so should return false");
		Assert.equal(sc.balance, 0, "Sent ether should have been distributed so balance should be zero");

	}

}
