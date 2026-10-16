// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "forge-std/Test.sol";
import "../src/MockBDTc.sol";
import "../src/KendraEscrow.sol";
import "../src/AgentSessionAccount.sol";

contract KendraEscrowTest is Test {
    MockBDTc public bdtc;
    KendraEscrow public escrow;

    uint256 internal borrowerPk = 0xA11CE;
    address internal borrower;

    uint256 internal g1Pk = 0xB0B1;
    address internal guarantor1;

    uint256 internal g2Pk = 0xB0B2;
    address internal guarantor2;

    uint256 internal g3Pk = 0xB0B3;
    address internal guarantor3;

    address internal relayer = address(0x9999);
    address internal kybSupplier = 0x71c0000000000000000000000000000000000a91; // Meghna Group
    address internal untrustedSupplier = address(0xDEAD);

    bytes32 internal testInvoiceId = keccak256("INV-2026-DHAKA-001");
    uint256 internal principal = 45000 ether;
    uint256 internal grossRepayment = 45462 ether; // 45,462 BDTc
    uint32 internal tenorDays = 30;

    address[3] internal guarantors;
    uint256[3] internal stakes;

    function setUp() public {
        borrower = vm.addr(borrowerPk);
        guarantor1 = vm.addr(g1Pk);
        guarantor2 = vm.addr(g2Pk);
        guarantor3 = vm.addr(g3Pk);

        guarantors = [guarantor1, guarantor2, guarantor3];

        // 35% (15,911.7 ether), 35% (15,911.7 ether), 30% (13,638.6 ether) -> Total = 45,462 ether
        // All individual stakes <= 40% cap (18,184.8 ether)
        stakes = [
            (grossRepayment * 3500) / 10000,
            (grossRepayment * 3500) / 10000,
            grossRepayment - ((grossRepayment * 3500) / 10000) * 2
        ];

        bdtc = new MockBDTc();
        escrow = new KendraEscrow(address(bdtc), relayer);

        // Whitelist supplier
        escrow.setKYBSupplier(kybSupplier, true);

        // Fund relayer with liquidity for disbursement
        bdtc.mint(relayer, 100000 ether);
        vm.prank(relayer);
        bdtc.approve(address(escrow), type(uint256).max);

        // Fund escrow with liquidity for disbursements / peer yield
        bdtc.mint(address(escrow), 100000 ether);

        // Fund borrower with BDTc for repayments
        bdtc.mint(borrower, 100000 ether);

        vm.prank(borrower);
        bdtc.approve(address(escrow), type(uint256).max);
    }

    function _signBorrowerIntent(
        uint256 pk,
        bytes32 invoiceId,
        address b,
        address s,
        uint256 p,
        uint256 gross
    ) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(
            abi.encode(escrow.BORROWER_INTENT_TYPEHASH(), invoiceId, b, s, p, gross)
        );
        bytes32 typedDataHash = keccak256(
            abi.encodePacked("\x19\x01", escrow.DOMAIN_SEPARATOR(), structHash)
        );
        (uint8 v, bytes32 r, bytes32 sSig) = vm.sign(pk, typedDataHash);
        return abi.encodePacked(r, sSig, v);
    }

    function _signGuarantorStake(
        uint256 pk,
        bytes32 invoiceId,
        address b,
        address s,
        uint256 p,
        address g,
        uint256 stake
    ) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(
            abi.encode(escrow.GUARANTEE_STAKE_TYPEHASH(), invoiceId, b, s, p, g, stake)
        );
        bytes32 typedDataHash = keccak256(
            abi.encodePacked("\x19\x01", escrow.DOMAIN_SEPARATOR(), structHash)
        );
        (uint8 v, bytes32 r, bytes32 sSig) = vm.sign(pk, typedDataHash);
        return abi.encodePacked(r, sSig, v);
    }

    function test_executeSyndicateEscrow_success() public {
        bytes[4] memory sigs;
        sigs[0] = _signBorrowerIntent(borrowerPk, testInvoiceId, borrower, kybSupplier, principal, grossRepayment);
        sigs[1] = _signGuarantorStake(g1Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor1, stakes[0]);
        sigs[2] = _signGuarantorStake(g2Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor2, stakes[1]);
        sigs[3] = _signGuarantorStake(g3Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor3, stakes[2]);

        uint256 supplierBefore = bdtc.balanceOf(kybSupplier);

        vm.prank(relayer);
        escrow.executeSyndicateEscrow(
            testInvoiceId,
            borrower,
            kybSupplier,
            principal,
            grossRepayment,
            tenorDays,
            guarantors,
            stakes,
            sigs
        );

        // Supplier payout = 98.5% of 45,000 = 44,325 ether
        uint256 expectedSupplierPayout = (principal * 985) / 1000;
        assertEq(bdtc.balanceOf(kybSupplier) - supplierBefore, expectedSupplierPayout);
        assertEq(expectedSupplierPayout, 44325 ether);

        // Check facility state
        (
            bytes32 invId,
            address b,
            address s,
            uint256 p,
            uint256 gross,
            uint256 repaid,
            uint256 tenor,
            KendraEscrow.FacilityStatus status
        ) = escrow.getFacility(testInvoiceId);

        assertEq(invId, testInvoiceId);
        assertEq(b, borrower);
        assertEq(s, kybSupplier);
        assertEq(p, principal);
        assertEq(gross, grossRepayment);
        assertEq(repaid, 0);
        assertEq(tenor, tenorDays);
        assertTrue(status == KendraEscrow.FacilityStatus.ACTIVE);
    }

    function test_revertOnForgedBorrowerSignature() public {
        uint256 attackerPk = 0xBADC0DE;
        bytes[4] memory sigs;
        // Borrower signature forged by attacker
        sigs[0] = _signBorrowerIntent(attackerPk, testInvoiceId, borrower, kybSupplier, principal, grossRepayment);
        sigs[1] = _signGuarantorStake(g1Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor1, stakes[0]);
        sigs[2] = _signGuarantorStake(g2Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor2, stakes[1]);
        sigs[3] = _signGuarantorStake(g3Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor3, stakes[2]);

        vm.prank(relayer);
        vm.expectRevert("INVALID_BORROWER_EIP712_SIGNATURE");
        escrow.executeSyndicateEscrow(
            testInvoiceId,
            borrower,
            kybSupplier,
            principal,
            grossRepayment,
            tenorDays,
            guarantors,
            stakes,
            sigs
        );
    }

    function test_revertOnForgedGuarantorSignature() public {
        uint256 attackerPk = 0xBADC0DE;
        bytes[4] memory sigs;
        sigs[0] = _signBorrowerIntent(borrowerPk, testInvoiceId, borrower, kybSupplier, principal, grossRepayment);
        sigs[1] = _signGuarantorStake(g1Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor1, stakes[0]);
        // Guarantor 2 forged
        sigs[2] = _signGuarantorStake(attackerPk, testInvoiceId, borrower, kybSupplier, principal, guarantor2, stakes[1]);
        sigs[3] = _signGuarantorStake(g3Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor3, stakes[2]);

        vm.prank(relayer);
        vm.expectRevert("INVALID_GUARANTOR_EIP712_SIGNATURE");
        escrow.executeSyndicateEscrow(
            testInvoiceId,
            borrower,
            kybSupplier,
            principal,
            grossRepayment,
            tenorDays,
            guarantors,
            stakes,
            sigs
        );
    }

    function test_revertOnStakeExceeding40PercentCap() public {
        // g1 stake is 50% (> 40% cap)
        uint256[3] memory invalidStakes = [
            (grossRepayment * 5000) / 10000,
            (grossRepayment * 2500) / 10000,
            (grossRepayment * 2500) / 10000
        ];

        bytes[4] memory sigs;
        sigs[0] = _signBorrowerIntent(borrowerPk, testInvoiceId, borrower, kybSupplier, principal, grossRepayment);
        sigs[1] = _signGuarantorStake(g1Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor1, invalidStakes[0]);
        sigs[2] = _signGuarantorStake(g2Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor2, invalidStakes[1]);
        sigs[3] = _signGuarantorStake(g3Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor3, invalidStakes[2]);

        vm.prank(relayer);
        vm.expectRevert("STAKE_EXCEEDS_40_PERCENT_CAP");
        escrow.executeSyndicateEscrow(
            testInvoiceId,
            borrower,
            kybSupplier,
            principal,
            grossRepayment,
            tenorDays,
            guarantors,
            invalidStakes,
            sigs
        );
    }

    function test_revertOnUnverifiedSupplierAddress() public {
        bytes[4] memory sigs;
        sigs[0] = _signBorrowerIntent(borrowerPk, testInvoiceId, borrower, untrustedSupplier, principal, grossRepayment);
        sigs[1] = _signGuarantorStake(g1Pk, testInvoiceId, borrower, untrustedSupplier, principal, guarantor1, stakes[0]);
        sigs[2] = _signGuarantorStake(g2Pk, testInvoiceId, borrower, untrustedSupplier, principal, guarantor2, stakes[1]);
        sigs[3] = _signGuarantorStake(g3Pk, testInvoiceId, borrower, untrustedSupplier, principal, guarantor3, stakes[2]);

        vm.prank(relayer);
        vm.expectRevert("X402_UNVERIFIED_SUPPLIER_ADDRESS");
        escrow.executeSyndicateEscrow(
            testInvoiceId,
            borrower,
            untrustedSupplier,
            principal,
            grossRepayment,
            tenorDays,
            guarantors,
            stakes,
            sigs
        );
    }

    function test_repayFacility_dailySweeps_andSettlement() public {
        // 1. Execute Escrow
        bytes[4] memory sigs;
        sigs[0] = _signBorrowerIntent(borrowerPk, testInvoiceId, borrower, kybSupplier, principal, grossRepayment);
        sigs[1] = _signGuarantorStake(g1Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor1, stakes[0]);
        sigs[2] = _signGuarantorStake(g2Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor2, stakes[1]);
        sigs[3] = _signGuarantorStake(g3Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor3, stakes[2]);

        vm.prank(relayer);
        escrow.executeSyndicateEscrow(
            testInvoiceId,
            borrower,
            kybSupplier,
            principal,
            grossRepayment,
            tenorDays,
            guarantors,
            stakes,
            sigs
        );

        // 2. Partial daily sweep: 20,000 BDTc
        vm.prank(borrower);
        escrow.repayFacility(testInvoiceId, 20000 ether);

        (,,,,,, , KendraEscrow.FacilityStatus statusPart) = escrow.getFacility(testInvoiceId);
        assertTrue(statusPart == KendraEscrow.FacilityStatus.ACTIVE);

        // 3. Final daily sweep: remaining 25,462 BDTc
        uint256 g1BalanceBefore = bdtc.balanceOf(guarantor1);

        vm.prank(borrower);
        escrow.repayFacility(testInvoiceId, grossRepayment - 20000 ether);

        // Verify status is REPAID
        (,,,,,, , KendraEscrow.FacilityStatus statusDone) = escrow.getFacility(testInvoiceId);
        assertTrue(statusDone == KendraEscrow.FacilityStatus.REPAID);

        // 4. Verify 1.0% APR peer yield payout
        // yield = stake * 100 * 30 / (10000 * 365)
        uint256 expectedYieldG1 = (stakes[0] * 100 * tenorDays) / (10000 * 365);
        assertEq(bdtc.balanceOf(guarantor1) - g1BalanceBefore, expectedYieldG1);
        assertTrue(expectedYieldG1 > 0);

        // 5. Verify dynamic credit ceiling expansion (+15% = 1500 bps)
        assertEq(escrow.syndicateCreditMultiplierBps(borrower), 1500);
    }

    function test_triggerBesleyCoateBailout() public {
        bytes[4] memory sigs;
        sigs[0] = _signBorrowerIntent(borrowerPk, testInvoiceId, borrower, kybSupplier, principal, grossRepayment);
        sigs[1] = _signGuarantorStake(g1Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor1, stakes[0]);
        sigs[2] = _signGuarantorStake(g2Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor2, stakes[1]);
        sigs[3] = _signGuarantorStake(g3Pk, testInvoiceId, borrower, kybSupplier, principal, guarantor3, stakes[2]);

        vm.prank(relayer);
        escrow.executeSyndicateEscrow(
            testInvoiceId,
            borrower,
            kybSupplier,
            principal,
            grossRepayment,
            tenorDays,
            guarantors,
            stakes,
            sigs
        );

        // Relayer triggers emergency weather shock bailout
        vm.prank(relayer);
        escrow.triggerBesleyCoateBailout(testInvoiceId);

        (,,,,,, , KendraEscrow.FacilityStatus status) = escrow.getFacility(testInvoiceId);
        assertTrue(status == KendraEscrow.FacilityStatus.BAILED_OUT);
    }

    function test_agentSessionAccount_boundedPolicy() public {
        address entryPoint = address(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789);
        AgentSessionAccount account = new AgentSessionAccount(borrower, entryPoint);

        address agentSessionKey = vm.addr(0x5E5510);

        // Register session key with 40% cap (4000 bps)
        vm.prank(borrower);
        account.registerSessionKey(agentSessionKey, 4000, 7 days);

        (uint256 alpha, uint256 expiry, bool active) = account.sessionPolicies(agentSessionKey);
        assertEq(alpha, 4000);
        assertTrue(active);
        assertGt(expiry, block.timestamp);

        // Attempting to register > 40% cap must revert
        vm.prank(borrower);
        vm.expectRevert("AgentSessionAccount: ALPHA_EXCEEDS_40_PERCENT_CAP");
        account.registerSessionKey(vm.addr(0x999), 4001, 7 days);
    }
}
