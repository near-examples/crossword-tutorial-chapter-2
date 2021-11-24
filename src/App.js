import './App.css';
import React, { useCallback, useRef, useState } from 'react';
import Crossword from 'react-crossword-near';
import { parseSolutionSeedPhrase } from './utils';
import nearCLICommand from './near-cli-command';
import { createGridData, loadGuesses } from "react-crossword-near/dist/es/util";
import sha256 from 'js-sha256';

const App = ({ data, solutionHash }) => {
  const crossword = useRef();
  const [solutionFound, setSolutionFound] = useState("Not correct yet");

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
    } else {
      console.log("That's not the correct solution. :/");
      setSolutionFound("Not correct yet");
    }
  }

  if (solutionHash) {
    // A solution hash was found, meaning there's a crossword puzzle to solve
    return (
      <div id="page">
        <h1>NEAR Crossword Puzzle</h1>
        <div id="crossword-wrapper">
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
    return (
      <div id="page">
        <h1>NEAR Crossword Puzzle</h1>
        <div id="crossword-wrapper" className="no-puzzles">
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
