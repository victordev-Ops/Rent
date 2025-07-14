import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import logo from "../../images/logo/logo.png";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css";
import { motion, AnimatePresence } from "framer-motion";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCodeModal from "@walletconnect/qrcode-modal";
import Web3 from "web3";

function NavBar() {
  const [connecting, setConnecting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState("");
  const [account, setAccount] = useState("");

  // SVG Icons
  const WalletIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 019-9"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  const EthIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v8m0 0l3-3m-3 3L9 7m3 13v-8m0 0l3 3m-3-3l-3 3"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );

  const QRIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1"
        stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1"
        stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1"
        stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1"
        stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );

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
      }
      else if (walletType === "walletconnect") {
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

  const WalletOption = ({ icon, name, onClick, notDetected = false, color = "currentColor" }) => {
    return (
      <motion.button
        className="wallet-option"
        style={{
          width: "100%",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "none",
          border: "none",
          cursor: "pointer",
          borderRadius: "8px",
          textAlign: "left",
          transition: "all 0.2s ease"
        }}
        whileHover={{
          backgroundColor: "#f8f9fa",
          transform: "translateX(2px)"
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
      >
        <div style={{ color }}>
          {icon}
        </div>
        <span style={{ flex: 1, fontSize: "14px" }}>
          {name}
        </span>
        {notDetected && (
          <span style={{ fontSize: "12px", color: "#dc3545" }}>
            Not detected
          </span>
        )}
      </motion.button>
    );
  };

  return (
    <Navbar expand="lg" className="py-3">
      <Container>
        <Navbar.Brand href="#" className="me-lg-5">
          <img className="logo" src={logo} alt="logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            <Nav.Link href="#action1">Marketplace</Nav.Link>
            <Nav.Link href="#action2" className="px-lg-3">
              About Us
            </Nav.Link>
            <Nav.Link href="#action3">Developers</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <div className="d-flex align-items-center order">
          <span className="line d-lg-inline-block d-none"></span>
          <i className="fa-regular fa-heart"></i>
          <div className="position-relative ms-3">
            <Button
              variant="primary"
              className="btn-primary d-none d-lg-inline-block"
              onClick={account ? () => setAccount("") : () => setShowOptions(!showOptions)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                minWidth: "160px",
                justifyContent: "center"
              }}
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
                  {`${account.slice(0, 4)}...${account.slice(-4)}`}
                </>
              ) : (
                <>
                  <WalletIcon />
                  Connect Wallet
                </>
              )}
            </Button>

            {/* Wallet Options Dropdown */}
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "8px",
                    background: "white",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    padding: "12px",
                    width: "200px",
                    zIndex: 1000,
                    border: "1px solid rgba(0,0,0,0.1)"
                  }}
                >
                  <div className="d-flex flex-column gap-2">
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

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  background: "#f8d7da",
                  borderRadius: "4px",
                  color: "#721c24",
                  fontSize: "14px",
                  padding: "8px 12px",
                  zIndex: 1000,
                  width: "200px",
                  border: "1px solid #f5c6cb"
                }}
              >
                {error}
              </motion.div>
            )}
          </div>
        </div>
      </Container>
    </Navbar>
  );
}

export default NavBar;
