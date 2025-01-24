// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IOTContract {

    mapping(string=>uint256) private iot;
    
    function getByIdentifier(string memory _identifier) external view returns(uint256) {
        return iot[_identifier];
    }

    function updateCredits(uint256 _credits , string memory _identifier) external  {
        require(iot[_identifier]!=0 , "Invalid Identifier");
        require(iot[_identifier]-_credits!=0, "Reduntant action");
        iot[_identifier]=_credits;
    }

}
