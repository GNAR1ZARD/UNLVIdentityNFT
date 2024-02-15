(async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        const deployerAccount = accounts[0];
        const secondAccount = accounts[1]; // Second account to test double minting

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

        // Mint an NFT with a given student ID
        const studentID = 123456;
        await deployedContract.methods.mintNFT(studentID).send({ from: deployerAccount });
        console.log(`NFT minted for student ID ${studentID}`);

        // Attempt to mint again with the same student ID, which should fail
        try {
            await deployedContract.methods.mintNFT(studentID).send({ from: deployerAccount });
        } catch (error) {
            console.log(`Expected error on double minting: ${error.message}`);
        }

        // Check if an address has already minted an NFT
        const hasMinted = await deployedContract.methods.hasAddressMinted(deployerAccount).call();
        console.log(`Has deployer account already minted an NFT: ${hasMinted}`);

        // Attempt to mint with a different account but the same student ID, which should fail
        try {
            await deployedContract.methods.mintNFT(studentID).send({ from: secondAccount });
        } catch (error) {
            console.log(`Expected error on minting with used student ID from another account: ${error.message}`);
        }

        // Check token ownership with a fake signature
        const fakeSignature = "0x" + "1".repeat(130); // Placeholder 65-byte signature

        // Retrieve the token ID by student ID using the fake signature
        try {
            const tokenId = await deployedContract.methods.getTokenIdByStudentId(studentID, fakeSignature).call({ from: secondAccount });
            console.log(`Token ID associated with student ID ${studentID}: ${tokenId}`);
        } catch (error) {
            console.log(`Expected error on retrieving token ID with invalid signature: ${error.message}`);
        }

        // // Simulate another fake signature that does not match the one used for minting
        // const differentFakeSignature = "0x" + "2".repeat(130); // Another placeholder 65-byte signature

        // try {
        //     // This call should also fail since the signature does not match the one used for minting
        //     const tokenId = await deployedContract.methods.getTokenIdByStudentId(studentID, differentFakeSignature).call({ from: deployerAccount });
        //     console.log(`Retrieved token ID with a different fake signature (which should not happen): ${tokenId}`);
        // } catch (error) {
        //     console.log(`Correctly failed to retrieve token ID with a different fake signature: ${error.message}`);
        // }

    } catch (error) {
        console.error(`Error in the async function: ${error}`);
    }
})();
