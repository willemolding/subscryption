pragma solidity ^0.4.11;

import "./ServiceContract.sol";


contract ServiceContractFactory {

	ServiceContract[] private deployedContracts;
	mapping(bytes32 => ServiceContract) private contractIndex; // maps service url-name to a deployed contract address


	event NewContractDeployed(address indexed newContractAddress, bytes32 indexed newContractServiceName);

	function ServiceContractFactory() {
	}

	function deployNewContract(bytes32 serviceName, bytes32 serviceUrlName, uint256 price, uint256 billingPeriod) external returns (ServiceContract) {
		require(contractIndex[serviceUrlName] == address(0)); //require this url-name is not alread in use

		ServiceContract newContract = new ServiceContract(
			serviceName, 
			msg.sender, 
			price, 
			billingPeriod);

		deployedContracts.push(newContract); 
		contractIndex[serviceUrlName] = newContract;

		NewContractDeployed(newContract, serviceName);
		return newContract;
	}

	function numberOfDeployedContracts() public constant returns (uint) {
		return deployedContracts.length;
	}

	function getDeployedContractAtIndex(uint256 index) public constant returns (ServiceContract) {
		return deployedContracts[index];
	}

	function getDeployedContractByUrlName(bytes32 serviceUrlName) public constant returns (ServiceContract) {
		return contractIndex[serviceUrlName];
	}

}