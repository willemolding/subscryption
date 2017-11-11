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


window.App = {
	start: function() {

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

		var hash = window.location.hash.substring(1);
		console.log(hash);
		App.renderSendEtherForm(hash);


	},

	renderCreateNewServiceContractForm: function() {
	},

	renderSendEtherForm: function(appUrlName) {

		console.log("rendering send ether form for "+appUrlName);
		// check that this app name has a valid contract and get its address

		var nameField = document.getElementById("appName");
		var priceField = document.getElementById("purchasePrice");

		var contract;

		ServiceContractFactory.deployed().then(function(instance) {
			return instance.getDeployedContractByUrlName(web3.toHex(appUrlName));
		}).then(function(address) {
			try {
				return ServiceContract.at(address);
			} catch (err) {
				throw "No contract exists with url name: "+appUrlName;
			}		
		}).then(function(serviceContract) {
			contract = serviceContract;
			return contract.price();
		}).then(function(price) {
			priceField.value = web3.fromWei(price, 'ether');
			return contract.serviceName();
		}).then(function(name) {
			nameField.innerHTML = web3.toAscii(name);
			App.updateSendEtherForm();
		}).catch(function(err) {
			console.error(err);
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
			message = "This is how much of a cut Apple would be taking ;)";
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
		var appUrlName = document.getElementById("appUrlNameInput").value;
		var priceInWei = web3.toWei(document.getElementById("appPriceInput").value, 'ether');
		var beneficiaryShare = document.getElementById("appDonationInput").value / 100 * web3.toWei(1, 'ether');
		var billingPeriodInSeconds = 0;

		console.log("deploying new service contract:");
		console.log(appName);
		console.log(appUrlName);
		console.log(priceInWei);
		console.log(beneficiaryShare);

		ServiceContractFactory.deployed().then(function(instance) {
			return instance.deployNewContract(appName, appUrlName, priceInWei, billingPeriodInSeconds, beneficiaryShare, 
				{from: accounts[0]});
		}).then(function(result) {
			//verify that the contract was deployed successfully
			console.log(result);
			var newContractAddress = result.logs[0].args.newContractAddress
			console.log("New Contract at address: \n"+newContractAddress);
		}).catch(function(err) {
			console.error(err);
		});
	},

	addEtherToAccount: function() {
		console.log("Adding ether to account");

		var purchasePrice = Number(document.getElementById("purchasePrice").value);
		var tip = Number(document.getElementById("tip").value);
		var totalPayment = purchasePrice + tip;

		var appUrlName = window.location.hash.substring(1);
		var userID = document.getElementById("userID").value;

		ServiceContractFactory.deployed().then(function(instance) {
			return instance.getDeployedContractByUrlName(web3.toHex(appUrlName));
		}).then(function(address) {
			try {
				return ServiceContract.at(address);
			} catch (err) {
				throw "No contract exists with url name: "+appUrlName;
			}
		}).then(function(serviceContract) {
			return serviceContract.addEther(userID, {from: accounts[0], value: web3.toWei(totalPayment)});
		}).then(function(result) {
			console.log("ether successfully send to account");
		}).catch(function(err) {
			console.error(err);
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
		console.warn("No web3 detected. Only read-only calls permitted");
		// fallback - use your fallback strategy (Infura Ethereum provider (using ropsten for now))
		window.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/siZtDG9vlqEzi7Jekeqt "));
	}

	App.start();
});
