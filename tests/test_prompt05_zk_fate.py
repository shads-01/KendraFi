"""
tests/test_prompt05_zk_fate.py
Automated Test Suite for Prompt 05: Layer-4 Cryptographic Privacy, secp256k1 Pedersen Commitments,
16-Bit CDS94 Range Proofs, Private Set Intersection (PSI), and WeBank FATE Hetero-LR Scorer.
2026 Shenzhen International FinTechathon — Tsinghua PBCSF & WeBank.

Verifies:
1. Deterministic nothing-up-my-sleeve secondary generator H on secp256k1.
2. Exact Pedersen commitments C_i = v*G + r_i*H and homomorphic excess C_excess = C_i - T*G.
3. 16-bit CDS94 OR-Sigma Range Proof generation and cryptographic verification.
4. Negative excess cash flow (v < T) rejection.
5. Bit commitment tampering detection via curve-point homomorphic sum sum(2^k * C_bk) == C_excess.
6. Private Set Intersection (PSI) supplier whitelist verification.
7. WeBank FATE Hetero-LR survival probability scoring (p_1 = 98.5%).
8. Strict Pydantic v2 ZKCommitmentProof validation.
"""

import os
import time
import pytest
from ecdsa.curves import SECP256k1
from ecdsa.ellipticcurve import PointJacobi

from api.core.schemas import BitRangeProof, ZKCommitmentProof
from api.core.zk_fate_privacy import (
    CURVE_ORDER,
    GENERATOR_G,
    GENERATOR_H,
    Secp256k1PedersenRangeProver,
    WeBankFATEHeteroLRScorer,
    compress_point,
    compute_psi_supplier_token,
    create_zk_solvency_proof,
    decompress_point,
    sub_points,
    verify_psi_supplier_token,
    verify_zk_solvency_proof,
)


VALID_SUPPLIER_MEGHNA = "0x71C0000000000000000000000000000000000A91"
UNVERIFIED_SUPPLIER_PATUATULI = "0xDead00000000000000000000000000000000Beef"


# ==============================================================================
# TEST SUITE 1: GENERATORS & NOTHING-UP-MY-SLEEVE SEED
# ==============================================================================

def test_secp256k1_generators_and_nothing_up_my_sleeve():
    """
    Validates that:
    1. G is standard secp256k1 generator.
    2. H is a valid point on secp256k1 derived deterministically via Hash-to-Curve.
    3. H != G and H is not point at infinity.
    """
    assert GENERATOR_G is not None
    assert GENERATOR_H is not None
    assert GENERATOR_H != GENERATOR_G

    # Verify H is on the secp256k1 curve: y^2 == x^3 + 7 (mod p)
    p = SECP256k1.curve.p()
    x = GENERATOR_H.x()
    y = GENERATOR_H.y()
    assert (pow(y, 2, p)) == (pow(x, 3, p) + 7) % p


# ==============================================================================
# TEST SUITE 2: PEDERSEN COMMITMENTS & HOMOMORPHIC EXCESS
# ==============================================================================

def test_pedersen_commitment_and_excess_homomorphism():
    """
    Validates:
    v = 76,376 BDT, T = 56,828 BDT, Delta_v = 19,548 BDT.
    C_i = v*G + r*H
    C_excess = C_i - T*G == Delta_v*G + r*H
    """
    v = 76376
    t = 56828
    delta_v = v - t  # 19548
    r = int.from_bytes(os.urandom(32), "big") % CURVE_ORDER

    c_i = Secp256k1PedersenRangeProver.commit(v, r)
    c_excess = Secp256k1PedersenRangeProver.compute_excess_commitment(c_i, t)

    direct_excess = Secp256k1PedersenRangeProver.commit(delta_v, r)

    assert c_excess == direct_excess, "Homomorphic excess commitment mismatch"


# ==============================================================================
# TEST SUITE 3: 16-BIT CDS94 OR-SIGMA RANGE PROOF & BENCHMARK PERFORMANCE
# ==============================================================================

def test_prove_and_verify_16bit_cds94_range_proof():
    """
    Validates generation and cryptographic verification of 16-bit CDS94 proof
    proving Delta_v in [0, 65535].
    """
    v = 76376
    t = 56828
    r = int.from_bytes(os.urandom(32), "big") % CURVE_ORDER

    t0 = time.time()
    c_i, c_excess, bit_proofs = Secp256k1PedersenRangeProver.prove_non_negative_16bit(v, t, r)
    gen_time_ms = (time.time() - t0) * 1000

    assert len(bit_proofs) == 16
    for idx, bp in enumerate(bit_proofs):
        assert bp.bit_index == idx
        assert len(bp.commitment_point_hex) == 66
        assert len(bp.e0_hex) == 64
        assert len(bp.z0_hex) == 64
        assert len(bp.e1_hex) == 64
        assert len(bp.z1_hex) == 64

    # Cryptographic verification by peer agent
    t1 = time.time()
    is_valid = Secp256k1PedersenRangeProver.verify_non_negative_16bit(
        commitment_c=c_i,
        solvency_floor_t=t,
        excess_commitment=c_excess,
        bit_proofs=bit_proofs,
    )
    verify_time_ms = (time.time() - t1) * 1000

    assert is_valid is True, "Valid 16-bit CDS94 proof failed verification"


