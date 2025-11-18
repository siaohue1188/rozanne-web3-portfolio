// Contract addresses (replace with your addresses)
const ROZANNE_TOKEN_ADDRESS = "0x88d85dc85b1e03dd6b76e34078c396b6c1fdab1f"; // Your RozanneToken address
const STAKING_CONTRACT_ADDRESS = "0xd42efb2950a1a43eed6a247edd3d99fe57f869c6"; // Your Staking contract address

// Contract ABIs (simplified for the functions we use)
const ROZANNE_TOKEN_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function mint(uint256 amount) public"
];

const STAKING_ABI = [
    "function rewardsToken() view returns (address)",
    "function stakes(address) view returns (uint256)",
    "function totalStaked() view returns (uint256)",
    "function stake(uint256 _amount) external",
    "function unstake(uint256 _amount) external",
    "function getStake(address _user) external view returns (uint256)"
];

let provider;
let signer;
let tokenContract;
let stakingContract;
let userAddress;

// Connect to MetaMask
async function connectWallet() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        // Initialize contracts
        tokenContract = new ethers.Contract(ROZANNE_TOKEN_ADDRESS, ROZANNE_TOKEN_ABI, signer);
        stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);

        // Update UI
        document.getElementById('connectWallet').style.display = 'none';
        document.getElementById('walletInfo').style.display = 'block';
        document.getElementById('stakingSection').style.display = 'block';
        document.getElementById('account').textContent = userAddress;

        // Check if the connected user is the owner (you can set your address here)
        // For now, we show minting section to everyone for testing, but in production, you should restrict it.
        document.getElementById('mintSection').style.display = 'block';

        // Load balances
        await updateBalances();
    } else {
        alert('Please install MetaMask!');
    }
}

// Update token and staked balances
async function updateBalances() {
    if (tokenContract && stakingContract && userAddress) {
        const tokenBalance = await tokenContract.balanceOf(userAddress);
        const stakedBalance = await stakingContract.getStake(userAddress);

        document.getElementById('tokenBalance').textContent = ethers.utils.formatUnits(tokenBalance, 18);
        document.getElementById('stakedBalance').textContent = ethers.utils.formatUnits(stakedBalance, 18);
    }
}

// Mint tokens (only owner can do this, but we are showing it for testing)
async function mintTokens() {
    const amount = document.getElementById('mintAmount').value;
    if (!amount) return;

    try {
        const tx = await tokenContract.mint(ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        await updateBalances();
        alert('Mint successful!');
    } catch (error) {
        console.error(error);
        alert('Mint failed!');
    }
}

// Approve staking contract to spend tokens
async function approveTokens() {
    const amount = document.getElementById('approveAmount').value;
    if (!amount) return;

    try {
        const tx = await tokenContract.approve(STAKING_CONTRACT_ADDRESS, ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        alert('Approve successful!');
    } catch (error) {
        console.error(error);
        alert('Approve failed!');
    }
}

// Stake tokens
async function stakeTokens() {
    const amount = document.getElementById('stakeAmount').value;
    if (!amount) return;

    try {
        const tx = await stakingContract.stake(ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        await updateBalances();
        alert('Stake successful!');
    } catch (error) {
        console.error(error);
        alert('Stake failed!');
    }
}

// Unstake tokens
async function unstakeTokens() {
    const amount = document.getElementById('unstakeAmount').value;
    if (!amount) return;

    try {
        const tx = await stakingContract.unstake(ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        await updateBalances();
        alert('Unstake successful!');
    } catch (error) {
        console.error(error);
        alert('Unstake failed!');
    }
}

// Event listeners
document.getElementById('connectWalletButton').addEventListener('click', connectWallet);
document.getElementById('mintButton').addEventListener('click', mintTokens);
document.getElementById('approveButton').addEventListener('click', approveTokens);
document.getElementById('stakeButton').addEventListener('click', stakeTokens);
document.getElementById('unstakeButton').addEventListener('click', unstakeTokens);