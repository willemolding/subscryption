pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "../contracts/ServiceContract.sol";
import "../contracts/ServiceContractFactory.sol";


contract TestServiceContractFactory {
	function testConstructor() {
		ServiceContractFactory factory = new ServiceContractFactory(msg.sender);
		Assert.equal(factory.beneficiary(), msg.sender, "beneficiary should be assigned by the constructor");
		Assert.equal(factory.numberOfDeployedContracts(), 0, "No deployed contract should exist in a new factory contract");
	}

	function testDeployNewContract() {
		ServiceContractFactory factory = new ServiceContractFactory(msg.sender);
		uint price = 1 ether;
		uint beneficiaryShare = 100 wei;
		bytes32 serviceName = "name123";
		ServiceContract newContract = factory.deployNewContract(serviceName, price, beneficiaryShare);

		Assert.equal(newContract, factory.getDeployedContractAtIndex(0), "Deployed contract address should be returned and stored in the deployedContracts list");
		Assert.equal(newContract.price(), price, "Price must be set from deployContract call");
		Assert.equal(newContract.serviceName(), serviceName, "Name must be set from deployContract call");
		Assert.equal(newContract.beneficiaryShare(), beneficiaryShare, "beneficiaryShare must be set from deployContract call");
		
		Assert.equal(newContract.creator(), factory, "Creator should be the factory contract");
		Assert.equal(newContract.owner(), this, "Owner should be whoever called this function");
		Assert.equal(newContract.beneficiary(), factory.beneficiary(), "beneficiary should be the one stored in the factory");

	}

	function testDeployingMultipleContracts() {
		ServiceContractFactory factory = new ServiceContractFactory(msg.sender);
		uint price = 1 ether;
		uint beneficiaryShare = 100 wei;
		bytes32 serviceName = "name123";
		ServiceContract newContract1 = factory.deployNewContract(serviceName, price, beneficiaryShare);
		ServiceContract newContract2 = factory.deployNewContract(serviceName, price, beneficiaryShare);
		ServiceContract newContract3 = factory.deployNewContract(serviceName, price, beneficiaryShare);

		Assert.equal(factory.numberOfDeployedContracts(), 3, "The contract should record that 3 contracts have been deployed");
		Assert.equal(newContract1, factory.getDeployedContractAtIndex(0), "First deployed contract must be at start of list");
		Assert.equal(newContract2, factory.getDeployedContractAtIndex(1), "Deployed contract must be in list");
		Assert.equal(newContract3, factory.getDeployedContractAtIndex(2), "Last deployed contract must be at end of list");
	}
}