import { useContext, useEffect, useState } from "react";
import { Context } from "../../context/context.jsx";
import { BuyCredits, SellCredits } from "../../apis/p2p.contracts";
// import { SubmitSellProof , SubmitBuyProof } from "../../apis/verifierZK.js";
import { generateSellProof , generateBuyProof } from "../../configs/snark.js";
import { GetCredits } from "../../apis/iot.contracts.js";
import axios from 'axios';
import { updateURI } from "../../apis/auth.contracts.js";
import CryptoJS from "crypto-js";
import { useQuery } from '@apollo/client';
import { GET_LIST,GET_PURCHASE } from "../../graphql/queries";
import jsPDF from "jspdf";

const P2P = ()=>{

    const [listings , setListings] = useState([]);
    const [isloading , setLoading] = useState(true);
    const [iserror , setError] = useState(false);
    const [formData , setFormData] = useState({
        price:10 , units:0 , totalPrice:0
    })
    const context = useContext(Context);
    const {accData ,  setAccData} = context;

    const { loading:loadingList, error:errorList, data:dataList , refetch:refetchList } = useQuery(GET_LIST, {
        variables: { first: 1,skip:0 },
    });
    const { loading:loadingPurchase, error:errorPurchase, data:dataPurchase , refetch:refetchPurchase } = useQuery(GET_PURCHASE, {
        variables: { first: 1,skip:0 },
    });

    //useEffect(() => {
      //  refetch({ first: 0, skip: 0 });
    //}, [refetch]);

    useEffect(()=>{
        if(loadingList || loadingPurchase) setLoading(true);
        else setLoading('');
    },[loadingList,loadingPurchase]);

    useEffect(()=>{
        console.log(errorList)
        if(errorList || errorPurchase) setError(true);
        else setError(false);
    },[errorPurchase,errorList]);


    useEffect(()=>{
        console.log(dataPurchase)
        console.log(dataList)
        if(dataList?.listeds && dataPurchase?.purchaseds) {
            const purchaseIds = dataPurchase?.purchaseds.map((item) => item.listId);

            // Filter objects in dataList that are not in dataPurchase
            const uniqueList = dataList?.listeds.filter(
                (item) => !purchaseIds.includes(item.listId)
            );

            setListings(uniqueList);
        }
    },[dataList , dataPurchase])



    const handleHashing=(formData)=>{
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(formData),accData.key).toString();
        return encrypted;
    }

    async function handleIPFSUpdate() {
        //get the recent credits from the iot contract-d
        //update the accData in the client-d
        //proceed with the handleBuy()-d
        //after the transaction's success, update the data on the IPFS-d
        //finally update in the contract
        let data = {
            ...accData , carbonCredits:accData.carbonCredits - formData.units
        }
        delete data.key;
        const hashed = handleHashing(data);
        const res = await axios.post('http://localhost:3000/api/v1/company/register' , {data:hashed} , {
            headers:{
                'Content-Type': 'application/json',
            },
        });
        console.log(res.data.data.cid);
        const transaction = await updateURI({data:{
            tokenId : accData.tokenId,
            newUri : res.data.data.cid
        },address:accData.user})
        if(!transaction) return;
    }

    function generateReceipt(res) {
        res = {...res , units:formData.units , date:Date.now() , 
            price_per_credit:formData.price , totalPrice:formData.totalPrice};
        const doc = new jsPDF();
        const formattedData = JSON.stringify(res, null, 2);
        doc.setFont("Courier", "normal");
        doc.text("Receipt Data:", 10, 10);
        doc.text(formattedData, 10, 20);
      
        doc.save(`receipt-${Date.now()}.pdf`);
    }

    async function handleBuy(listId) {
        const carbonCredits = GetCredits({iots:accData.iot , address:accData.user});
        // const carbonCredits = 100;
        if(!carbonCredits) return;
        setAccData({...accData , carbonCredits:carbonCredits});
        const res = await generateBuyProof({balance:accData.carbonCredits||100 , units:formData.units, limit:accData.creditsLimit||150}); 
        if(!res) return;
        const proof = {
            ...res.proof ,
            pi_a:[res.proof.pi_a[0] , res.proof.pi_a[1]],
            pi_b:[res.proof.pi_b[0],res.proof.pi_b[1]],
            pi_c:[res.proof.pi_c[0],res.proof.pi_c[1]],
        }
        console.log(proof);
        // res = await submitProof({proof:proof,publicInputs:[Number(res.publicSignals[0])],action:'buy'});
        // if(!res) return;
        const res1 = await BuyCredits({listId,address:accData.user});
        if(!res1) return;
        await handleIPFSUpdate();
        generateReceipt(res)
    }

    async function handleSell() {
        // let carbonCredits = GetCredits({iots:accData.iot , address:accData.user});
        let carbonCredits = 100;
        if(!carbonCredits) return;
        setAccData({...accData , carbonCredits:carbonCredits});
        formData.totalPrice = formData.price * formData.units;
        let res = await generateSellProof({balance:accData.carbonCredits||100 , units:formData.units});
        if(!res) return;
        const proof = {
            ...res.proof ,
            pi_a:[res.proof.pi_a[0] , res.proof.pi_a[1]],
            pi_b:[res.proof.pi_b[0],res.proof.pi_b[1]],
            pi_c:[res.proof.pi_c[0],res.proof.pi_c[1]],
        }
        // res = await submitProof({proof:proof , publicInputs:[Number(res.publicSignals[0])],action:'sell'});
        // if(!res) return;    
        console.log(accData);
        res = await SellCredits({data:formData,address:accData.user});
        if(!res) return;
        await handleIPFSUpdate();
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
            {iserror && "Some Error Occured"}
        </div>

        {
            isloading?
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