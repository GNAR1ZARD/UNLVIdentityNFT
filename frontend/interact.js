document.addEventListener('DOMContentLoaded', () => {
    const mintButton = document.getElementById('mintNFT');
    const studentIdInput = document.getElementById('studentId');

    mintButton.addEventListener('click', async () => {
        try {
            // Prompt user to connect their Ethereum wallet (if its not already connected)
            await ethereum.request({ method: 'eth_requestAccounts' });

            // Create a new provider and signer
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Load contract ABI and address
            const contractABI = [...]; // ABI array 
            const contractAddress = "CONTRACT_ADDRESS";

            // Create a contract instance
            const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

            // Get the student ID from the input
            const studentID = studentIdInput.value;
            if (!studentID) {
                return alert('Please enter a valid student ID.');
            }

            // Send the mint transaction
            const tx = await nftContract.mintNFT(studentID);
            console.log('Minting...', tx.hash);

            // Wait for the transaction to be confirmed
            const receipt = await tx.wait();
            console.log('Transaction confirmed', receipt);


        } catch (error) {
            console.error('Error minting NFT:', error);
            alert('Error minting NFT. See console for details.');
        }
    });
});