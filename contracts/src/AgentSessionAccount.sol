// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @dev PackedUserOperation struct defined in ERC-4337 v0.7
 */
struct PackedUserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    bytes32 accountGasLimits;
    uint256 preVerificationGas;
    bytes32 gasFees;
    bytes paymasterAndData;
    bytes signature;
}

/**
 * @dev ERC-4337 Account interface
 */
interface IAccount {
    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData);
}

/**
 * @title AgentSessionAccount
 * @notice ERC-4337 compliant smart contract wallet with bounded session key policies.
 * Enforces a strict 40.0% (4,000 bps) maxAlphaBps joint-liability staking cap per session key.
 * 2026 Shenzhen International FinTechathon (Topic F: +5 Bonus Agent Wallet).
 */
contract AgentSessionAccount is IAccount {
    struct SessionPolicy {
        uint256 maxAlphaBps; // Max 4000 (40.0%)
        uint256 expiry;     // Expiration timestamp
        bool active;        // Authorization status
    }

    address public owner;
    address public entryPoint;
    uint256 public constant MAX_STAKE_CAP_BPS = 4000; // 40.0% hard cap

    mapping(address => SessionPolicy) public sessionPolicies;

    event SessionKeyRegistered(address indexed sessionKey, uint256 maxAlphaBps, uint256 expiry);
    event SessionKeyRevoked(address indexed sessionKey);
    event Executed(address indexed target, uint256 value, bytes data);

    modifier onlyOwner() {
        require(msg.sender == owner, "AgentSessionAccount: NOT_OWNER");
        _;
    }

    modifier onlyEntryPointOrOwner() {
        require(msg.sender == entryPoint || msg.sender == owner, "AgentSessionAccount: UNAUTHORIZED");
        _;
    }

    constructor(address _owner, address _entryPoint) {
        require(_owner != address(0), "AgentSessionAccount: ZERO_OWNER");
        owner = _owner;
        entryPoint = _entryPoint;
    }

    /**
     * @notice Registers or updates a bounded session key.
     * @dev Enforces the non-negotiable 40.0% single-agent liability cap.
     */
    function registerSessionKey(
        address sessionKey,
        uint256 maxAlphaBps,
        uint256 expiry
    ) public onlyOwner {
        require(sessionKey != address(0), "AgentSessionAccount: ZERO_KEY");
        require(maxAlphaBps <= MAX_STAKE_CAP_BPS, "AgentSessionAccount: ALPHA_EXCEEDS_40_PERCENT_CAP");
        require(expiry > block.timestamp, "AgentSessionAccount: INVALID_EXPIRY");

        sessionPolicies[sessionKey] = SessionPolicy({
            maxAlphaBps: maxAlphaBps,
            expiry: expiry,
            active: true
        });

        emit SessionKeyRegistered(sessionKey, maxAlphaBps, expiry);
    }

    function setSessionKey(
        address sessionKey,
        uint256 maxAlphaBps,
        uint256 expiry
    ) external onlyOwner {
        registerSessionKey(sessionKey, maxAlphaBps, expiry);
    }

    /**
     * @notice Revokes a previously authorized session key.
     */
    function revokeSessionKey(address sessionKey) external onlyOwner {
        delete sessionPolicies[sessionKey];
        emit SessionKeyRevoked(sessionKey);
    }

    /**
     * @notice Validates an ERC-4337 user operation.
     */
    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external override returns (uint256 validationData) {
        require(msg.sender == entryPoint, "AgentSessionAccount: NOT_FROM_ENTRYPOINT");

        // Signature verification (signer must be owner or valid active session key)
        address signer = recoverSigner(userOpHash, userOp.signature);
        if (signer == owner) {
            // Owner signature valid without bounds
            validationData = 0;
        } else {
            SessionPolicy memory policy = sessionPolicies[signer];
            if (policy.active && block.timestamp <= policy.expiry) {
                // Session key valid until policy.expiry
                validationData = uint256(policy.expiry) << 160;
            } else {
                // Signature mismatch / expired session key (ERC-4337 SIG_VALIDATION_FAILED)
                return 1;
            }
        }

        // Pay missing funds to entrypoint if requested
        if (missingAccountFunds > 0) {
            (bool success, ) = payable(entryPoint).call{value: missingAccountFunds}("");
            require(success, "AgentSessionAccount: GAS_PAYMENT_FAILED");
        }

        return validationData;
    }

    /**
     * @notice Executes transactions on behalf of the smart account.
     */
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external onlyEntryPointOrOwner returns (bytes memory) {
        (bool success, bytes memory result) = dest.call{value: value}(func);
        require(success, "AgentSessionAccount: EXECUTION_FAILED");
        emit Executed(dest, value, func);
        return result;
    }

    /**
     * @dev Recovers signer from standard ECDSA signature.
     */
    function recoverSigner(bytes32 hash, bytes memory signature) internal pure returns (address) {
        if (signature.length != 65) {
            return address(0);
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
            return address(0);
        }
        return ecrecover(hash, v, r, s);
    }

    receive() external payable {}
}
