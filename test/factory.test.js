require("@nomiclabs/hardhat-waffle");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (value) => ethers.utils.parseEther(value.toString());
const fromWei = (value) =>
  ethers.utils.formatEther(
    typeof value === "string" ? value : value.toString()
  );

describe("Test Factory", () => {
  let owner, factory, token;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("Token", "TKN", toWei(100000000));
    await token.deployed();

    const Factory = await ethers.getContractFactory("Factory");
    factory = await Factory.deploy();
    await factory.deployed();
  });

  it("deployed the contract", async () => {
    expect(await factory.deployed()).to.equal(factory);
  });

  describe("creates new Exchanges", () => {
    it("creates new Exchanges", async () => {
      const exchangeAddr = await factory.callStatic.createExchange(
        token.address
      );
      await factory.createExchange(token.address);

      expect(await factory.tokenToExchange(token.address)).to.equal(
        exchangeAddr
      );

      const exchange = factory.tokenToExchange(token.address);
      //   const Exchange = await ethers.getContractFactory("Exchange");
      console.log(exchange);
      expect(await exchange.name()).to.equal("UNI-Pool-LP");
      expect(await exchange.symbol()).to.equal("UNI");
      expect(await exchange.factoryContract()).to.equal(factory.address);
    });
  });
});
