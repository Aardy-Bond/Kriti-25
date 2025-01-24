// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract UserBoundNFT is ERC1155, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    Counters.Counter private _tokenIdCounter; 
    // try converting this tokenId to some seed phrase-cancelled

   // struct BusinessInfo {
     //   string businessName;
     //   string sector;
     //   uint256 carbonCredits;
     //   string country;
     //   string yearOfEstablishment;
   // }
    //this will be removed

    struct ListedCredit {
       uint256 price;
       uint256 totalPrice;
       uint256 units;
       address seller;
    }

    // mapping(string => BusinessInfo) private _businessData; // Token uri to Business Info, will be removed
    // mapping(uint256 => address) private _owners; 
    mapping(uint256 => string) private _uris; 


    mapping(uint256=>ListedCredit) private _listings;
    uint256 listId=0;

    // use graphQL for fetching and indexing
    event ListedCredits(uint256 listId , uint256 units , uint256 price , uint256 totalPrice); 
    event PurchasedCredits(uint256 listId );


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


        bytes memory metadata = abi.encode(
            businessName,
            sector,
            country,
            yearOfEstablishment
        );
        _mint(user, tokenId, 1, metadata);
        // _owners[tokenId] = user;
        _uris[tokenId] = tokenUri;


        //_businessData[tokenUri] = BusinessInfo({
          //  businessName: businessName,
            //sector: sector,
           // carbonCredits: carbonCredits,
           // country:country,
            //yearOfEstablishment:yearOfEstablishment
        //});
        //this will be removed
        return tokenId; 
        //give this to business and say them not to share with anyone. unhone share kiya toh unki maa ka bhosda
    }

    function verifyBusiness( uint256 tokenId) external view returns (string memory) {
        require(msg.sender != address(0), "Invalid wallet address");
        // require(_owners[tokenId]==msg.sender , "Not authorized"); 
        require(balanceOf(msg.sender, tokenId) > 0 , "No NFT found");
        string memory tokenUri = uri(tokenId);
        return (tokenUri);
        //use this uri to get the meatdata from the ipfs
    }

    function updateUri(uint256 tokenId, string memory newUri) external  onlyRole(ADMIN_ROLE) {
        // require(_owners[tokenId] != address(0), "Token does not exist"); 
        require(balanceOf(msg.sender, tokenId) > 0 , "No NFT found");
        _uris[tokenId] = newUri;
    }


    function list(uint256 _price , uint256 _units , uint256 _totalPrice) external  {
       require(_units > 0 , "Cannot sell Zero Credits");
       require(_price > 0 , "Cannot Sell for free");
       listId++;
       ListedCredit storage listing = _listings[listId];
       listing.price = _price;
       listing.totalPrice = _totalPrice;
       listing.units = _units;
       listing.seller = msg.sender;
       emit ListedCredits(listId , _units , _price , _totalPrice);
    }

    function purchase(uint256 _listId) external payable {
        require(_listId<=listId , "Invalid listId");
        require(_listings[_listId].units!=0 , "Already Sold");
        ListedCredit memory listing = _listings[_listId];
        require(msg.value >= listing.totalPrice , "Insufficient Ethers");
        address seller = listing.seller;
        address buyer  = msg.sender; 
        uint256 excess = msg.value - listing.totalPrice;
        (bool sentToSeller,) = seller.call{value:listing.totalPrice}("");
        require(sentToSeller, "Failed to send Ether to seller");

        if (excess > 0) {
            (bool refundedToBuyer,) = buyer.call{value: excess}("");
            require(refundedToBuyer, "Failed to refund excess Ether to buyer");
        }

        _listings[_listId].units = 0;
        emit PurchasedCredits(listId);
    }
}