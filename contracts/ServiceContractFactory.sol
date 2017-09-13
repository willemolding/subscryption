import "./ServiceContract";


contract ServiceContractFactory {

	address[] deployedContracts;
	address beneficiary;


	function ServiceContractFactory() {

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
	}

}