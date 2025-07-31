// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AsvaStaking Smart Contract
 * @author Anurag Munda
 * @notice A basic smart contract to carry out staking functionalities
 */
contract AsvaStaking is ReentrancyGuard {
    /*==============================================================
                                ERRORS
    ==============================================================*/

    error AsvaStaking_ZeroAmount();
    error AsvaStaking_ZeroAddress();
    error AsvaStaking_InsfufficientStakedBalance();

    /*==============================================================
                                TYPE DECLARATIONS
    ==============================================================*/

    using SafeERC20 for IERC20;

    /*==============================================================
                            STATE VARIABLES
    ==============================================================*/

    /// @dev The staking token
    address private immutable i_poolToken;

    /// @dev Total amount staked currently in the pool
    uint256 private s_poolBalance;

    /// @dev Maps a user address to their total staked amount
    mapping(address user => uint256 amountStaked) private s_userStakedBalance;

    /*==============================================================
                                EVENTS
    ==============================================================*/

    event Staked(address indexed from, uint256 indexed amount);
    event Unstaked(address indexed to, uint256 indexed amount);

    /*==============================================================
                                FUNCTIONS
    ==============================================================*/

    constructor(address _poolToken) {
        require(_poolToken != address(0), AsvaStaking_ZeroAddress());
        i_poolToken = _poolToken;
    }

    /**
     * @notice Function used to stake funds
     *
     * @param _amount value to be staked
     */
    function stake(uint256 _amount) external nonReentrant {
        // amount validation
        require(_amount > 0, AsvaStaking_ZeroAmount());

        // add amount to pool balance
        s_poolBalance += _amount;
        // add amount to user stake balance
        s_userStakedBalance[msg.sender] += _amount;

        // transfer the amount from user to pool
        IERC20(i_poolToken).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );

        emit Staked(msg.sender, _amount);
    }

    /**
     * @notice Function used to unstake the staked funds
     *
     * @param _amount value to be unstaked
     */
    function unstake(uint256 _amount) external nonReentrant {
        // amount validation
        require(_amount > 0, AsvaStaking_ZeroAmount());

        // user staked balance validation
        require(
            _amount <= s_userStakedBalance[msg.sender],
            AsvaStaking_InsfufficientStakedBalance()
        );

        // decrease the pool balance amount
        s_poolBalance -= _amount;
        // decrease the user staked balance
        s_userStakedBalance[msg.sender] -= _amount;

        // transfer the unstaked amount from pool to the user
        IERC20(i_poolToken).safeTransfer(msg.sender, _amount);

        emit Unstaked(msg.sender, _amount);
    }

    /**
     * @notice Function used to get the stake of a user
     *
     * @param _user Address of the user to get the stake balance for
     * @return stakedBalance the staked amount for the user
     */
    function getUserStake(
        address _user
    ) external view returns (uint256 stakedBalance) {
        stakedBalance = s_userStakedBalance[_user];
    }

    /**
     * @notice Function to get the total balance of the pool
     *
     * @return totalStake the total stake of the pool
     */
    function getTotalStake() external view returns (uint256 totalStake) {
        totalStake = s_poolBalance;
    }

    /**
     * @notice Function used to get the stake of a user
     *
     * @return returns the pool token
     */
    function getPoolToken() external view returns (address) {
        return i_poolToken;
    }
}
