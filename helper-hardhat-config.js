const { ethers } = require("hardhat");

const networkConfig = {
  4: {
    name: "rinkeby",
    vrfCoordinatorV2: "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B",
    gasLane:
      "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311",
    subscriptionId: "9495",
    callbackGasLimit: "500000",
    keepersUpdateInterval: "30",
    ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
  },
  31337: {
    name: "hardhat",
    gasLane:
      "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311",
    callbackGasLimit: "500000",
    keepersUpdateInterval: "30",
  },
  1337: {
    name: "localhost",
    gasLane: "47be774db7343c9c9a13b2d8e2b4f6ee057f8c05ca7d7d1cd534d1402892cc4d",
    callbackGasLimit: "500000",
    keepersUpdateInterval: "30",
  },
  42: {
    name: "kovan",
    ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
  },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = { developmentChains, networkConfig };
