const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", async () => {
  let owner, token;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();

    const Token = await hre.ethers.getContractFactory("Token");
    token = await Token.deploy("Token", "TKN", (31337).toString());
    await token.deployed();
  });

  it("constructor works", async () => {
    expect(await token.name()).to.equal("Token");
    expect(await token.symbol()).to.equal("TKN");
    expect(await token.initialSupply()).to.equal(31337);
  });

  it("mints the specified initial supply", async () => {
    expect(await token.totalSupply()).to.equal(31337);
    //expect(await token.balanceOf(owner.addres)).to.equal(31337);
  });
});
