import {
  gcdTrace,
  extendedEuclid,
  modInverseTool,
  modPowTool,
  primeTest,
  factorize,
  totient,
  sieve,
  primitiveRoots,
  crt,
  discreteLog,
} from "../src/lib/crypto/numbertheory";
import {
  extendedEuclidTableau,
  millerRabinStepByStep,
  crtMultiSolver,
  babyStepGiantStep,
} from "../src/lib/crypto/advanced-numbertheory";

function testNumberTheory() {
  console.log("=== Testing Number Theory Tools ===");

  console.log("1. gcdTrace(252, 105):", gcdTrace(252, 105).output);
  console.log("2. extendedEuclid(252, 105):", extendedEuclid(252, 105).output);
  console.log("3. modInverseTool(3, 11):", modInverseTool(3, 11).output);
  console.log("4. modPowTool('7', '256', '13'):", modPowTool("7", "256", "13").output);
  console.log("5. primeTest('104729'):", primeTest("104729").output);
  console.log("6. factorize('3233'):", factorize("3233").output);
  console.log("7. totient('3233'):", totient("3233").output);
  console.log("8. sieve('50'):", sieve("50").output);
  console.log("9. primitiveRoots('23'):", primitiveRoots("23").output);
  console.log("10. crt('2', '3', '3', '5'):", crt("2", "3", "3", "5").output);
  console.log("11. discreteLog('2', '9', '11'):", discreteLog("2", "9", "11").output);
  console.log("12. extendedEuclidTableau(252, 105):", extendedEuclidTableau(252, 105).output);
  console.log("13. millerRabinStepByStep(561, 2):", millerRabinStepByStep(561, 2).output);
  console.log("14. crtMultiSolver('x = 2 mod 3\\nx = 3 mod 5\\nx = 2 mod 7'):", crtMultiSolver("x = 2 mod 3\nx = 3 mod 5\nx = 2 mod 7").output);
  console.log("15. babyStepGiantStep(2, 9, 11):", babyStepGiantStep(2, 9, 11).output);

  console.log("\nAll number theory tools executed without throwing.");
}

testNumberTheory();
