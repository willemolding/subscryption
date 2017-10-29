pragma solidity ^0.4.11;

import "./ServiceContract.sol";
import "zeppelin-solidity/contracts/ownership/HasNoEther.sol";
// HasNoEther also makes the contract ownable by the creator (not sure if we want this...)


contract ServiceContractFactory is HasNoEther {

	ServiceContract[] private deployedContracts;
	mapping(bytes32 => ServiceContract) private contractIndex; // maps service url-name to a deployed contract address
	address public beneficiary;

	event NewContractDeployed(address indexed newContractAddress, bytes32 indexed newContractServiceName);


	function ServiceContractFactory(address beneficiary_) {
		beneficiary = beneficiary_;
	}


	function deployNewContract(bytes32 serviceName, bytes32 serviceUrlName, uint price, uint beneficiaryShare) external returns (ServiceContract) {
		
		require(contractIndex[serviceUrlName] == 0); //require this url-name is not alread in use

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

	function getDeployedContractByUrlName(bytes32 serviceUrlName) public constant returns (ServiceContract) {
		return contractIndex[serviceUrlName];
	}

}