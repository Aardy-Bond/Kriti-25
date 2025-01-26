import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.png";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: "",
    country: "",
    sector: "",
    yearOfEstablishment: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };
  async function handleSubmit() {
    try {
      if (
        !formData.country.trim() ||
        !formData.businessName.trim() ||
        !formData.trim() ||
        !formData.sector.trim() ||
        !formData.yearOfEstablishment.trim()
      )
        return;
      const res = await axios.post(
        "http://localhost:3000/api/v1/dashboard/uploads",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (res.status === 500) throw new Error("Documents not Submitted");
      console.log('Documents Submitted')
    } catch (error) {
      console.log(`Some Error occured\n${error.message}`);
    }
  }

  return (
    <>
      <div className="container">
        <div className="col1">
          <img src={logo} alt="" />
        </div>

        <div className="col2">
          <h1>Register your company</h1>

          <form className="create">
            <label>Enter your Company Name</label>
            <input
              type="text"
              name="country"
              onChange={handleChange}
              required
            />
            <label>Enter your Country</label>

            <input type="text" name="user" onChange={handleChange} required />

            <label>Enter your Sector</label>
            <input type="text" name="sector" onChange={handleChange} required />

            <label>Enter your year established</label>
            <input
              type="date"
              name="yearOfEstablishment"
              onChange={handleChange}
              required
            />

            <label>Upload Document 1</label>
            <input type="file" name="doc1" onChange={handleChange} required />

            <label>Upload Document 2</label>
            <input type="file" name="doc2" onChange={handleChange} required />

            <button className="submit">Submit</button>
          </form>
          <p className="register" onClick={handleSubmit}>
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
