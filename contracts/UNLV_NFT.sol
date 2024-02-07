// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract UNLVIdentityNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from student ID to their NFT token ID
    mapping(uint => uint256) private _tokenByStudentId;

    // Mapping to keep track of which student IDs have been used to mint an NFT
    mapping(uint => bool) private _studentIdUsed;

    // Mapping to keep track of which addresses have minted an NFT
    mapping(address => bool) private _addressMinted;

    constructor() ERC721("UNLVIdentityNFT", "UNLV") {}

    // Function to mint new NFTs, restricted to one per student ID and one per Ethereum address
    function mintNFT(uint studentID) public {
        require(!_studentIdUsed[studentID], "This student ID has already minted an NFT.");
        require(!_addressMinted[msg.sender], "This address has already minted an NFT.");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        
        _mint(msg.sender, newItemId);
        
        // Mark the student ID and address as having minted an NFT
        _studentIdUsed[studentID] = true;
        _addressMinted[msg.sender] = true;

        // Map the student ID to the new token ID
        _tokenByStudentId[studentID] = newItemId;
    }

    // Function to check if a student ID has been used to mint an NFT
    function isStudentIdUsed(uint studentID) public view returns (bool) {
        return _studentIdUsed[studentID];
    }

    // Function to check if an address has minted an NFT
    function hasAddressMinted(address addr) public view returns (bool) {
        return _addressMinted[addr];
    }

    // Function to get the token ID associated with a student ID
    function getTokenIdByStudentId(uint studentID) public view returns (uint256) {
        require(_studentIdUsed[studentID], "This student ID has not been used to mint an NFT.");
        return _tokenByStudentId[studentID];
    }
}
