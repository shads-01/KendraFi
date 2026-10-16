// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../src/MockBDTc.sol";
import "../src/KendraEscrow.sol";
import "../src/AgentSessionAccount.sol";

/**
 * @title DeployKendraScript
 * @notice Deterministic deployment script for KendraFi Layer-5 contracts on Base Sepolia & FISCO BCOS.
 * 2026 Shenzhen International FinTechathon.
 */
contract DeployKendraScript {
    MockBDTc public bdtc;
    KendraEscrow public escrow;

    address public deployer;
    address public relayer;

    event Deployed(address bdtcAddress, address escrowAddress);

    function run() external returns (address bdtcAddress, address escrowAddress) {
        deployer = msg.sender;
        relayer = msg.sender;

        // 1. Deploy MockBDTc
        bdtc = new MockBDTc();

        // 2. Deploy KendraEscrow
        escrow = new KendraEscrow(address(bdtc), relayer);

        // 3. Whitelist Karwan Bazar Wholesalers
        escrow.setKYBSupplier(0x71c0000000000000000000000000000000000a91, true); // Meghna Group
        escrow.setKYBSupplier(0x82D0000000000000000000000000000000000B42, true); // Islampur Textiles
        escrow.setKYBSupplier(0x93E0000000000000000000000000000000000c18, true); // Shyamoli Agro
        escrow.setKYBSupplier(0xA4f0000000000000000000000000000000000D77, true); // Square Pharma

        emit Deployed(address(bdtc), address(escrow));

        return (address(bdtc), address(escrow));
    }
}
