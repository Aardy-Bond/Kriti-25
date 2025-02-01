// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IoTCreditManager {

    // Private mapping to store device/sensor IDs and associated credit values
    mapping(string => uint256) private iot;

    // External function to get the credit value for a given identifier
    function getByIdentifier(string memory _identifier) public view returns (uint256) {
        return iot[_identifier];
    }

    // External function to update the credit value for a given identifier
    function updateCredits(uint256 _credits, string memory _identifier) public {
        uint256 currentCredit = iot[_identifier];
        
        // Ensure the identifier exists in the mapping
        require(currentCredit != 0, "Invalid Identifier");
        
        // Ensure the new credit value is different from the current one
        require(currentCredit != _credits, "Redundant action");

        // Update the credit value
        iot[_identifier] = _credits;
    }
}