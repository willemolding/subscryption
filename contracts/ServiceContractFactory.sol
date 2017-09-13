pragma solidity ^0.4.2;

import "./ServiceContract.sol";


contract ServiceContractFactory {

	address[] deployedContracts;
	address beneficiary;

	event NewContractDeployed(address indexed addr);


	function ServiceContractFactory(address beneficiary_) {
		beneficiary = beneficiary;
	}

	function () payable {
		revert();
	}

	function DeployNewContract(bytes32 serviceName, uint price, uint beneficiaryShare) {
		address newContract = new ServiceContract(
			serviceName, 
			msg.sender, 
			beneficiary, 
			price, 
			beneficiaryShare);
		deployedContracts.push(newContract); 

		NewContractDeployed(newContract);
	}

}