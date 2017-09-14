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
	mapping(bytes6 => uint256) balances;
	// a record of how much wei has been paid by address. This is for partial Dapp mode
	mapping(address => uint256) addressBalances;

	event PaymentReceived(address indexed sender, uint256 value);


	function ServiceContract(bytes32 serviceName_, address owner_, address beneficiary_, uint256 price_, uint256 beneficiaryShare_){
		// sets the owner to the creator of the contract. It is not necessarily the creator
		serviceName = serviceName_;
		owner = owner_;
		beneficiary = beneficiary_;
		price = price_;
		beneficiaryShare = beneficiaryShare_
;		creator = msg.sender;
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
	function accountBalance(bytes6 userID) constant returns (uint256) {
		return balances[userID];
	}

	// method to add ether to a userID. 
	// The actual ether is passed on to the owner and beneficiary but a record is stored in the contract
	// no ether should ever be stored in the contract for security reasons
	function addEther(bytes6 userID) payable {
		balances[userID] = SafeMath.add(balances[userID], msg.value);

		uint256 beneficiaryCut = SafeMath.div(SafeMath.mul(msg.value, beneficiaryShare), 1 ether);
		uint256 ownerCut = SafeMath.sub(msg.value, beneficiaryCut);

		beneficiary.transfer(beneficiaryCut);
		owner.transfer(ownerCut);

		PaymentReceived(msg.sender, msg.value);
	}



}