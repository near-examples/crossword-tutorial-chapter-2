const nearCLICommand = `
      near call crossword.friend.testnet new_puzzle '{
        "solution_hash": "d1a5cf9ad1adefe0528f7d31866cf901e665745ff172b96892693769ad284010",
        "answers": [
      {
        "num": 1,
        "start": {
        "x": 1,
        "y": 1
      },
        "direction": "Down",
        "length": 5,
        "clue": "NFT market on NEAR that specializes in cards and comics."
      },
      {
        "num": 2,
        "start": {
        "x": 0,
        "y": 2
      },
        "direction": "Across",
        "length": 13,
        "clue": "You can move assets between NEAR and different chains, including Ethereum, by visiting ______.app"
      },
      {
        "num": 3,
        "start": {
        "x": 9,
        "y": 1
      },
        "direction": "Down",
        "length": 8,
        "clue": "NFT market on NEAR with art, physical items, tickets, and more."
      },
      {
        "num": 4,
        "start": {
        "x": 3,
        "y": 8
      },
        "direction": "Across",
        "length": 9,
        "clue": "The smallest denomination of the native token on NEAR."
      },
      {
        "num": 5,
        "start": {
        "x": 5,
        "y": 8
      },
        "direction": "Down",
        "length": 3,
        "clue": "You typically deploy a smart contract with the NEAR ___ tool."
      }
        ]
      }' --accountId crossword.friend.testnet    
    `;

module.exports = nearCLICommand