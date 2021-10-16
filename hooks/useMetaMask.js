import {
  useContext,
  createContext,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import Web3 from "web3";

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

const validNetworks = ["rinkeby", "private"];

// ===================================================
// METAMASK HOOK
// ===================================================

export function MetaMaskContext({ children }) {
  // STATE
  // ===================================================
  // metamask / web3 state
  const [{ account, network, isValidNetwork }, updateMetaMask] = useReducer(
    (state, moreState) => ({ ...state, ...moreState }),
    {
      account: null,
      network: null,
      isValidNetwork: false,
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
      console.log("DEBUG connect ", {});
      await connectAccount();
      await connectNetwork();
    } catch (err) {
      console.warn("Couldn't connect wallet", { err });
    }
  }, [connectAccount, connectNetwork]);

  // read the requested value from the provided contract
  const readVariable = useCallback(
    async (functionName, contract) => {
      try {
        if (!contract?.methods) throw new Error("No contract defined");
        const callback = contract.methods[functionName];
        const result = await callback?.().call({ from: account });
        return result;
      } catch (err) {
        console.warn(`Couldn't read ${functionName} from contract`, err);
      }
    },
    [account]
  );

  // function to (re)initialise contract variables
  const refreshVariables = useCallback(async (manual) => {
    if (!network || !isValidNetwork) return;

    // update address book values
    if (isAuthenticated) {
      try {
        updateAddressBook({
          contactList: await readVariable(
            "readAllContacts",
            addressBookContract
          ),
        });
      } catch (err) {
        console.log("DEBUG", { err });
      }
    }
  }, []);

  // EFFECT HOOKS
  // ===================================================
  // init web3
  useEffect(() => {
    try {
      if (typeof window.web3 !== undefined) {
        window.web3 = new Web3(web3.currentProvider);
      } else {
        window.web3 = new Web3(
          // new Web3.providers.HttpProvider("http://localhost:8545")
          window.ethereum
        );
      }
    } catch (err) {
      console.debug("ERROR: failed to initialise web3", { err });
    }
  }, []);

  return (
    <Context.Provider
      value={{
        account,
        network,
        isValidNetwork,
        connectWallet,
      }}
    >
      {children}
    </Context.Provider>
  );
}