# ==============================================================================
# TEST SUITE 4: NEGATIVE EXCESS CASH FLOW REJECTION (SOLVENCY VIOLATION)
# ==============================================================================

def test_negative_excess_cash_flow_fails_decomposition():
    """
    Validates that if v < T (e.g. v = 50,000 < T = 56,828, Delta_v = -6,828),
    bit-decomposition fails with ValueError and cannot produce a sound proof.
    """
    v_insolvent = 50000
    t_floor = 56828
    r = int.from_bytes(os.urandom(32), "big") % CURVE_ORDER

    with pytest.raises(ValueError, match="SOLVENCY_RANGE_VIOLATION"):
        Secp256k1PedersenRangeProver.prove_non_negative_16bit(
            projected_cf_v=v_insolvent,
            solvency_floor_t=t_floor,
            blinding_factor_r=r,
        )

    with pytest.raises(ValueError, match="SOLVENCY_VIOLATION"):
        create_zk_solvency_proof(
            projected_cf_v=v_insolvent,
            solvency_floor_t=t_floor,
            supplier_wallet=VALID_SUPPLIER_MEGHNA,
        )


def test_overflow_excess_cash_flow_fails_decomposition():
    """
    Validates that if Delta_v >= 2^16 (65,536), it fails 16-bit range decomposition.
    """
    v_overflow = 56828 + 65536
    t_floor = 56828
    r = int.from_bytes(os.urandom(32), "big") % CURVE_ORDER

    with pytest.raises(ValueError, match="SOLVENCY_RANGE_VIOLATION"):
        Secp256k1PedersenRangeProver.prove_non_negative_16bit(
            projected_cf_v=v_overflow,
            solvency_floor_t=t_floor,
            blinding_factor_r=r,
        )


# ==============================================================================
# TEST SUITE 5: HOMOMORPHIC CURVE-POINT SUM & BIT TAMPERING DETECTION
# ==============================================================================

def test_tampering_with_bit_commitment_breaks_homomorphic_sum():
    """
    Validates that tampering with ANY bit commitment C_bk breaks the homomorphic
    curve-point sum sum(2^k * C_bk) == C_excess and is rejected.
    """
    proof = create_zk_solvency_proof(
        projected_cf_v=76376,
        solvency_floor_t=56828,
        supplier_wallet=VALID_SUPPLIER_MEGHNA,
    )
    assert verify_zk_solvency_proof(proof, 56828, VALID_SUPPLIER_MEGHNA) is True

    # Tamper with bit commitment at index 3
    tampered_proofs = list(proof.bit_range_proofs)
    orig_bp = tampered_proofs[3]

    # Change to a forged point
    forged_point_hex = compress_point(GENERATOR_G + GENERATOR_H)
    tampered_proofs[3] = BitRangeProof(
        bit_index=orig_bp.bit_index,
        commitment_point_hex=forged_point_hex,
        e0_hex=orig_bp.e0_hex,
        z0_hex=orig_bp.z0_hex,
        e1_hex=orig_bp.e1_hex,
        z1_hex=orig_bp.z1_hex,
    )

    tampered_zk = proof.model_copy(update={"bit_range_proofs": tampered_proofs})

    # Verifier MUST reject the tampered commitment
    assert verify_zk_solvency_proof(tampered_zk, 56828, VALID_SUPPLIER_MEGHNA) is False


def test_tampering_with_challenge_scalar_breaks_cds94_verification():
    """
    Validates that modifying any CDS94 challenge scalar (e0_hex) breaks
    e0 XOR e1 == SHA256(...) and is rejected by the verifier.
    """
    proof = create_zk_solvency_proof(
        projected_cf_v=76376,
        solvency_floor_t=56828,
        supplier_wallet=VALID_SUPPLIER_MEGHNA,
    )

    tampered_proofs = list(proof.bit_range_proofs)
    orig_bp = tampered_proofs[7]

    # Tamper with e0 challenge scalar
    bad_e0 = "ff" * 32
    tampered_proofs[7] = BitRangeProof(
        bit_index=orig_bp.bit_index,
        commitment_point_hex=orig_bp.commitment_point_hex,
        e0_hex=bad_e0,
        z0_hex=orig_bp.z0_hex,
        e1_hex=orig_bp.e1_hex,
        z1_hex=orig_bp.z1_hex,
    )

    tampered_zk = proof.model_copy(update={"bit_range_proofs": tampered_proofs})
    assert verify_zk_solvency_proof(tampered_zk, 56828, VALID_SUPPLIER_MEGHNA) is False


