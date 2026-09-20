import {
  aesStateVisualizer,
  blockCipherModesVisualizer,
  merkleTreeTool,
  birthdayCollisionEstimator,
} from "../src/lib/crypto/advanced-modern";
import {
  paddingOracleSimulator,
  timingAttackSimulator,
  zkpSchnorrSimulator,
} from "../src/lib/crypto/security-attacks";
import {
  bifidCipher,
  scytaleCipher,
  desRoundVisualizer,
  chacha20QuarterRound,
  modularGroupLab,
  quadraticResiduesTool,
  replayAttackSimulator,
} from "../src/lib/crypto/more-algorithms";
import {
  latticeLweSimulator,
  mlKemKyberSimulator,
  lamportMerkleSignSimulator,
  quantumThreatCalculator,
  codeBasedMcElieceSimulator,
  simplifiedAesEngine,
} from "../src/lib/crypto/post-quantum";

function testAll() {
  console.log("=== Testing Advanced Modern, Security, More Algorithms & PQC ===");

  console.log("1. aesStateVisualizer:", aesStateVisualizer("ATTACK AT DAWN!", "MYSECRETKEY12345").output);
  console.log("2. blockCipherModesVisualizer:", blockCipherModesVisualizer("A VERY LONG MESSAGE EXTENDING ACROSS MULTIPLE 16 BYTE BLOCKS", "cbc", "1234567890123456").output);
  console.log("3. merkleTreeTool:", merkleTreeTool("Tx0, Tx1, Tx2, Tx3", 2).output);
  console.log("4. birthdayCollisionEstimator:", birthdayCollisionEstimator(32, 50000).output);
  console.log("5. paddingOracleSimulator:", paddingOracleSimulator("SECRET").output);
  console.log("6. timingAttackSimulator:", timingAttackSimulator("PASS", "PASSWORD").output);
  console.log("7. zkpSchnorrSimulator:", zkpSchnorrSimulator(42, 7).output);
  console.log("8. desRoundVisualizer:", desRoundVisualizer("87878787", "1b02effc7072").output);
  console.log("9. chacha20QuarterRound:", chacha20QuarterRound(0x11111111, 0x22222222, 0x33333333, 0x44444444).output);
  console.log("10. modularGroupLab:", modularGroupLab(12).output);
  console.log("11. quadraticResiduesTool:", quadraticResiduesTool(5, 19).output);
  console.log("12. replayAttackSimulator:", replayAttackSimulator(500, true, true, true).output);
  console.log("13. latticeLweSimulator:", latticeLweSimulator("3", "97", "1", "2").output);
  console.log("14. mlKemKyberSimulator:", mlKemKyberSimulator("768", "EntropyPayload").output);
  console.log("15. lamportMerkleSignSimulator:", lamportMerkleSignSimulator("POST-QUANTUM", "16").output);
  console.log("16. quantumThreatCalculator:", quantumThreatCalculator("rsa-2048").output);
  console.log("17. codeBasedMcElieceSimulator:", codeBasedMcElieceSimulator("1011").output);
  console.log("18. simplifiedAesEngine:", simplifiedAesEngine("6F6B", "A73B", "enc").output);
  console.log("19. simplifiedAesEngine (dec):", simplifiedAesEngine(simplifiedAesEngine("6F6B", "A73B", "enc").output, "A73B", "dec").output);
}

testAll();
