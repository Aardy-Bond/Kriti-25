// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./verifier.sol";

contract CreditValidator {
    Groth16Verifier private verifier;

    constructor(address _verifierAddress) {
        verifier = Groth16Verifier(_verifierAddress);
    }

    function validateUser(
        uint[2] calldata proofA,
        uint[2][2] calldata proofB,
        uint[2] calldata proofC,
        uint[1] calldata publicInputs
    ) public view returns (bool) {
        // Ensure the dynamic threshold is checked as part of the proof
        // publicInputs[0]: balance, publicInputs[1]: threshold
        require(publicInputs.length >= 2, "Invalid public inputs");
        return verifier.verifyProof(proofA,proofB,proofC,publicInputs);
    }
}