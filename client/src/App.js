import React, { useEffect, useState } from "react";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import clipboard from "./assets/copy-icon.svg";
import { ethers } from "ethers";
import myNft from "./utils/MyNFT.json";
import LoadSpinner from "./components/LoadSpinner";
import Blockies from "react-blockies";
import MiddleEllipsis from "react-middle-ellipsis";

const TWITTER_HANDLE = "thescoho";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://testnets.opensea.io/assets";
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0xE286094F2A8489634002703De0551Bac136Ab06E";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [mining, setMining] = useState(null);
  const [opensea, setOpenSea] = useState(null);
  const [minted, setMinted] = useState(null);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Please install metamask extension and login!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      // Setup listener! This is for the case where a user comes to our site
      // and already had their wallet connected + authorized.
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  /*
   * Implement connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
       * request access to account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * print out public address once we authorize Metamask.
       */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener();
    } catch (error) {
      console.log(error);
      let message = JSON.parse(
        error.message.substring(56).trim().replace("'", "")
      ).value.data.data;
      alert(message[Object.keys(message)[0]].reason);
    }
  };

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myNft.abi,
          signer
        );

        // This will essentially "capture" our event when our contract throws it.
        // similar to webhooks
        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Minted a fresh NFT!\r\nOpenSea link: ${OPENSEA_LINK}/${CONTRACT_ADDRESS}/${tokenId.toNumber()}\r\n(Note: OpenSea might take a while to properly display NFT, please wait a few minutes..)`
          );
          setOpenSea(
            `${OPENSEA_LINK}/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getNumberOfNFTs = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myNft.abi,
          signer
        );

        let mintedNFTs = await connectedContract.mintedNFTs();

        if (mintedNFTs === null) {
          mintedNFTs = 0;
        }

        setMinted(mintedNFTs);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myNft.abi,
          signer
        );

        setOpenSea(null);

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setMining(true);
        console.log("Mining...please wait.");

        await nftTxn.wait();
        setMining(false);
        getNumberOfNFTs();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      setMining(false);
      let message = JSON.parse(
        error.message.substring(56).trim().replace("'", "")
      ).value.data.data;
      alert(message[Object.keys(message)[0]].reason);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () =>
    !mining && (
      <button
        onClick={connectWallet}
        className="cta-button connect-wallet-button"
      >
        Connect to Wallet
      </button>
    );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    getNumberOfNFTs();
  }, []);

  const handleClickOpenSea = () => {
    window.open(opensea, "_blank");
  };

  /*
   * Added a conditional render - don't want to show Connect to Wallet if already conencted
   */
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {mining && <LoadSpinner />}
          <div className="button-container">
            {currentAccount !== "" && !mining ? (
              <button
                onClick={askContractToMintNft}
                className="cta-button mint-button"
              >
                Mint NFT
              </button>
            ) : (
              renderNotConnectedContainer()
            )}
            {opensea != null && (
              <button
                className="cta-button connect-wallet-button"
                onClick={handleClickOpenSea}
              >
                View on OpenSea
              </button>
            )}
          </div>
        </div>
        <div className="footer-container">
          <div className="twitter-container">
            <img
              alt="Twitter Logo"
              className="twitter-logo"
              src={twitterLogo}
            />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built by @${TWITTER_HANDLE}`}</a>
          </div>
          <div className="mint-count-container">
            {minted && (
              <span className="mint-count-text">{`NFTs Minted: ${minted}/${TOTAL_MINT_COUNT}`}</span>
            )}
          </div>
          {currentAccount && (
            <div className="blockie-container">
              <Blockies className="blockie" seed={currentAccount} />
              <div style={{ width: "200px", whiteSpace: "nowrap" }}>
                <MiddleEllipsis>
                  <span className="account-address">{currentAccount}</span>
                </MiddleEllipsis>
              </div>
              <img
                alt="Copy to clipboard"
                className="copy-to-clipboard"
                src={clipboard}
                onClick={() => {
                  navigator.clipboard.writeText(currentAccount);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
