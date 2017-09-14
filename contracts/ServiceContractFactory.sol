pragma solidity ^0.4.2;

import "./ServiceContract.sol";


contract ServiceContractFactory {

	ServiceContract[] deployedContracts;
	address public beneficiary;

	event NewContractDeployed(address indexed addr);


	function ServiceContractFactory(address beneficiary_) {
		beneficiary = beneficiary_;
	}

	function () payable {
		revert();
	}

	function deployNewContract(bytes32 serviceName, uint price, uint beneficiaryShare) returns (ServiceContract) {
		ServiceContract newContract = new ServiceContract(
			serviceName, 
			msg.sender, 
			beneficiary, 
			price, 
			beneficiaryShare);
		deployedContracts.push(newContract); 

		NewContractDeployed(newContract);
		return newContract;
	}

	function numberOfDeployedContracts() constant returns (uint) {
		return deployedContracts.length;
	}

	function getDeployedContractAtIndex(uint index) constant returns (ServiceContract) {
		return deployedContracts[index];
	}

}