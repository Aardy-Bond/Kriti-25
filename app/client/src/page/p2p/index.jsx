import { useContext, useEffect, useState } from "react";
import { Context } from "../../context/context.jsx";
import { BuyCredits, SellCredits } from "../../apis/p2p.contracts";
// import { SubmitSellProof , SubmitBuyProof } from "../../apis/verifierZK.js";
import { generateSellProof, generateBuyProof } from "../../configs/snark.js";
import { GetCredits } from "../../apis/iot.contracts.js";
import axios from "axios";
import { updateURI } from "../../apis/auth.contracts.js";
import CryptoJS from "crypto-js";
import { useQuery } from '@apollo/client';
import { GET_LIST,GET_PURCHASE } from "../../graphql/queries";
import jsPDF from "jspdf";
import Cards from "../../components/cards.jsx";
import Navbar from "../../components/navbar.jsx";
import { SocketContext } from "../../context/socket.jsx";
import Dialog from "../../components/dailog.jsx";
import Loader from "../../components/loader.jsx";

const P2P = () => {
  const users = [
    ["user1", "47 units", "1.13eth"],
    ["user2", "47 units", "1.13eth"],
    ["user3", "47 units", "1.13eth"],
    ["user4", "47 units", "1.13eth"],
    ["user5", "47 units", "1.13eth"],
    ["user6", "47 units", "1.13eth"],
    ["user7", "47 units", "1.13eth"],
    ["user8", "47 units", "1.13eth"],
    ["user9", "47 units", "1.13eth"],
    ["user10", "47 units", "1.13eth"],
    ["user11", "47 units", "1.13eth"],
    ["user12", "47 units", "1.13eth"],
    ["user12", "47 units", "1.13eth"],
    ["user12", "47 units", "1.13eth"],
    ["user12", "47 units", "1.13eth"],
    ["user12", "47 units", "1.13eth"],
    ["user12", "47 units", "1.13eth"],
  ];

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    price: 10,
    units: 0,
    totalPrice: 0,
  });
  const [dialogProps , setDialogProps] = useState({});
  const [openDialog , setOpenDialog] = useState(false);
  const context = useContext(Context);
  const { accData, setAccData , isConnected} = context;
  const socketContext = useContext(SocketContext);
  const {socketId} = socketContext;

  const { loading:loadingList, error:errorList, data:dataList , refetch:refetchList } = useQuery(GET_LIST, {
    variables: { first: 1,skip:0 },
});
const { loading:loadingPurchase, error:errorPurchase, data:dataPurchase , refetch:refetchPurchase } = useQuery(GET_PURCHASE, {
    variables: { first: 1,skip:0 },
});

useEffect(() => {
   console.log(isConnected)
}, [isConnected]);

useEffect(()=>{
    if(loadingList || loadingPurchase) setLoading(true);
    else setLoading('');
},[loadingList,loadingPurchase]);

useEffect(()=>{
    if(errorList || errorPurchase) setError(true);
    else setError(false);
},[errorPurchase,errorList]);


