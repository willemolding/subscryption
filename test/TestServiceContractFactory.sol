pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "../contracts/ServiceContract.sol";
import "../contracts/ServiceContractFactory.sol";


contract TestServiceContractFactory {
	function testConstructor() {
		ServiceContractFactory factory = new ServiceContractFactory(address msg.sender);
		Assert.equal(factory.beneficiary(), msg.sender, "beneficiary should be assigned by the constructor");
		Assert.equal(factory.deployedContracts.length(), 0, "No deployed contract should exist in a new factory contract");
	}

	function testDeployNewContract() {
		ServiceContractFactory factory = new ServiceContractFactory(address msg.sender);
		uint price = 1 ether;
		uint beneficiaryShare = 100 wei;
		bytes32 name = "name123";
		ServiceContract newContract = factory.deployNewContract(name, price, beneficiaryShare);

		Assert.equal(newContract, factors.deployedContracts()[0], "Deployed contract address should be returned and stored in the deployedContracts list");
		Assert.equal(newContract.price(), price, "Price must be set from deployContract call");
		Assert.equal(newContract.name(), name, "Name must be set from deployContract call");
		Assert.equal(newContract.beneficiaryShare(), beneficiaryShare, "beneficiaryShare must be set from deployContract call");
		
		Assert.equal(newContract.creator(), factory, "Creator should be the factory contract");
		Assert.equal(newContract.owner(), msg.sender, "Owner should be whoever called this function");
		Assert.equal(newContract.beneficiary(), factory.beneficiary(), "beneficiary should be the one stored in the factory");

	}

	function testDeployingMultipleContracts() {
		ServiceContractFactory factory = new ServiceContractFactory(address msg.sender);
		uint price = 1 ether;
		uint beneficiaryShare = 100 wei;
		bytes32 name = "name123";
		ServiceContract newContract1 = factory.deployNewContract(name, price, beneficiaryShare);
		ServiceContract newContract2 = factory.deployNewContract(name, price, beneficiaryShare);
		ServiceContract newContract3 = factory.deployNewContract(name, price, beneficiaryShare);

		Assert.equal(newContract1, factors.deployedContracts()[0], "First deployed contract must be at start of list");
		Assert.equal(newContract2, factors.deployedContracts()[1], "Deployed contract must be in list");
		Assert.equal(newContract3, factors.deployedContracts()[2], "Last deployed contract must be at end of list");
	}
}