import { useContext } from "react"
import { Context } from "../../context/context.jsx";

const Dashboard = ()=>{

    const context = useContext(Context);
    const {accData} = context;

    return(
        <>
        <div>
            <h1>{accData.businessName}</h1><h2>Sector:{accData.sector}</h2>
            <div>Country:{accData.country}</div>
        </div>
        </>
    )
}

export default Dashboard;