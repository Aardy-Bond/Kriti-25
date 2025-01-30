import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../context/context.jsx";
import { notifications } from "./fakeData/notificatiosn";
import PieChart from "../../components/pieChart.jsx";
import LineChart from "../../components/lineChart.jsx";
import Navbar from "../../components/navbar.jsx";
import { SocketContext } from "../../context/socket.jsx"
import { backendUrl } from "../../configs/constants.js";

function Dashboard() {

    const context = useContext(Context);
    const {accData , isConnected} = context;
    const socketContext = useContext(SocketContext);
    const {socketId , setSocketId} = socketContext;
    const iots = [accData.iots];
    const [activities , setActivities] = useState([]);
    const [data , setData] = useState([]); //use this to store the data of the iot in the daywise 

    // useEffect(()=>{
    //   setActivities(notifications)
    // },[])

    async function getCreditsTillYesterday() {
      //call the GetCredits contract and update the data in the line chart accordingly
      //remember to consider for all the iot devices and display the sum of all the iot daywise
    }

    function socketInit(){
      try {

        if(socketId) {
          console.log('Connection already persists');
          return;
        }

        if(!isConnected) { 
          console.log('Not Signed in');
          if(socketId) setSocketId(null)
          return;
        }

        const newSocket = io(backendUrl);
        setSocketId(newSocket);

        newSocket.on("connect", () => {
          setSocketId(newSocket.id);
          newSocket.emit('subscribe' , iots);
          console.log("Connected to socket:", newSocket.id);
        });

        newSocket.on('activites' , (activities)=>{
          setActivities(JSON.parse(activities));
          console.log('received activities:',activities);
        })

        newSocket.on("disconnect", () => {
            console.log("Disconnected from socket");
            setSocketId(null);
        });

        newSocket.on("trade", (msg) => {
          let temp = activities;
          temp.push(msg);
          setActivities(temp);
          console.log("New trade received:", msg);
        });

        newSocket.on("data", (carbonCredits) => {
          //update the today credits in the data sent to the line chart.
          console.log("Received carbon credits data:", carbonCredits);
        });

      } catch (error) {
        console.log('connection failed!')
        console.log(error)
      }
    }

    useEffect(()=>{
      socketInit();
    },[socketId])

  return (
    <>
    <Navbar/>
    <div className="relative to-black text-white w-[100vw] h-[100vh] pt-[80px]">
      {/* <div class="absolute inset-0 bg-gradient-to-br from-[#ffffff] via-[#eaeaea] to-[#d6d6d6] opacity-80 blur-xl"></div> */}
      <div className="w-full h-full relative z-10  bg-[#191919] bg-opacity-0  shadow-lg ">

        <div className="w-[95%] mx-auto fit mt-4 flex gap-4 justify-between">
          <div className="flex flex-col w-full">
            <div className="w-full h-[55vh] my-2">
              <LineChart />
            </div>

            <div className="w-full mt-2 bg-[#191919] h-[25vh] px-4 py-4 rounded-[10px]">
              <p className="text-xl">Today's Activities:</p>
              <div className="w-full mt-4">
                {
                  activities.length > 0 ? 
                  (
                   <>
                   { activities.map((activity, index) =>
                      <div key={index} className="bg-[#202020] flex mb-2 items-center justify-between p-2 rounded-md my-2">
                        <p className="text-sm font-medium">{activity}</p>
                      </div>
                    )}
                   </>
                  ):(
                    <>No Recent Activities</>
                  )
                }
              </div>
            </div>
          </div>

          <div className="w-4/12 my-2">
            <PieChart />
          </div>

        </div>
      </div>
    </div>
    </>
  );
}

export default Dashboard;
