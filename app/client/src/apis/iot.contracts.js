import Web3, { errors } from 'web3';
import {iotContractAddress , IOT_ABI} from '../configs/constants.js'

const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(IOT_ABI , iotContractAddress);

export const GetCredits=async({iots,address}) =>{
    try {
        let sum = 0;
        iots.forEach(async (identifier) => {
            let credits = await contract.methods.getByIdentifier(identifier).call({
                from:address
            });
            console.log(credits);
            sum=sum+credits;
        })
        console.log('Transaction Successful',sum);
        return sum;
    } catch (error) {
        console.log('Transaction failed to fetch carbon credits',error);
        return false;
    }
}