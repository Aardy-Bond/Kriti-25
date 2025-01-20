import { BrowserRouter , Route, Routes } from "react-router-dom"
import Register from './page/register/index.jsx'
import { useContext} from 'react';
import Web3 from 'web3';
import Wallet from './components/wallet';
import { Context } from './context/context';
import SignIn from "./page/signin/index.jsx";
import Dashboard from "./page/dashboard/index.jsx";
import P2P from "./page/p2p/index.jsx";

function App() {

  const context = useContext(Context)
  const {setAccData , isConnected , setIsConnected} = context

  const detectCurrentProvider = () => {
    let provider;
    if (window.ethereum) {
      provider = window.ethereum;
    } else if (window.web3) {
      provider = window.web3.currentProvider;
    } else {
      alert("Window does not support MEtamask")
    }
    return provider;
  };
  
  const onConnect = async() => {
    try {
      const currentProvider = detectCurrentProvider();
      if(currentProvider) {
        await currentProvider.request({method: 'eth_requestAccounts'});
        const web3 = new Web3(currentProvider);
        const userAccount  =await web3.eth.getAccounts();
        let ethAddress = userAccount[0];
        let ethBalance = await web3.eth.getBalance(ethAddress);
        ethBalance = web3.utils.fromWei(ethBalance, 'ether'); 
        const data = {
          balance:ethBalance, address:ethAddress
        }
        setAccData(data)
        setIsConnected(true);
      }
    } catch(err) {
      console.log(err);
    }
  }

  return (
    <>
      <div style={{display:'fixed'}}>
        {
          !isConnected && <Wallet onConnect={onConnect}/>
        }
      </div>
      <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register/>}/>
        <Route path="/sign-in" element={<SignIn/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/p2p" element={<P2P/>}/>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
