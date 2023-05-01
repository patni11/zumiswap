// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    uint256 public initialSupply;

    constructor(
        string memory name,
        string memory symbol,
        uint256 _initialSupply
    ) ERC20(name, symbol) {
        initialSupply = _initialSupply;
        _mint(msg.sender, initialSupply);
    }
}
