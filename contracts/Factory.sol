// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Exchange.sol";
import "./IFactory.sol";

contract Factory {
    mapping(address => address) public tokenToExchange;

    function createExchange(address tokenAddress) public returns (address) {
        //check the addr is not 0 and exchange does not already exist

        require(tokenAddress != address(0), "can't be null addr");
        require(
            tokenToExchange[tokenAddress] == address(0),
            "exchange exists for this token"
        );

        Exchange exchange = new Exchange(tokenAddress);
        tokenToExchange[tokenAddress] = address(exchange);

        return address(exchange);
    }

    function getExchange(address tokenAddress) external view returns (address) {
        return tokenToExchange[tokenAddress];
    }
}
