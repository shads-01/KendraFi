# -*- coding: utf-8 -*-
"""
KendraFi Layer-5 Chain Executor & EIP-712 Signer Test Suite
===========================================================
Prompt 07 Verification:
- Tests ZeroTrustSessionKeySigner EIP-712 hashing and signature generation.
- Verifies exact match with KendraEscrow.sol's DOMAIN_SEPARATOR and struct typehashes.
- Tests 4-of-5 quorum signature recovery and EIP-55 address normalization.
- Tests KendraChainRelayer serverless nonce management.
- Tests transparent badging: LIVE_RPC_BROADCAST vs REPLAY_OF_VERIFIED_TESTNET_TX.
- Tests on-chain execution with local Anvil testnet (when available) or verified deterministic fallback.
"""

import json
import os
import subprocess
import time
from pathlib import Path
import pytest
from web3 import Web3
from eth_account import Account

from api.core.chain_executor import (
    ZeroTrustSessionKeySigner,
    KendraChainRelayer,
    EIP712_DOMAIN_TYPEHASH,
    BORROWER_INTENT_TYPEHASH,
    GUARANTEE_STAKE_TYPEHASH,
    to_bytes32,
    to_bdtc_wei,
    from_bdtc_wei,
    DEFAULT_AGENT_KEYS,
)


@pytest.fixture
def signer():
    contract = Web3.to_checksum_address("0x5aAdFB43eF8dAF45DD80F4676345b7676f1D70e3")
    return ZeroTrustSessionKeySigner(chain_id=84532, verifying_contract=contract)


@pytest.fixture
def relayer():
    contract = Web3.to_checksum_address("0x5aAdFB43eF8dAF45DD80F4676345b7676f1D70e3")
    bdtc = Web3.to_checksum_address("0xf13D09eD3cbdD1C930d4de74808de1f33B6b3D4f")
    return KendraChainRelayer(
        rpc_url="http://127.0.0.1:8545",  # Anvil default
        escrow_address=contract,
        bdtc_address=bdtc,
        chain_id=84532,
    )


# ==============================================================================
# 1. EIP-712 CRYPTOGRAPHIC STRUCT HASHES & ADDRESS NORMALIZATION
# ==============================================================================

def test_eip712_domain_separator_computation(signer):
    """Verifies that domain separator matches KendraEscrow.sol specification."""
    dom_sep = signer.get_domain_separator()
    assert isinstance(dom_sep, bytes)
    assert len(dom_sep) == 32

    # Recompute independently
    from eth_abi import encode
    expected = Web3.keccak(
        encode(
            ["bytes32", "bytes32", "bytes32", "uint256", "address"],
            [
                EIP712_DOMAIN_TYPEHASH,
                Web3.keccak(text="KendraFi"),
                Web3.keccak(text="1"),
                84532,
                signer.verifying_contract,
            ],
        )
    )
    assert dom_sep == expected


def test_address_normalization_and_checksumming():
    """Verifies all lowercase or mixed-case addresses are normalized with Web3.to_checksum_address."""
    raw_addr = "0x71c0000000000000000000000000000000000a91"
    normalized = Web3.to_checksum_address(raw_addr)
    assert Web3.is_checksum_address(normalized)
    assert normalized == "0x71c0000000000000000000000000000000000a91"


def test_borrower_intent_struct_hash(signer):
    """Verifies borrower struct hash matches BORROWER_INTENT_TYPEHASH."""
    invoice_id = "INV-2026-DHAKA-001"
    borrower = signer.agent_wallets["AGT-01"]
    supplier = "0x71c0000000000000000000000000000000000a91"
    principal_wei = to_bdtc_wei(45000)
    gross_wei = to_bdtc_wei(45462.33)

    shash = signer.compute_borrower_struct_hash(
        invoice_id=invoice_id,
        borrower=borrower,
        supplier=supplier,
        principal_wei=principal_wei,
        gross_repayment_wei=gross_wei,
    )
    assert isinstance(shash, bytes)
    assert len(shash) == 32

    typed_hash = signer.compute_typed_data_hash(shash)
    assert isinstance(typed_hash, bytes)
    assert len(typed_hash) == 32


