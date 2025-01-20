// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract UserBoundNFT is ERC1155, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    Counters.Counter private _tokenIdCounter; 
    // try converting this tokenId to some seed phrase

    struct BusinessInfo {
        string businessName;
        string sector;
        uint256 carbonCredits;
        string country;
        string yearOfEstablishment;
    }

    //struct ListedCredit {
    //    uint256 price;
    //    uint256 totalPrice;
    //    uint256 units;
    //    address seller;
    //}

    mapping(string => BusinessInfo) private _businessData; // Token ID to Business Info
    mapping(uint256 => address) private _owners; // Token ID to Owner
    mapping(uint256 => string) private _uris;


    //mapping(uint256=>ListedCredit) private _listings;
    //uint256 listId=0;

    //event ListCredits(uint256 listId , address seller);
    //event PurchaseCredits(uint256 listId , address buyer, address seller );

    event RegisteredBusiness(uint256 tokenId, BusinessInfo info);
    event MetadataUpdated(uint256 tokenId, BusinessInfo newInfo);

    constructor() ERC1155("") {
        _grantRole(ADMIN_ROLE, msg.sender); // Assign deployer as admin
    }

    // Override supportsInterface to resolve ambiguity
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(bytes(_uris[tokenId]).length > 0, "URI not set for this token");
        return _uris[tokenId];
    }

    function registerBusiness( address user, string memory businessName, string memory sector, string memory country,
    string memory tokenUri , string memory yearOfEstablishment ) external onlyRole(ADMIN_ROLE) returns (uint256){
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        require(user != address(0), "User address cannot be zero");
        require(bytes(businessName).length > 0, "Business name is required");
        require(bytes(sector).length > 0, "Sector is required");
        require(bytes(country).length > 0, "Country is required");
        require(bytes(tokenUri).length > 0, "URI is required");
        require(bytes(yearOfEstablishment).length > 0, "Year of establishment is required");

        uint256 carbonCredits = 100;
        //hardcoded for now

        bytes memory metadata = abi.encode(
            businessName,
            sector,
            country,
            yearOfEstablishment,
            carbonCredits
        );
        _mint(user, tokenId, 1, metadata);
        _owners[tokenId] = user;
        _uris[tokenId] = tokenUri;


        // Store business information in metadata
        _businessData[tokenUri] = BusinessInfo({
            businessName: businessName,
            sector: sector,
            carbonCredits: carbonCredits,
            country:country,
            yearOfEstablishment:yearOfEstablishment
        });
        emit RegisteredBusiness(tokenId , _businessData[tokenUri]);
        return tokenId; 
        //give this to business and say them not to share with anyone. unhone share kiya toh unki maa ka bhosda
    }

    function verifyBusiness(address user, uint256 tokenId) external view returns (string memory) {
        require(user != address(0), "Invalid wallet address");
        require(_owners[tokenId]==user , "Not authorized");
        require(balanceOf(user, tokenId) > 0 , "No NFT found");
        string memory tokenUri = uri(tokenId);
        return (tokenUri);
        //use this uri to get the meatdata from the ipfs
    }

    function updateBusinessInfo(uint256 tokenId, BusinessInfo memory newInfo , string memory tokenUri) internal  onlyRole(ADMIN_ROLE) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        _businessData[tokenUri] = newInfo;
        emit MetadataUpdated(tokenId, newInfo);
    }


    //function listCredit(uint256 units , uint256 price) external  {
    //    require(units > 0 , "Cannot sell Zero Credits");
    //    require(price > 0 , "Cannot Sell for free");
    //    listId++;
    //    ListedCredit storage listing = _listings[listId];
    //    listing.price = price;
    //    listing.totalPrice = price * units; // Changed totalPrice to be calculated directly
    //    listing.units = units;
    //    listing.seller = msg.sender;
    //}
}