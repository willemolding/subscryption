// Import libraries
let Web3            = require('web3'),
    contract        = require("truffle-contract"),
    path            = require('path'),
    express			= require('express'),
    service_contract_factory_artifacts  = require(path.join(__dirname, '../build/contracts/ServiceContractFactory.json'));
    service_contract_artifacts = require(path.join(__dirname, '../build/contracts/ServiceContract.json'));



// Setup RPC connection   
let provider = new Web3.providers.HttpProvider("http://localhost:8545");
let web3 = new Web3(provider);

// Read JSON and attach RPC connection (Provider)
let ServiceContractFactory = contract(service_contract_factory_artifacts);
let ServiceContract = contract(service_contract_artifacts)

ServiceContractFactory.setProvider(provider);
ServiceContract.setProvider(provider);

let app = express();
let router = express.Router();


////////////////////////////////////////////////////////
// Get info about a service contract from it's Url Name.
////////////////////////////////////////////////////////
///
router.get('/contract/:urlName', function(req, res) {
	let urlName = req.params.urlName;
	let response = {};
	let serviceContractInstance;

	console.log(urlName)

	// can maybe do this better than using nested promises. Need to check
	ServiceContractFactory.deployed().then(function(factoryInstance) {
    	return factoryInstance.getDeployedContractByUrlName(web3.toHex(urlName));
    }).then(function(address) {

		ServiceContract.at(address)
		.then(function(contractInstance) {
			serviceContractInstance = contractInstance;
			return serviceContractInstance.serviceName();
		}).then(function (serviceName) {
			response["name"] = serviceName;
			return serviceContractInstance.price();
		}).then(function(price) {
			response["price"] = price;
			res.send(response);
		}).catch(function(err) {
			console.error(err);
			res.send({"error":"Could not locate contract with this urlName"});
		});

	}).catch(function(err){
		console.error(err)
		res.send(500)
	});
	
});


////////////////////////////////////////////
// Get info about a user of a given contract 
////////////////////////////////////////////
router.get('/user/:urlName/:userId', function(req, res) {
	let urlName = req.params.urlName;
	let userId = req.params.userId;

	let response = {};
	let serviceContractInstance;

	ServiceContractFactory.deployed().then(function(factoryInstance) {
    	return factoryInstance.getDeployedContractByUrlName(web3.toHex(urlName));
    }).then(function(address) {

		ServiceContract.at(address)
		.then(function(contractInstance) {
			serviceContractInstance = contractInstance;
			return serviceContractInstance.getPaidUntil(userId);
		}).then(function (paidUntilDuration) {
			response["paid_until"] = paidUntilDuration;
			response["enabled"] = paidUntilDuration >= Math.floor(new Date() / 1000);
			return serviceContractInstance.getTotalPaid(userId);
		}).then(function(totalPaid) {
			response["total_paid"] = totalPaid;
			res.send(response);
		}).catch(function(err){
			console.error(err)
			res.send({"error":"Could not locate contract with this urlName"});
		});

	}).catch(function(err) {
		console.error(err);
		res.send(500); //respond with a http 500 error response (internal server error)
	});
});


app.use('/api/v1/', router);

port = 3000;
app.listen(port);
console.log("listening on port: "+port);