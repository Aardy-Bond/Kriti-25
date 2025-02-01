# Outline of the Main Smart Contract
#### This contract is an ERC1155-based Soul-Bound NFT system used for business verification and carbon credit trading, ensuring non-transferable ownership and secure transactions. 

## 1. Variables Used

### State Variables:
- **ADMIN_ROLE**: A constant `bytes32` hash representing the admin role.
- **_tokenIdCounter**: A counter to track the `tokenId` of minted NFTs.
- **_uris**: A mapping storing URIs for each token ID.
- **_listings**: A mapping storing details of listed credits.
- **listId**: A counter for tracking listings.
- **admin**: Stores the address of the contract deployer (admin).

### Structs:
#### ListedCredit
- **price**: Price per unit.
- **totalPrice**: Total price of the listed credits.
- **units**: Number of units available.
- **seller**: Address of the seller.

## 2. ERC1155 Token Details

- The contract inherits from ERC1155 (multi-token standard).
- **Soul-Bound Mechanism**:
  - `_update` function prevents transfers between users (NFTs are bound to the original minter).
- **Metadata Storage**:
  - `_uris` mapping stores token URIs.
- **Token minting**:
  - `_mint` function mints NFTs for businesses.

## 3. Events Emitted
#### The Events emitted are consistently listened by the Subgraphs deployed on The Graph Protocol
- **ListedCredits**: Emitted when a user lists credits for sale.
- **PurchasedCredits**: Emitted when a purchase is completed.

## 4. Functions

### Core ERC1155 Overrides

- **supportsInterface**: Resolves conflicts between ERC1155 and AccessControl.
- **uri**: Returns the metadata URI of a token.

### Business Registration & Verification

- **registerBusiness**:
  - Mints a soul-bound NFT representing a business.
  - Stores metadata including business name, sector, country, and year of establishment.
- **verifyBusiness**:
  - Checks if a caller owns a specific NFT.
  - Returns the associated metadata URI.
- **updateUri**:
  - Allows an admin to update a token's URI.

### Credit Listing & Purchase

- **list**:
  - Allows users to list credits for sale by specifying price, units, and total price.
- **purchase**:
  - Allows buyers to purchase listed credits.
  - Ensures sufficient payment, deducts admin fees (0.01% of `totalPrice`), and transfers remaining funds to the seller.
  - Refunds any excess Ether to the buyer.
  - Marks the listing as sold.

# IoT Credit Management Contract

This contract manages the credit values associated with IoT devices. It stores credit values in a private mapping and provides functions to retrieve and update these values.

## Variables

### `iot (Mapping)`
- **Type**: `mapping(string => uint256)`
- **Description**: This private mapping stores the relationship between a unique string identifier (e.g., device or sensor ID) and a corresponding credit value (represented as `uint256`).

## Functions

### `getByIdentifier`
- **Parameters**: 
    - `_identifier (string memory)`: The identifier (e.g., device ID) used to look up the stored credit value.
- **Return**: 
    - Returns the credit value associated with the provided identifier, of type `uint256`.
- **Description**: 
    - This external view function allows retrieval of the credit value associated with a given identifier from the `iot` mapping.

### `updateCredits`
- **Parameters**: 
    - `_credits (uint256)`: The new credit value to be assigned to the specified identifier.
    - `_identifier (string memory)`: The identifier whose credit value needs to be updated.
- **Description**: 
    - This external function updates the credit value for the specified identifier.
    - **Requirements**: 
        - The identifier should already exist in the `iot` mapping, i.e., it should not be zero.
        - The action must not result in a redundant update where the current credit value and the new credit value are the same.
- **Error Messages**:
    - `"Invalid Identifier"`: Thrown if the identifier doesn't exist (i.e., its associated value is zero).
    - `"Redundant action"`: Thrown if the provided credit value equals the current value, indicating no update is needed.


