import { useContext, useEffect, useState } from "react";
import { BuyCredits, GetListings } from "../../apis/p2p.contracts";
import { Context } from "../../context/context.jsx";

const P2P = ()=>{

    const [listings , setListings] = useState([]);
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState("");
    const [formData , setFormData] = useState({
        price:10 , units:0 , totalPrice:0
    })
    const context = useContext(Context);
    const {accData} = context;

    async function getListings() {
        try {
            const res = await GetListings();
            if(!res) throw new Error('Some Error Occured');
            setListings(res);
            setLoading(false);
        } catch (error) {
            console.log('Some Error Occured')
            setLoading(false)
            setError('Could not Fetch the Market')
        }
    }
    useEffect(()=>{
        getListings();
    },[])
    
    async function handleBuy(listId) {
        const res = await BuyCredits({listId,address:accData.user});
        if(!res) throw new Error('Some Error Occured');
    }

    async function handleSell() {
        if(!formData.price===0 || !formData.units===0) return;
        formData.totalPrice = formData.price * formData.units;
    }

    const handleChange = (e)=>{
        const { name, value } = e.target;
        setFormData((prevFormData) => ({...prevFormData,[name]: value}));
    }

    return(
        <div style={{display:'flex',flexDirection:'column'}}>

        <div>
            <form onSubmit={(e)=>{
                e.preventDefault();
                handleSell()
            }}>
                <input type="text" name="units" placeholder="Enter the no. of Credits to list" onChange={handleChange}/>
                <br/>
                Price:<input type="range" name="price" defaultValue="10"  min="0" max="100" onChange={handleChange}/>{formData.price}
                <input type="submit" value="Sell"/>
            </form>
        </div>
   
        <div style={{color:'red'}}>
            {error}
        </div>

        {
            loading? 
            (
                <>
                Loading the Market...
                </>
            ):(
                <div style={{display:'flex',flexDirection:'column'}}>
                {listings.length<=0? (
                    listings.map((list,index)=>{
                        return(
                            <div key={index}>
                                <p>{list.units}</p>
                                <p>{list.price}</p>
                                <p>{list.total}</p>
                                <button onClick={()=>handleBuy(list.id)}>Buy</button>
                            </div>
                        )
                    })
                ):(<h1>Market is Empty</h1>)}
                </div>
            )
        }
        </div>
    )
}
export default P2P;