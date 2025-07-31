
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'viem/chains';

const projectId = import.meta.env.VITE_PROJECT_ID;

if (!projectId) {
  throw new Error("project id not defined")
}

export const config = getDefaultConfig({
  appName: 'AsvaStaking app',
  projectId: projectId,
  chains: [sepolia],
});
