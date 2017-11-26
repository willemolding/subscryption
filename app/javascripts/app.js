// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";
import "../stylesheets/animate.css";

import 'bootstrap'; //bootstap js
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
        $('#step1Form').change(App.updateNewContractForm);
        $('#step2Form').change(App.updateNewContractForm);
		$('#addEtherForm').change(App.updateSendEtherForm);
        $("#appBillingPeriodMultiplierInput").hide();

		App.updateNewContractForm()
		App.updateSendEtherForm()
	},

	renderCreateNewServiceContractForm: function() {
	},

    validateUrlName: function (urlName) {

        return true;

        //TODO

		// checks that a url name is valid and not in use in the dapp already
		// first check it is valid when appeneded to a url
        
		// then check it isn't already taken
		ServiceContractFactory.deployed().then(function(instance) {
			return instance.getDeployedContractByUrlName(urlName);
		}).then(function(address) {

		}).catch(function(err) {
			console.log(err);
		});
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
		
	},

	updateNewContractForm: function() {
		document.getElementById("priceDisplay").innerHTML = Number(document.getElementById("appPriceInput").value);
        var billingPeriodSelect = document.getElementById("billingPeriodSelect");
        var multiplier = $("#appBillingPeriodMultiplierInput").val();
        var billingPeriodText = billingPeriodSelect.options[billingPeriodSelect.selectedIndex].text;

        if (multiplier != '1') {
            billingPeriodText = billingPeriodText + 's';
        }
        else {
            multiplier = '';
        }

		if (billingPeriodSelect.value > 0) {
            document.getElementById("intervalDisplay").innerHTML = "Per " + multiplier + " " + billingPeriodText;

            $("#appBillingPeriodMultiplierInput").prop("disabled", false);
            $("#appBillingPeriodMultiplierInput").show(200);

		} else {
            $("#appBillingPeriodMultiplierInput").prop("disabled", true);
            $("#appBillingPeriodMultiplierInput").hide(200);

			//$("#appBillingPeriodMultiplierInput").val(0);
			document.getElementById("intervalDisplay").innerHTML = "";
        }
	},

	deployNewServiceContract: function() {
		var appName = document.getElementById("appNameInput").value;
		var appUrlName = document.getElementById("appUrlNameInput").value;
		var priceInWei = web3.toWei(document.getElementById("appPriceInput").value, 'ether');
		var beneficiaryShare = web3.toWei(0.01, 'ether'); // remove this soon and make it a property of the contract factory
		var billingPeriodInSeconds = document.getElementById("billingPeriodSelect").value * $("#appBillingPeriodMultiplierInput").val();

		console.log("deploying new service contract:");
		console.log("name" + appName);
		console.log("urlName" + appUrlName);
		console.log("price in wei" + priceInWei);

		ServiceContractFactory.deployed().then(function(instance) {
			return instance.deployNewContract(appName, appUrlName, priceInWei, billingPeriodInSeconds, 
				{from: accounts[0]});
		}).then(function(result) {
			//verify that the contract was deployed successfully
			let txhash = result.tx;
			console.log("Contract deployment started with transaction hash:");
			console.log(txhash);
			// var newContractAddress = result.logs[0].args.newContractAddress
			// console.log("New Contract at address: \n"+newContractAddress);
		}).catch(function(err) {
			console.error(err);
		});
	},

	addEtherToAccount: function() {
		console.log("Adding ether to account");

		var totalPayment = Number(document.getElementById("purchasePrice").value);

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
			let txhash = result.tx;
			console.log("Payment started with transaction hash:");
			console.log(txhash);
		}).catch(function(err) {
			console.error(err);
		});
	},
};

window.addEventListener('load', function () {
    var validURL = false;
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

    //### Modal Functions
    $('.next').click(function () {
        var nextId = $(this).parents('.tab-pane').next().attr("id");
        var isValid = $(this).parents('form')[0].checkValidity();

        if (isValid && validURL) {

            if (nextId == 'step3') { //if summary page
                $("#appNameSummary").html($("#appNameInput").val());
                $("#appURLNameSummary").html($("#appUrlNameInput").val());
                var billPeriodMultiplier = $('#appBillingPeriodMultiplierInput').val();
                var billingType = '';
                var billingPeriodSelect = $('#billingPeriodSelect').val();
                switch (billingPeriodSelect) {
                    case '0':
                        billingType = "One Time Payment";
                        break;
                    case '86400':
                        billingType = billPeriodMultiplier + " Day Subscription";
                        break;
                    case '604800':
                        billingType = billPeriodMultiplier + " Week Subscription";
                        break;
                    case '2592000':
                        billingType = billPeriodMultiplier + " Month Subscription";
                        break;
                    case '31104000':
                        billingType = billPeriodMultiplier + " Year Subscription";
                        break;
                }
                $("#billingTypeSummary").html(billingType);
                $("#priceInEthSummary").html($('#appPriceInput').val());
            }
            $('[href="#' + nextId + '"' + ']').tab('show');
            return false;
        }
        else {
        }

    });

    $('.previous').click(function () {
        var prevId = $(this).parents('.tab-pane').prev().attr("id");
        $('[href="#' + prevId + '"' + ']').tab('show');
        return false;
    });

    $('#appUrlNameInput').change(function () {
        $('#urlError').show();
        $('#urlError').html("Checking availability of URL name");

        validURL = App.validateUrlName($(this).val());
        if (!validURL) {
            $('#urlError').show();
            $('#urlError').html("Error: This URL is already being used by another App");
            $('#urlError').addClass("warning");
        }
        else {
            $('#urlError').hide();
        }
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

        //update progress
        var step = $(e.target).data('step');
        var percent = (parseInt(step) / 3) * 100;

        $('.progress-bar').css({ width: percent + '%' });
        $('.progress-bar').text("Step " + step + " of 3");

        //e.relatedTarget // previous tab

    });
    $('[data-toggle="popover"]').popover(); 




     //### End Modal Functions


	App.start();
});