useEffect(()=>{
    if(dataList?.listeds && dataPurchase?.purchaseds) {
        const purchaseIds = dataPurchase?.purchaseds.map((item) => item.listId);

        // Filter objects in dataList that are not in dataPurchase
        const uniqueList = dataList?.listeds.filter(
            (item) => !purchaseIds.includes(item.listId)
        );

        setListings(uniqueList);
    }
},[dataList , dataPurchase])


  const handleHashing = (data) => {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      accData.key
    ).toString();
    return encrypted;
  };

  async function handleIPFSUpdate(change) {
    let data = {
      ...accData,
      carbonCredits: accData.carbonCredits + change,
      activity: activity + change
    };
    setAccData(data);
    delete data.key;
    const hashed = handleHashing(data);
    const res = await axios.post(
      "http://localhost:3000/api/v1/company/register",
      { data: hashed },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(res.data.data.cid);
    const transaction = await updateURI({
      data: {
        tokenId: accData.tokenId,
        newUri: res.data.data.cid,
      },
      address: accData.user,
    });
    if (!transaction) return;
  }

  function generateReceipt(res) {
    let response = {
      ...res,
      units: listings[index].units,
      date: Date.now(),
      price_per_credit: listings[index].price,
      totalPrice: listings[index].totalPrice,
    };
    const doc = new jsPDF();
    const formattedData = JSON.stringify(response, null, 2);
    doc.setFont("Courier", "normal");
    doc.text("Receipt Data:", 10, 10);
    doc.text(formattedData, 10, 20);

    doc.save(`receipt-${Date.now()}.pdf`);
  }

  async function handleBuy(index) {
    // const carbonCredits = GetCredits({
    //   iots: accData.iot,
    //   address: accData.user,
    // });
    // const carbonCredits = ;
    // if (!carbonCredits) return;
    // setAccData({ ...accData, carbonCredits: carbonCredits });
    let res = await generateBuyProof({
      balance: accData.carbonCredits || 100,
      units: listings[index].units,
      limit: accData.creditsLimit || 150,
    });
    if (!res) return;
    // res = await submitProof({proof:proof,publicInputs:[Number(res.publicSignals[0])],action:'buy'});
    // if(!res) return;
    res = await BuyCredits({ listId:listings[index].listId, address: accData.user });
    if (!res) return;
    await handleIPFSUpdate(listings[index].units*(-1));
    generateReceipt(res,index);
    if(socketId) {
      socketId.emit('trade' , `Anonymous bought ${listings[listId].units} credits, each for ${listings[listId].price}`)
    }
  }

  async function handleSell() {
    // let carbonCredits = GetCredits({iots:accData.iot , address:accData.user});
    // let carbonCredits = 100;
    // if (!carbonCredits) return;
    // setAccData({ ...accData, carbonCredits: carbonCredits });
    formData.totalPrice = formData.price * formData.units;
    let res = await generateSellProof({
      balance: accData.carbonCredits || 100,
      units: formData.units,
    });
    if (!res) return;
    // res = await submitProof({proof:proof , publicInputs:[Number(res.publicSignals[0])],action:'sell'});
    // if(!res) return;
    res = await SellCredits({ data: formData, address: accData.user });
    if (!res) return;
    await handleIPFSUpdate(formData.units);
  }

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };  
  
  return (
    <>
    <Navbar/>
   { openDialog &&  <Dialog msg={dialogProps.msg} closefn={dialogProps.closefn} callback={dialogProps.callback}/>}
    <div
      className="h-screen w-screen p-10 mt-[50px]"
      // style={{ "background-image": `url(${bgimg})` }}
    >
      <div className=" flex flex-col bg-[#1e1e1e] bg-opacity-90 rounded-lg">
        {/* <div className="grid grid-cols-5 mt-10 mb-10 h-20 ">
          <div></div>
          <div className=" rounded-lg bg-gradient-to-r from-[#494747]  to-[#272727] h-26"></div>
          <div></div>
          <div className=" rounded-lg bg-gradient-to-r from-[#494747]  to-[#272727] h-26"></div>
          <div></div>
        </div> */}
        <div className="flex justify-between min-h-[40vw] p-10">
          <div className="justify-center w-[20vw] flex flex-col">
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="w-full pr-10"
            >
              <br />
              <label className="text-left">eth:</label>
              <div className="relative w-full pl-1 pr-1">
                <div className="flex justify-between text-xs text-white">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
              <input
                className="w-full"
                type="range"
                name="price"
                defaultValue="10"
                min="0"
                max="100"
                onChange={handleChange}
              />

              <br />
              <label className="text-left">creds:</label>
              <div className="relative w-full pl-1 pr-1">
                <div className="flex justify-between text-xs text-white">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
              <input
                className="w-full"
                type="range"
                name="price"
                defaultValue="10"
                min="0"
                max="100"
                onChange={handleChange}
              />
              {/* {formData.price} */}
              <br />

              <button type="submit" onClick={()=>{
                setOpenDialog(true)
                setDialogProps({
                  msg:`Sure to sell ${formData.units} credits for ${formData.price} eth each?`,
                  closefn:setOpenDialog,
                  callback:handleSell
                })
              }}
              className="ml-5 mr-5 h-auto cursor-button border-[0px] border-[solid] border-[rgb(187,204,0)] text-[22px] text-[rgb(255,_255,_255)] px-[30px] py-[10px] [transition:300ms] w-[50%] [box-shadow:rgba(14,_30,_37,_0.12)_0px_2px_4px_0px,_rgba(14,_30,_37,_0.32)_0px_2px_16px_0px] rounded-[50px] bg-[rgb(204,_0,_0)] hover:text-[rgb(255,_255,_255)] hover:w-[60%] hover:bg-[rgb(30,_30,_30)_none_repeat_scroll_0%_0%_/_auto_padding-box_border-box] hover:border-[rgb(255,_255,_255)] hover:border-4 hover:border-solid">
                SELL
              </button>
            </form>
          </div>

          <div className="h-[70vh] flex overflow-y-auto">
              {
                loading? (
                  <div className="w-[70vw] flex justify-center items-center">
                  <Loader/>
                  </div>
                ):(
                  <div className="grid grid-cols-3 gap-4 col-span-3">
                  {users.map(([uname, eth, percent] , index) => (
                    <Cards key={index} uname={uname} eth={eth} percent={percent} />
                  ))}
                </div>
                )
              }
          </div>

        </div>
        
        
      </div>      
    </div>
    </>
  );
};
export default P2P;