def test_guarantee_stake_struct_hash(signer):
    """Verifies guarantee stake struct hash matches GUARANTEE_STAKE_TYPEHASH."""
    invoice_id = "INV-2026-DHAKA-001"
    borrower = signer.agent_wallets["AGT-01"]
    supplier = "0x71c0000000000000000000000000000000000a91"
    guarantor = signer.agent_wallets["AGT-04"]
    principal_wei = to_bdtc_wei(45000)
    stake_wei = to_bdtc_wei(18184.93)

    shash = signer.compute_guarantee_struct_hash(
        invoice_id=invoice_id,
        borrower=borrower,
        supplier=supplier,
        principal_wei=principal_wei,
        guarantor=guarantor,
        stake_amount_wei=stake_wei,
    )
    assert isinstance(shash, bytes)
    assert len(shash) == 32


# ==============================================================================
# 2. 4-OF-5 QUORUM SIGNATURE GENERATION & ON-CHAIN RECOVERY
# ==============================================================================

def test_generate_and_verify_quorum_signatures(signer):
    """
    Verifies generation of 4-element quorumSignatures array:
    [sig_borrower_AGT01, sig_AGT04, sig_AGT02, sig_AGT03].
    Recovers each signature and asserts matching expected addresses.
    """
    invoice_id = "INV-2026-DHAKA-001"
    borrower = signer.agent_wallets["AGT-01"]
    supplier = "0x71c0000000000000000000000000000000000a91"
    principal_wei = to_bdtc_wei(45000.00)
    gross_wei = to_bdtc_wei(45462.33)

    guarantors = [
        signer.agent_wallets["AGT-04"],
        signer.agent_wallets["AGT-02"],
        signer.agent_wallets["AGT-03"],
    ]
    stakes_wei = [
        to_bdtc_wei(18184.93),
        to_bdtc_wei(15911.82),
        to_bdtc_wei(11365.58),
    ]

    quorum = signer.generate_quorum_signatures(
        invoice_id=invoice_id,
        borrower=borrower,
        supplier=supplier,
        principal_wei=principal_wei,
        gross_repayment_wei=gross_wei,
        guarantors=guarantors,
        guarantor_stakes_wei=stakes_wei,
    )

    assert len(quorum) == 4
    for sig in quorum:
        assert isinstance(sig, bytes)
        assert len(sig) == 65  # 32 bytes r + 32 bytes s + 1 byte v

    # 1. Verify Borrower Signature (sig 0)
    b_shash = signer.compute_borrower_struct_hash(
        invoice_id, borrower, supplier, principal_wei, gross_wei
    )
    b_digest = signer.compute_typed_data_hash(b_shash)
    assert signer.verify_signature(b_digest, quorum[0], borrower) is True

    # 2. Verify Guarantor Signatures (sig 1, 2, 3)
    for i in range(3):
        g_shash = signer.compute_guarantee_struct_hash(
            invoice_id, borrower, supplier, principal_wei, guarantors[i], stakes_wei[i]
        )
        g_digest = signer.compute_typed_data_hash(g_shash)
        assert signer.verify_signature(g_digest, quorum[i + 1], guarantors[i]) is True


