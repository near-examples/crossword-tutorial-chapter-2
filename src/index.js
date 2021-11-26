import React from 'react';
import ReactDOM from 'react-dom';
import * as nearAPI from 'near-api-js';
import App from './App';
import getConfig from './config.js';
import { viewMethodOnContract, mungeBlockchainCrossword } from './utils';

async function initCrossword() {
  const nearConfig = getConfig(process.env.NEAR_ENV || 'testnet');

  // create a keyStore for signing transactions using the user's key
  // which is located in the browser local storage after user logs in
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();

  // Initializing connection to the NEAR testnet
  const near = await nearAPI.connect({ keyStore, ...nearConfig });

  // Initialize wallet connection
  const walletConnection = new nearAPI.WalletConnection(near);

  // Load in user's account data
  let currentUser;
  if (walletConnection.getAccountId()) {
    currentUser = walletConnection.getAccountId();
  }

  const chainData = await viewMethodOnContract(nearConfig, 'get_unsolved_puzzles', '{}');

  let data;
  let solutionHash;

  // There may not be any crossword puzzles to solve, check this.
  if (chainData.puzzles.length) {
    solutionHash = chainData.puzzles[0]['solution_hash'];
    data = mungeBlockchainCrossword(chainData.puzzles);
  } else {
    console.log("Oof, there's no crossword to play right now, friend.");
  }
  return { data, solutionHash, nearConfig, walletConnection, currentUser };
}

initCrossword()
  .then(({ data, solutionHash, nearConfig, walletConnection, currentUser }) => {
    ReactDOM.render(
      <App
        data={data}
        hash={solutionHash}
        nearConfig={nearConfig}
        walletConnection={walletConnection}
        currentUser={currentUser}
      />,
      document.getElementById('root'));
  });

