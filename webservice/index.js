// Import libraries
var Web3            = require('web3'),
    contract        = require("truffle-contract"),
    path            = require('path'),
    express			= require('express'),
    service_contract_factory_artifacts  = require(path.join(__dirname, '../build/contracts/ServiceContractFactory.json'));

// Setup RPC connection   
var provider = new Web3.providers.HttpProvider("http://localhost:8545");

// Read JSON and attach RPC connection (Provider)
var ServiceContract = contract(service_contract_factory_artifacts);
ServiceContract.setProvider(provider);

var app = express();
var router = express.Router();

router.get('/:urlName/:userId', function(req, res) {
	console.log('request made with parameters');
	console.log();
});



// // Use Truffle as usual
// ServiceContract.deployed().then(function(instance) {
//     console.log(JSON.stringify(instance));
// }).catch(function(err) {
// 	console.error(err);
// });

app.use('/', router);

port = 3000;
app.listen(port);
console.log("listening on port: "+port);