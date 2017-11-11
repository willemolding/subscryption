pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "../contracts/ServiceContract.sol";
import "../contracts/ServiceContractFactory.sol";


contract TestServiceContractFactory {

	uint public initialBalance = 10 ether;

	// needed to test the creator can accept payments in the constructor
	function () payable {

	}

	function testConstructor() {
		ServiceContractFactory factory = new ServiceContractFactory(msg.sender, 0);
		Assert.equal(factory.beneficiary(), msg.sender, "beneficiary should be assigned by the constructor");
		Assert.equal(factory.numberOfDeployedContracts(), 0, "No deployed contract should exist in a new factory contract");
	}

	function testDeployNewContract() {
		uint256 price = 1 ether;
		uint256 billingPeriod = 10 weeks;
		uint256 beneficiaryShare = 100 wei;
		bytes32 serviceName = "name123";
		bytes32 serviceUrlName = "name123url";

		ServiceContractFactory factory = new ServiceContractFactory(msg.sender, beneficiaryShare);
		ServiceContract newContract = factory.deployNewContract(serviceName, serviceUrlName, price, billingPeriod);

		Assert.equal(newContract, factory.getDeployedContractAtIndex(0), "Deployed contract address should be returned and stored in the deployedContracts list");
		Assert.equal(newContract.price(), price, "Price must be set from deployContract call");
		Assert.equal(newContract.serviceName(), serviceName, "Name must be set from deployContract call");
		Assert.equal(newContract.beneficiaryShare(), beneficiaryShare, "beneficiaryShare must be set from deployContract call");
		
		Assert.equal(newContract.creator(), factory, "Creator should be the factory contract");
		Assert.equal(newContract.owner(), this, "Owner should be whoever called this function");
		Assert.equal(newContract.beneficiary(), factory.beneficiary(), "beneficiary should be the one stored in the factory");

	}

	function testDeployingMultipleContracts() {
		uint256 price = 1 ether;
		uint256 billingPeriod = 10 weeks;
		uint beneficiaryShare = 100 wei;
		bytes32 serviceName = "name123";
		bytes32 serviceUrlName1 = "name123url1";
		bytes32 serviceUrlName2 = "name123url2";
		bytes32 serviceUrlName3 = "name123url3"; // urlnames must be unique

		ServiceContractFactory factory = new ServiceContractFactory(msg.sender, beneficiaryShare);

		ServiceContract newContract1 = factory.deployNewContract(serviceName, serviceUrlName1, price, billingPeriod);
		ServiceContract newContract2 = factory.deployNewContract(serviceName, serviceUrlName2, price, billingPeriod);
		ServiceContract newContract3 = factory.deployNewContract(serviceName, serviceUrlName3, price, billingPeriod);

		Assert.equal(factory.numberOfDeployedContracts(), 3, "The contract should record that 3 contracts have been deployed");
		Assert.equal(newContract1, factory.getDeployedContractAtIndex(0), "First deployed contract must be at start of list");
		Assert.equal(newContract2, factory.getDeployedContractAtIndex(1), "Deployed contract must be in list");
		Assert.equal(newContract3, factory.getDeployedContractAtIndex(2), "Last deployed contract must be at end of list");
	}
}