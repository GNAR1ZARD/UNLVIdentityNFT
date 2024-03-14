(async () => {
    try {
        const accounts = await web3.eth.getAccounts()
        const deployerAccount = accounts[0]
        const secondAccount = accounts[1] // Second account to test double minting

        // Extract ABI and ByteCode from Metadata
        const metadata = JSON.parse(
            await remix.call(
                'fileManager',
                'getFile',
                'contracts/artifacts/UNLVIdentityNFT.json'
            )
        )
        const contractABI = metadata.abi
        const contractBytecode = metadata.data.bytecode.object

        // Deploy the UNLVIdentityNFT contract
        const contractInstance = new web3.eth.Contract(contractABI)
        const deployedContract = await contractInstance
            .deploy({
                data: contractBytecode,
            })
            .send({
                from: deployerAccount,
                gas: 4700000, // Adjust as needed
            })

        console.log(
            'UNLVIdentityNFT contract deployed at address: ' +
            deployedContract.options.address
        )

        // Set up the event listener for DebugVerify event
        deployedContract.events.DebugVerify({
            fromBlock: 'latest'
        })
            .on('data', function (event) {
                console.log('DebugVerify Event Emitted:', event.returnValues);
            })
            .on('error', function (error) {
                if (Object.keys(error).length === 0) {
                    console.log('DebugVerify Event Listener Triggered, but no error to report.');
                } else {
                    console.error('Error listening to the DebugVerify event:', error);
                }
            });

        // Mint an NFT with a given student ID
        const studentID = 123456
        await deployedContract.methods
            .mintNFT(studentID)
            .send({ from: deployerAccount })
        console.log(`NFT minted for student ID ${studentID}`)

        // Attempt to mint again with the same student ID, which should fail
        try {
            await deployedContract.methods
                .mintNFT(studentID)
                .send({ from: deployerAccount })
        } catch (error) {
            console.log(`Expected error on double minting: ${error.message}`)
        }

        // Check if an address has already minted an NFT
        const hasMinted = await deployedContract.methods
            .hasAddressMinted(deployerAccount)
            .call()
        console.log(`Has deployer account already minted an NFT: ${hasMinted}`)

        // Attempt to mint with a different account but the same student ID, which should fail
        try {
            await deployedContract.methods
                .mintNFT(studentID)
                .send({ from: secondAccount })
        } catch (error) {
            console.log(
                `Expected error on minting with used student ID from another account: ${error.message}`
            )
        }
        // Retrieving the token ID using the signed message
        const message = `Verify student ID ${studentID}`;
        const signature = await new Promise((resolve, reject) => {
            web3.eth.sign(web3.utils.keccak256(message), deployerAccount, (error, signature) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(signature);
                }
            });
        });

        console.log('The signature is: ', signature);

        // Verifying the token ID with the signature
        const tokenId = await deployedContract.methods.getTokenIdByStudentId(studentID, signature).call();
        console.log(`Token ID associated with student ID ${studentID}: ${tokenId}`);
    } catch (error) {
        console.error(`Error in the async function: ${error}`)
    }
})();