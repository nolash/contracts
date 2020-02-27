pragma solidity ^0.4.24;
import '../token/ERC20Token.sol';
import '../utility/Owned.sol';
import '../utility/TokenHolder.sol';
import '../utility/SafeMath.sol';

/**
    @dev Totally fictious money contract, for testing

    'Owned' is specified here for readability reasons
*/
contract FooToken is Owned, ERC20Token, TokenHolder {
    using SafeMath for uint256;

    /**
        @dev initializes a new FooToken instance
    */
    constructor(string _name, string _symbol, uint8 _decimals, uint256 _supply)
        public
        ERC20Token(_name, _symbol, _decimals)
    {
        balanceOf[msg.sender] = _supply; // add the value to the account balance
        totalSupply = _supply; // increase the total supply
    }

}