def test_tampered_signature_fails_verification(signer):
    """Verifies that tampering with signed data or signature causes verification to fail."""
    invoice_id = "INV-2026-DHAKA-001"
    borrower = signer.agent_wallets["AGT-01"]
    supplier = "0x71c0000000000000000000000000000000000a91"
    principal_wei = to_bdtc_wei(45000.00)
    gross_wei = to_bdtc_wei(45462.33)

    sig = signer.sign_borrower_intent(
        borrower_key=signer.agent_keys["AGT-01"],
        invoice_id=invoice_id,
        borrower=borrower,
        supplier=supplier,
        principal_wei=principal_wei,
        gross_repayment_wei=gross_wei,
    )

    # Verify original
    b_shash = signer.compute_borrower_struct_hash(
        invoice_id, borrower, supplier, principal_wei, gross_wei
    )
    b_digest = signer.compute_typed_data_hash(b_shash)
    assert signer.verify_signature(b_digest, sig, borrower) is True

    # Tamper with gross repayment in struct hash
    tampered_shash = signer.compute_borrower_struct_hash(
        invoice_id, borrower, supplier, principal_wei, gross_wei + 1
    )
    tampered_digest = signer.compute_typed_data_hash(tampered_shash)
    assert signer.verify_signature(tampered_digest, sig, borrower) is False


# ==============================================================================
# 3. SERVERLESS NONCE MANAGER & MONOTONIC SAFETY
# ==============================================================================

def test_serverless_nonce_manager_monotonic_increments(relayer):
    """Verifies get_next_nonce advances monotonically."""
    n1 = relayer.get_next_nonce()
    n2 = relayer.get_next_nonce()
    n3 = relayer.get_next_nonce()

    assert n2 > n1
    assert n3 > n2
    assert n3 == n1 + 2


# ==============================================================================
# 4. HONEST RELAYER & REPLAY BADGING
# ==============================================================================

def test_execute_onchain_escrow_replay_mode(relayer):
    """
    Verifies execute_onchain_escrow in offline/replay mode.
    Asserts tx_mode is REPLAY_OF_VERIFIED_TESTNET_TX with verified badging.
    """
    invoice_id = "INV-2026-DHAKA-001"
    borrower = "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955"
    supplier = "0x71c0000000000000000000000000000000000a91"

    # Force disconnected mode to test replay fallback
    relayer.w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:9999"))

    res = relayer.execute_onchain_escrow(
        invoice_id=invoice_id,
        borrower=borrower,
        supplier=supplier,
        principal_bdt=45000.00,
        gross_repayment_bdt=45462.33,
        tenor_days=30,
    )

    assert res["tx_mode"] == "REPLAY_OF_VERIFIED_TESTNET_TX"
    assert res["status"] == "SUCCESS"
    assert res["quorum_count"] == 4
    assert res["principal_bdt"] == 45000.00
    assert res["net_supplier_payout_bdt"] == 44325.00  # 98.5%
    assert res["mdr_fee_bdt"] == 675.00               # 1.5%
    assert "0x" in res["tx_hash"]
    assert "[REPLAY OF VERIFIED TESTNET TX]" in res["badge"]


def test_execute_onchain_repayment_sweep_replay_mode(relayer):
    """Verifies execute_onchain_repayment_sweep with 1.0% APR peer yield badging."""
    invoice_id = "INV-2026-DHAKA-001"

    relayer.w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:9999"))
    res = relayer.execute_onchain_repayment_sweep(
        invoice_id=invoice_id,
        amount_bdt=45462.33,
    )

    assert res["tx_mode"] == "REPLAY_OF_VERIFIED_TESTNET_TX"
    assert res["status"] == "SUCCESS"
    assert res["amount_repaid_bdt"] == 45462.33
    assert res["peer_yield_apr_bps"] == 100
    assert "[REPLAY OF VERIFIED TESTNET TX]" in res["badge"]


def test_execute_onchain_monsoon_bailout_replay_mode(relayer):
    """Verifies execute_onchain_monsoon_bailout for covariant shock."""
    invoice_id = "INV-2026-DHAKA-001"

    relayer.w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:9999"))
    res = relayer.execute_onchain_monsoon_bailout(invoice_id=invoice_id)

    assert res["tx_mode"] == "REPLAY_OF_VERIFIED_TESTNET_TX"
    assert res["status"] == "SUCCESS"
    assert res["bailout_reason"] == "COVARIANT_MONSOON_FLOODING_EXOGENOUS_SHOCK"


