import ethers from 'ethers';
import keys from './env.js';

const provider = new ethers.JsonRpcProvider(keys.RPC_URL);

const wallet = new ethers.Wallet(keys.PRIVATE_KEY, provider);

const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_identifier",
				"type": "string"
			}
		],
		"name": "getByIdentifier",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_credits",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_identifier",
				"type": "string"
			}
		],
		"name": "updateCredits",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
const contractAddress = "0xe0b5709dd00984cb0438183c81ea612b948b6c62";

export const contract = new ethers.Contract(contractAddress, contractABI, wallet);