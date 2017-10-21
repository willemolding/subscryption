# subsCryption

An Ethereum dApp for adding crypto micro payment services to your app

## Local dev setup

- Install ethereum testrpc. This simulates an ethereum network locally
- Install MetaMask (preferred) or Mist. These are browsers that allow the site to connect to the ethereum net
- Run testrpc and ensure your MetaMask/Mist is connecting to it locally
- Run `truffle compile` then `truffle migrate` to build and delploy the smart contracts to the testrpc
- Then run `npm run dev` to build the app and serve it on http://localhost:8080