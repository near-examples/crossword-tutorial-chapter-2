import './App.css';
import React, { useCallback, useRef, useState } from 'react';
import Crossword from 'react-crossword-near';
import { parseSolutionSeedPhrase } from './utils';
import nearCLICommand from './near-cli-command';
import { createGridData, loadGuesses } from "react-crossword-near/dist/es/util";
import sha256 from 'js-sha256';
import SimpleDark from './loader';
import { DEFAULT_FUNCTION_CALL_GAS } from "near-api-js/src/constants";

const App = ({ data, hash, nearConfig, walletConnection, currentUser }) => {
  const crossword = useRef();
  const [solutionFound, setSolutionFound] = useState("Not correct yet");
  const [showLoader, setShowLoader] = useState(false);
  const [solutionHash, setSolutionHash] = useState(hash);
  const [transactionHash, setTransactionHash] = useState(false);

  const onCrosswordComplete = useCallback(
    async (completeCount) => {
      if (completeCount !== false) {
        let gridData = createGridData(data).gridData;
        loadGuesses(gridData, 'guesses');
        await checkSolution(gridData);
      }
    },
    []
  );

  // This function is called when all entries are filled
  async function checkSolution(gridData) {
    let seedPhrase = parseSolutionSeedPhrase(data, gridData);
    let answerHash = sha256.sha256(seedPhrase);
    // Compare crossword solution's public key with the known public key for this puzzle
    // (It was given to us when we first fetched the puzzle in index.js)
    if (answerHash === solutionHash) {
      console.log("You're correct!");
      setSolutionFound("Correct!");

      // Clean up and get ready for next puzzle
      localStorage.removeItem('guesses');
      setSolutionHash(null);
      // Show full-screen loader as we process transaction
      setShowLoader(true);
      // Send the 5 NEAR prize to the logged-in winner
      let functionCallResult = await walletConnection.account().functionCall({
        contractId: nearConfig.contractName,
        methodName: 'submit_solution',
        args: {solution: seedPhrase, memo: "Yay I won!"},
        gas: DEFAULT_FUNCTION_CALL_GAS, // optional param, by the way
        attachedDeposit: 0,
        walletMeta: '', // optional param, by the way
        walletCallbackUrl: '' // optional param, by the way
      });
      if (functionCallResult && functionCallResult.transaction && functionCallResult.transaction.hash) {
        console.log('Transaction hash for explorer', functionCallResult.transaction.hash)
        setTransactionHash(functionCallResult.transaction.hash);
      }
      setShowLoader(false);
    } else {
      console.log("That's not the correct solution. :/");
      setSolutionFound("Not correct yet");
    }
  }

  const signIn = () => {
    walletConnection.requestSignIn(
      nearConfig.contractName,
      '', // title. Optional, by the way
      '', // successUrl. Optional, by the way
      '', // failureUrl. Optional, by the way
    );
  };

  const signOut = () => {
    walletConnection.signOut();
    window.location.replace(window.location.origin + window.location.pathname);
  };

  if (showLoader) {
    return (
      <div className="wrapper">
        <header className="site-header">
        </header>
        <main className="main-area">
          <SimpleDark />
        </main>
      </div>
    )
  } else if (solutionHash) {
    // A solution hash was found, meaning there's a crossword puzzle to solve
    return (
      <div id="page">
        <h1>NEAR Crossword Puzzle</h1>
        <div id="crossword-wrapper">
          <div id="login">
            { currentUser
              ? <button onClick={signOut}>Log out</button>
              : <button onClick={signIn}>Log in</button>
            }
          </div>
          <h3>Status: { solutionFound }</h3>
          <Crossword
            data={data}
            ref={crossword}
            onCrosswordComplete={onCrosswordComplete}
          />
          <p>Thank you <a href="https://github.com/JaredReisinger/react-crossword" target="_blank" rel="noreferrer">@jaredreisinger/react-crossword</a>!</p>
        </div>
      </div>
    );
  } else {
    // No solution hash was found, let the user know
    const explorerUrl = `https://explorer.testnet.near.org/transactions/${transactionHash}`;
    return (
      <div id="page">
        <h1>NEAR Crossword Puzzle</h1>
        <div id="crossword-wrapper" className="no-puzzles">
          { transactionHash && <a href={explorerUrl} target="_blank">See transaction on NEAR Explorer</a>}
          <h2>No puzzles to solve :)</h2>
          <p>Sorry, no puzzles to solve.</p>
          <p>If you are the developer and are surprised to see this, perhaps you'll want to add a puzzle:</p>
          <p>With <a href="https://docs.near.org/docs/tools/near-cli#installation" target="_blank">NEAR CLI</a>:</p>
          <div className="cli-command">
            <code>
              {nearCLICommand}
            </code>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
