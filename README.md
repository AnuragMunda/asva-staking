# Asva Staking Project

This project contains smart contracts, tests, and a frontend for an ERC20 staking dApp. It uses Hardhat for development and testing, and Vite + React for the frontend.

## Project Structure

- `contracts/` — Solidity smart contracts (`AsvaStaking.sol`, `MyToken.sol`)
- `test/` — Hardhat test scripts (TypeScript)
- `frontend/` — Vite + React frontend app
- `artifacts/`, `cache/`, `coverage/` — Build, cache, and coverage outputs
- `ignition/` — Hardhat Ignition deployment modules and deployment data

## Prerequisites

- Node.js (v16 or later recommended)
- npm or yarn
- [Hardhat](https://hardhat.org/)
- [Alchemy](https://dashboard.alchemy.com/) account (for Sepolia testnet)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repo-url>
cd asva-staking
```

### 2. Install Dependencies

#### For Hardhat (root folder):
```bash
npm install
```

#### For Frontend:
Open a new tab in terminal.

```bash
cd frontend 
npm install
```

### 3. Configuration Variables
Obtain your Alchemy API key from the [Here](https://dashboard.alchemy.com/).
Now add the key in your configuration variables by running the following command in your terminal.

```bash
npx hardhat vars set INFURA_API_KEY
```
This will prompt you to enter the api key. Paste the key and press Enter.

Similarly, copy your Private Key from you wallet (e.g. Metamask). Then run the following command.

```bash
npx hardhat vars set PRIVATE_KEY
```
Paste the Private key in the prompt and press Enter.


### 4. Compile Contracts

```bash
npx hardhat compile
```

### 5. Run Tests

```bash
npx hardhat node
# In a new terminal
npx hardhat test
```

### 6. Deploy Contracts

#### Local Hardhat Network:
```bash
npx hardhat node
# In a new terminal:
npx hardhat ignition deploy ./ignition/modules/AsvaStaking.ts --network hardhat
```

**To start and use the frontend dapp, Sepolia deployment is needed. Please run the below command.**
**Once the deployment is completed, please copy the addresses for both MyToken and AsvaStaking contract. We'll use them in the next step**

#### Sepolia Testnet:
```bash
npx hardhat ignition deploy ./ignition/modules/AsvaStaking.ts --network sepolia
```

### 3. Environment Variables

Go to the /frontend folder. Create a `.env.local` file in the root frontend directory with the following:

```
VITE_PROJECT_ID=<your_wallet_connect_project_id>
VITE_TOKEN_ADDRESS=<mytoken_contract_address>
VITE_STAKING_CONTRACT_ADDRESS=<staking_contract_address>
```
You can also find these in `.env.example`. Fill the following values accordingly.

- `VITE_PROJECT_ID`: Obtain a projectId from [WalletConnect Cloud](https://dashboard.reown.com/).
- `VITE_TOKEN_ADDRESS`: MyToken contract address.
- `VITE_STAKING_CONTRACT_ADDRESS`: Staking contract address.

### 7. Run Frontend

```bash
# If not already in the frontend folder -
cd frontend
# Then start the client
npm run dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173) by default.

## Coverage

To generate a test coverage report:
```bash
SOLIDITY_COVERAGE=true npx hardhat coverage
```

## Notes
- Contracts use Solidity 0.8.28.
- Uses Hardhat Toolbox and Viem plugins.
- Artifacts and deployment data are stored in `artifacts/` and `ignition/`.

## License

MIT