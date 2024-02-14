(async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        const deployerAccount = accounts[0];

        // Extract ABI and ByteCode from Metadata
        const metadata = JSON.parse(await remix.call('fileManager', 'getFile', 'contracts/artifacts/UNLVIdentityNFT.json'));
        const contractABI = metadata.abi;
        const contractBytecode = metadata.data.bytecode.object;

        // Deploy the UNLVIdentityNFT contract
        const contractInstance = new web3.eth.Contract(contractABI);
        const deployedContract = await contractInstance.deploy({
            data: contractBytecode
        }).send({
            from: deployerAccount,
            gas: 4700000 // Adjust as needed 
        });

        console.log("UNLVIdentityNFT contract deployed at address: " + deployedContract.options.address);

        // Interact with the contract after deployment
        // Mint an NFT
        const studentID = 123456; // Example student ID
        await deployedContract.methods.mintNFT(studentID).send({ from: deployerAccount });
        console.log(`NFT minted for student ID ${studentID}`);

        // Fake signature for testing
        const fakeSignature = "0x" + "1".repeat(130); // Placeholder 65-byte signature

        // Retrieve the token ID by student ID using the fake signature
        const tokenId = await deployedContract.methods.getTokenIdByStudentId(studentID, fakeSignature).call();
        console.log(`Token ID associated with student ID ${studentID}: ${tokenId}`);

    } catch (error) {
        console.error(`Error in the async function: ${error}`);
    }
})();
