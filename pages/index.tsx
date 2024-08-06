import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { useEffect, useState } from 'react';
import contract from '../constants.json';
import { writeContract } from '@wagmi/core'


const Home: NextPage = () => {

  const name = "Adrian";
  const { writeContract } = useWriteContract({})
  const result = useReadContract({
    abi: contract.abi,
    address: contract.address as `0x${string}`,
    functionName: 'getMessage'

  });

  const [text, setText] = useState("");

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
  useEffect(() => {
    if(result.data){
      console.log(result.data);
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

  return (
    <div className={styles.container}>
      <Head>
        <title>RainbowKit App</title>
        <meta
          content="Generated by @rainbow-me/create-rainbowkit"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <ConnectButton />

        <h1 className={styles.title}>
          Welcome to <a href="">RainbowKit</a> + <a href="">wagmi</a> +{' '}
          <a href="https://nextjs.org">Next.js!</a>
        </h1>
        <div>
          <p>{text == "" ? "" : `Hola ${name} el valor es ${text}`}</p>
          <form onSubmit = {updateText} className={styles.form_main} >
            <label>Digite el nuevo texto: </label>
            <input type="text" name="name"></input>
            <div>
              <button type="submit">Actualizar mensaje</button>
            </div>
          </form>
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
          Made with ❤️ by your frens at 🌈
        </a>
      </footer>
    </div>
  );
};

export default Home;
