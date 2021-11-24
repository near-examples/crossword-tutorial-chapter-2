import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import getConfig from './config.js';
import { viewMethodOnContract, mungeBlockchainCrossword } from './utils';

async function initCrossword() {
  const nearConfig = getConfig(process.env.NEAR_ENV || 'testnet');
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
  return { data, solutionHash };
}

initCrossword()
  .then(({ data, solutionHash }) => {
    ReactDOM.render(
      <App
        data={data}
        solutionHash={solutionHash}
      />,
      document.getElementById('root'));
  });

