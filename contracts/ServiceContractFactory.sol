pragma solidity ^0.4.2;

import "./ServiceContract.sol";


contract ServiceContractFactory {

	ServiceContract[] private deployedContracts;
	address public beneficiary;

	event NewContractDeployed(address indexed addr);


	function ServiceContractFactory(address beneficiary_) {
		beneficiary = beneficiary_;
	}

	function () payable {
		revert();
	}

	function deployNewContract(bytes32 serviceName, uint price, uint beneficiaryShare) external returns (ServiceContract) {
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

	function numberOfDeployedContracts() public constant returns (uint) {
		return deployedContracts.length;
	}

	function getDeployedContractAtIndex(uint index) public constant returns (ServiceContract) {
		return deployedContracts[index];
	}

}