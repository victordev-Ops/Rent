import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCodeModal from "@walletconnect/qrcode-modal";
import Web3 from "web3";

const WalletConnectButton = () => {
  const [connecting, setConnecting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState("");
  const [account, setAccount] = useState("");

  // ...SVG icon definitions (no changes)...

  const handleConnect = async (walletType) => {
    setConnecting(true);
    setError("");
    setShowOptions(false);
    try {
      if (walletType === "metamask") {
        if (window.ethereum?.isMetaMask) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
        } else {
          window.open("https://metamask.io/download.html", "_blank");
          setError("Please install MetaMask");
        }
      } else if (walletType === "walletconnect") {
        const provider = new WalletConnectProvider({
          qrcodeModal: QRCodeModal,
          rpc: { 
            1: "https://mainnet.infura.io/v3/YOUR_INFURA_ID",
            5: "https://goerli.infura.io/v3/YOUR_INFURA_ID",
            11155111: "https://sepolia.infura.io/v3/YOUR_INFURA_ID"
          }
        });
        await provider.enable();
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      }
    } catch (err) {
      setError(err.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  return (
    // OUTER DIV: remove all flex/centering/minHeight/padding styles
    <div style={{
      position: "static" // Ensures static positioning
    }}>
      <div style={{
        position: "static", // No relative/absolute
        textAlign: "left",  // No centering
        // Remove maxWidth and width
        // maxWidth: "400px",
        // width: "100%"
      }}>
        <motion.button
          style={{
            background: account ? "#1DA1F2" : "#5D8BF4",
            color: "white",
            border: "none",
            padding: "16px 32px",
            borderRadius: "16px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            // width: "100%",   // <-- REMOVE THIS LINE
            justifyContent: "center",
            fontSize: "19px",
            boxShadow: account 
              ? "8px 8px 16px blue, -8px -8px 16px black"
              : "8px 8px 16px black, -8px -8px 16px black",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            marginBottom: "20px"
          }}
          whileHover={{ 
            background: account ? "#43A047" : "#4D7DE0",
            boxShadow: account
              ? "4px 4px 8px blue, -4px -4px 8px blue"
              : "4px 4px 8px blue, -4px -4px 8px blue",
            y: -2
          }}
          whileTap={{ 
            scale: 0.98,
            boxShadow: "2px 2px 4px blue, -2px -2px 4px blue"
          }}
          onClick={account ? () => setAccount("") : () => setShowOptions(!showOptions)}
        >
          {connecting ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <WalletIcon />
              </motion.span>
              Connecting...
            </>
          ) : account ? (
            <>
              <EthIcon />
              {`${account.slice(0, 6)}...${account.slice(-4)}`}
            </>
          ) : (
            <>
              <WalletIcon />
              Connect Wallet
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                padding: "16px",
                width: "100%", // You can also remove or set to 'auto' if you want the dropdown to fit content
                zIndex: 100,
                border: "1px solid rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ 
                display: "flex", 
                flexDirection: "column",
                gap: "12px"
              }}>
                <WalletOption 
                  icon={<EthIcon />}
                  name="MetaMask"
                  onClick={() => handleConnect("metamask")}
                  notDetected={!window.ethereum?.isMetaMask}
                  color="#F6851B"
                />
                
                <WalletOption 
                  icon={<QRIcon />}
                  name="WalletConnect"
                  onClick={() => handleConnect("walletconnect")}
                  color="#3B99FC"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: "20px",
              padding: "16px",
              background: "#FFEBEE",
              borderRadius: "12px",
              color: "#C62828",
              fontSize: "14px",
              overflow: "hidden",
              borderLeft: "4px solid #EF5350",
              boxShadow: "0 4px 12px rgba(239, 83, 80, 0.15)"
            }}
          >
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ...WalletOption definition (no changes)...
export default WalletConnectButton;
