import type { ToolOutput } from "@/lib/crypto/types";
import { CaesarVisualizer } from "./CaesarVisualizer";
import { VigenereVisualizer } from "./VigenereVisualizer";
import { EnigmaVisualizer } from "./EnigmaVisualizer";
import { AesVisualizer } from "./AesVisualizer";
import { DesVisualizer } from "./DesVisualizer";
import { RsaVisualizer } from "./RsaVisualizer";
import { DiffieHellmanVisualizer } from "./DiffieHellmanVisualizer";
import { EccVisualizer } from "./EccVisualizer";
import { MerkleVisualizer } from "./MerkleVisualizer";
import { FrequencyVisualizer } from "./FrequencyVisualizer";
import { EuclidVisualizer } from "./EuclidVisualizer";
import { BlockModesVisualizer } from "./BlockModesVisualizer";
import { HillVisualizer } from "./HillVisualizer";
import { ZkpVisualizer } from "./ZkpVisualizer";
import { AvalancheVisualizer } from "./AvalancheVisualizer";
import { EncodingVisualizer } from "./EncodingVisualizer";
import { LatticeVisualizer } from "./LatticeVisualizer";
import { KyberVisualizer } from "./KyberVisualizer";
import { QuantumThreatVisualizer } from "./QuantumThreatVisualizer";
import { LamportVisualizer } from "./LamportVisualizer";
import { ShamirVisualizer } from "./ShamirVisualizer";
import { AlgorithmInspector } from "./AlgorithmInspector";

type Props = {
  toolId: string;
  values: Record<string, string>;
  result: ToolOutput;
};

export function AlgorithmVisualizer({ toolId, values, result }: Props) {
  // Dispatch to dedicated visualizer based on tool ID
  switch (toolId) {
    case "caesar":
    case "rot13":
    case "atbash":
    case "affine":
    case "caesar-bruteforce":
      return <CaesarVisualizer values={values} resultOutput={result.output} />;

    case "vigenere":
    case "autokey":
    case "otp":
      return <VigenereVisualizer values={values} resultOutput={result.output} />;

    case "enigma":
      return <EnigmaVisualizer values={values} resultOutput={result.output} />;

    case "aes":
    case "aes-state":
    case "aes-encrypt":
    case "aes-decrypt":
      return <AesVisualizer values={values} resultOutput={result.output} />;

    case "des-round":
    case "des-feistel":
      return <DesVisualizer values={values} resultOutput={result.output} />;

    case "rsa-demo":
    case "rsa-suite":
    case "rsa":
      return <RsaVisualizer values={values} resultOutput={result.output} />;

    case "diffie-hellman":
    case "dh-mitm":
      return <DiffieHellmanVisualizer values={values} resultOutput={result.output} />;

    case "ecc-point":
      return <EccVisualizer values={values} resultOutput={result.output} />;

    case "merkle-tree":
      return <MerkleVisualizer values={values} resultOutput={result.output} />;

    case "frequency":
    case "freq-enhanced":
      return <FrequencyVisualizer values={values} resultOutput={result.output} />;

    case "extended-euclid":
    case "extended-euclid-tableau":
    case "euclid-tableau":
    case "gcd":
    case "crt":
    case "crt-multi":
    case "mod-inverse":
    case "mod-pow":
    case "baby-step-giant-step":
      return <EuclidVisualizer values={values} resultOutput={result.output} />;

    case "block-modes":
      return <BlockModesVisualizer values={values} resultOutput={result.output} />;

    case "hill-2x2":
    case "hill-cipher":
      return <HillVisualizer values={values} resultOutput={result.output} />;

    case "zkp-schnorr":
      return <ZkpVisualizer values={values} resultOutput={result.output} />;

    case "avalanche":
      return <AvalancheVisualizer values={values} resultOutput={result.output} />;

    case "encoding-base64":
    case "decoding-base64":
    case "base64":
    case "base32":
    case "base58":
    case "hex":
    case "binary":
    case "decimal":
    case "url":
    case "endianness":
    case "radix":
    case "encoding-hex":
    case "encoding-binary":
      return <EncodingVisualizer values={values} resultOutput={result.output} />;

    case "pqc-lattice-visualizer":
    case "pqc-lwe-simulator":
      return <LatticeVisualizer />;

    case "pqc-kyber-simulator":
    case "kyber":
      return <KyberVisualizer />;

    case "pqc-threat-calculator":
      return <QuantumThreatVisualizer />;

    case "pqc-lamport-merkle":
      return <LamportVisualizer />;

    case "simplified-aes":
      return <AesVisualizer values={values} resultOutput={result.output} />;

    case "shamir":
    case "shamir-secret-sharing":
      return <ShamirVisualizer values={values} resultOutput={result.output} />;

    default:
      return <AlgorithmInspector toolId={toolId} values={values} result={result} />;
  }
}
