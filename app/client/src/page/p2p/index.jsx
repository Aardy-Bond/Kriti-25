import { useContext, useEffect, useState } from "react";
import { Context } from "../../context/context.jsx";
import { BuyCredits, GetListings, SellCredits } from "../../apis/p2p.contracts";
import { SubmitSellProof , SubmitBuyProof } from "../../apis/verifierZK.js";
import { generateSellProof , generateBuyProof } from "../../configs/snark.js";

const P2P = ()=>{

    const [listings , setListings] = useState([]);
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState("");
    const [formData , setFormData] = useState({
        price:10 , units:0 , totalPrice:0
    })
    const context = useContext(Context);
    const {accData} = context;

    async function getListings() { //use graphQL for this insteadc
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
        let res = await generateBuyProof({balance:accData.carbonCredits||100 , units:formData.units, limit:150}) //limit ka kya karu??
        if(!res) return;
        const proof = {
            ...res.proof ,
            pi_a:[res.proof.pi_a[0] , res.proof.pi_a[1]],
            pi_b:[res.proof.pi_b[0],res.proof.pi_b[1]],
            pi_c:[res.proof.pi_c[0],res.proof.pi_c[1]],
        }
        res = await submitProof({proof:proof,publicInputs:[Number(res.publicSignals[0])],action:'buy'});
        if(!res) return;
        res = await BuyCredits({listId,address:accData.user});
        if(!res) return;
    }

    async function handleSell() {
        formData.totalPrice = formData.price * formData.units;
        let res = await generateSellProof({balance:accData.carbonCredits||100 , units:formData.units});
        if(!res) return;
        const proof = {
            ...res.proof ,
            pi_a:[res.proof.pi_a[0] , res.proof.pi_a[1]],
            pi_b:[res.proof.pi_b[0],res.proof.pi_b[1]],
            pi_c:[res.proof.pi_c[0],res.proof.pi_c[1]],
        }
        res = await submitProof({proof:proof , publicInputs:[Number(res.publicSignals[0])],action:'sell'});
        if(!res) return;
        res = await SellCredits({data:formData,address:accData.user});
        if(!res) return;
    }

    const submitProof =async({proof , publicInputs , action}) =>{
        try {
            let transaction ;
            if(action == 'sell') transaction = await SubmitSellProof({proof,publicInputs});
            else transaction = await SubmitBuyProof({proof , publicInputs});
            if(!transaction) throw new Error('Some Error occured');
            return true;
       } catch (error) {
            console.log(`submit-proof failed\n${error}`);
            return false;
       }
    }

    const handleChange = async(e)=>{
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