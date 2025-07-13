import React, { useEffect, useState } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";

const WalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(null);

  const SEPOLIA_CHAIN_ID = 11155111;

  const buttonStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '14px 24px',
    minWidth: '180px',
    background: 'linear-gradient(135deg, #3a36e0 0%, #6d67e4 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontFamily: '"Inter", sans-serif',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(106, 98, 255, 0.3)',
    transition: 'all 0.3s ease'
  };

  const iconStyle = {
    display: 'block',
    width: '20px',
    height: '20px',
    backgroundColor: 'currentColor',
    mask: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>\')',
    WebkitMask: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>\')',
    maskSize: 'cover',
    WebkitMaskSize: 'cover'
  };

  const connectWallet = async () => {
    try {
      let _provider;
      let _web3;

      if (window.ethereum) {
        _provider = window.ethereum;
        await _provider.request({ method: "eth_requestAccounts" });
        _web3 = new Web3(_provider);
      } else {
        _provider = new WalletConnectProvider({
          rpc: {
            [SEPOLIA_CHAIN_ID]: "https://rpc.sepolia.org",
          },
          chainId: SEPOLIA_CHAIN_ID,
        });
        await _provider.enable();
        _web3 = new Web3(_provider);
      }

      const accounts = await _web3.eth.getAccounts();
      const chainId = await _web3.eth.getChainId();

      if (chainId !== SEPOLIA_CHAIN_ID) {
        alert("Please switch to the Sepolia testnet");
        return;
      }

      setAccount(accounts[0]);
      setProvider(_provider);
      setWeb3(_web3);

      if (_provider.on) {
        _provider.on("accountsChanged", (accounts) => {
          setAccount(accounts[0] || null);
        });

        _provider.on("chainChanged", (chainId) => {
          if (parseInt(chainId, 16) !== SEPOLIA_CHAIN_ID) {
            alert("Please switch back to Sepolia testnet");
          }
          window.location.reload();
        });

        _provider.on("disconnect", () => {
          disconnectWallet();
        });
      }
    } catch (err) {
      if (err.code === 4001 || err.message === "User closed modal") {
        console.log("Wallet connection cancelled");
      } else {
        console.error("Connection error:", err);
        alert("Connection failed. See console for details.");
      }
    }
  };

  const disconnectWallet = async () => {
    if (provider?.disconnect) await provider.disconnect();
    setAccount(null);
    setProvider(null);
    setWeb3(null);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <button
        onClick={account ? disconnectWallet : connectWallet}
        style={buttonStyle}
      >
        {account ? (
          `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
        ) : (
          <>
            <span style={iconStyle}></span>
            Connect Wallet
          </>
        )}
      </button>
    </div>
  );
};

export default WalletConnect;
