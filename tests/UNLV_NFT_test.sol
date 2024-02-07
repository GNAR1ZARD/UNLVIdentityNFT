// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.22 <0.9.0;

import "remix_tests.sol"; // Importing Remix tests library
import "remix_accounts.sol"; // Importing Remix accounts library
import "../contracts/UNLV_NFT.sol"; // Adjust the path according to your project structure

contract UNLV_NFT_Test {
    UNLVIdentityNFT unlvNFT;

    // Setting up accounts
    // address acc0 = TestsAccounts.getAccount(0); // Simulated account that could represent a student
    // address acc1 = TestsAccounts.getAccount(1); // Another simulated student account

    uint256 studentID0 = 123456; // Example student ID for acc0
    uint256 studentID1 = 789012; // Example student ID for acc1, different from studentID0

    function beforeAll() public {
        unlvNFT = new UNLVIdentityNFT(); // Deploy a new instance of the UNLVIdentityNFT contract for testing
    }

    /// Test successful minting of an NFT
    /// #sender: account-0
    function testMintNFTSuccess() public {
        // Attempt to mint an NFT for acc0 with studentID0
        unlvNFT.mintNFT(studentID0); // This should succeed

        // Get the token ID associated with studentID0
        uint256 tokenId = unlvNFT.getTokenIdByStudentId(studentID0);

        // Verify the token ID is greater than 0, indicating a token was minted
        Assert.equal(tokenId > 0, true, "NFT should be minted for studentID0");
    }

    /// #sender: account-1
    /// #value: 100
    function checkSenderAndValue() public payable {
        Assert.equal(msg.sender, TestsAccounts.getAccount(1), "wrong sender");
        Assert.equal(msg.value, 100, "wrong value");
    }

    // /// Test successful minting of an NFT
    // /// #sender: account-1
    // function testMintNFTSuccessStudent1() public {
    //     // Attempt to mint an NFT for acc0 with studentID1
    //     unlvNFT.mintNFT(studentID1); // This should succeed

    //     // Get the token ID associated with studentID0
    //     uint256 tokenId = unlvNFT.getTokenIdByStudentId(studentID1);

    //     // Verify the token ID is greater than 0, indicating a token was minted
    //     Assert.equal(tokenId > 0, true, "NFT should be minted for studentID1");
    // }
}
