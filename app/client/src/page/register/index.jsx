import { useContext, useState } from "react";
import axios from "axios";
import { RegisterBusiness } from "../../apis/auth.contracts.js";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import logo from "../../assets/logo.png";
import { Context } from "../../context/context.jsx";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: "",
    country: "",
    sector: "",
    yearOfEstablishment: "",
    iots: "",
  });

  const [key, setKey] = useState("");

  const context = useContext(Context);
  const {accData} = context;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleHashing = (formData) => {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(formData),
      key
    ).toString();
    return encrypted;
  };

  async function handleSubmit() {
    try {
      if (
        !formData.country.trim() ||
        !formData.businessName.trim() ||
        !formData.sector.trim() ||
        !formData.iots.trim() ||
        !formData.unitsProd.trim() ||
        !formData.yearOfEstablishment.trim() ||
        !key.trim()
      ) return;
      const iotArray = formData.iots.split(',').map((iot)=>iot.trim());
      setFormData((prevFormData)=>(
        {
          ...prevFormData ,
          carbonCredits:100,
          creditsLimit:100,
          activity:0,
          iots:iotArray,
          user: accData.user
        }
       ))
      const data = handleHashing(formData);
      const res = await axios.post(
        "http://localhost:3000/api/v1/company/register",
        { data: data },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (res.status === 500) throw new Error("Not Uploaded to IPFS");
      const transaction = await RegisterBusiness({
        data: res.data.data,
        formData: formData,
      });
      if (!transaction) {
        alert("Not Registered");
        return;
      }
    } catch (error) {
      console.log(`Some Error occured\n${error.message}`);
    }
  }

  return (
    <>
      <div className="flex w-[100vw]">
        <div className="col1">
          <img src={logo} alt="" />
        </div>

        <div className="col2">
          <div style={{fontSize:'2rem',margin:'20px 0px'}}>Register your company</div>

          <form className="create" onSubmit={(e)=>{
            e.preventDefault();
            handleSubmit();
          }}>
            <label>Enter your Company Name</label>
            <input type="text" name="businessName" onChange={handleChange} required/>
            <label>Enter your Country</label>

            <input type="text" name="country" onChange={handleChange} required />

            <label>Enter your Sector</label>
            <input type="text" name="sector" onChange={handleChange} required />

            <label>Enter your Smart Meter Identifiers(separated by commas(,))</label>
            <input type="text" name="iots" onChange={handleChange} required />

            <label>Enter your Amount of Power Consumed per year(in KWh)</label>
            <input type="text" name="unitProd" onChange={handleChange} required />

            <label>Enter your year established</label>
            <input
              type="date"
              name="yearOfEstablishment"
              onChange={handleChange}
              required
            />

            <label>Enter a private key</label>
            <input
              type="password"
              name="private_key"
              onChange={(e) => {
                setKey(e.target.value);
              }}
              required
            />

            <button className="submit" type="submit" >Proceed</button>
          </form>
          <p className="register">
            Already Registered?{" "}
            <a
              onClick={() => {
                navigate("/sign-in");
              }}
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
