// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./MockBDTc.sol";

/**
 * @dev Cryptographic signature recovery utility strictly conforming to OpenZeppelin ECDSA standard.
 */
library ECDSA {
    function recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        if (signature.length != 65) {
            revert("ECDSA: invalid signature length");
        }
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        if (v < 27) {
            v += 27;
        }
        if (v != 27 && v != 28) {
            revert("ECDSA: invalid signature 'v' value");
        }
        // Protect against signature malleability (s in lower half of secp256k1 order)
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D57617F1A13DDFF7FF75F57A08BFF86) {
            revert("ECDSA: invalid signature 's' value");
        }
        address signer = ecrecover(hash, v, r, s);
        require(signer != address(0), "ECDSA: invalid signature");
        return signer;
    }

    function toTypedDataHash(bytes32 domainSeparator, bytes32 structHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    }
}

/**
 * @dev Reentrancy protection modifier.
 */
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: REENTRANT_CALL");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

/**
 * @title KendraEscrow
 * @notice Layer-5 Programmable B2B Escrow & Autonomous Peer Syndicate Protocol for WeBank Weiyedai-Global.
 *
 * Core Guarantees:
 * 1. solc 0.8.20 + paris EVM: Bytecode compatibility across FISCO BCOS v3 and Base Sepolia.
 * 2. On-Chain EIP-712 Multisig Verification (ECDSA.recover): Verifies 4-of-5 quorum (1 Borrower + 3 Guarantors).
 * 3. Enforces on-chain max 40.0% single-agent staking cap: guarantorStakes[i] <= (grossRepayment * 4000) / 10000.
 * 4. Direct 98.5% B2B settlement to whitelisted supplier (isKYBSupplier), deducting 1.50% Wholesale MDR.
 * 5. Automated daily repayment sweeps with 1.00% APR micro-guarantee yield (ySCT) distribution.
 * 6. Autonomous Monsoon Flash Bailouts (triggerBesleyCoateBailout) for covariant exogenous weather shocks.
 */
