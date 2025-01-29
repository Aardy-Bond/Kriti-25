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
import bgimg from "../../styles/background-image.jpg";
import Cards from "../../components/cards.jsx";

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
  ];

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    price: 10,
    units: 0,
    totalPrice: 0,
  });
  const context = useContext(Context);
  const { accData, setAccData } = context;

  async function getListings() {
    //use graphQL for this instead
    try {
      const res = await GetListings();
      if (!res) throw new Error("Some Error Occured");
      setListings(res);
      setLoading(false);
    } catch (error) {
      console.log("Some Error Occured");
      setLoading(false);
      setError("Could not Fetch the Market");
    }
  }
  useEffect(() => {
    getListings();
  }, []);

  const handleHashing = (formData) => {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(formData),
      accData.key
    ).toString();
    return encrypted;
  };

  async function handleIPFSUpdate() {
    //get the recent credits from the iot contract-d
    //update the accData in the client-d
    //proceed with the handleBuy()-d
    //after the transaction's success, update the data on the IPFS-d
    //finally update in the contract
    let data = {
      ...accData,
      carbonCredits: accData.carbonCredits - formData.units,
    };
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
    res = {
      ...res,
      units: formData.units,
      date: Date.now(),
      price_per_credit: formData.price,
      totalPrice: formData.totalPrice,
    };
    const doc = new jsPDF();
    const formattedData = JSON.stringify(res, null, 2);
    doc.setFont("Courier", "normal");
    doc.text("Receipt Data:", 10, 10);
    doc.text(formattedData, 10, 20);

    doc.save(`receipt-${Date.now()}.pdf`);
  }

  async function handleBuy(listId) {
    const carbonCredits = GetCredits({
      iots: accData.iot,
      address: accData.user,
    });
    // const carbonCredits = 100;
    if (!carbonCredits) return;
    setAccData({ ...accData, carbonCredits: carbonCredits });
    res = await generateBuyProof({
      balance: accData.carbonCredits || 100,
      units: formData.units,
      limit: accData.creditsLimit || 150,
    });
    if (!res) return;
    const proof = {
      ...res.proof,
      pi_a: [res.proof.pi_a[0], res.proof.pi_a[1]],
      pi_b: [res.proof.pi_b[0], res.proof.pi_b[1]],
      pi_c: [res.proof.pi_c[0], res.proof.pi_c[1]],
    };
    // res = await submitProof({proof:proof,publicInputs:[Number(res.publicSignals[0])],action:'buy'});
    // if(!res) return;
    res = await BuyCredits({ listId, address: accData.user });
    if (!res) return;
    await handleIPFSUpdate();
    generateReceipt(res);
  }

  async function handleSell() {
    // let carbonCredits = GetCredits({iots:accData.iot , address:accData.user});
    let carbonCredits = 100;
    if (!carbonCredits) return;
    setAccData({ ...accData, carbonCredits: carbonCredits });
    formData.totalPrice = formData.price * formData.units;
    let res = await generateSellProof({
      balance: accData.carbonCredits || 100,
      units: formData.units,
    });
    if (!res) return;
    const proof = {
      ...res.proof,
      pi_a: [res.proof.pi_a[0], res.proof.pi_a[1]],
      pi_b: [res.proof.pi_b[0], res.proof.pi_b[1]],
      pi_c: [res.proof.pi_c[0], res.proof.pi_c[1]],
    };
    // res = await submitProof({proof:proof , publicInputs:[Number(res.publicSignals[0])],action:'sell'});
    // if(!res) return;
    console.log(accData);
    res = await SellCredits({ data: formData, address: accData.user });
    if (!res) return;
    await handleIPFSUpdate();
  }

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };  
  
  return (
    <div
      className="h-screen w-screen p-10"
      style={{ "background-image": `url(${bgimg})` }}
    >
      <div className=" flex flex-col bg-[#1e1e1e] bg-opacity-90 rounded-lg">
        <div className="grid grid-cols-5 mt-10 mb-10 h-20 ">
          <div></div>
          <div className=" rounded-lg bg-gradient-to-r from-[#494747]  to-[#272727] h-26"></div>
          <div></div>
          <div className=" rounded-lg bg-gradient-to-r from-[#494747]  to-[#272727] h-26"></div>
          <div></div>
        </div>
        <div className="grid grid-cols-4 min-h-[40vw] p-10">
          <div className="justify-center flex flex-col">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSell();
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

              <button className="ml-5 mr-5 h-auto cursor-button border-[0px] border-[solid] border-[rgb(187,204,0)] text-[22px] text-[rgb(255,_255,_255)] px-[30px] py-[10px] [transition:300ms] w-[50%] [box-shadow:rgba(14,_30,_37,_0.12)_0px_2px_4px_0px,_rgba(14,_30,_37,_0.32)_0px_2px_16px_0px] rounded-[50px] bg-[rgb(204,_0,_0)] hover:text-[rgb(255,_255,_255)] hover:w-[60%] hover:bg-[rgb(30,_30,_30)_none_repeat_scroll_0%_0%_/_auto_padding-box_border-box] hover:border-[rgb(255,_255,_255)] hover:border-4 hover:border-solid">
                SELL
              </button>
            </form>
          </div>
          <div className="grid grid-cols-3 gap-4 col-span-3">
            {users.map(([uname, eth, percent]) => (
              <Cards key={uname} uname={uname} eth={eth} percent={percent} />
            ))}
          </div>
        </div>
        
        
      </div>

      {/* 

      <div style={{ color: "red" }}>{error}</div>

      {loading ? (
        <>Loading the Market...</>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {listings.length <= 0 ? (
            listings.map((list, index) => {
              return (
                <div key={index}>
                  <p>{list.units}</p>
                  <p>{list.price}</p>
                  <p>{list.total}</p>
                  <button onClick={() => handleBuy(list.id)}>Buy</button>

                </div>
              );
            })
          ) : (
            <h1>Market is Empty</h1>
          )}
        </div>
      )} */}
      
      
    </div>
  );
};
export default P2P;
