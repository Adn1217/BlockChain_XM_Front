import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { useEffect, useState } from 'react';
import contract from '../constants.json';
import { writeContract } from '@wagmi/core';
import dotenv from 'dotenv';

dotenv.config({
  path: './.env'
})

// console.log('BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL)
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_URL;
const XMMAIN_CONTRACT = process.env.NEXT_PUBLIC_XMMAIN_ADDRESS;

const decimals = 1000000000000000000;

const Home: NextPage = () => {

  const name = "Profe";
  const { writeContract } = useWriteContract({})
  const result = useReadContract({
    abi: contract.abi,
    address: contract.address as `0x${string}`,
    functionName: 'getMessage'

  });

  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState("");
  const [lastAmount, setLastAmount] = useState("");
  const [withdrawHash, setWithdrawHash] = useState("");

  useWatchContractEvent({
    abi: contract.abi,
    address: contract.address as `0x${string}`,
    eventName: 'messageChanged',
    onLogs(logs) {
      const newMessage = logs[logs.length - 1]?.args.newMessage;
      if(newMessage){
        setText(String(newMessage));
      }else{
       result.refetch();
      }
      console.log('new Logs: ', logs);
    }

  });

  useWatchContractEvent({
    abi: contract.abiMain,
    address: XMMAIN_CONTRACT as `0x${string}`,
    eventName: 'ack',
    onLogs(logs) {
      // const newMessage = logs[logs.length - 1]?.args.message;
      const newHash = logs[logs.length - 1]?.transactionHash;
      if(newHash){
        setWithdrawHash(String(newHash));
        setIsLoading(false);
      }else{
        setWithdrawHash(String(newHash));
      //  result.refetch();
      }
      console.log('New successful action in contract: ', logs);
    }

  });



  useEffect(() => {
    if(result.data){
      // console.log(result.data);
      setText(String(result.data))
    }
  }, [result])
  
  const updateText = (event: any) => {
    event.preventDefault();
    const newMessage = event.target[0].value;
    console.log(newMessage);
    writeContract({ 
      abi: contract.abi,
      address: contract.address as `0x${string}`,
      functionName: 'setMessage',
      args: [ newMessage ],
   })
  }

    const withdrawWithWallet = () => {
    let amount = (document.getElementById("amount")! as HTMLInputElement).value.trim();
    let receiver = (document.getElementById("receiverPubKey")! as HTMLInputElement).value.trim();
    writeContract({ 
      abi: contract.abiMain,
      address: XMMAIN_CONTRACT as `0x${string}`,
      functionName: 'withdraw',
      args: [ receiver as `0x${string}`, Number(amount)*decimals ],
    })
    setIsLoading(true);
        
  }

  async function consultUsers(){
    let myHeaders = new Headers();
    // myHeaders.append("apikey", config.myApiKey);

    let requestOptions = {
    method: 'GET',
    // redirect: 'follow',
    headers: myHeaders
    };
    try{
      let usersData = await fetch(`${BACKEND_API}users/`, requestOptions);
      // let usersData = await fetch("http://localhost:3500/users/", requestOptions);
      // console.log(resp)
      let users = await usersData.json();
      // console.log(users)
      setUsers(JSON.stringify(users,null, '\t'));
      return users;
    }catch(err){
      console.log(err);
      // console.log('Ha ocurrido un error: ', err.message!);
    }
}

  async function consultLastAmount(){
    let myHeaders = new Headers();
    let email = (document.getElementById("email")! as HTMLInputElement).value.trim();
    console.log(email)
    // myHeaders.append("apikey", config.myApiKey);
    if (email){
      let requestOptions = {
      method: 'GET',
      // redirect: 'follow',
      headers: myHeaders,
      };
      try{
        // let usersData = await fetch(BACKEND_API + "/users/", requestOptions);
        let lastAmountData = await fetch(`${BACKEND_API}purchases/web3/?`+ new URLSearchParams({email: email}), requestOptions);
        // console.log(resp)
        let lastAmount = await lastAmountData.json();
        // console.log(users)
        setLastAmount(JSON.stringify(lastAmount,null, '\t'));
        return lastAmount;
      }catch(err){
        console.log(err);
        // console.log('Ha ocurrido un error: ', err.message!);
      }
    }else{
        setLastAmount('Ingrese correo válido');
    }
}

async function withdrawAmount(){

    let myHeaders =  new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
    let amount = (document.getElementById("amount")! as HTMLInputElement).value.trim();
    let receiver = (document.getElementById("receiverPubKey")! as HTMLInputElement).value.trim();
    let payload = JSON.stringify({
        amount: Number(amount),
        receiver: receiver
      });
    console.log(amount, receiver);
    if (Number(amount) && receiver){
      let requestOptions = {
      method: 'POST',
      body: payload,
      // redirect: 'follow',
      headers: myHeaders,
      };
      try{
        // let usersData = await fetch(BACKEND_API + "/users/", requestOptions);
        setIsLoading(true);
        let withdrawData = await fetch(`${BACKEND_API}withdrawals`, requestOptions);
        // console.log(resp)
        let withdrawHash = await withdrawData.json();
        // console.log(users)
        setWithdrawHash(JSON.stringify(withdrawHash,null, '\t'));
        setIsLoading(false);
        return withdrawHash;
      }catch(err){
        setWithdrawHash('ERROR');
        console.log(err);
        // console.log('Ha ocurrido un error: ', err.message!);
      }
    }else{
        setWithdrawHash('Ingrese data válida');
    }
}

  return (
    <div className={styles.container}>
      <Head>
        <title>RainbowKit App</title>
        <meta
          content="Generated by @rainbow-me/create-rainbowkit"
          name="description"
        />
        {/* <link href="/favicon.ico" rel="icon" /> */}
      </Head>

      <main className={styles.main}>
        <ConnectButton />

        <h1 className={styles.title}>
          Welcome to <a href="">RainbowKit</a> + <a href="">wagmi</a> +{' '}
          <a href="https://nextjs.org">Next.js!</a>
        </h1>
        <div className={styles.message}>
          <h2>Actualiza en tiempo real en mensaje desde contrato BlockChain</h2>
          <p>{text == "" ? "" : `Hola ${name} el mensaje actual es: "${text}"`}</p>
          <form onSubmit = {updateText} className={styles.form_main} >
            <label>Digite el nuevo texto: </label>
            <input type="text" name="name"></input>
            <div>
              <button type="submit">Actualizar mensaje</button>
            </div>
          </form>
        </div>
        <div className={styles.users}>
          <h2>Consulta los usuarios en BD</h2>
            {/* <label>Usuarios:</label> */}
            <div onClick={() =>consultUsers()} >
              {/* <button ><img src={buyCartLogo} className="Delete-logo" alt="deleteAllLogo"/></button> */}
            <button id="getUsersButton">Consultar</button>
            </div>
        </div>
        <div>
          <p>{users == "" ? "" : `${users}`}</p>
        </div>
        <div>
          <div className={styles.users}>
              <h2>Consulta la última transacción en Contrato BlockChain</h2>
              <div>
                <label>Digite el correo del usuario: </label>
              </div>
              <input id="email" type="text" name="email"></input>
              <div onClick={() =>consultLastAmount()} >
              {/* <button ><img src={buyCartLogo} className="Delete-logo" alt="deleteAllLogo"/></button> */}
                <button>Consultar</button>
              </div>
          </div>
          <div>
            <p>{lastAmount == "" ? "" : `${lastAmount}`}</p>
          </div>
        </div>
        <div className={styles.withdraws}>
          <div >
              <h2>Realiza un retiro de fondos desde el contrato</h2>
              <div className={styles.users}>
                <div>
                  <label>Digite la dirección pública del receptor de los fondos: </label>
                </div>
                <input id="receiverPubKey" type="text" name="text"></input>
                <div>
                  <label>Digite monto [XMCOP]:</label>
                </div>
                <input id="amount" type="text" name="text"></input>
              </div>
          </div>
          <div className={styles.withdrawsButtons}>
            <div onClick={() =>withdrawAmount()} >
              {/* <button ><img src={buyCartLogo} className="Delete-logo" alt="deleteAllLogo"/></button> */}
            <button>Retirar Web2</button>
            </div>
            <div className={styles.bold} onClick={() =>withdrawWithWallet()} >
              {/* <button ><img src={buyCartLogo} className="Delete-logo" alt="deleteAllLogo"/></button> */}
            <button>Retirar con Wallet</button>
            </div>
          </div>
          <div>
            <>{isLoading ? "Transacción en proceso..." : withdrawHash == "ERROR" ? "Se ha presentado error en la transacción." : withdrawHash == "" ? "": <p><b>Transacción exitosa. <br></br> Hash:</b> {withdrawHash}</p>}</>
          </div>
        </div>
        {/* <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.tsx</code>
        </p>

        <div className={styles.grid}>
          <a className={styles.card} href="https://rainbowkit.com">
            <h2>RainbowKit Documentation &rarr;</h2>
            <p>Learn how to customize your wallet connection flow.</p>
          </a>

          <a className={styles.card} href="https://wagmi.sh">
            <h2>wagmi Documentation &rarr;</h2>
            <p>Learn how to interact with Ethereum.</p>
          </a>

          <a
            className={styles.card}
            href="https://github.com/rainbow-me/rainbowkit/tree/main/examples"
          >
            <h2>RainbowKit Examples &rarr;</h2>
            <p>Discover boilerplate example RainbowKit projects.</p>
          </a>

          <a className={styles.card} href="https://nextjs.org/docs">
            <h2>Next.js Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a
            className={styles.card}
            href="https://github.com/vercel/next.js/tree/canary/examples"
          >
            <h2>Next.js Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            className={styles.card}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div> */}
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ❤️ by your frens (Adrian) at 🌈
        </a>
      </footer>
    </div>
  );
};

export default Home;
