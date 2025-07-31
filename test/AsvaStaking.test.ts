import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { hexToBytes, isAddressEqual, parseEther, parseUnits } from "viem";
import hre from "hardhat";
import { ContractTypesMap } from "hardhat/types";
import { assert, expect } from "chai";

describe("AsvaStaking contract", () => {
    const deployAsvaStakingFixture = async () => {
        const [owner] = await hre.viem.getWalletClients();
        const publicClient = await hre.viem.getPublicClient();

        const chainId = await publicClient.getChainId();

        const myToken: ContractTypesMap["MyToken"] = await hre.viem.deployContract("MyToken", [], {
            client: { wallet: owner }
        });

        const asvaStaking: ContractTypesMap["AsvaStaking"] = await hre.viem.deployContract(
            "contracts/AsvaStaking.sol:AsvaStaking",
            [myToken.address],
        );

        return { asvaStaking, myToken, owner, publicClient, chainId }
    }

    const approveAndStake = async (stakingAmount: bigint) => {
        const { asvaStaking, owner, myToken } = await loadFixture(deployAsvaStakingFixture);

        const allowance = await myToken.read.allowance([owner.account.address, asvaStaking.address])

        if (stakingAmount > allowance) {
            await myToken.write.approve([asvaStaking.address, stakingAmount], { account: owner.account.address })
        }
        await asvaStaking.write.stake([stakingAmount]);
    }

    describe("Deployment", () => {
        it("should set the pool token", async () => {
            const { asvaStaking, myToken } = await loadFixture(deployAsvaStakingFixture);

            const poolTokenAddress = await asvaStaking.read.getPoolToken();
            assert(isAddressEqual(poolTokenAddress, myToken.address));

            const totalStake = await asvaStaking.read.getTotalStake();
            assert.equal(totalStake, parseUnits('0', 18));
        })
    })

    describe("Staking", () => {
        it("should stake user funds and update the state", async () => {
            const stakingAmount = parseUnits('10', 18);
            const { asvaStaking, owner, myToken } = await loadFixture(deployAsvaStakingFixture);

            const initialUserStake = await asvaStaking.read.getUserStake([owner.account.address])
            const initialPoolBalance = await asvaStaking.read.getTotalStake()
            const initialUserBalance = await myToken.read.balanceOf([owner.account.address])

            await approveAndStake(stakingAmount);

            const finalUserStake = await asvaStaking.read.getUserStake([owner.account.address]);
            assert.equal(finalUserStake, initialUserStake + stakingAmount);

            const finalPoolBalance = await asvaStaking.read.getTotalStake();
            assert.equal(finalPoolBalance, initialPoolBalance + stakingAmount);

            const finalUserBalance = await myToken.read.balanceOf([owner.account.address]);
            assert.equal(finalUserBalance, initialUserBalance - stakingAmount);
        })
    })

    describe("Unstaking", () => {
        it("should unstake user funds and update the state", async () => {
            const unstakingAmount = parseUnits('5', 18);
            const { asvaStaking, owner, myToken } = await loadFixture(deployAsvaStakingFixture);

            await approveAndStake(unstakingAmount);

            const initialUserStake = await asvaStaking.read.getUserStake([owner.account.address])
            const initialPoolBalance = await asvaStaking.read.getTotalStake()
            const initialUserBalance = await myToken.read.balanceOf([owner.account.address])

            await asvaStaking.write.unstake([unstakingAmount]);

            const finalUserStake = await asvaStaking.read.getUserStake([owner.account.address]);
            assert.equal(finalUserStake, initialUserStake - unstakingAmount);

            const finalPoolBalance = await asvaStaking.read.getTotalStake();
            assert.equal(finalPoolBalance, initialPoolBalance - unstakingAmount);

            const finalUserBalance = await myToken.read.balanceOf([owner.account.address]);
            assert.equal(finalUserBalance, initialUserBalance + unstakingAmount);
        })
    })

    describe("Validation", () => {
        it("should revert if amount zero is staked", async () => {
            const { asvaStaking } = await loadFixture(deployAsvaStakingFixture)
            await expect(asvaStaking.write.stake([parseUnits('0', 18)])).to.be.rejected;
        });

        it("should revert if amount zero is unstaked", async () => {
            const stakingAmount = parseUnits('10', 18);
            const unstakingAmount = parseUnits('0', 18);

            const { asvaStaking } = await loadFixture(deployAsvaStakingFixture);

            approveAndStake(stakingAmount)

            await expect(asvaStaking.write.unstake([unstakingAmount])).to.be.rejected
        });

        it("should revert if user staked balance is less than unstaked amount", async () => {
            const stakingAmount = parseEther('10');
            const unstakingAmount = parseEther('15');

            const { asvaStaking } = await loadFixture(deployAsvaStakingFixture);

            approveAndStake(stakingAmount)

            await expect(asvaStaking.write.unstake([unstakingAmount])).to.be.rejected
        })
    })
})