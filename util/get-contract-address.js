const networks = {
  main: process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS,
  rinkeby: process.env.NEXT_PUBLIC_RINKEBY_CONTRACT_ADDRESS,
  dev: "0x0000000000000000000000000000000000000000", // must be manually updated (for ganache)
};

export default function getContractAddress(network) {
  return networks[network];
}
