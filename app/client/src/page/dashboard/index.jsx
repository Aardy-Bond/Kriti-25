import { useContext } from "react"
import { Context } from "../../context/context.jsx";
import { useNavigate } from "react-router";

const Dashboard = ()=>{

    const context = useContext(Context);
    const {accData} = context;
    const navigate = useNavigate();

    return(
        <>
        <div>
            <h1>{accData.businessName}</h1><h2>Sector:{accData.sector}</h2>
            <div>Country:{accData.country}</div>
            <button onClick={()=>{navigate('/p2p')}}>P2P</button>
        </div>
        </>
    )
}

export default Dashboard;