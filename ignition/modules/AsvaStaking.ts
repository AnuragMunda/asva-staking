// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {

  const myToken = m.contract("MyToken")
  const asvaStaking = m.contract("AsvaStaking", [myToken]);

  return { myToken, asvaStaking };
});

export default DeployModule;
