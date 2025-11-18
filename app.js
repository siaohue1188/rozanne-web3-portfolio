// Contract addresses (replace with your addresses)
const ROZANNE_TOKEN_ADDRESS = "0x88d85dc85b1e03dd6b76e34078c396b6c1fdab1f"; // Your RozanneToken address
const STAKING_CONTRACT_ADDRESS = "0xd42efb2950a1a43eed6a247edd3d99fe57f869c6"; // Your Staking contract address

// ABI - Simplified version
const ROZANNE_TOKEN_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)", 
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function mint(uint256 amount) public",
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

const STAKING_ABI = [
    "function rewardsToken() view returns (address)",
    "function stakes(address) view returns (uint256)", 
    "function totalStaked() view returns (uint256)",
    "function stake(uint256 _amount) external",
    "function unstake(uint256 _amount) external", 
    "function getStake(address _user) external view returns (uint256)"
];

let provider, signer, tokenContract, stakingContract, userAddress;

// Enhanced connect function with detailed logging
async function connectWallet() {
    console.log('🔗 Connect Wallet clicked');
    updateStatus('🔄 Starting connection...');
    
    try {
        // Step 1: Check for provider
        if (!window.ethereum) {
            updateStatus('❌ No Ethereum provider found');
            return;
        }
        
        console.log('✅ Ethereum provider found');
        updateStatus('🔄 Creating provider...');
        
        // Step 2: Create provider
        provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log('✅ Provider created');
        
        // Step 3: Request accounts
        updateStatus('🔄 Requesting accounts from MetaMask...');
        console.log('Requesting accounts...');
        
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        console.log('📨 Accounts received:', accounts);
        
        if (!accounts || accounts.length === 0) {
            updateStatus('❌ No accounts received');
            return;
        }
        
        userAddress = accounts[0];
        console.log('✅ User address:', userAddress);
        updateStatus('🔄 Account received: ' + userAddress.slice(0, 6) + '...');
        
        // Step 4: Get signer
        signer = provider.getSigner();
        console.log('✅ Signer created');
        
        // Step 5: Check network
        updateStatus('🔄 Checking network...');
        const network = await provider.getNetwork();
        console.log('🌐 Network:', network);
        
        if (network.chainId !== 11155111) {
            updateStatus('❌ Wrong network. Please switch to Sepolia');
            return;
        }
        
        updateStatus('🔄 Network OK - Initializing contracts...');
        
        // Step 6: Initialize contracts
        tokenContract = new ethers.Contract(ROZANNE_TOKEN_ADDRESS, ROZANNE_TOKEN_ABI, signer);
        stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
        console.log('✅ Contracts initialized');
        
        // Step 7: Update UI
        updateStatus('🔄 Updating UI...');
        document.getElementById('wallet-address').textContent = userAddress;
        document.getElementById('network').textContent = 'Sepolia';
        
        // Show the UI elements
        document.querySelector('.dashboard').classList.remove('hidden');
        document.querySelector('.actions').classList.remove('hidden');
        console.log('✅ UI updated');
        
        // Step 8: Load balances
        updateStatus('🔄 Loading balances...');
        await updateBalances();
        
        updateStatus('✅ Connected successfully!');
        console.log('🎉 Connection complete!');
        
    } catch (error) {
        console.error('💥 Connection failed:', error);
        updateStatus('❌ Connection failed: ' + error.message);
    }
}

// Update balances with error handling
async function updateBalances() {
    try {
        console.log('🔄 Loading token balance...');
        const tokenBalance = await tokenContract.balanceOf(userAddress);
        console.log('Token balance:', tokenBalance.toString());
        
        console.log('🔄 Loading staked balance...');
        const stakedBalance = await stakingContract.getStake(userAddress);
        console.log('Staked balance:', stakedBalance.toString());
        
        console.log('🔄 Loading total staked...');
        const totalStaked = await stakingContract.totalStaked();
        console.log('Total staked:', totalStaked.toString());
        
        // Update UI
        document.getElementById('token-balance').textContent = ethers.utils.formatUnits(tokenBalance, 18) + ' RZT';
        document.getElementById('staked-balance').textContent = ethers.utils.formatUnits(stakedBalance, 18) + ' RZT';
        document.getElementById('total-staked').textContent = ethers.utils.formatUnits(totalStaked, 18) + ' RZT';
        
        console.log('✅ Balances updated');
        
    } catch (error) {
        console.error('💥 Balance update failed:', error);
        updateStatus('❌ Failed to load balances: ' + error.message);
    }
}

function updateStatus(message) {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `<div style="padding: 10px; margin: 10px 0; border-radius: 5px; background: #e3f2fd;">${message}</div>`;
    console.log('📢 Status:', message);
}

// Add event listeners
document.getElementById('connect-wallet').addEventListener('click', connectWallet);
document.getElementById('mint-btn').addEventListener('click', mintTokens);
document.getElementById('stake-btn').addEventListener('click', stakeTokens);
document.getElementById('unstake-btn').addEventListener('click', unstakeTokens);

// Placeholder functions for now
async function mintTokens() {
    updateStatus('Mint function - to be implemented');
}

async function stakeTokens() {
    updateStatus('Stake function - to be implemented'); 
}

async function unstakeTokens() {
    updateStatus('Unstake function - to be implemented');
}

// Debug function
function debugConnection() {
    console.log('=== DEBUG INFO ===');
    console.log('window.ethereum:', window.ethereum);
    console.log('userAddress:', userAddress);
    console.log('provider:', provider);
    console.log('tokenContract:', tokenContract);
    console.log('stakingContract:', stakingContract);
    console.log('==================');
}