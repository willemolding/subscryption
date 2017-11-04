pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/math/SafeMath.sol";



contract ServiceContract{

    struct AccountData {
        uint256 totalPaid; // The total value in wei the user has ever paid to the contract
        uint256 paidUntil; // timestamp to which the user will be valid based on their payments
    }

	bytes32 public serviceName; // name of the service that is being subscribed to

	address public owner; // address of the owner of the service that is being paid for. Also the owner of the contract
	address public creator; // who created the contract. They do not have any special privilages
	address public beneficiary; // address of party that gets a fraction of proceeds

	uint256 public price; // how much the service costs in wei per billing period
	uint256 public billingPeriod; // Duration in seconds that is paid for by price. If 0 then only one-off payments are required
	uint256 public beneficiaryShare; // how much goes to the beneficiary in wei per ether

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


	function ServiceContract(bytes32 serviceName_, address owner_, address beneficiary_, uint256 price_, uint256 billingPeriod_, uint256 beneficiaryShare_) payable {
		require(msg.value == 0); // do not allow payments to this contract ever

		// sets the owner to the creator of the contract. It is not necessarily the creator
		serviceName = serviceName_;
		owner = owner_;
		beneficiary = beneficiary_;
		price = price_;
        billingPeriod = billingPeriod_;
		beneficiaryShare = beneficiaryShare_;
		creator = msg.sender;

		// check that the owner and beneficiary are both able to receive funds
		// this costs gas but the contract is useless otherwise
		// these will revert if unsuccessful erasing the created contract
		owner.transfer(0);
		beneficiary.transfer(0);
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
        require(msg.value > 0);

        accounts[userID].totalPaid = SafeMath.add(accounts[userID].totalPaid, msg.value);
        uint256 paidDuration =  SafeMath.div(SafeMath.mul(msg.value, billingPeriod), price);

        if (billingPeriod == 0) { // implies a one-off-payment service
        	if (accounts[userID].totalPaid >= price) {
        		accounts[userID].paidUntil = 2**256 - 1; //largest possible uint256. The end of time for our purposes
        	}
        } else { // subscription service
			if (isEnabled(userID)) {
	            accounts[userID].paidUntil = SafeMath.add(accounts[userID].paidUntil, paidDuration);
	        } else {
	            accounts[userID].paidUntil = SafeMath.add(block.timestamp, paidDuration);
	        }
        } 

        uint256 beneficiaryCut = SafeMath.div(SafeMath.mul(msg.value, beneficiaryShare), 1 ether);

        //transfer the cut to the beneficiary
        // If this call fails then everything will be rolled back
        // no further code execution will occur
        // The users funds will be recalled (minus gas)
        beneficiary.transfer(beneficiaryCut);

        // transfer everything remaining to the owner.
        // If this call fails then the beneficiary won't receive funds and the user won't be authenticated
        // the users funds will be recalled though (minus gas)
        // Another call can be used to recover these funds although the address cannot be changed
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