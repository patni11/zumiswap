// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public tokenAddress;

    constructor(address _tokenAddress) ERC20("UNI-Pool-LP", "UNI") {
        require(_tokenAddress != address(0), "Invalid Address");
        tokenAddress = _tokenAddress;
    }

    function addLiquidity(uint256 _amount) public payable returns (uint256) {
        if (getReserve() == 0) {
            IERC20 tokenContract = IERC20(tokenAddress);
            tokenContract.transferFrom(msg.sender, address(this), _amount);

            uint256 liquidity = address(this).balance;
            _mint(msg.sender, liquidity);
            return liquidity;
        } else {
            uint256 ethReserve = address(this).balance - msg.value;
            uint256 tokenAmount = (msg.value * getReserve()) / ethReserve;
            require(_amount >= tokenAmount, "insufficient Token amount");

            IERC20 token = IERC20(tokenAddress);
            token.transferFrom(msg.sender, address(this), tokenAmount);

            uint256 liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
            return liquidity;
        }
    }

    function getReserve() public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    function getPrice(
        uint256 primaryReserve,
        uint256 secondaryReserve
    ) public pure returns (uint256) {
        require(
            primaryReserve > 0 && secondaryReserve > 0,
            "can't be 0 or less"
        );

        return (primaryReserve * 1000) / secondaryReserve;
    }

    function _getAmount(
        uint256 amount,
        uint256 firstReserve,
        uint256 secondReserve
    ) private pure returns (uint256) {
        require(firstReserve > 0 && secondReserve > 0, "can't be 0 or less");

        uint256 inputAmtWithFee = amount * 99;
        uint256 numerator = inputAmtWithFee * secondReserve;
        uint256 denominator = (firstReserve * 100) + inputAmtWithFee;
        return numerator / denominator;
    }

    function removeLiquidity(
        uint256 _amount
    ) public returns (uint256, uint256) {
        //calculate eth amount, calculate tokenAmount, burn tokens
        require(_amount > 0, "amount must be > 0");
        uint256 ethAmount = (address(this).balance * _amount) / totalSupply();
        uint256 tokenAmount = (getReserve() * _amount) / totalSupply();
        _burn(msg.sender, _amount);

        IERC20(tokenAddress).transfer(msg.sender, tokenAmount);
        payable(msg.sender).transfer(ethAmount);

        return (ethAmount, tokenAmount);
    }

    function getTokenAmount(uint256 _ethSold) public view returns (uint256) {
        require(_ethSold > 0, "too small");
        uint256 tokenReserve = getReserve();
        return _getAmount(_ethSold, address(this).balance, tokenReserve);
    }

    function getEthAmount(uint256 _tokenSold) public view returns (uint256) {
        require(_tokenSold > 0, "too small");
        uint256 tokenReserve = getReserve();
        return _getAmount(_tokenSold, tokenReserve, address(this).balance);
    }

    function ethToTokenSwap(uint256 _minTokens) public payable {
        uint256 tokenAmount = _getAmount(
            msg.value,
            address(this).balance - msg.value,
            getReserve()
        );

        require(tokenAmount >= _minTokens, "insufficient reserve");
        IERC20(tokenAddress).transfer(msg.sender, tokenAmount);
    }

    function tokenToEthSwap(uint256 tokensSold, uint256 _minEth) public {
        uint ethAmount = _getAmount(
            _minEth,
            address(this).balance,
            getReserve()
        );

        // transfer ETH to The person
        // trasnfer ERC20 to contract
        require(ethAmount >= _minEth, "insufficient amount in reserve");

        IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            tokensSold
        );
        payable(msg.sender).transfer(ethAmount);
    }
}
