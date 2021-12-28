import Head from "next/head";
import useMetaMask from "../hooks/useMetaMask";
import styles from "../styles/Home.module.css";

export default function Home() {
  const {
    metamask: { connectWallet, account, isValidNetwork },
    contract: {
      txCost,
      count,
      decrement,
      increment,
      setCount,
      withdraw,
      owner,
    },
  } = useMetaMask();
  return (
    <div className={styles.container}>
      <Head>
        <title>Tiny Counter</title>
        <meta name="description" content="A tiny counter smart contract" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Tiny Counter</h1>

        <p className={styles.description}>
          A counter app, created simply for Mainnet deployment experience
        </p>

        {!account || !isValidNetwork ? (
          <div className={styles.card} onClick={connectWallet}>
            <h2>Connect Wallet</h2>
            <p>Connect to the smart contract</p>
          </div>
        ) : (
          <>
            <div className={styles.display}>
              <h2>Current count</h2>
              <p>{count}</p>
            </div>

            <div className={styles.grid}>
              <div onClick={decrement} className={styles.card}>
                <h2>Decrement</h2>
                <p>Transaction cost: 0 ETH</p>
              </div>

              <div onClick={increment} className={styles.card}>
                <h2>Increment</h2>
                <p>Transaction cost: 0 ETH</p>
              </div>

              <div onClick={setCount} className={styles.card}>
                <h2>Set Count</h2>
                <p>Transaction cost: {txCost / (10 ** 9 * 10 ** 9)} ETH</p>
              </div>

              <div
                onClick={withdraw}
                className={owner === account ? styles.card : styles.disabled}
              >
                <h2>Withdraw</h2>
                <p>Only owner</p>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://www.jameshooper.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ⓒ {new Date().getFullYear()} James Hooper
        </a>
      </footer>
    </div>
  );
}