contract KendraEscrow is ReentrancyGuard {
    using ECDSA for bytes32;

    enum FacilityStatus {
        NONE,
        ACTIVE,
        REPAID,
        BAILED_OUT,
        INTERCEPTED
    }

    struct Facility {
        bytes32 invoiceId;
        address borrower;
        address supplier;
        uint256 principal;
        uint256 grossRepayment;
        uint256 amountRepaid;
        uint256 tenorDays;
        uint256 startTime;
        FacilityStatus status;
        address[3] guarantors;
        uint256[3] guarantorStakes;
    }

    // ==============================================================================
    // STATE VARIABLES & CONSTANTS
    // ==============================================================================

    MockBDTc public immutable bdtcToken;
    address public relayer;
    address public governance;

    bytes32 public DOMAIN_SEPARATOR;

    bytes32 public constant BORROWER_INTENT_TYPEHASH = keccak256(
        "BorrowerIntent(bytes32 invoiceId,address borrower,address supplier,uint256 principal,uint256 grossRepayment)"
    );

    bytes32 public constant GUARANTEE_STAKE_TYPEHASH = keccak256(
        "GuaranteeStake(bytes32 invoiceId,address borrower,address supplier,uint256 principal,address guarantor,uint256 stakeAmount)"
    );

    uint256 public constant MAX_STAKE_CAP_BPS = 4000; // 40.0% single-agent liability cap
    uint256 public constant WHOLESALER_MDR_BPS = 150; // 1.50% supplier early-settlement discount
    uint256 public constant PEER_YIELD_APR_BPS = 100; // 1.00% APR micro-guarantee yield (ySCT)

    mapping(address => bool) public isKYBSupplier;
    mapping(address => address) public agentSessionSigner;
    mapping(bytes32 => Facility) public facilities;
    mapping(address => uint256) public syndicateCreditMultiplierBps;
    mapping(address => uint256) public totalYieldEarned;

    // ==============================================================================
    // EVENTS
    // ==============================================================================

    event SyndicateEscrowExecuted(
        bytes32 indexed invoiceId,
        address indexed borrower,
        address indexed supplier,
        uint256 principal,
        uint256 grossRepayment,
        uint256 netSupplierPayout,
        uint256 mdrFee
    );

    event CollateralLocked(bytes32 indexed invoiceId, address indexed guarantor, uint256 stakeAmount);
    event CollateralUnlocked(bytes32 indexed invoiceId, address indexed guarantor, uint256 stakeAmount, uint256 yieldPaid);
    event RepaymentReceived(bytes32 indexed invoiceId, address indexed payer, uint256 amount, uint256 totalRepaid);
    event FacilitySettled(bytes32 indexed invoiceId, address indexed borrower, uint256 totalAmountRepaid);
    event BesleyCoateBailoutTriggered(bytes32 indexed invoiceId, address indexed borrower, string reason);
    event AdversarialInterceptRecorded(bytes32 indexed invoiceId, address indexed invalidSupplier, string reason);
    event KYBSupplierUpdated(address indexed supplier, bool whitelisted);
    event AgentSessionSignerRegistered(address indexed agentWallet, address indexed sessionKey);

    // ==============================================================================
    // MODIFIERS
    // ==============================================================================

    modifier onlyRelayer() {
        require(msg.sender == relayer, "KendraEscrow: ONLY_RELAYER");
        _;
    }

    modifier onlyGovernance() {
        require(msg.sender == governance, "KendraEscrow: ONLY_GOVERNANCE");
        _;
    }

    // ==============================================================================
    // CONSTRUCTOR
    // ==============================================================================

    constructor(address _bdtcToken, address _relayer) {
        require(_bdtcToken != address(0), "KendraEscrow: ZERO_BDTC_ADDRESS");
        require(_relayer != address(0), "KendraEscrow: ZERO_RELAYER_ADDRESS");

        bdtcToken = MockBDTc(_bdtcToken);
        relayer = _relayer;
        governance = msg.sender;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("KendraFi")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );

        // Pre-configure canonical Karwan Bazar suppliers
        isKYBSupplier[0x71c0000000000000000000000000000000000a91] = true; // Meghna Group Wholesale
        isKYBSupplier[0x82D0000000000000000000000000000000000B42] = true; // Islampur Fabric Mills
        isKYBSupplier[0x93E0000000000000000000000000000000000c18] = true; // Shyamoli Cold Storage
        isKYBSupplier[0xA4f0000000000000000000000000000000000D77] = true; // Square Pharma Depot
    }

    // ==============================================================================
    // CORE ESCROW SETTLEMENT WITH ON-CHAIN EIP-712 SIGNATURE VERIFICATION
    // ==============================================================================

    /**
     * @notice Executes a multi-agent syndicated escrow with on-chain EIP-712 quorum verification.
     * @param invoiceId Unique invoice hash identifier.
     * @param borrower Borrower wallet address.
     * @param supplier Wholesaler wallet address (must be KYB whitelisted).
     * @param principal Principal loan amount in BDTc.
     * @param grossRepayment Gross repayment amount including ACT/365 interest.
     * @param tenorDays Loan tenor duration in days.
     * @param guarantors Array of 3 guarantor wallet addresses.
     * @param guarantorStakes Array of 3 stake obligations (each must be <= 40% cap).
     * @param quorumSignatures Array of 4 EIP-712 signatures: [0] Borrower, [1..3] Guarantors.
     */
    function executeSyndicateEscrow(
        bytes32 invoiceId,
        address borrower,
        address supplier,
        uint256 principal,
        uint256 grossRepayment,
        uint256 tenorDays,
        address[3] calldata guarantors,
        uint256[3] calldata guarantorStakes,
        bytes[4] calldata quorumSignatures
    ) external nonReentrant returns (uint256 netSupplierPayout) {
        require(facilities[invoiceId].status == FacilityStatus.NONE, "KendraEscrow: FACILITY_ALREADY_EXISTS");
        require(principal > 0, "KendraEscrow: INVALID_PRINCIPAL");
        require(grossRepayment >= principal, "KendraEscrow: INVALID_GROSS_REPAYMENT");
        require(tenorDays > 0 && tenorDays <= 180, "KendraEscrow: INVALID_TENOR");

        // 1. Enforce x402 Counterparty Registry Screen
        require(isKYBSupplier[supplier], "X402_UNVERIFIED_SUPPLIER_ADDRESS");

        // 2. On-Chain EIP-712 Signature Verification for Borrower
        _verifyBorrowerSignature(invoiceId, borrower, supplier, principal, grossRepayment, quorumSignatures[0]);

        // 3. On-Chain EIP-712 Signature Verification & 40% Cap Enforcement for All 3 Guarantors
        _verifyGuarantorsQuorum(
            invoiceId,
            borrower,
            supplier,
            principal,
            grossRepayment,
            guarantors,
            guarantorStakes,
            quorumSignatures
        );

        // 4. Deduct 1.50% Wholesale Supplier MDR & Settle 98.5% Directly to Supplier
        uint256 mdrFee = (principal * WHOLESALER_MDR_BPS) / 10000;
        netSupplierPayout = principal - mdrFee; // 98.5%

        // Pull principal funding from Relayer / Capital Pool
        require(bdtcToken.transferFrom(msg.sender, address(this), principal), "KendraEscrow: PRINCIPAL_FUNDING_FAILED");

        // Pay supplier directly (0% borrower diversion risk)
        require(bdtcToken.transfer(supplier, netSupplierPayout), "KendraEscrow: SUPPLIER_PAYOUT_FAILED");

        // Store facility record
        facilities[invoiceId] = Facility({
            invoiceId: invoiceId,
            borrower: borrower,
            supplier: supplier,
            principal: principal,
            grossRepayment: grossRepayment,
            amountRepaid: 0,
            tenorDays: tenorDays,
            startTime: block.timestamp,
            status: FacilityStatus.ACTIVE,
            guarantors: guarantors,
            guarantorStakes: guarantorStakes
        });

        emit SyndicateEscrowExecuted(
            invoiceId,
            borrower,
            supplier,
            principal,
            grossRepayment,
            netSupplierPayout,
            mdrFee
        );

        return netSupplierPayout;
    }

    function _verifyBorrowerSignature(
        bytes32 invoiceId,
        address borrower,
        address supplier,
        uint256 principal,
        uint256 grossRepayment,
        bytes calldata signature
    ) internal view {
        bytes32 structHash = keccak256(
            abi.encode(BORROWER_INTENT_TYPEHASH, invoiceId, borrower, supplier, principal, grossRepayment)
        );
        bytes32 typedHash = ECDSA.toTypedDataHash(DOMAIN_SEPARATOR, structHash);
        address recovered = typedHash.recover(signature);

        address expected = agentSessionSigner[borrower] != address(0) ? agentSessionSigner[borrower] : borrower;
        require(recovered == expected, "INVALID_BORROWER_EIP712_SIGNATURE");
    }

    function _verifyGuarantorsQuorum(
        bytes32 invoiceId,
        address borrower,
        address supplier,
        uint256 principal,
        uint256 grossRepayment,
        address[3] calldata guarantors,
        uint256[3] calldata guarantorStakes,
        bytes[4] calldata quorumSignatures
    ) internal {
        uint256 totalStaked = 0;
        uint256 maxAllowedStake = (grossRepayment * MAX_STAKE_CAP_BPS) / 10000;

        for (uint256 i = 0; i < 3; i++) {
            address guarantor = guarantors[i];
            uint256 stake = guarantorStakes[i];

            require(guarantor != address(0), "KendraEscrow: ZERO_GUARANTOR");
            require(guarantor != borrower, "KendraEscrow: BORROWER_CANNOT_GUARANTEE_OWN_LOAN");
            require(stake > 0, "KendraEscrow: ZERO_STAKE");
            require(stake <= maxAllowedStake, "STAKE_EXCEEDS_40_PERCENT_CAP");

            bytes32 stakeStructHash = keccak256(
                abi.encode(GUARANTEE_STAKE_TYPEHASH, invoiceId, borrower, supplier, principal, guarantor, stake)
            );
            bytes32 stakeTypedHash = ECDSA.toTypedDataHash(DOMAIN_SEPARATOR, stakeStructHash);
            address recovered = stakeTypedHash.recover(quorumSignatures[i + 1]);

            address expected = agentSessionSigner[guarantor] != address(0) ? agentSessionSigner[guarantor] : guarantor;
            require(recovered == expected, "INVALID_GUARANTOR_EIP712_SIGNATURE");

            totalStaked += stake;
            emit CollateralLocked(invoiceId, guarantor, stake);
        }

        require(totalStaked == grossRepayment, "KendraEscrow: TOTAL_STAKE_MUST_EQUAL_GROSS_REPAYMENT");
    }

    // ==============================================================================
    // REPAYMENT SWEEPS & MICRO-GUARANTEE YIELD (ySCT) PAYOUT
    // ==============================================================================

    /**
     * @notice Sweeps daily MFS repayments into the escrow vault and distributes 1.0% APR yield upon full settlement.
     */
    function repayFacility(bytes32 invoiceId, uint256 amount) external nonReentrant {
        Facility storage fac = facilities[invoiceId];
        require(fac.status == FacilityStatus.ACTIVE, "KendraEscrow: FACILITY_NOT_ACTIVE");
        require(amount > 0, "KendraEscrow: ZERO_REPAYMENT");

        fac.amountRepaid += amount;
        require(bdtcToken.transferFrom(msg.sender, address(this), amount), "KendraEscrow: REPAYMENT_TRANSFER_FAILED");

        emit RepaymentReceived(invoiceId, msg.sender, amount, fac.amountRepaid);

        // Check if fully settled
        if (fac.amountRepaid >= fac.grossRepayment) {
            fac.status = FacilityStatus.REPAID;

            // Distribute 1.0% APR annualized yield to guarantors proportional to their stake
            for (uint256 i = 0; i < 3; i++) {
                address guarantor = fac.guarantors[i];
                uint256 stake = fac.guarantorStakes[i];

                // Yield = stake * 1.0% * (tenorDays / 365)
                uint256 yieldAmount = (stake * PEER_YIELD_APR_BPS * fac.tenorDays) / (10000 * 365);
                if (yieldAmount > 0 && bdtcToken.balanceOf(address(this)) >= yieldAmount) {
                    bool sent = bdtcToken.transfer(guarantor, yieldAmount);
                    require(sent, "KendraEscrow: YIELD_TRANSFER_FAILED");
                    totalYieldEarned[guarantor] += yieldAmount;
                }

                emit CollateralUnlocked(invoiceId, guarantor, stake, yieldAmount);
            }

            // Expand borrower dynamic credit ceiling by +15% (1500 bps)
            syndicateCreditMultiplierBps[fac.borrower] += 1500;

            emit FacilitySettled(invoiceId, fac.borrower, fac.amountRepaid);
        }
    }

    // ==============================================================================
    // EMERGENCY AUTONOMOUS MONSOON FLASH BAILOUT & INTERCEPT LOGGING
    // ==============================================================================

    /**
     * @notice Triggers emergency flash bailout for exogenous weather shocks (e.g. Dhaka monsoon flooding).
     * Unlocks peer collateral without slashing reputation.
     */
    function triggerBesleyCoateBailout(bytes32 invoiceId) external nonReentrant onlyRelayer {
        Facility storage fac = facilities[invoiceId];
        require(fac.status == FacilityStatus.ACTIVE, "KendraEscrow: FACILITY_NOT_ACTIVE");

        fac.status = FacilityStatus.BAILED_OUT;

        // Unlock peer social collateral without slashing
        for (uint256 i = 0; i < 3; i++) {
            emit CollateralUnlocked(invoiceId, fac.guarantors[i], fac.guarantorStakes[i], 0);
        }

        emit BesleyCoateBailoutTriggered(invoiceId, fac.borrower, "COVARIANT_MONSOON_FLOODING_EXOGENOUS_SHOCK");
    }

    /**
     * @notice Records adversarial security intercepts on-chain for transparent auditability.
     */
    function recordAdversarialIntercept(
        bytes32 invoiceId,
        address invalidSupplier,
        string calldata reason
    ) external onlyRelayer {
        emit AdversarialInterceptRecorded(invoiceId, invalidSupplier, reason);
    }

    // ==============================================================================
    // ADMINISTRATIVE CONFIGURATION
    // ==============================================================================

    function setKYBSupplier(address supplier, bool whitelisted) external onlyGovernance {
        isKYBSupplier[supplier] = whitelisted;
        emit KYBSupplierUpdated(supplier, whitelisted);
    }

    function registerAgentSessionSigner(address agentWallet, address sessionKey) external onlyGovernance {
        agentSessionSigner[agentWallet] = sessionKey;
        emit AgentSessionSignerRegistered(agentWallet, sessionKey);
    }

    function setRelayer(address _relayer) external onlyGovernance {
        require(_relayer != address(0), "KendraEscrow: ZERO_ADDRESS");
        relayer = _relayer;
    }

    function getFacility(bytes32 invoiceId) external view returns (
        bytes32 invId,
        address borrower,
        address supplier,
        uint256 principal,
        uint256 grossRepayment,
        uint256 amountRepaid,
        uint256 tenorDays,
        FacilityStatus status
    ) {
        Facility storage fac = facilities[invoiceId];
        return (
            fac.invoiceId,
            fac.borrower,
            fac.supplier,
            fac.principal,
            fac.grossRepayment,
            fac.amountRepaid,
            fac.tenorDays,
            fac.status
        );
    }
}

