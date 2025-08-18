// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PaymentVault
 * @dev Module for opt-in USDC-on-Sei fee rails for storage/indexing (micro-payments, tips, revenue share).
 */
contract PaymentVault is ReentrancyGuard {
    IERC20 public immutable usdcToken;
    
    mapping(address => uint256) public balances;
    mapping(string => uint256) public streamPayments; // streamId => total payments
    mapping(address => uint256) public indexerEarnings;
    
    uint256 public constant INDEXING_FEE_BASIS_POINTS = 100; // 1%
    uint256 public constant BASIS_POINTS_DENOMINATOR = 10000;
    
    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event IndexingPaid(
        string indexed streamId,
        address indexed payer,
        address indexed indexer,
        uint256 amount,
        uint256 timestamp
    );
    event TipSent(
        string indexed streamId,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "Invalid USDC token address");
        usdcToken = IERC20(_usdcToken);
    }

    /**
     * @dev Deposit USDC to the vault
     */
    function depositUSDC(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");
        
        balances[msg.sender] += amount;
        
        emit Deposited(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Withdraw USDC from the vault
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        
        bool success = usdcToken.transfer(msg.sender, amount);
        require(success, "USDC transfer failed");
        
        emit Withdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Pay for indexing services
     */
    function payIndexing(
        string memory streamId,
        address indexer,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(indexer != address(0), "Invalid indexer address");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        
        // Calculate fee for protocol (if any)
        uint256 protocolFee = (amount * INDEXING_FEE_BASIS_POINTS) / BASIS_POINTS_DENOMINATOR;
        uint256 indexerPayment = amount - protocolFee;
        
        indexerEarnings[indexer] += indexerPayment;
        streamPayments[streamId] += amount;
        
        emit IndexingPaid(streamId, msg.sender, indexer, amount, block.timestamp);
    }

    /**
     * @dev Send tip to another user
     */
    function sendTip(
        string memory streamId,
        address to,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(to != address(0), "Invalid recipient address");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        emit TipSent(streamId, msg.sender, to, amount, block.timestamp);
    }

    /**
     * @dev Indexer withdraws earnings
     */
    function withdrawEarnings() external nonReentrant {
        uint256 earnings = indexerEarnings[msg.sender];
        require(earnings > 0, "No earnings to withdraw");
        
        indexerEarnings[msg.sender] = 0;
        
        bool success = usdcToken.transfer(msg.sender, earnings);
        require(success, "USDC transfer failed");
        
        emit Withdrawn(msg.sender, earnings, block.timestamp);
    }

    /**
     * @dev Get user balance
     */
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    /**
     * @dev Get total payments for a stream
     */
    function getStreamPayments(string memory streamId) external view returns (uint256) {
        return streamPayments[streamId];
    }

    /**
     * @dev Get indexer earnings
     */
    function getIndexerEarnings(address indexer) external view returns (uint256) {
        return indexerEarnings[indexer];
    }
}
