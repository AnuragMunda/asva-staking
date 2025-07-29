// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 100_000 * 1e18);
    }

    function mint(address _to, uint256 _amount) public {
        _mint(_to, _amount);
    }
}
