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
			return ServiceContract.at(address).price();
		}).then(function(price) {
			console.log(price);
			priceField.value = web3.fromWei(price, 'ether');
			App.updateSendEtherForm();
		});
	},

	updateSendEtherForm: function() {
		var purchasePrice = document.getElementById("purchasePrice").value;
		var tip = document.getElementById("tip").value;
		var totalPayment = purchasePrice + tip;
		document.getElementById("totalPayment").innerHTML = totalPayment;
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
			App.renderSendEtherForm(web3.toAscii(result.logs[0].args.newContractServiceName));

		});
	},

	addEtherToAccount: function() {

	},


};

window.addEventListener('load', function() {
	// Checking if Web3 has been injected by the browser (Mist/MetaMask)
	if (typeof web3 !== 'undefined') {
		console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
		// Use Mist/MetaMask's provider
		window.web3 = new Web3(web3.currentProvider);
	} else {
		console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
		// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
		window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	}

	App.start();
});
