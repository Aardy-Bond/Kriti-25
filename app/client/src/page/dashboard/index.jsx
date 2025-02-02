import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../context/context.jsx";
import PieChart from "../../components/pieChart.jsx";
import LineChart from "../../components/lineChart.jsx";
import Navbar from "../../components/navbar.jsx";
import { SocketContext } from "../../context/socket.jsx"
import { backendUrl } from "../../configs/constants.js";
import { GetCredits } from "../../apis/iot.contracts.js";

function Dashboard() {

    const context = useContext(Context);
    const {accData , setAccData , isConnected  , setIotData , iotData} = context;
    const socketContext = useContext(SocketContext);
    const {socketId , setSocketId} = socketContext;
    const iots = [accData.iots];
    const [activities , setActivities] = useState([]);


    const getCreditsTillYesterday = useMemo(() => async () => {
      let temp
      await Promise.all(
        iots.map(async (iot) => {
         temp[iot] = await GetCredits({ iot, address: accData.user })
        })
      );
      
      setIotData(temp);
    }, [iots]); 
    
    useEffect(() => {
      getCreditsTillYesterday();
    }, [getCreditsTillYesterday]); 

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

        newSocket.on("data", (data) => { //this is how much it has consumed, whereas in accData i am storing how much is left
          setIotData((prevIotData) => {
            let tempData = new Map(prevIotData); 
            let history = [...tempData.get(data.identifier)]; 
            history[history.length - 1] = carbonCredits; 
            tempData.set(data.identifier, history);
          
            let consumption = 0;
            tempData.forEach((value) => {
              consumption += value[value.length - 1]; 
            });
          
            setAccData((prevAccData) => ({
              ...prevAccData, carbonCredits:prevAccData.limit - prevAccData.activity - consumption
            }));

            return tempData;
          });
          console.log("Received carbon credits data:", data);
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
