pragma solidity ^0.4.11;


library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}


contract ServiceContract{

    struct AccountData {
        uint256 totalPaid; // The total value in wei the user has ever paid to the contract
        uint256 paidUntil; // timestamp to which the user will be valid based on their payments
    }

	bytes32 public serviceName; // name of the service that is being subscribed to

	address public owner; // address of the owner of the service that is being paid for. Also the owner of the contract
	address public creator; // who created the contract. They do not have any special privilages

	uint256 public price; // how much the service costs in wei per billing period
	uint256 public billingPeriod; // Duration in seconds that is paid for by price. If 0 then only one-off payments are required. This is also the minimum allowable payment

	// a mapping of userIDs to their account data
	mapping(bytes32 => AccountData) private accounts;

	event PaymentReceived(address indexed sender, uint256 value);
	event PriceChanged(uint256 oldPrice, uint256 newPrice);
	event BillingPeriodChanged(uint256 oldBillingPeriod, uint256 newBillingPeriod);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


	modifier onlyOwner() {
    	require(msg.sender == owner);
    	_;
  	}

	function transferOwnership(address newOwner) onlyOwner public {
		require(newOwner != address(0));
		OwnershipTransferred(owner, newOwner);
		owner = newOwner;
	}


    function ServiceContract(bytes32 serviceName_, address owner_, uint256 price_, uint256 billingPeriod_) payable public {
		require(msg.value == 0); // do not allow payments to this contract ever

		// sets the owner to the creator of the contract. It is not necessarily the creator
		serviceName = serviceName_;
		owner = owner_;
		price = price_;
        billingPeriod = billingPeriod_;
		creator = msg.sender;

		// check that the owner and beneficiary are both able to receive funds
		// this costs gas but t he contract is useless otherwise
		// these will revert if unsuccessful erasing the created contract
		owner.transfer(0);
	}

	// fallback does not have payable modifier so direct payments are disallowed
	function() external {
	}

	// view function to find is a user has paid the required amount at the current time
	function isEnabled(bytes32 userID) public constant returns (bool) {
		return accounts[userID].paidUntil >= block.timestamp;
	}

	// gets the value the user has paid to their account
	function getTotalPaid(bytes32 userID) public constant returns (uint256) {
		return accounts[userID].totalPaid;
	}

    // gets the timestamp to which the user has paid
    function getPaidUntil(bytes32 userID) public constant returns (uint256) {
        return accounts[userID].paidUntil;
    }

	// method to add ether to a userID. 
	// The actual ether is passed on to the owner and beneficiary but a record is stored in the contract
	// no ether should ever be stored in the contract 
	function addEther(bytes32 userID) external payable {
        require(msg.value >= price); // don't allow paying less than the minimum billing period

        accounts[userID].totalPaid = SafeMath.add(accounts[userID].totalPaid, msg.value);
        uint256 paidDuration =  SafeMath.div(SafeMath.mul(msg.value, billingPeriod), price);

        if (billingPeriod == 0) { // implies a one-off-payment service
        	accounts[userID].paidUntil = 2**256 - 1; //largest possible uint256. The end of time for our purposes
        } else { // subscription service
			if (isEnabled(userID)) {
	            accounts[userID].paidUntil = SafeMath.add(accounts[userID].paidUntil, paidDuration);
	        } else {
	            accounts[userID].paidUntil = SafeMath.add(block.timestamp, paidDuration);
	        }
        } 

        // transfer everything in the contract to the owner. makes sure no ether can get stuck
        owner.transfer(this.balance);

        //trigger event
        PaymentReceived(msg.sender, msg.value);

	}


	function changePrice(uint256 newPrice) external onlyOwner {
		PriceChanged(price, newPrice);
		price = newPrice;
	}

	function changeBillingPeriod(uint256 newBillingPeriod) external onlyOwner {
		BillingPeriodChanged(billingPeriod, newBillingPeriod);
		billingPeriod = newBillingPeriod;
	}

}




contract ServiceContractFactory {

	ServiceContract[] private deployedContracts;
	mapping(bytes32 => ServiceContract) private contractIndex; // maps service url-name to a deployed contract address


	event NewContractDeployed(address indexed newContractAddress, bytes32 indexed newContractServiceName);

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