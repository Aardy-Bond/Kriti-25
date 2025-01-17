import Web3 from 'web3';
import {nftContractAddress , NFT_ABI} from '../configs/constants.js'

export const RegisterBusiness = async ({data , formData})=>{
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(NFT_ABI , nftContractAddress);
    const uri = `ipfs://${data.cid}`;
    try {
        const gasLimit = BigInt(await contract.methods.registerBusiness(
            formData.user , formData.businessName , formData.sector , formData.country , uri , formData.yearOfEstablishment
        ).estimateGas({
            from: formData.user
        }));
        const bufferGasLimit = (gasLimit * 13n) / 10n;
        let receipt = await contract.methods.registerBusiness(
            formData.user , formData.businessName , formData.sector , formData.country , uri , formData.yearOfEstablishment
        ).send({
            from:formData.user,
            gas:bufferGasLimit.toString()
        });
        
        receipt = JSON.stringify(receipt, (key, value) =>
            typeof value === "bigint" ? Number(value) : value,
        );
        console.log(`Transcation Successful\n${receipt}`);
        return true;
    } catch (error) {
        console.log(`Transaction Unsuccessful\n${error}`);
        return false;
    }
}

export const SignInBusiness = async({formData})=>{
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(NFT_ABI , nftContractAddress);
    try {
        const gasLimit = BigInt(await contract.methods.verifyBusiness(
            formData.user ,formData.tokenId
        ).estimateGas({
            from: formData.user
        }));
        const tokenUri = await contract.methods.verifyBusiness(
            formData.user ,formData.tokenId
        ).call({
            from:formData.user,
            gas:gasLimit.toString()
        });
        console.log(`Transcation Successful\n${tokenUri}`);
        return tokenUri;
    } catch (error) {
        console.log(`Transaction Unsucessful\n${error}`)
        return false;
    }
}
