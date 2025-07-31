import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { hexToBytes, isAddressEqual, parseUnits } from "viem";
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

    const splitSignature = (signature: `0x${string}`) => {
        const bytes = hexToBytes(signature)
        const r = `0x${Buffer.from(bytes.slice(0, 32)).toString('hex')}` as `0x${string}`
        const s = `0x${Buffer.from(bytes.slice(32, 64)).toString('hex')}` as `0x${string}`
        let v = bytes[64]
        if (v < 27) v += 27
        return { v, r, s }
    }

    const permitAndStake = async (stakingAmount: bigint) => {
        const { asvaStaking, owner, myToken, chainId } = await loadFixture(deployAsvaStakingFixture);

        const nonce = await myToken.read.nonces([owner.account.address])
        const deadline = BigInt(Math.floor(Date.now() / 1000)) + 86400n;

        const signature = await owner.signTypedData({
            domain: {
                name: 'MyToken',
                version: '1',
                chainId: chainId,
                verifyingContract: myToken.address,
            },
            types: {
                Permit: [
                    { name: 'owner', type: 'address' },
                    { name: 'spender', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' },
                ],
            },
            primaryType: 'Permit',
            message: {
                owner: owner.account.address,
                spender: asvaStaking.address,
                value: stakingAmount,
                nonce,
                deadline,
            },
        })


        const { v, r, s } = splitSignature(signature);

        await myToken.write.permit([
            owner.account.address,
            asvaStaking.address,
            stakingAmount,
            deadline,
            v,
            r,
            s
        ])
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

            await permitAndStake(stakingAmount);

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

            await permitAndStake(unstakingAmount);

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
        it("should revert if amount zero is staking", async () => {
            const stakingAmount = parseUnits('0', 18);

            await expect(permitAndStake(stakingAmount)).to.be.rejectedWith('AsvaStaking_ZeroAmount');
        });

        it("should revert if amount zero is unstaked", async () => {
            const stakingAmount = parseUnits('10', 18);
            const unstakingAmount = parseUnits('0', 18);

            const { asvaStaking } = await loadFixture(deployAsvaStakingFixture);

            permitAndStake(stakingAmount)

            await expect(asvaStaking.write.unstake([unstakingAmount])).to.be.rejectedWith('AsvaStaking_ZeroAmount')
        });

        it("should revert if user staked balance is less than unstaked amount", async () => {
            const stakingAmount = parseUnits('10', 18);
            const unstakingAmount = parseUnits('15', 18);

            const { asvaStaking } = await loadFixture(deployAsvaStakingFixture);

            permitAndStake(stakingAmount)

            await expect(asvaStaking.write.unstake([unstakingAmount])).to.be.rejectedWith('AsvaStaking_InsfufficientStakedBalance')
        })
    })
})