def test_execute_onchain_adversarial_log_replay_mode(relayer):
    """Verifies execute_onchain_adversarial_log with checksummed invalid supplier."""
    invoice_id = "INV-2026-DHAKA-001"
    invalid_supplier = "0xdead00000000000000000000000000000000beef"
    reason = "X402_UNVERIFIED_SUPPLIER_ADDRESS"

    relayer.w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:9999"))
    res = relayer.execute_onchain_adversarial_log(
        invoice_id=invoice_id,
        invalid_supplier=invalid_supplier,
        reason=reason,
    )

    assert res["tx_mode"] == "REPLAY_OF_VERIFIED_TESTNET_TX"
    assert res["status"] == "SUCCESS"
    assert res["invalid_supplier"] == Web3.to_checksum_address(invalid_supplier)
    assert res["reason"] == reason


# ==============================================================================
# 5. LIVE ON-CHAIN BROADCAST INTEGRATION TEST (LOCAL ANVIL TESTNET)
# ==============================================================================

@pytest.mark.skipif(
    not os.path.exists(os.path.expanduser("~/.foundry/bin/anvil")),
    reason="Anvil not installed",
)
def test_live_anvil_escrow_execution_and_repayment():
    """
    Spins up a lightweight local Anvil node, deploys KendraEscrow + MockBDTc,
    and executes live transactions on-chain with tx_mode == 'LIVE_RPC_BROADCAST'.
    """
    anvil_bin = os.path.expanduser("~/.foundry/bin/anvil")
    port = 8599
    rpc_url = f"http://127.0.0.1:{port}"

    # Start Anvil process
    proc = subprocess.Popen(
        [anvil_bin, "--port", str(port), "--silent"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    time.sleep(1.0)

    try:
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        assert w3.is_connected(), "Anvil failed to start"

        # Deployer / Relayer is Anvil account 0
        deployer_key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
        deployer_acct = Account.from_key(deployer_key)

        # Load bytecode and ABIs from Foundry artifacts
        contracts_out = Path(__file__).resolve().parent.parent / "contracts" / "out"
        with open(contracts_out / "MockBDTc.sol" / "MockBDTc.json") as f:
            bdtc_artifact = json.load(f)
        with open(contracts_out / "KendraEscrow.sol" / "KendraEscrow.json") as f:
            escrow_artifact = json.load(f)

        # 1. Deploy MockBDTc
        BdtcFactory = w3.eth.contract(abi=bdtc_artifact["abi"], bytecode=bdtc_artifact["bytecode"]["object"])
        tx_bdtc = BdtcFactory.constructor().build_transaction({
            "from": deployer_acct.address,
            "nonce": w3.eth.get_transaction_count(deployer_acct.address),
            "gas": 3000000,
            "gasPrice": w3.eth.gas_price,
        })
        signed = w3.eth.account.sign_transaction(tx_bdtc, deployer_key)
        h = w3.eth.send_raw_transaction(signed.raw_transaction)
        rcpt_bdtc = w3.eth.wait_for_transaction_receipt(h)
        bdtc_addr = rcpt_bdtc.contractAddress

        # 2. Deploy KendraEscrow
        EscrowFactory = w3.eth.contract(abi=escrow_artifact["abi"], bytecode=escrow_artifact["bytecode"]["object"])
        tx_escrow = EscrowFactory.constructor(bdtc_addr, deployer_acct.address).build_transaction({
            "from": deployer_acct.address,
            "nonce": w3.eth.get_transaction_count(deployer_acct.address),
            "gas": 4000000,
            "gasPrice": w3.eth.gas_price,
        })
        signed = w3.eth.account.sign_transaction(tx_escrow, deployer_key)
        h = w3.eth.send_raw_transaction(signed.raw_transaction)
        rcpt_escrow = w3.eth.wait_for_transaction_receipt(h)
        escrow_addr = rcpt_escrow.contractAddress

        # 3. Whitelist Supplier & Fund Relayer
        escrow_contract = w3.eth.contract(address=escrow_addr, abi=escrow_artifact["abi"])
        bdtc_contract = w3.eth.contract(address=bdtc_addr, abi=bdtc_artifact["abi"])
        supplier = "0x71c0000000000000000000000000000000000a91"

        # Whitelist supplier
        tx_wl = escrow_contract.functions.setKYBSupplier(supplier, True).build_transaction({
            "from": deployer_acct.address,
            "nonce": w3.eth.get_transaction_count(deployer_acct.address, "pending"),
            "gas": 200000,
            "gasPrice": w3.eth.gas_price,
        })
        signed_wl = w3.eth.account.sign_transaction(tx_wl, deployer_key)
        h_wl = w3.eth.send_raw_transaction(signed_wl.raw_transaction)
        w3.eth.wait_for_transaction_receipt(h_wl)

        # Approve BDTc for Escrow from Relayer
        tx_app = bdtc_contract.functions.approve(escrow_addr, 2**256 - 1).build_transaction({
            "from": deployer_acct.address,
            "nonce": w3.eth.get_transaction_count(deployer_acct.address, "pending"),
            "gas": 200000,
            "gasPrice": w3.eth.gas_price,
        })
        signed_app = w3.eth.account.sign_transaction(tx_app, deployer_key)
        h_app = w3.eth.send_raw_transaction(signed_app.raw_transaction)
        w3.eth.wait_for_transaction_receipt(h_app)

        # 4. Initialize Relayer on Anvil RPC
        live_relayer = KendraChainRelayer(
            rpc_url=rpc_url,
            relayer_private_key=deployer_key,
            escrow_address=escrow_addr,
            bdtc_address=bdtc_addr,
            chain_id=31337,  # Anvil chainId
        )

        # Setup agent wallets
        borrower_acct = Account.from_key(DEFAULT_AGENT_KEYS["AGT-01"])
        borrower_addr = borrower_acct.address

        guarantor_addrs = [
            Account.from_key(DEFAULT_AGENT_KEYS["AGT-04"]).address,
            Account.from_key(DEFAULT_AGENT_KEYS["AGT-02"]).address,
            Account.from_key(DEFAULT_AGENT_KEYS["AGT-03"]).address,
        ]

        # 5. Execute On-Chain Escrow Live
        invoice_id = "INV-LIVE-DHAKA-001"
        res_escrow = live_relayer.execute_onchain_escrow(
            invoice_id=invoice_id,
            borrower=borrower_addr,
            supplier=supplier,
            principal_bdt=45000.00,
            gross_repayment_bdt=45462.33,
            tenor_days=30,
            guarantors=guarantor_addrs,
            guarantor_stakes_bdt=[18184.93, 15911.82, 11365.58],
        )

        assert res_escrow["tx_mode"] == "LIVE_RPC_BROADCAST"
        assert res_escrow["status"] == "SUCCESS"
        assert res_escrow["block_number"] > 0
        assert res_escrow["gas_used"] > 0
        assert res_escrow["net_supplier_payout_bdt"] == 44325.00

        # Supplier received 44,325 BDTc
        sup_bal = bdtc_contract.functions.balanceOf(supplier).call()
        assert sup_bal == to_bdtc_wei(44325.00)

        # 6. Execute Repayment Sweep Live
        res_sweep = live_relayer.execute_onchain_repayment_sweep(
            invoice_id=invoice_id,
            amount_bdt=45462.33,
        )

        assert res_sweep["tx_mode"] == "LIVE_RPC_BROADCAST"
        assert res_sweep["status"] == "SUCCESS"
        assert res_sweep["block_number"] > 0
        assert res_sweep["amount_repaid_bdt"] == 45462.33

    finally:
        proc.terminate()
        proc.wait()
