import {
  useContext,
  createContext,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import Web3 from "web3";
import ABI from "util/abi.json";
import getContractAddress from "util/get-contract-address";

// ===================================================
// USECONTEXT => ACCESS COMPONENT, HANDLERS
// ===================================================

export const Context = createContext({});

export default function useMetaMask() {
  return useContext(Context);
}

// ===================================================
// UTIL / OPTIONS
// ===================================================

const validNetworks = ["main", "rinkeby", "private"];

const addresses = {
  main: "MAINNET",
  rinkeby: "RINKEBY",
};

// ===================================================
// METAMASK HOOK
// ===================================================

export function MetaMaskContext({ children }) {
  // STATE
  // ===================================================
  // metamask / web3 state
  const [{ account, network, isValidNetwork, contract }, updateMetaMask] =
    useReducer((state, moreState) => ({ ...state, ...moreState }), {
      account: null,
      network: null,
      isValidNetwork: false,
      contract: null,
    });

  // contract state and variables
  const [{ count, txCost, owner }, updateContractVars] = useReducer(
    (state, moreState) => ({ ...state, ...moreState }),
    {
      count: null,
      txCost: null,
      owner: null,
    }
  );

  // HANDLERS
  // ===================================================
  // connect and set the user's public key
  const connectAccount = useCallback(async () => {
    const [_account] = await window.web3.eth.requestAccounts();
    updateMetaMask({ account: _account });
  }, []);

  // connect to the network
  const connectNetwork = useCallback(async () => {
    const connectedNetwork = await window.web3.eth.net.getNetworkType();
    updateMetaMask({
      network: connectedNetwork,
      isValidNetwork: validNetworks.includes(connectedNetwork),
    });
  }, []);

  // connect to user's wallet
  const connectWallet = useCallback(async () => {
    try {
      await connectAccount();
      await connectNetwork();
    } catch (err) {
      console.warn("Couldn't connect wallet", { err });
    }
  }, [connectAccount, connectNetwork]);

  // read the requested value from the provided contract
  const readVariable = useCallback(
    async (functionName) => {
      try {
        if (!contract?.methods) throw new Error("No contract defined");
        const callback = contract.methods[functionName];
        const result = await callback?.().call({ from: account });
        return result;
      } catch (err) {
        console.warn(`Couldn't read ${functionName} from contract`, err);
      }
    },
    [account, contract]
  );

  // function to (re)initialise contract variables
  const refreshVariables = useCallback(async () => {
    if (!isValidNetwork) return;
    try {
      updateContractVars({
        count: await readVariable("count"),
        txCost: await readVariable("txCost"),
        owner: await readVariable("owner"),
      });
    } catch (err) {
      console.warn("DEBUG refresh error", { err });
    }
  }, [readVariable, isValidNetwork, account, network]);

  // contract functions
  const decrement = useCallback(async () => {
    if (!contract?.methods) return;
    await contract?.methods?.decrement().send({ from: account });
    await refreshVariables();
  }, [contract, refreshVariables]);

  const increment = useCallback(async () => {
    if (!contract?.methods) return;
    await contract?.methods?.increment().send({ from: account });
    await refreshVariables();
  }, [refreshVariables, contract]);

  const setCount = useCallback(async () => {
    if (!contract?.methods) return;
    const n = Number(window?.prompt());
    if (!n && n !== "0") return;
    await contract?.methods?.setCount(n).send({ from: account, value: txCost });
    await refreshVariables();
  }, [refreshVariables, contract, txCost]);

  const withdraw = useCallback(async () => {
    if (!contract?.methods) return;
    await contract?.methods?.withdraw().send({ from: account });
    await refreshVariables();
  }, [refreshVariables, contract]);

  // EFFECT HOOKS
  // ===================================================
  // init web3
  useEffect(() => {
    try {
      if (typeof window.web3 !== undefined) {
        window.web3 = new Web3(web3.currentProvider);
      } else {
        window.web3 = new Web3(
          // new Web3.providers.HttpProvider("http://localhost:8545") // ganache
          window.ethereum
        );
      }
    } catch (err) {
      console.debug("ERROR: failed to initialise web3", { err });
    }
  }, []);

  // initialise and store a reference to the smart contract
  useEffect(() => {
    if (!network) return;
    const address = getContractAddress(network);
    try {
      const _contract = new web3.eth.Contract(ABI, address);
      updateMetaMask({
        contract: _contract,
      });
    } catch (err) {
      console.debug("DEBUG caught useContract error", { err });
    }
  }, [network]);

  // update the variables whenever something about metamask changes
  useEffect(() => refreshVariables(), [contract, network, account]);

  // refresh the page on network change
  useEffect(() => {
    const handleNetworkChange = (chain) => window.location.reload();
    window.ethereum?.on("chainChanged", handleNetworkChange);
    return () =>
      window.ethereum?.removeListener("chainChanged", handleNetworkChange);
  }, []);

  return (
    <Context.Provider
      value={{
        metamask: {
          account,
          network,
          isValidNetwork,
          connectWallet,
        },
        contract: {
          count,
          txCost,
          owner,
          decrement,
          increment,
          setCount,
          withdraw,
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
