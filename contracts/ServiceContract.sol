pragma solidity ^0.4.0;

contract ServiceContract {

	bytes32 public serviceName; // name of the service that is being subscribed to

	address owner; // address of the owner of the service that is being paid for. Also the owner of the contract
	address creator; // who created the contract. They do not have any special privilages
	address beneficiary; // address of party that gets a fraction of proceeds

	uint public price; // how much the service costs in wei
	uint beneficiaryShare; // how much goes to the beneficiary in wei per ether

	// a record of how much wei has been paid to each userID. This is for full Dapp mode
	mapping(bytes6 => uint) balances;
	// a record of how much wei has been paid by address. This is for partial Dapp mode
	mapping(address => uint) addressBalances;

	event PaymentReceived(address indexed sender, uint value);


	function ServiceContract(bytes32 serviceName_, address owner_, address beneficiary_, uint price_, uint beneficiaryShare_){
		// sets the owner to the creator of the contract. It is not necessarily the creator
		serviceName = serviceName_;
		owner = owner_;
		beneficiary = beneficiary_;
		price = price_;
		beneficiaryShare = beneficiaryShare_;
		creator = msg.sender;
	}

	// fallback called when someones sends funds to this contract. This is not allowed at this time
	function() payable {
		revert();
	}

	// view function to find is a user has paid the required amount
	function isPaid(bytes6 userID) constant returns (bool) {
		return balances[userID] >= price;
	}

	// gets the balance of a users account
	function accountBalance(bytes6 userID) constant returns (uint) {
		return balances[userID];
	}

	// method to add ether to a userID. 
	// The actual ether is passed on to the owner and beneficiary but a record is stored in the contract
	// no ether should ever be stored in the contract
	function addEther(bytes6 userID) payable {
		balances[userID] += msg.value;

		uint beneficiaryCut = msg.value * beneficiaryShare;
		uint ownerCut = msg.value - beneficiaryCut;

		assert(beneficiaryCut+ownerCut == msg.value);
		beneficiary.transfer(beneficiaryCut);
		owner.transfer(ownerCut);

		PaymentReceived(msg.sender, msg.value);
	}



}