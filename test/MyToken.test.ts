import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers"
import hre from "hardhat"
import { ContractTypesMap } from "hardhat/types"
import { assert, expect } from "chai";
import { isAddressEqual, parseUnits } from "viem";

describe('MyToken contract', () => {
    const deployTokenFixature = async () => {
        const [deployer, user1] = await hre.viem.getWalletClients()
        const myToken: ContractTypesMap['MyToken'] = await hre.viem.deployContract("MyToken", [], {
            client: { wallet: deployer }
        })

        return { myToken, deployer, user1 }
    }

    describe('Deployment', () => {
        it("should set name, symbol of the token", async () => {
            const { myToken } = await loadFixture(deployTokenFixature);

            const name = await myToken.read.name();
            const symbol = await myToken.read.symbol();

            assert.equal(name, "MyToken")
            assert.equal(symbol, "MTK")
        })

        it("should set the owner of the token", async () => {
            const { myToken, deployer } = await loadFixture(deployTokenFixature);

            const owner = await myToken.read.owner();
            assert(isAddressEqual(owner, deployer.account.address));
        })

        it("should mint initial tokens to deployer", async () => {
            const { myToken, deployer } = await loadFixture(deployTokenFixature);

            const balance = await myToken.read.balanceOf([deployer.account.address]);
            assert.equal(balance, parseUnits('100000', 18));
        })
    })

    describe("Mint", async () => {
        it("should mint tokens", async () => {
            const mintAmount = parseUnits('100', 18);
            const { myToken, deployer, user1 } = await loadFixture(deployTokenFixature);

            const user1InitialBalance = await myToken.read.balanceOf([user1.account.address])

            await myToken.write.mint([user1.account.address, mintAmount], {
                account: deployer.account.address
            })

            const user1FinalBalance = await myToken.read.balanceOf([user1.account.address])

            assert.equal(user1FinalBalance, user1InitialBalance + mintAmount)
        })

        it("should revert if caller is not the owner", async () => {
            const mintAmount = parseUnits('100', 18);
            const { myToken, user1 } = await loadFixture(deployTokenFixature);

            const mint = myToken.write.mint([user1.account.address, mintAmount], {
                account: user1.account.address
            })

            await expect(mint).to.be.rejectedWith("OwnableUnauthorizedAccount")
        })
    })
})