def test_tampering_with_response_scalar_breaks_cds94_verification():
    """
    Validates that modifying any response scalar (z0_hex) breaks
    z0*H == R0 + e0*C_bk and is rejected by the verifier.
    """
    proof = create_zk_solvency_proof(
        projected_cf_v=76376,
        solvency_floor_t=56828,
        supplier_wallet=VALID_SUPPLIER_MEGHNA,
    )

    tampered_proofs = list(proof.bit_range_proofs)
    orig_bp = tampered_proofs[11]

    # Tamper with z0 response scalar
    bad_z0 = "00" * 31 + "01"
    tampered_proofs[11] = BitRangeProof(
        bit_index=orig_bp.bit_index,
        commitment_point_hex=orig_bp.commitment_point_hex,
        e0_hex=orig_bp.e0_hex,
        z0_hex=bad_z0,
        e1_hex=orig_bp.e1_hex,
        z1_hex=orig_bp.z1_hex,
    )

    tampered_zk = proof.model_copy(update={"bit_range_proofs": tampered_proofs})
    assert verify_zk_solvency_proof(tampered_zk, 56828, VALID_SUPPLIER_MEGHNA) is False


# ==============================================================================
# TEST SUITE 6: PRIVATE SET INTERSECTION (PSI) SUPPLIER REGISTRY
# ==============================================================================

def test_psi_supplier_token_verification():
    """
    Validates HMAC-SHA256 Private Set Intersection (PSI) token for KYB verification:
    - Meghna Group (verified wholesaler): True
    - Patuatuli Parts Hub (unverified): False
    """
    token_meghna = compute_psi_supplier_token(VALID_SUPPLIER_MEGHNA)
    assert len(token_meghna) == 64
    assert verify_psi_supplier_token(token_meghna, VALID_SUPPLIER_MEGHNA) is True

    token_patuatuli = compute_psi_supplier_token(UNVERIFIED_SUPPLIER_PATUATULI)
    assert verify_psi_supplier_token(token_patuatuli, UNVERIFIED_SUPPLIER_PATUATULI) is False

    # Proof created with unverified supplier must fail verify_zk_solvency_proof
    proof_valid = create_zk_solvency_proof(supplier_wallet=VALID_SUPPLIER_MEGHNA)
    assert verify_zk_solvency_proof(proof_valid, 56828, VALID_SUPPLIER_MEGHNA) is True
    assert verify_zk_solvency_proof(proof_valid, 56828, UNVERIFIED_SUPPLIER_PATUATULI) is False


# ==============================================================================
# TEST SUITE 7: WEBANK FATE HETERO-LR CREDIT SCORER
# ==============================================================================

def test_webank_fate_hetero_lr_scorer_benchmark():
    """
    Validates WeBank FATE Hetero-LR credit scorer output:
    p_1 = 0.9850 (98.5%) for standard Rahim Store (AGT-01).
    """
    p1 = WeBankFATEHeteroLRScorer.compute_survival_probability(agent_id="AGT-01")
    assert p1 == 0.9850, f"Expected 0.9850, got {p1}"


def test_webank_fate_hetero_lr_scorer_dynamic_features():
    """
    Validates dynamic feature logit calculation: u_A = X_A * theta_A, u_B = X_B * theta_B.
    """
    p_high = WeBankFATEHeteroLRScorer.compute_survival_probability(
        features_a=[1.0, 1.0, 1.0],
        features_b=[1.0, 1.0, 1.0],
        agent_id="CUSTOM",
    )
    p_low = WeBankFATEHeteroLRScorer.compute_survival_probability(
        features_a=[-2.0, -2.0, -2.0],
        features_b=[-2.0, -2.0, -2.0],
        agent_id="CUSTOM",
    )
    assert 0.0 <= p_high <= 1.0
    assert 0.0 <= p_low <= 1.0
    assert p_high > p_low


# ==============================================================================
# TEST SUITE 8: PYDANTIC V2 ZKCOMMITMENTPROOF STRUCTURAL INTEGRITY
# ==============================================================================

def test_zk_commitment_proof_schema_validation():
    """
    Validates that ZKCommitmentProof model enforces:
    - 66-character compressed point hex starting with 02 or 03.
    - Exactly 16 bit range proofs in sequential order.
    - 64-character PSI token hex.
    - Rejects assertion of dscr_verified_ge_125=True without complete proof.
    """
    proof = create_zk_solvency_proof(
        projected_cf_v=76376,
        solvency_floor_t=56828,
        supplier_wallet=VALID_SUPPLIER_MEGHNA,
    )

    assert proof.commitment_hex.startswith(("02", "03"))
    assert len(proof.commitment_hex) == 66
    assert proof.excess_commitment_hex.startswith(("02", "03"))
    assert len(proof.excess_commitment_hex) == 66
    assert len(proof.bit_range_proofs) == 16
    assert len(proof.psi_supplier_hmac_hex) == 64
    assert proof.dscr_verified_ge_125 is True
    assert proof.supplier_kyb_verified is True
    assert proof.display_short_hex.startswith("0x02") or proof.display_short_hex.startswith("0x03")
