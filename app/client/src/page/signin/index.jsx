import { useContext, useState } from "react"
import { SignInBusiness } from "../../apis/auth.contracts.js";
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import { Context } from "../../context/context.jsx";
import CryptoJS from "crypto-js";

const SignIn = ()=>{

    const navigate = useNavigate();
    const context = useContext(Context);
    const {setAccData} = context;

    const [formData , setFormData] = useState({
        tokenId:0 , user:""
    });

    const handleChange = (e)=>{
        const { name, value } = e.target;
        setFormData((prevFormData) => ({...prevFormData,[name]: value}));
    }

    const [key,setKey] = useState("")

    function handleDecrypt(data){
        const bytes = CryptoJS.AES.decrypt(data,key);
        const decryptedData= JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return decryptedData
    }

    async function handleSubmit() {
        try {
            if(!formData.tokenId) return;
            const transaction = await SignInBusiness({formData});
            if(!transaction) {
                alert('Could not Sign-in');
                return;
            }
            const cid = transaction.slice(7);
            // const response = await axios.get(`https://ipfs.io/ipfs/${cid}`,{
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            // });
            const response = await axios.get(`http://localhost:3000/api/v1/company/signin/${cid}`,{
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const dataa = handleDecrypt(response.data.data.data)
            setAccData({...dataa , tokenId:formData.tokenId , key:key});
            navigate('/dashboard');
        } catch (error) {
            alert(`some Error Occured\n${error}`);
            console.log('Some Error Occured\n',error);
        }
    }

    return(
        <>
            <form style={{display:'flex',flexDirection:'column',width:'60vw'}}
            onSubmit={(e)=>{
                e.preventDefault();
                handleSubmit();
            }}>
                <input type="text" name="tokenId" placeholder="Enter your Token Id" onChange={handleChange} required/>
                <input type="text" name="user" placeholder="Enter your Wallet Address" onChange={handleChange} required/>
                <input type="text" name="private_key" placeholder="Enter your Password" onChange={(e)=>{setKey(e.target.value)}} required/>
                <input type="submit" value="SignIn"/>
            </form>
        </>
    )

}

export default SignIn