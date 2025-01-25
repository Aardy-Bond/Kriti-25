import { useState } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from "./page/register/index.jsx";
import { useContext } from "react";
import { Context } from "./context/context";
import SignIn from "./page/signin/index.jsx";
import Dashboard from "./page/dashboard/index.jsx";
import P2P from "./page/p2p/index.jsx";
import KYC from "./page/kyc/index.jsx";
import styles from "./styles/Home.module.css";

import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { WagmiConfig } from "wagmi";
import { arbitrum, mainnet } from "viem/chains";

// 1. Get projectId
const projectId = "556f704d7102922b2bfd2c6b88c70969";

// 2. Create wagmiConfig
const metadata = {
  name: "web3-modal-setup",
  description: "Web3 Modal Example",
};

const chains = [mainnet, arbitrum];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains });

function App() {
  const [isNetworkSwitchHighlighted, setIsNetworkSwitchHighlighted] =
    useState(false);
  const [isConnectHighlighted, setIsConnectHighlighted] = useState(false);

  const closeAll = () => {
    setIsNetworkSwitchHighlighted(false);
    setIsConnectHighlighted(false);
  };

  const context = useContext(Context);
  const { setAccData, isConnected, setIsConnected } = context;

  const [formData, setFormData] = useState({
    tokenId: 0,
    user: "",
  });

  const [key, setKey] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  return (
    <>
      <div className="wallets">
        <WagmiConfig config={wagmiConfig}>
          <header>
            <div
              className={styles.backdrop}
              style={{
                opacity:
                  isConnectHighlighted || isNetworkSwitchHighlighted ? 1 : 0,
              }}
            />
            <div className={styles.header}>
              <div className={styles.buttons}>
                <div
                  onClick={closeAll}
                  className={`${styles.highlight} ${
                    isNetworkSwitchHighlighted ? styles.highlightSelected : ``
                  }`}
                >
                  <w3m-network-button />
                </div>
                <div
                  onClick={closeAll}
                  className={`${styles.highlight} ${
                    isConnectHighlighted ? styles.highlightSelected : ``
                  }`}
                >
                  <w3m-button />
                </div>
              </div>
            </div>
          </header>
        </WagmiConfig>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/p2p" element={<P2P />} />
          <Route path="/kyc" element={<KYC />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
