import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from './assets/logo.png';
import trendIcon from './assets/trends.svg';
import { notifications } from "./fakeData/notificatiosn";
import { trends } from "./fakeData/trends";
import PieChart from "./components/pieChart";
import LineChart from "./components/lineChart";

function App() {
  const [companies, setCompanies] = useState([]);
  const [selectedPDF, setSelectedPDF] = useState(null);
  // Fetch company data from backend when the component mounts
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/dashboard/getCompanyData"
        );
        console.log("Fetched data:", response.data); // Debugging log

        if (response.data.success) {
          setCompanies(response.data.data);
        } else {
          console.error("Failed to fetch company data");
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchCompanyData();
  }, []);




  const chartData = {
    labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    datasets: [
      {
        label: "Monthly Data",
        data: [40, 35, 50, 60, 45, 70, 55, 65, 50, 60, 70, 75],
        borderColor: "#FACC15",
        backgroundColor: "rgba(250, 204, 21, 0.2)",
        pointBackgroundColor: "#FACC15",
      },
    ],
  };

  

  return (
    // 
    <div class="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white h-[100vh] w-full">
      <div class="absolute inset-0 bg-gradient-to-br from-[#ffffff] via-[#eaeaea] to-[#d6d6d6] opacity-80 blur-xl"></div>
      <div class="w-full h-full relative z-10  bg-[#191919] bg-opacity-80  shadow-lg overflow-y-scroll">


        <div className="w-full h-[10vh] bg-[#1E1E1E] flex items-center justify-between px-4">
          <div className="w-3/12">
            <img src={logo} alt="logo" className="h-8" />
          </div>
          <div className="w-6/12 flex items-center justify-between">
            <p className="text-sm cursor-pointer">Dashboard</p>
            <p className="text-sm cursor-pointer">MarketPlace</p>
            <p className="text-sm cursor-pointer">Liquid Pool Identity</p>
          </div>
          <div className="w-3/12 text-right">
            <p className="text-md font-medium">Xyz pvt Ltd</p>
          </div>
        </div>

        <div className="w-[95%] mx-auto fit mt-4 flex gap-4 justify-between">
          <div className="w-8/12">
            <LineChart />
          </div>

          <div className="w-4/12">
            <PieChart />
          </div>
        </div>


        <div className="w-[95%] mx-auto h-fit mt-4 flex gap-4 py-4">
          <div className="w-8/12 bg-[#191919] h-fit px-4 py-4 rounded-[10px]">
            <p className="text-xl">Notifications:</p>
            <div className="w-full mt-4">
              {notifications.map((notification, index) =>
                <div key={index} className="bg-[#202020] flex mb-2 items-center justify-between p-2 rounded-md my-2">
                  <p className="text-sm font-medium">{notification.msg}</p>
                  <p className="text-sm font-medium text-[#6B6B6B]">{notification.date}</p>
                </div>
              )}
            </div>
          </div>

          <div className="w-4/12 bg-[#191919] h-fit px-4 py-4 rounded-[10px]">
            <p className="text-xl">Trends:</p>
            <div className="w-full mt-4">
              {trends.map((trend, index) =>
                <div key={index} className="bg-[#202020] flex mb-2 gap-2 items-center p-2 rounded-md my-2">
                  <img src={trendIcon} alt="trend" className="h-4" />
                  <p className="text-sm font-medium">{trend.msg}</p>
                </div>
              )}
            </div>
          </div>
        </div>




      </div>
    </div>
  );
}

export default App;
