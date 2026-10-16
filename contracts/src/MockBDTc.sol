// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title MockBDTc
 * @notice Mock Digital Bangladeshi Taka (BDTc) ERC-20 token for KendraFi escrow settlement.
 * 2026 Shenzhen International FinTechathon — Tsinghua PBCSF & WeBank.
 */
contract MockBDTc {
    string public constant name = "Bangladeshi Taka Digital Coin";
    string public constant symbol = "BDTc";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "MockBDTc: NOT_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Mint initial test supply to deployer (1,000,000 BDTc)
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "MockBDTc: ZERO_ADDRESS");
        require(balanceOf[msg.sender] >= amount, "MockBDTc: INSUFFICIENT_BALANCE");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(to != address(0), "MockBDTc: ZERO_ADDRESS");
        require(balanceOf[from] >= amount, "MockBDTc: INSUFFICIENT_BALANCE");
        if (allowance[from][msg.sender] != type(uint256).max) {
            require(allowance[from][msg.sender] >= amount, "MockBDTc: INSUFFICIENT_ALLOWANCE");
            allowance[from][msg.sender] -= amount;
        }
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(balanceOf[from] >= amount, "MockBDTc: INSUFFICIENT_BALANCE");
        if (msg.sender != from && allowance[from][msg.sender] != type(uint256).max) {
            require(allowance[from][msg.sender] >= amount, "MockBDTc: INSUFFICIENT_ALLOWANCE");
            allowance[from][msg.sender] -= amount;
        }
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "MockBDTc: ZERO_ADDRESS");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
}
