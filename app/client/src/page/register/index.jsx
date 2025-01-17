import { useState } from "react";
import axios from 'axios';
import { RegisterBusiness } from "../../apis/contracts.js";

const Register = ()=>{

    const [formData , setFormData] = useState({
        businessName:"", country:"" , sector:"", yearOfEstablishment:"",user:""
    });

    const handleChange = (e)=>{
        const { name, value } = e.target;
        setFormData((prevFormData) => ({...prevFormData,[name]: value}));
    }

    async function handleSubmit() {
        try {
            if(!formData.country.trim() || !formData.businessName.trim() || !formData.user.trim() ||
            !formData.sector.trim() || !formData.yearOfEstablishment.trim()) return;
            const data = formData;
            const res = await axios.post('http://localhost:3000/api/v1/company/register',data,{
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if(res.status === 500) throw new Error(error);
            // send the data to the admin side for verification(to be done afterwards)
            const transaction = await RegisterBusiness({data:res.data.data,formData:formData});
            if(!transaction) {
                alert('Not Registered');
                return;
            }
        } catch (error) {
            console.log(`Some Error occured\n${error.message}`);
        }
    }

    return(
        <>
            <form style={{display:'flex',flexDirection:'column',width:'60vw'}}
            onSubmit={(e)=>{
                e.preventDefault();
                handleSubmit();
            }}>
                <input type="text" name="businessName" placeholder="Enter your company name" onChange={handleChange} required/>
                <input type="text" name="country" placeholder="Enter your country" onChange={handleChange} required/>
                <input type="text" name="sector" placeholder="Enter your sector" onChange={handleChange} required/>
                <input type="text" name="yearOfEstablishment" placeholder="Enter your year established" onChange={handleChange} required/>
                <input type="text" name="user" placeholder="Enter you Metamask Wallet Address" onChange={handleChange}/>
                <input type="submit" value="Register"/>
            </form>
        </>
    )

}

export default Register