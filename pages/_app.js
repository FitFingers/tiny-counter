import { MetaMaskContext } from "../hooks/useMetaMask";
import "../styles/globals.css";

function TinyCounter({ Component, pageProps }) {
  return (
    <MetaMaskContext>
      <Component {...pageProps} />
    </MetaMaskContext>
  );
}

export default TinyCounter;
