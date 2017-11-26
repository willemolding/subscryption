pragma solidity ^0.4.11;

import "./ServiceContract.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract ServiceContractFactory is Ownable {

	ServiceContract[] private deployedContracts;
	mapping(bytes32 => ServiceContract) private contractIndex; // maps service url-name to a deployed contract address
	address public beneficiary;
	uint256 beneficiaryShare;

	event NewContractDeployed(address indexed newContractAddress, bytes32 indexed newContractServiceName);
	event BeneficiaryChanged(address oldBeneficiary, address newBeneficiary);
	event BeneficiaryShareChanged(uint256 oldShare, uint256 newShare);

	function ServiceContractFactory(address beneficiary_, uint256 beneficiaryShare_) {
		beneficiary = beneficiary_;
		beneficiaryShare = 0;
		owner = msg.sender;
	}


	function deployNewContract(bytes32 serviceName, bytes32 serviceUrlName, uint256 price, uint256 billingPeriod) external returns (ServiceContract) {
		require(contractIndex[serviceUrlName] == address(0)); //require this url-name is not alread in use

		ServiceContract newContract = new ServiceContract(
			serviceName, 
			msg.sender, 
			beneficiary, 
			price, 
			billingPeriod,
			beneficiaryShare);

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

	function changeBeneficiary(address newBeneficiary) onlyOwner public {
		require(newBeneficiary != address(0));
		BeneficiaryChanged(beneficiary, newBeneficiary);
		beneficiary = newBeneficiary;
	}

	function changeBeneficiaryShare(uint256 newShare) onlyOwner public {
		BeneficiaryShareChanged(beneficiaryShare, newShare);
		beneficiaryShare = newShare;
	}

}