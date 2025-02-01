// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// Importing ERC1155 token standard, AccessControl for role-based access, and Counters for tracking token IDs
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract UserBoundNFT is ERC1155, AccessControl {
    using Counters for Counters.Counter;

    // Defining the ADMIN_ROLE for AccessControl
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Counter to track the next token ID
    Counters.Counter private _tokenIdCounter;

    // Struct to hold the credit listing details (price, total price, available units, and seller address)
    struct ListedCredit {
       uint256 price;
       uint256 totalPrice;
       uint256 units;
       address seller;
    }

    // Mappings to store URIs associated with token IDs and the credit listings
    mapping(uint256 => string) private _uris; 
    mapping(uint256 => ListedCredit) private _listings;

    // Variable to track the list ID for listings
    uint256 private listId = 0;

    // Admin address (the contract deployer)
    address private admin;

    // Event triggered when credits are listed for sale
    event ListedCredits(uint256 indexed listId, uint256 indexed units, uint256 indexed price, uint256 totalPrice);

    // Event triggered when credits are purchased
    event PurchasedCredits(uint256 indexed listId);

    // Constructor to initialize the contract, setting the admin and minting an initial URI
    constructor() ERC1155("https://ipfs.io/ipfs/bafkreiar442uwfrvmtj453xxb6gdedae7xm4tpcanynulwhb2la7bxnerm") {
        admin = msg.sender;  // Set deployer as the admin
        _grantRole(ADMIN_ROLE, msg.sender); // Assign admin role to deployer
    }

    // Override the supportsInterface function to resolve ambiguity with ERC1155 and AccessControl
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Override the URI function to return the URI associated with the token ID
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(bytes(_uris[tokenId]).length > 0, "URI not set for this token");
        return _uris[tokenId];
    }

    // Internal function to handle token transfers, preventing transfers between addresses
    // This ensures the NFTs are soul-bound and cannot be transferred.
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal override {
        require(from == address(0) || to == address(0), "Soul-Bound NFT");  // Ensure no transfers except minting and burning
        super._update(from, to, ids, values);
    }

    // Function to register a business and mint a business-bound NFT for a user
    // Admin role required
    function registerBusiness(
        address user,
        string memory businessName,
        string memory sector,
        string memory country,
        string memory tokenUri,
        string memory yearOfEstablishment
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();  // Get the current token ID
        _tokenIdCounter.increment();  // Increment the token ID for the next mint

        // Validations for business registration input
        require(user != address(0), "User address cannot be zero");
        require(bytes(businessName).length > 0, "Business name is required");
        require(bytes(sector).length > 0, "Sector is required");
        require(bytes(country).length > 0, "Country is required");
        require(bytes(tokenUri).length > 0, "URI is required");
        require(bytes(yearOfEstablishment).length > 0, "Year of establishment is required");

        // Encode metadata and mint the business NFT
        bytes memory metadata = abi.encode(
            businessName,
            sector,
            country,
            yearOfEstablishment
        );
        _mint(user, tokenId, 1, metadata);  // Mint the NFT to the user address
        _uris[tokenId] = tokenUri;  // Set the URI for the minted token

        return tokenId;  // Return the minted token ID
    }

    // Function to verify a business by checking if the sender owns the specified token
    function verifyBusiness(uint256 tokenId) external view returns (string memory) {
        require(msg.sender != address(0), "Invalid wallet address");  // Ensure the sender address is valid
        require(balanceOf(msg.sender, tokenId) > 0, "No NFT found");  // Ensure the sender owns the NFT
        string memory tokenUri = uri(tokenId);  // Retrieve the token URI
        return tokenUri;  // Return the URI of the token
    }

    // Function to update the URI for an existing business-bound NFT
    // Admin role required
    function updateUri(uint256 tokenId, string memory newUri) external onlyRole(ADMIN_ROLE) { 
        require(balanceOf(msg.sender, tokenId) > 0, "No NFT found");  // Ensure the admin owns the token
        _uris[tokenId] = newUri;  // Update the URI for the token
    }

    // Function to list credits for sale
    // The seller must provide the price, units, and total price of credits
    function list(uint256 _price, uint256 _units, uint256 _totalPrice) external {
        require(_units > 0, "Cannot sell Zero Credits");  // Ensure units to sell are greater than zero
        require(_price > 0, "Cannot Sell for free");  // Ensure price is greater than zero
        listId++;  // Increment the list ID
        ListedCredit storage listing = _listings[listId];  // Create a new listing
        listing.price = _price;
        listing.totalPrice = _totalPrice;
        listing.units = _units;
        listing.seller = msg.sender;
        emit ListedCredits(listId, _units, _price, _totalPrice);  // Emit the ListedCredits event
    }

    // Function to purchase credits from a listing
    function purchase(uint256 _listId) external payable {
        require(_listId <= listId, "Invalid listId");  // Ensure the list ID is valid
        require(_listings[_listId].units != 0, "Already Sold");  // Ensure credits are available
        ListedCredit memory listing = _listings[_listId];  // Get the listing details
        require(msg.value >= listing.totalPrice, "Insufficient Ethers");  // Ensure the buyer sent enough Ether

        uint256 adminFee = (listing.totalPrice * 1) / 10000;  // Calculate admin fee (1%)
        uint256 sellerAmount = listing.totalPrice - adminFee;  // Calculate the amount to be paid to the seller

        // Send the admin fee to the admin address
        (bool sentToAdmin, ) = admin.call{value: adminFee}("");
        require(sentToAdmin, "Failed to send admin fee");

        address seller = listing.seller;  // Get the seller's address
        address buyer = msg.sender;  // Get the buyer's address
        uint256 excess = msg.value - listing.totalPrice;  // Calculate any excess Ether

        // Send the remaining amount to the seller
        (bool sentToSeller, ) = seller.call{value: sellerAmount}("");
        require(sentToSeller, "Failed to send Ether to seller");

        // Refund any excess Ether back to the buyer
        if (excess > 0) {
            (bool refundedToBuyer, ) = buyer.call{value: excess}("");
            require(refundedToBuyer, "Failed to refund excess Ether to buyer");
        }

        // Mark the listing as sold (no units remaining)
        _listings[_listId].units = 0;
        emit PurchasedCredits(listId);  // Emit the PurchasedCredits event
    }
}
