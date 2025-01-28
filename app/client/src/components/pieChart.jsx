import { Doughnut, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    ArcElement,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Context } from '../context/context.jsx';
import { useContext } from 'react';
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, ArcElement);

const PieChart = () => {
    const context = useContext(Context);
    const {accData} = context;
    const creditdata = {
        datasets: [
            {
                data: [accData.carbonCredits || 100, 150],
                backgroundColor: ["#D9D9D9", "#3F3F3F",],
                borderWidth: 0,
            },
        ],
    };

    const creditoptions = {
        cutout: "70%",
        plugins: {
            tooltip: { enabled: false },
        },
    };
    return (
        <div className="flex justify-center items-center justify-center  text-white bg-[#191919] w-full rounded-lg shadow-lg">
            <div className="flex flex-col justify-center items-center text-white p-4 w-8/12 py-8 relative" >
                {/* <p className="text-xl mb-2 font-medium">Credits Left:</p> */}
                <p className="font-bold" style={{fontSize:'2rem'}}>ABC Limited</p>
                <p className="text-right">Since {accData.yearOfEstablishment || "1999"}</p>
                {
                    (() => {
                    try {
                        return <Doughnut data={creditdata} options={creditoptions} />
                    } catch { error } {
                        console.log(error)
                    }
                    })()
                
                }

                <p  style={{fontSize:'2rem'}}> 
                    {/* {accData.carbonCredits || "100"}<br/> */}
                    <span className="font-medium" >{accData.carbonCredits || "100"} Credits Left</span>
                    {/* <span className="font-bold text-xl">{accData.carbonCredits || "100"}/{accData.limit || "150"}</span> */}
                </p>

                <div className="mt-2 relative flex flex-col justify-left">
                    {/* <p className="font-bold" style={{fontSize:'2rem'}}>ABC Limited</p> */}
                    {/* <p className="text-right">Since {accData.yearOfEstablishment || "1999"}</p> */}
                    <p className="mb-2 text-xl " >Credits Limit : {accData.limit || "150"}</p>
                    <p className="text-xl">Sector : {accData.sector || "Lund"}</p>
                    <p className="text-xl">Country : {accData.sector || "India"}</p>
                </div>
            </div>
        </div>
    )
}

export default PieChart;