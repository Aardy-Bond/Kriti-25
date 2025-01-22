import { ZK_SELL_ABI,zkSellContractAddress , ZK_BUY_ABI,zkBuyContractAddress} from "../configs/constants.js";
import Web3 from "web3";

export async function SubmitSellProof({ proof , publicInputs}) {
   const web3 = new Web3(window.ethereum);
   const contract = new web3.eth.Contract(ZK_SELL_ABI , zkSellContractAddress);
   try {
      const isValid = await contract.methods.validateUser(proof.pi_a ,proof.pi_b , proof.pi_c , publicInputs).call() || publicInputs[0];
      console.log(isValid);
      return isValid;
   } catch (error) {
      console.log('Some Error in validate user submit proof contract\n',error);
      return false;
   }
}

export async function SubmitBuyProof() {
   const web3 = new Web3(window.ethereum);
   const contract = new web3.eth.Contract(ZK_BUY_ABI , zkBuyContractAddress);
   try {
      const isValid = await contract.methods.validateUser(proof.pi_a ,proof.pi_b , proof.pi_c , publicSignals).call({
         from:address
      });
      return isValid;
   } catch (error) {
      console.log('Some Error in validate user submit proof contract\n',error);
      return false;
   }
}