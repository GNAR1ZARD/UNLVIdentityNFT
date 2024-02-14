// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract UNLVIdentityNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from student ID to their NFT token ID
    mapping(uint256 => uint256) private _tokenByStudentId;

    // Mapping to keep track of which student IDs have been used to mint an NFT
    mapping(uint256 => bool) private _studentIdUsed;

    // Mapping to keep track of which addresses have minted an NFT
    mapping(address => bool) private _addressMinted;

    constructor() ERC721("UNLVIdentityNFT", "UNLV") {}

    // Function to mint new NFTs, restricted to one per student ID and one per Ethereum address
    function mintNFT(uint256 studentID) public {
        require(
            !_studentIdUsed[studentID],
            "This student ID has already minted an NFT."
        );
        require(
            !_addressMinted[msg.sender],
            "This address has already minted an NFT."
        );

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
    function isStudentIdUsed(uint256 studentID) public view returns (bool) {
        return _studentIdUsed[studentID];
    }

    // Function to check if an address has minted an NFT
    function hasAddressMinted(address addr) public view returns (bool) {
        return _addressMinted[addr];
    }

    // Function to get the token ID associated with a student ID
    // Requires a signature for verification
    function getTokenIdByStudentId(uint256 studentID, bytes memory signature)
        public
        view
        returns (uint256)
    {
        require(
            _studentIdUsed[studentID],
            "This student ID has not been used to mint an NFT."
        );
        uint256 tokenId = _tokenByStudentId[studentID];

        // This is the message that the user signed
        // It should be the same message that was signed on the client side
        bytes32 message = keccak256(
            abi.encodePacked("Verify student ID", studentID)
        );
        // This is the hash that was signed
        // Message in the Ethereum signed message format
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", message)
        );

        // Recover the address that signed the message
        // Calls recoverSigner
        address signer = recoverSigner(ethSignedMessageHash, signature);

        // Verify that the signer is the owner of the NFT
        require(
            ownerOf(tokenId) == signer,
            "Signature invalid or signer does not own the token"
        );

        return tokenId;
    }

    // Function to recover the signer address from a signature
    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature)
        internal
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    // Helper function to split a signature into its components
    function splitSignature(bytes memory sig)
        internal
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }
}
