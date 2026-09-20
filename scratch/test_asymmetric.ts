import {
  rsaCompleteSuite,
  eccPointVisualizer,
  diffieHellmanMitmSimulator,
  tlsHandshakeVisualizer,
} from "../src/lib/crypto/advanced-asymmetric";

function testAsymmetric() {
  console.log("=== Testing Asymmetric Tools ===");

  console.log("1. rsaCompleteSuite('61', '53', '17', '42'):\n", rsaCompleteSuite("61", "53", "17", "42").output);
  console.log("2. eccPointVisualizer(2, 3, 97, 3, 6, 80, 10, 'add'):\n", eccPointVisualizer(2, 3, 97, 3, 6, 80, 10, "add").output);
  console.log("3. eccPointVisualizer(2, 3, 97, 3, 6, 0, 0, 'double'):\n", eccPointVisualizer(2, 3, 97, 3, 6, 0, 0, "double").output);
  console.log("4. diffieHellmanMitmSimulator('23', '5', '6', '15', true):\n", diffieHellmanMitmSimulator("23", "5", "6", "15", true).output);
  console.log("5. diffieHellmanMitmSimulator('23', '5', '6', '15', false):\n", diffieHellmanMitmSimulator("23", "5", "6", "15", false).output);
  console.log("6. tlsHandshakeVisualizer('TLS_AES_256_GCM_SHA384'):\n", tlsHandshakeVisualizer("TLS_AES_256_GCM_SHA384").output);
}

testAsymmetric();
