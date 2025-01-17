import { useContext, useState } from "react"
import { SignInBusiness } from "../../apis/contracts.js";
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import { Context } from "../../context/context.jsx";

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

    async function handleSubmit() {
        try {
            if(!formData.tokenId || !formData.user.trim()) return;
            const transaction = await SignInBusiness({formData:formData});
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
            console.log("Successfull",response.data.data);
            setAccData(response.data.data);
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
                <input type="submit" value="SignIn"/>
            </form>
        </>
    )

}

export default SignIn