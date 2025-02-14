const fs = require('fs');
//const solc = require('solc');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

let json = {};

fs.readFile('contract.json', 'utf8', (err, data) => {
	if(err) {
		console.error(err);
		return;
	}
	json = JSON.parse(data);
	let contractJSON = json['contracts']['contract.sol:Storage'];
	let abi = contractJSON['abi'];
	let code = '0x' + contractJSON.bin;

	let contract = new web3.eth.Contract(abi, null, {
		data: code
	});
	let account = '';

	web3.eth.getAccounts((error, result) => {
		if(error) {
			console.error(error);
		} else {
			account = result[0];
			try {
				let password = '';
				web3.eth.personal.unlockAccount(account, password);
			} catch(e) {
				console.error(e);
			}

			web3.eth.getGasPrice().then((averageGasPrice) => {
				contract.deploy().estimateGas().then((estimatedGas) => {
					// console.log('Account', account);
					// console.log('Estimated Gas', estimatedGas);
					// console.log('Average Gas Price', averageGasPrice);
					contract.deploy().send({
						from: account,
						gas: estimatedGas,
						gasPrice: averageGasPrice
					}).then((instance) => {
						console.log('Contract deployed to:', instance.options.address);
						process.exit(0);
					});
				}).catch(error => {
					console.error(error);
					// estimatedGas = 3141592000000
					// contract.deploy().send({
					// 	from: account,
					// 	gas: estimatedGas,
					// 	gasPrice: averageGasPrice
					// }).then((instance) => {
					// 	console.log('Contract deployed to:', instance.options.address);
					// 	process.exit(0);
					// });
				});

			}).catch(console.error);
		}
	});
});
