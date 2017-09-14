pragma solidity ^0.4.2;

import "./ServiceContract.sol";


contract ServiceContractFactory {

	address[] public deployedContracts;
	address public beneficiary;

	event NewContractDeployed(address indexed addr);


	function ServiceContractFactory(address beneficiary_) {
		beneficiary = beneficiary;
	}

	function () payable {
		revert();
	}

	function deployNewContract(bytes32 serviceName, uint price, uint beneficiaryShare) returns (address) {
		address newContract = new ServiceContract(
			serviceName, 
			msg.sender, 
			beneficiary, 
			price, 
			beneficiaryShare);
		deployedContracts.push(newContract); 

		NewContractDeployed(newContract);
		return newContract;
	}

}