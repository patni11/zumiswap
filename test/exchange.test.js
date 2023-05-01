const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber = require("@ethersproject/bignumber");

const toWei = (value) => ethers.utils.parseEther(value.toString());
const fromWei = (value) =>
  ethers.utils.formatEther(
    typeof value === "string" ? value : value.toString()
  );
const getBalance = ethers.provider.getBalance;

describe("Exchange Contract", async () => {
  let owner, token, exchange, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const Token = await hre.ethers.getContractFactory("Token");
    token = await Token.deploy("Token", "TKN", (10 ** 18).toString());
    await token.deployed();

    const Exchange = await ethers.getContractFactory("Exchange");
    exchange = await Exchange.deploy(token.address);
    await exchange.deployed();
  });

  it("constructor works", async () => {
    expect(await exchange.tokenAddress()).to.equal(token.address);
  });

  describe("addLiquidity", () => {
    it("adds liquidity", async () => {
      await token.approve(exchange.address, 31337);
      await exchange.addLiquidity(31337, { value: toWei(10) });

      expect(await getBalance(exchange.address)).to.equal(toWei(10));
      expect(await exchange.getReserve()).to.equal(31337);
    });

    //allows zero amounts
    it("adds 0 liquidity", async () => {
      await token.approve(exchange.address, toWei(0));
      await exchange.addLiquidity(toWei(0), { value: toWei(0) });

      expect(await getBalance(exchange.address)).to.equal(toWei(0));
      expect(await exchange.getReserve()).to.equal(toWei(0));
    });
  });

  describe("price function", () => {
    it("gets the price of the token based on reserve", async () => {
      await token.approve(exchange.address, 100);
      await exchange.addLiquidity(100, { value: 50 });

      const tokenReserve = exchange.getReserve();
      const etherReserve = getBalance(exchange.address);

      expect(await exchange.getPrice(tokenReserve, etherReserve)).to.equal(
        "2000"
      );
    });
  });

  describe("getTokenAmount", () => {
    it("returns correct token amount", async () => {
      await token.approve(exchange.address, 100);
      await exchange.addLiquidity(100, { value: 50 });

      const tokenReserve = await exchange.getReserve();
      const etherReserve = await getBalance(exchange.address);
      console.log(tokenReserve, etherReserve);

      let tokensOut = await exchange.getTokenAmount(100);
      expect(tokensOut).to.equal("66");
    });
  });

  describe("getEthAmount", () => {
    it("returns correct token amount", async () => {
      await token.approve(exchange.address, 100);
      await exchange.addLiquidity(100, { value: 50 });

      const tokenReserve = await exchange.getReserve();
      const etherReserve = await getBalance(exchange.address);
      console.log(tokenReserve, etherReserve);

      let tokensOut = await exchange.getEthAmount(100);
      expect(tokensOut).to.equal("25");
    });
  });

  describe("ethToTokenSwap", () => {
    beforeEach(async () => {
      await token.approve(exchange.address, 100);
      await exchange.addLiquidity(100, { value: 50 });

      const tokenReserve = await exchange.getReserve();
      const etherReserve = await getBalance(exchange.address);
      console.log(tokenReserve, etherReserve);
    });

    // Things to test:-
    // 1) when tokenAmount < minToken, it does not work and throws error
    // 2) sends correct number of ERC20 to msg.sender
    // 3) increments the balance of contract by certain ETH amount

    it("throws error when tokenAmount is less than minTokens", async () => {
      try {
        // Call the function that is expected to throw an error
        await exchange.ethToTokenSwap(10, { value: 4 });

        // If the function doesn't throw an error, the test should fail
        expect(false).to.equal(true, "Error was not thrown");
      } catch (error) {
        // Check if the error message contains the expected message
        console.log("Error");
        expect(error.message).to.include("insufficient reserve");
      }
    });

    it("sends correct number of ERC20 to msg.sender", async () => {
      const oldUserBal = ethers.BigNumber.from(
        await token.balanceOf(owner.address)
      );
      console.log("OLD BALANCE", oldUserBal);

      await exchange.ethToTokenSwap(7, { value: 4 });
      const userBal = ethers.BigNumber.from(
        await token.balanceOf(owner.address)
      );
      console.log("NEW BAL", userBal);

      console.log("CHANGE IN BALANCE:", userBal.sub(oldUserBal));
      expect(userBal.sub(oldUserBal)).to.equal(7);

      const exchangeBal = await token.balanceOf(exchange.address);

      console.log("REAL CONTRACT BALANCE:", exchangeBal);
      expect(exchangeBal).to.equal(93);
    });

    it("increments the balance of contract by certain ETH amount", async () => {
      await exchange.ethToTokenSwap(7, { value: 4 });
      expect(await getBalance(exchange.address)).to.equal(54);
    });
  });

  describe("Testing full cycle of exchange", () => {
    beforeEach(async () => {
      await token.approve(exchange.address, 200);
      await exchange.addLiquidity(100, { value: 50 });

      const tokenReserve = await exchange.getReserve();
      const etherReserve = await getBalance(exchange.address);
      console.log(tokenReserve, etherReserve);

      expect(await exchange.balanceOf(owner.address)).to.equal(etherReserve);
    });

    //Things to test
    // 1) add liquidity should mint LP tokens
    // 2) swap should take into account 1% fee
    // 3) remove liquidity should burn LP tokens and distribute rewards in eth and token terms

    it("add liquidity should mint LP tokens", async () => {
      await exchange.addLiquidity(100, { value: 50 });
      expect(await exchange.balanceOf(owner.address)).to.equal(100);
    });

    it("swap should take into account 1% fee", async () => {
      await exchange.connect(user).ethToTokenSwap(7, { value: 4 });
      expect(await token.balanceOf(user.address)).to.equal(7);
    });
  });
});
