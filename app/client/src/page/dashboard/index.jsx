// import { useContext } from "react"
// import { Context } from "../../context/context.jsx";
// import { useNavigate } from "react-router";

// const Dashboard = ()=>{

//     const context = useContext(Context);
//     const {accData} = context;
//     const navigate = useNavigate();

//     return(
//         <>
//         <div>
//             <h1>{accData.businessName}</h1><h2>Sector:{accData.sector}</h2>
//             <div>Country:{accData.country}</div>
//             <button onClick={()=>{navigate('/p2p')}}>P2P</button>
//         </div>
//         </>
//     )
// }

// export default Dashboard;


import React, { useContext } from "react";
import { Context } from "../../context/context.jsx";
import trendIcon from '../../assets/trends.svg';
import { notifications } from "./fakeData/notificatiosn";
import { trends } from "./fakeData/trends";
import PieChart from "../../components/pieChart.jsx";
import LineChart from "../../components/lineChart.jsx";
import Navbar from "../../components/navbar.jsx";

function Dashboard() {

    const context = useContext(Context);
    const {accData} = context;
    const iots = [accData.iots]

  return (
    // 
    <>
    <Navbar/>
    <div class="relative to-black text-white w-full pt-[80px]">
      {/* <div class="absolute inset-0 bg-gradient-to-br from-[#ffffff] via-[#eaeaea] to-[#d6d6d6] opacity-80 blur-xl"></div> */}
      <div class="w-full h-full relative z-10  bg-[#191919] bg-opacity-0  shadow-lg ">

        <div className="w-[95%] mx-auto fit mt-4 flex gap-4 justify-between">
          <div className="flex flex-col w-full">
            <div className="w-full my-2">
              <LineChart />
            </div>

            <div className="w-full mt-2 bg-[#191919] h-fit px-4 py-4 rounded-[10px]">
              <p className="text-xl">Recent Activities:</p>
              <div className="w-full mt-4">
                {notifications.map((notification, index) =>
                  <div key={index} className="bg-[#202020] flex mb-2 items-center justify-between p-2 rounded-md my-2">
                    <p className="text-sm font-medium">{notification.msg}</p>
                    <p className="text-sm font-medium text-[#6B6B6B]">{notification.date}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-4/12 my-2">
            <PieChart />
          </div>


        {/* <div className="w-[95%] mx-auto h-fit mt-4 flex gap-4 py-4">
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
          </div> */}

          {/* <div className="w-4/12 bg-[#191919] h-fit px-4 py-4 rounded-[10px]">
            <p className="text-xl">Trends:</p>
            <div className="w-full mt-4">
              {trends.map((trend, index) =>
                <div key={index} className="bg-[#202020] flex mb-2 gap-2 items-center p-2 rounded-md my-2">
                  <img src={trendIcon} alt="trend" className="h-4" />
                  <p className="text-sm font-medium">{trend.msg}</p>
                </div>
              )}
            </div>
          </div> */}
        </div>
      </div>
    </div>
    </>
  );
}

export default Dashboard;
