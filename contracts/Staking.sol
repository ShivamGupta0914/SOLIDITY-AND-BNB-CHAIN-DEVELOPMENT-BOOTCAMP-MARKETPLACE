// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

contract Staking is
  Initializable,
  Ownable2StepUpgradeable,
  AccessControlUpgradeable
{
  bytes32 constant DEFAULT_ROLE = keccak256("DEFAULT_ROLE");

  using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
  struct StakerDetail {
    uint256 blockNumber;
    address ERC20Contract;
  }

  uint256 public start;
  uint256 public end;
  uint256 updatedBlockNumber;

  mapping(address => uint256) reward;
  mapping(address => uint256) balance;
  mapping(address => StakerDetail) staker;

  EnumerableSetUpgradeable.AddressSet private _whitList;

  /// @dev To check msg.sender able to stake or not
  modifier checkStakeTime() {
    require(start != 0, "stake has not started");
    require(block.timestamp <= end, "stake time has ended");
    _;
  }
  /// @notice To check caller is owner
  modifier checkOwner() {
    require(hasRole(DEFAULT_ROLE, msg.sender), "Caller is not a owner");
    _;
  }

  /// @notice initialize state once
  /// @dev it initializes contract owner and setupRole
  function initialize() external initializer {
    _setupRole(DEFAULT_ROLE, msg.sender);
  }

  /// @notice add new ERC20 contract to whiteList
  /// @dev add ERC20 contract address in whiteList set
  function addWhiteList(address value) external checkOwner returns (bool) {
    return _whitList.add(value);
  }

  /// @notice remove ERC20 contract from whiteList
  /// @dev remove ERC20 contract address in whiteList set
  function removeWhiteList(address value) external checkOwner returns (bool) {
    return _whitList.remove(value);
  }

  /// @notice owner start staking so that user can stake
  /// @dev owner change state of start and end for user to stake
  function startStack(uint256 _hours) external checkOwner {
    start = block.timestamp;
    end += start + _hours * 60 * 60;
  }

  /// @notice user can stake its coins by this stake function
  /// @dev this add user stake amount and contract token address and block number at staking time in stacker
  function stake(uint256 _amount, address _ERC20) external checkStakeTime {
    require(_whitList.contains(_ERC20), "token is not white list token");
    balance[msg.sender] += _amount;
    staker[msg.sender] = StakerDetail(block.number, _ERC20);
    IERC20Upgradeable(_ERC20).transferFrom(msg.sender, address(this), _amount);
  }

  /// @notice user can withdraw its staked token
  /// @dev give msg.sender its staked token and update its reward
  function withdrawStakToken() external {
    require(balance[msg.sender] != 0, "have not staked");
    address _ERC20 = staker[msg.sender].ERC20Contract;
    IERC20Upgradeable(_ERC20).transfer(msg.sender, balance[msg.sender]);
    uint256 rewardAmount;
    if (block.timestamp <= end) {
      rewardAmount = (block.number - staker[msg.sender].blockNumber) / 5;
    } else {
      rewardAmount = (updatedBlockNumber - staker[msg.sender].blockNumber) / 5;
    }
    reward[msg.sender] = rewardAmount;
    balance[msg.sender] = 0;
  }

  /// @dev only owner can updatedBlockNumber when stake time has ended
  function updateTimestamp() external checkOwner {
    require(block.timestamp == end, "time is not equal to end");
    updatedBlockNumber = block.number;
  }

  /// @notice reward amount of owner
  /// @param _owner address of owner of reward
  /// @return amount of reward owner have
  function getRewardBalance(address _owner) external view returns (uint256) {
    return reward[_owner];
  }

  /// @notice check _owner is valid to claim reward
  /// @param _owner address of staker
  /// @return bool
  function check(address _owner) external view returns (bool) {
    require(end != 0 && block.timestamp > end, "stake period has not ended");
    require(
      _whitList.contains(staker[_owner].ERC20Contract),
      "token is not white list token"
    );
    return true;
  }

  function isWhitList(address value) external view returns (bool) {
    return _whitList.contains(value);
  }
}
