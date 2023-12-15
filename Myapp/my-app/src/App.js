import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Telecom from './Telecom.json';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [TelecomStatus, setTelecomStatus] = useState(undefined);
  const [refundAmount, setRefundAmount] = useState(undefined);
  const [delayCredit, setDelayCredit] = useState(undefined);
  const [storedValue, setStoredValue] = useState(undefined);

  const [delayTime, setDelayTime] = useState(0);
  const [isDueToNatureSafety, setIsDueToNatureSafety] = useState(false);
  const [isCancelledByCustomer, setIsCancelledByCustomer] = useState(false);
  const [cancellationTimeInMinutes, setCancellationTimeInMinutes] = useState(0);
  const [amountInEther, setAmountInEther] = useState(0);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.enable();
          setWeb3(web3Instance);
          return web3Instance;
        } catch (error) {
          console.error(error);
        }
      } else if (window.web3) {
        const web3Instance = new Web3(window.web3);
        setWeb3(web3Instance);
        return web3Instance;
      } else {
        console.error('No web3 instance detected');
      }
    };

    initWeb3();
  }, []);

  useEffect(() => {
    const initContract = async () => {
      if (web3 !== undefined) {
        try {
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = Telecom.networks[networkId];
          
          if (!deployedNetwork) {
            console.error('Contract not deployed on the current network.');
            return;
          }
  
          const contract = new web3.eth.Contract(Telecom.abi, deployedNetwork.address);
          console.log('Contract initialized:', contract);
          setContract(contract);
        } catch (error) {
          console.error('Error initializing contract:', error);
        }
      }
    };
  
    initContract();
  }, [web3]);  
  

  useEffect(() => {
    const getAccount = async () => {
      if (web3 !== undefined) {
        try {
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
        } catch (error) {
          console.error('Error getting accounts:', error);
        }
      }
    };

    getAccount();
  }, [web3]);

  async function subscribeTelecom(amountInEther) {
    try {
      if (!contract) {
        console.error('Contract not initialized.');
        return;
      }  
      const weiAmount = web3.utils.toWei(amountInEther.toString(), 'ether');
      const gasLimit = 200000; // Set an appropriate gas limit
      const gasPrice = await web3.eth.getGasPrice();
      const receipt = await contract.methods.subscribeTelecom(weiAmount).send({
        from: account,
        gas: gasLimit,
        value: weiAmount,
      });

      console.log('Transaction receipt:', receipt);
    } catch (error) {
      console.error('Error in subscribeTelecom:', error);
    }
  }

  async function handleperiodendsTelecom() {
    try {
      const gasPrice = await web3.eth.getGasPrice();
      await contract.methods.periodends().send({ from: account, gas: 200000, gasPrice: gasPrice });
      const TelecomStatus = await contract.methods.status().call();
      setTelecomStatus(TelecomStatus);
    } catch (error) {
      console.error('Error in handleperiodendsTelecom:', error);
    }
  }

  async function handleDelayTelecom() {
    try {
      const gasPrice = await web3.eth.getGasPrice();
      await contract.methods.delay(isDueToNatureSafety, delayTime).send({ from: account, gas: 200000, gasPrice: gasPrice });
      const delayCredit = await contract.methods.getDelayCredit().call();
      setDelayCredit(delayCredit);
    } catch (error) {
      console.error('Error in handleDelayTelecom:', error);
    }
  }

  async function handleCancelTelecom() {
    try {
      const gasPrice = await web3.eth.getGasPrice();
      await contract.methods
        .cancel(isCancelledByCustomer, cancellationTimeInMinutes)
        .send({ from: account, gas: 200000, gasPrice: gasPrice });
      const TelecomStatus = await contract.methods.status().call();
      setTelecomStatus(TelecomStatus);
      const refundAmount = await contract.methods.getRefundAmount().call();
      setRefundAmount(refundAmount);
    } catch (error) {
      console.error('Error in handleCancelTelecom:', error);
    }
  }

  async function handleStoreValue() {
    try {
      const gasPrice = await web3.eth.getGasPrice();
      await contract.methods.storeValue(42).send({ from: account, gas: 200000, gasPrice: gasPrice });
      const storedValue = await contract.methods.storedData().call();
      setStoredValue(storedValue);
    } catch (error) {
      console.error('Error in handleStoreValue:', error);
    }
  }

  async function connectWallet() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected to MetaMask wallet:', accounts[0]);
      } else {
        console.log('Please install MetaMask to connect to the Ethereum network');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Telecom Management</h1>
        <p>Account: {account}</p>
      </header>
      <main>
        <div className="Telecom-booking">
          <h2>Book Telecom</h2>
          <input
            type="number"
            value={amountInEther}
            onChange={(e) => setAmountInEther(parseFloat(e.target.value))}
            placeholder="Amount in Ether"
          />
          <button onClick={() => subscribeTelecom(amountInEther)}>Book Telecom</button>
        </div>
        <div className="Telecom-status">
          <h2>Telecom Status Update</h2>
          <button onClick={handleperiodendsTelecom}>Telecom periodends</button>
        </div>

        <div className="Telecom-delay">
          <h2>Telecom Service Delay Compensation</h2>
          <form>
            <label htmlFor="delayTime">Delay Time in minutes:</label>
            <input
              type="number"
              id="delayTime"
              value={delayTime}
              onChange={(e) => setDelayTime(parseInt(e.target.value))}
            />
            <br />
            <input
              type="checkbox"
              id="isDueToNatureSafety"
              checked={isDueToNatureSafety}
              onChange={(e) => setIsDueToNatureSafety(e.target.checked)}
            />
            <label htmlFor="isDueToNatureSafety">Due to nature/safety</label>
          </form>
          <button onClick={handleDelayTelecom}>Service Delay</button>
          <p>Delay Credit: {delayCredit} in wei</p>
        </div>

        <div className="Telecom-cancellation">
          <h2>Service Cancellation</h2>
          <label htmlFor="delayTime">Cancellation Time in minutes from the time offered:</label>
          <input
            type="number"
            value={cancellationTimeInMinutes}
            onChange={(e) => setCancellationTimeInMinutes(parseInt(e.target.value))}
            placeholder="Cancellation Time in minutes"
          />
          <br />
          <input
            type="checkbox"
            checked={isCancelledByCustomer}
            onChange={(e) => setIsCancelledByCustomer(e.target.checked)}
          />
          <label>Cancelled by customer</label>
          <p></p>
          <button onClick={handleCancelTelecom}>Service Postponed</button>
          <p>Refund Amount: {refundAmount} in wei</p>
        </div>
      </main>
    </div>
  );
}

export default App;