# subsCryption Contract Interfaces

Document with all of the ways to interact with the contracts to speed up development.
Calls to contracts are either readonly or write. Readonly calls are super fast and cost no gas. write calls require the user to be signed in and have their wallet unlocked, cost some gas and won't take effect until the transaction call is mined.

---

## Making contract calls using web3/truffle in javascript

### Readonly
If a contract has already been deployed, readonly calls can be made using a Promise. For example calling serviceName(). Thse can be called at any time. It doesn't even
require the user to be running metaMask as we can use INFURA as gateway to the Ethereum network.
```javascript

serviceContract.deployed().then(function(instance) {
	return instance.serviceName()
}).then(function(serviceName) {
	// do whatever with the returned name
	// don't forget to web3.toAscii(serviceName)
}).catch(function(err) {
	// handle any errors here. Maybe the contract doesn't exist or there is not web3 provider
});

```

### Write
Write calls can also be made using a promise but it is likely the user has left the page by then. Depending on the gas price it may take between 15 sec and hours!
Write calls also need to specify the account that is sending it and optionally a gas price and transfer value as a dict. The user must be using a web3 compatible browser such as Mist or MetaMask and needs to have their account unlocked.
An example using addEther(userID)

```javascript

serviceContract.deployed().then(function(instance) {
	return instance.addEther(userID, {from: accounts[0], value: web3.toWei(0.1, 'ether'), gas: })
}).then(function(result) {
	// maybe this will be called in like an hour...
}).catch(function(err) {
	// hopefully if there is an error it throws immediatly...
});

```

---

## ServiceContract

### Write

`ServiceContract(bytes32 serviceName_, address owner_, address beneficiary_, uint256 price_, uint256 billingPeriod_, uint256 beneficiaryShare_) payable`
(Constructor) - Creates and fully defines a new service contract. This should *never* be called and the factory contract should be used instead.

`addEther(bytes32 userID) external payable`
This is how a user adds ether to their account. They must provide the correct user ID. Doing it this way means devices with no access to the users ethereum wallet can still verify if they have paid using the ID. It is still up for debate if this is the best way to do it...

`transferOwnership(address newOwner) onlyOwner public`
Used to transfer the owner of the contract to another address. The owner receives the majority cut of the sales and can modify certain properties of the contract

`changePrice(uint256 newPrice) external onlyOwner`
Change the price per billing period. This does not affect previous payments

`changeBillingPeriod(uint256 newBillingPeriod) external onlyOwner`
Change the billing period. This does not affect previous payments


### Readonly

`isEnabled(bytes32 userID) public constant returns (bool)`
returns true if a user has paid and should be allowed to use the service

`getPaidUntil(bytes32 userID) public constant returns (uint256)`
returns the unix timestamp of the time when the users subscription expires

`getTotalPaid(bytes32 userID) public constant returns (uint256)`
returns the total value of ether the user has send to their account

`serviceName() public constant returns (bytes32)`

`price() public constant returns (uint256)`

`billingPeriod() public constant returns (uint256)`
the billing period in seconds. The interpretation is a subscription for one *billingPeriod* costs one *price*. 
I know this is a redundant way of defining it. May decide to change this and just have a price per second or something

`beneficiaryShare() public constant returns (uint256)`
How much the beneficiary (us) receives per transaction. It has the units wei per ether.

`owner() public constant returns (address)`

`creator() public constant returns (address)`

`beneficiary() public constant returns (address)`

---

## ServiceContractFactory

### Write

`ServiceContractFactory(address beneficiary_)`
(Constructor) - Should be called only once ever when we deploy the dApp for the first time

`function deployNewContract(bytes32 serviceName, bytes32 serviceUrlName, uint256 price, uint256 billingPeriod, uint256 beneficiaryShare) external returns (ServiceContract)`
Creates a new service contract and records its address and urlName in the contract index

`changeBeneficiary(address newBeneficiary) onlyOwner public`
Change the beneficiary. Can only be called by the owner which is the address that called the contructor

`transferOwnership(address newOwner) onlyOwner public`
Used to transfer the owner of the contract to another address.

### Readonly

`getDeployedContractByUrlName(bytes32 serviceUrlName) public constant returns (ServiceContract)`
Used to get the address of the service contract by its UrlName

`getDeployedContractAtIndex(uint index) public constant returns (ServiceContract)`
Same as above but by the index. Contracts are listed in order of creation

`numberOfDeployedContracts() public constant returns (uint)`
Self explainatory

`beneficiary() public constant returns (address)`
Get the address of the beneficiary