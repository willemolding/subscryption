// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

import "bootstrap/dist/css/bootstrap.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import service_contract_artifacts from '../../build/contracts/ServiceContract.json'
import service_contract_factory_artifacts from '../../build/contracts/ServiceContractFactory.json'


var ServiceContract = contract(service_contract_artifacts);
var ServiceContractFactory = contract(service_contract_factory_artifacts);

var accounts;
var account;

var MAX_GAS_LIMIT = 4476768; // this is just here for testing purposes

window.App = {
	start: function() {
		var self = this;

		// create the ServiceContract abstraction for Use.
		ServiceContractFactory.setProvider(web3.currentProvider);
		ServiceContract.setProvider(web3.currentProvider);

		// Get the initial account balance so it can be displayed.
		web3.eth.getAccounts(function(err, accs) {
			if (err != null) {
				alert("There was an error fetching your accounts.");
				return;
			}

			if (accs.length == 0) {
				alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
				return;
			}

			accounts = accs;
			account = accounts[0];

		});

		var hash = window.location.hash.substring(1)
		console.log(hash);
		App.renderSendEtherForm(hash);

	},
	// add more functions to the app here

	renderCreateNewServiceContractForm: function() {

	},

	renderSendEtherForm: function(appName) {
		// check that this app name has a valid contract and get its address

		document.getElementById("appName").innerHTML = appName;
		var priceField = document.getElementById("purchasePrice");

		ServiceContractFactory.deployed().then(function(instance) {
			return instance.getContractAddressFromName(web3.toHex(appName));
		}).then(function(address) {
			if(address != 0) {
				return ServiceContract.at(address);				
			} else {
				throw "An app with this name does not exist";
			}
		}).then(function(serviceContract) {
			return serviceContract.price();
		}).then(function(price) {
			console.log(price);
			priceField.value = web3.fromWei(price, 'ether');
			App.updateSendEtherForm();
		});
	},

	updateSendEtherForm: function() {
		var purchasePrice = Number(document.getElementById("purchasePrice").value);
		var tip = Number(document.getElementById("tip").value);
		var totalPayment = purchasePrice + tip;
		document.getElementById("totalPayment").innerHTML = totalPayment;
	},

	updateNewContractForm: function() {
		var sliderValue = document.getElementById("appDonationInput").value;
		document.getElementById("donationSliderValueLabel").innerHTML = sliderValue
		var message = "";
		if(sliderValue == 0) {
			message = "Aww come on don't be like that...";
		} else if(sliderValue < 3) {
			message = "Better than nothing I guess";
		} else if(sliderValue < 5) {
			message = "Getting there"
		} else if(sliderValue < 10) {
			message = "Thanks, we really appreciate it";
		} else if(sliderValue < 20) {
			message = "Amazing contribution! Thanks";
		} else if(sliderValue < 27) {
			message = "This is how much of a cut Kiezel pay would be taking";
		} else if(sliderValue < 50) {
			message = "Wow are you sure?";
		} else if(sliderValue < 100) {
			message = "OMG amazing!!!!!";
		} else if(sliderValue == 100) {
			message = "You sir, are a LEGEND";
		}
		document.getElementById("messageToUser").innerHTML = message;
	},

	deployNewServiceContract: function() {
		var appName = document.getElementById("appNameInput").value;
		var priceInWei = web3.toWei(document.getElementById("appPriceInput").value, 'ether');
		var beneficiaryShare = document.getElementById("appDonationInput").value / 100 * web3.toWei(1, 'ether');

		console.log("deploying new service contract:");
		console.log(appName);
		console.log(priceInWei);
		console.log(beneficiaryShare);

		ServiceContractFactory.deployed().then(function(instance) {
			return instance.deployNewContract(appName, priceInWei, beneficiaryShare, 
				{from: accounts[0], gas: MAX_GAS_LIMIT});
		}).then(function(result) {
			//verify that the contract was deployed successfully
			console.log(result);
			var newContractAddress = result.logs[0].args.newContractAddress
			console.log("New Contract at address: \n"+newContractAddress);
		});
	},

	addEtherToAccount: function() {
		console.log("Adding ether to account");

		var purchasePrice = Number(document.getElementById("purchasePrice").value);
		var tip = Number(document.getElementById("tip").value);
		var totalPayment = purchasePrice + tip;

		var appName = window.location.hash.substring(1);
		var userID = document.getElementById("userID").value;

		ServiceContractFactory.deployed().then(function(instance) {
			return instance.getContractAddressFromName(web3.toHex(appName));
		}).then(function(address) {
			return ServiceContract.at(address);
		}).then(function(serviceContract) {
			return serviceContract.addEther(userID, {from: accounts[0], value: web3.toWei(totalPayment)});
		}).then(function(result) {
			console.log("ether successfully send to account");
		});
	},


};

window.addEventListener('load', function() {
	// Checking if Web3 has been injected by the browser (Mist/MetaMask)
	if (typeof web3 !== 'undefined') {
		console.warn("Using web3 detected from external source. ");
		// Use Mist/MetaMask's provider
		window.web3 = new Web3(web3.currentProvider);
	} else {
		console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
		// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
		window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	}

	App.start();
});
