// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title AsvaStaking Smart Contract
 * @author Anurag Munda
 * @notice A basic smart contract to carry out staking functionalities
 */
contract AsvaStaking {
    /*==============================================================
                            STATE VARIABLES
    ==============================================================*/

    /// @dev Total amount staked currently in the pool
    uint256 private totalPoolAmount;

    /// @dev Maps a user address to their total staked amount
    mapping(address user => uint256 amountStaked) private s_userStakedBalance;


    /*==============================================================
                                FUNCTIONS
    ==============================================================*/

    /**
     * @notice Function used to stake funds
     */
    function stake() external {}

    /**
     * @notice Function used to unstake the staked funds
     */
    function unstake() external {}

    /**
     * @notice Function used to get the stake of a user
     */
    function getStake() external {}
}
