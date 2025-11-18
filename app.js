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
    // Check for both desktop and mobile MetaMask
    let ethereumProvider;
    
    // Check for desktop MetaMask
    if (typeof window.ethereum !== 'undefined') {
        ethereumProvider = window.ethereum;
    } 
    // Check for mobile MetaMask
    else if (typeof window.web3 !== 'undefined') {
        ethereumProvider = window.web3.currentProvider;
    }
    // Check for MetaMask Mobile specific provider
    else if (window.ethereum?.isMetaMask) {
        ethereumProvider = window.ethereum;
    }
    else {
        alert('Please install MetaMask or use the MetaMask mobile app browser!');
        return;
    }

    try {
        provider = new ethers.providers.Web3Provider(ethereumProvider);
        
        // Request account access
        await ethereumProvider.request({ method: 'eth_requestAccounts' });
        
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        // Initialize contracts
        tokenContract = new ethers.Contract(ROZANNE_TOKEN_ADDRESS, ROZANNE_TOKEN_ABI, signer);
        stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
        
        // Update UI
        document.getElementById('wallet-address').textContent = `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        document.getElementById('token-info').style.display = 'block';
        document.getElementById('actions').style.display = 'block';
        
        await updateBalances();
        updateStatus('Wallet connected successfully!');
        
    } catch (error) {
        console.error("Wallet connection failed:", error);
        updateStatus('Failed to connect wallet: ' + error.message);
        
        // If on mobile and still failing, show special instructions
        if (isMobileDevice()) {
            showMobileInstructions();
        }
    }
}

// Check if user is on mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Show mobile-specific instructions
function showMobileInstructions() {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <h3>📱 Mobile Setup Required</h3>
            <p><strong>To use this dApp on mobile:</strong></p>
            <ol style="text-align: left;">
                <li>Open the <strong>MetaMask app</strong></li>
                <li>Tap the <strong>🌐 Browser tab</strong></li>
                <li>Navigate to: <code>${window.location.href}</code></li>
                <li>Then try connecting again</li>
            </ol>
            <button onclick="openInMetaMaskApp()" style="background: #f6851b; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">
                Open in MetaMask App
            </button>
        </div>
    `;
}

// Open in MetaMask app
function openInMetaMaskApp() {
    // Create a deep link to open in MetaMask browser
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `https://metamask.app.link/dapp/${currentUrl}`;
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

// Debug: Check what providers are available
console.log('Window.ethereum:', typeof window.ethereum);
console.log('Window.web3:', typeof window.web3);
console.log('User agent:', navigator.userAgent);

// You can also add this to your HTML temporarily to see the debug info
document.addEventListener('DOMContentLoaded', function() {
    const debugInfo = `
        Ethereum: ${typeof window.ethereum}<br>
        Web3: ${typeof window.web3}<br>
        Mobile: ${isMobileDevice()}
    `;
    console.log('Debug info:', debugInfo);
});

// Event listeners
document.getElementById('connectWalletButton').addEventListener('click', connectWallet);
document.getElementById('mintButton').addEventListener('click', mintTokens);
document.getElementById('approveButton').addEventListener('click', approveTokens);
document.getElementById('stakeButton').addEventListener('click', stakeTokens);
document.getElementById('unstakeButton').addEventListener('click', unstakeTokens);