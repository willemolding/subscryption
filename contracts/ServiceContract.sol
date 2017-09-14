pragma solidity ^0.4.2;

import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract ServiceContract {

	bytes32 public serviceName; // name of the service that is being subscribed to

	address public owner; // address of the owner of the service that is being paid for. Also the owner of the contract
	address public creator; // who created the contract. They do not have any special privilages
	address public beneficiary; // address of party that gets a fraction of proceeds

	uint256 public price; // how much the service costs in wei
	uint256 public beneficiaryShare; // how much goes to the beneficiary in wei per ether

	// a record of how much wei has been paid to each userID. This is for full Dapp mode
	mapping(bytes6 => uint256) private balances;

	event PaymentReceived(address indexed sender, uint256 value);


	function ServiceContract(bytes32 serviceName_, address owner_, address beneficiary_, uint256 price_, uint256 beneficiaryShare_){
		// sets the owner to the creator of the contract. It is not necessarily the creator
		serviceName = serviceName_;
		owner = owner_;
		beneficiary = beneficiary_;
		price = price_;
		beneficiaryShare = beneficiaryShare_;
		creator = msg.sender;

		// check that the owner and beneficiary are both able to receive funds
		
	}

	// fallback called when someones sends funds to this contract. This is not allowed at this time
	function() payable {
		revert();
	}

	// view function to find is a user has paid the required amount
	function isPaid(bytes6 userID) public constant returns (bool) {
		return balances[userID] >= price;
	}

	// gets the balance of a users account
	function accountBalance(bytes6 userID) public constant returns (uint256) {
		return balances[userID];
	}

	// method to add ether to a userID. 
	// The actual ether is passed on to the owner and beneficiary but a record is stored in the contract
	// no ether should ever be stored in the contract 
	function addEther(bytes6 userID) external payable {
		if (msg.value > 0){
			balances[userID] = SafeMath.add(balances[userID], msg.value);

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

	}



}