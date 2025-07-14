import React, { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_PARAMS = {
  chainId: "0xaa36a7",
  chainName: "Sepolia Testnet",
  nativeCurrency: {
    name: "SepoliaETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

const WalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [balance, setBalance] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const buttonStyle = {
    padding: "14px 24px",
    minWidth: "200px",
    background: "linear-gradient(135deg, #3a36e0 0%, #6d67e4 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    fontFamily: '"Inter", sans-serif',
    fontWeight: "600",
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(106, 98, 255, 0.3)",
    transition: "all 0.3s ease",
    display: "inline-block",
  };

  const addressStyle = {
    fontFamily: "monospace",
    color: "#3a36e0",
    fontSize: "0.95rem",
    cursor: "pointer",
    marginTop: "8px",
    wordBreak: "break-word",
  };

  const infoBoxStyle = {
    marginTop: "20px",
    padding: "12px",
    backgroundColor: "#f4f4ff",
    borderRadius: "12px",
    textAlign: "center",
    fontSize: "0.95rem",
    color: "#444",
  };

  const switchToSepolia = async (provider) => {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_PARAMS.chainId }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [SEPOLIA_PARAMS],
        });
      } else {
        throw err;
      }
    }
  };

  const getBalance = async (_web3, address) => {
    const wei = await _web3.eth.getBalance(address);
    const eth = _web3.utils.fromWei(wei, "ether");
    setBalance(parseFloat(eth).toFixed(4));
  };

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    try {
      let provider;

      if (window.ethereum) {
        provider = window.ethereum;
        await provider.request({ method: "eth_requestAccounts" });
      } else {
        provider = new WalletConnectProvider({
          rpc: { [SEPOLIA_CHAIN_ID]: SEPOLIA_PARAMS.rpcUrls[0] },
          chainId: SEPOLIA_CHAIN_ID,
        });
        await provider.enable();
      }

      await switchToSepolia(provider);
      const web3Instance = new Web3(provider);
      const accounts = await web3Instance.eth.getAccounts();

      setWeb3(web3Instance);
      setAccount(accounts[0]);
      getBalance(web3Instance, accounts[0]);

      provider.on("accountsChanged", (accs) => {
        if (accs.length === 0) disconnectWallet();
        else {
          setAccount(accs[0]);
          getBalance(web3Instance, accs[0]);
        }
      });

      provider.on("chainChanged", () => window.location.reload());
      provider.on("disconnect", disconnectWallet);
    } catch (err) {
      console.error("Connection error:", err);
      alert("Wallet connection failed.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setWeb3(null);
    setBalance(null);
  }, []);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        const web3Instance = new Web3(window.ethereum);
        const accounts = await web3Instance.eth.getAccounts();
        const chainId = await web3Instance.eth.getChainId();
        if (chainId === SEPOLIA_CHAIN_ID) {
          setWeb3(web3Instance);
          setAccount(accounts[0]);
          getBalance(web3Instance, accounts[0]);
        }
      }
    };
    autoConnect();
  }, []);

  return (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      <button
        onClick={account ? disconnectWallet : connectWallet}
        style={buttonStyle}
      >
        {account
          ? `Disconnect (${account.slice(0, 6)}...${account.slice(-4)})`
          : connecting
          ? "Connecting..."
          : "Connect Wallet"}
      </button>

      {account && (
        <div style={infoBoxStyle}>
          <p>Wallet Address:</p>
          <p style={addressStyle} onClick={copyAddress} title="Click to copy">
            {account}
          </p>
          {copied && <span style={{ color: "green" }}>Copied!</span>}
          <p style={{ marginTop: "10px" }}>
            Balance: <strong>{balance} ETH</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
