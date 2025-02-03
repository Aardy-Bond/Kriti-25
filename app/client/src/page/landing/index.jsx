import React from "react";
import logo from "../../assets/logo.png";
import img from "../../assets/img.png";
const Landing = () => {
  return (
    <div className="relative h-screen w-full">
      <style>
        {`
        .cover {
            width: 100vw;
            height: 100vh;
            object-fit: cover;
            position: fixed; /* Keeps it in the background */
            top: 0;
            left: 0;
          }
          .login-button {
            background: none;
            border: none;
            color: white;
            font-size: 1rem;
            cursor: pointer;
          }
          .login-button:hover {
            text-decoration: underline;
          }
        `}
      </style>

      {/* Background Image */}
      <img src={img} alt="" className="cover" />

      {/* Navbar */}
      <div className="absolute top-5 left-5 text-white text-xl font-semibold flex items-center space-x-2">
        <img src={logo} alt="carbonX" className="" />
      </div>
      <div className="absolute top-5 right-5 flex space-x-6 text-white">
        <button className="login-button">Login</button>
        <button className="login-button">Sign up</button>
      </div>

      {/* Centered Text - Ensured it's Above the Image */}
      <div className="relative flex flex-col items-center justify-center h-full text-white text-center z-10">
        <h1 className="text-5xl font-bold">Welcome</h1>
        <p className="text-2xl mt-2">To Carbon Trading</p>
      </div>

      {/* Footer with 3 Boxes */}
      <div className="absolute bottom-5 w-[90%] left-1/2 -translate-x-1/2 flex justify-between space-x-4">
        <div className="w-1/3 bg-black/80 rounded-2xl p-6 text-white text-center">
          <p>What we do?</p>
        </div>
        <div className="w-1/3 bg-black/80 rounded-2xl p-6 text-white text-center">
          <p>Contact us</p>
        </div>
        <div className="w-1/3 bg-black/80 rounded-2xl p-6 text-white text-center">
          <p>Our Mission</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
