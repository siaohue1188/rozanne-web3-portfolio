// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
Rozanne Token (RZT)
✅ 含 Ownable 权限控制
✅ 完整 ERC-20 标准实现
*/

contract MyToken {
    // 基本信息
    string public name = "Rozanne Token";
    string public symbol = "RZT";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    // 余额与授权额度
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // 拥有者地址（可mint）
    address public owner;

    // 事件
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // 构造函数：部署者成为 owner
    constructor() {
        owner = msg.sender;
    }

    // 访问控制修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ✅ 造币功能，仅限 owner
    function mint(uint256 amount) public onlyOwner {
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    // ✅ 基础转账
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    // ✅ 授权别人使用你的代币
    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    // ✅ 第三方代转（如交易所调用）
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;

        emit Transfer(from, to, amount);
        return true;
    }
}