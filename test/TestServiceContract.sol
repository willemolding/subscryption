pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "../contracts/ServiceContract.sol";

contract TestServiceContract {

	uint public initialBalance = 10 ether;


	function testContructor() {
		bytes32 name = "testService";
		address owner = msg.sender;
		address beneficiary = msg.sender;
		uint price = 1 ether;
		uint share = 100 finney;
		ServiceContract sc = new ServiceContract(name, owner, beneficiary, price, share);

		Assert.equal(price, sc.price(), "price should have been set by constructor");
		Assert.equal(name, sc.serviceName(), "service name should have been set by constructor");

	}

	function testEnablingUserWithExactPayment() {
		bytes32 name = "testService";
		address owner = msg.sender;
		address beneficiary = msg.sender;
		uint price = 1 ether;
		uint share = 100 finney;
		ServiceContract sc = new ServiceContract(name, owner, beneficiary, price, share);

		bytes6 userID = "123456";
		Assert.equal(sc.isPaid(userID), false, "User has not paid so function should return false");
		Assert.equal(sc.balance, 0, "No ether has been send so balance should be zero");
		sc.addEther.value(price).gas(30000)(userID);
		Assert.equal(sc.balance, 0, "Sent ether should have been distributed so balance should be zero");
		Assert.equal(sc.isPaid(userID), true, "User has paid so function should return true");

	}

	function testEnablingUserWithExcessPayment() {
		bytes32 name = "testService";
		address owner = msg.sender;
		address beneficiary = msg.sender;
		uint price = 1 ether;
		uint share = 100 finney;
		ServiceContract sc = new ServiceContract(name, owner, beneficiary, price, share);

		bytes6 userID = "123456";
		Assert.equal(sc.isPaid(userID), false, "User has not paid so function should return false");
		sc.addEther.value(price + 1 wei).gas(30000)(userID);
		Assert.equal(sc.isPaid(userID), true, "User has paid so function should return true");

	}

	function testEnablingUserWithLessPayment() {
		bytes32 name = "testService";
		address owner = msg.sender;
		address beneficiary = msg.sender;
		uint price = 1 ether;
		uint share = 100 finney;
		ServiceContract sc = new ServiceContract(name, owner, beneficiary, price, share);

		bytes6 userID = "123456";
		Assert.equal(sc.isPaid(userID), false, "User has not paid so function should return false");
		sc.addEther.value(price - 1 wei).gas(30000)(userID);
		Assert.equal(sc.isPaid(userID), false, "User has paid insufficient funds so should return false");

	}




}
