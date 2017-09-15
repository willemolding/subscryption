pragma solidity ^0.4.11;

import "./ServiceContract.sol";


contract ServiceContractFactory {

	ServiceContract[] private deployedContracts;
	address public beneficiary;
	mapping(bytes32 => ServiceContract) private deployedContractsByName;

	event NewContractDeployed(address indexed newContractAddress, bytes32 indexed newContractServiceName);


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
		deployedContractsByName[serviceName] = newContract;

		NewContractDeployed(newContract, serviceName);
		return newContract;
	}

	function numberOfDeployedContracts() public constant returns (uint) {
		return deployedContracts.length;
	}

	function getDeployedContractAtIndex(uint index) public constant returns (ServiceContract) {
		return deployedContracts[index];
	}

	function getContractAddressFromName(bytes32 name) public constant returns (ServiceContract) {
		return deployedContractsByName[name];
	}

}