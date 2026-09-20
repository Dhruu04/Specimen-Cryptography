import { modInverse, modPow } from "./numbertheory";
import { sha256Sync } from "./merkle";

// ==========================================
// 1. Schnorr Identification Protocol over Z_p*
// ==========================================

export interface SchnorrParams {
  p: number; // Prime modulus
  g: number; // Generator
}

export const DEFAULT_SCHNORR_PARAMS: SchnorrParams = {
  p: 1019, // Safe prime
  g: 2,    // Generator
};

export interface SchnorrState {
  x: number; // Secret key
  y: number; // Public key: g^x mod p
  r: number; // Prover's ephemeral nonce
  R: number; // Commitment: g^r mod p
  c: number; // Verifier's challenge
  s: number; // Response
  isImposter: boolean;
  guessedC?: number;
}

export function generateSchnorrKeys(params: SchnorrParams = DEFAULT_SCHNORR_PARAMS, secretX?: number) {
  const { p, g } = params;
  const q = p - 1; // Group order for exponents
  const x = secretX ?? Math.floor(2 + Math.random() * (q - 3));
  const y = Number(modPow(BigInt(g), BigInt(x), BigInt(p)));
  return { x, y, p, g, q };
}

// Prover commits: picks random nonce r, computes R = g^r mod p
export function schnorrCommitHonest(params: SchnorrParams, x: number, nonceR?: number) {
  const { p, g } = params;
  const q = p - 1;
  const r = nonceR ?? Math.floor(2 + Math.random() * (q - 3));
  const R = Number(modPow(BigInt(g), BigInt(r), BigInt(p)));
  return { r, R };
}

// Imposter commits: does not know x, attempts to simulate by guessing challenge c_hat
export function schnorrCommitImposter(params: SchnorrParams, y: number, guessedC: number, fakeS?: number) {
  const { p, g } = params;
  const q = p - 1;
  const s = fakeS ?? Math.floor(2 + Math.random() * (q - 3));
  // Set R = g^s * (y^-c_hat) mod p
  const gs = Number(modPow(BigInt(g), BigInt(s), BigInt(p)));
  const yChat = Number(modPow(BigInt(y), BigInt(guessedC), BigInt(p)));
  const invYChat = Number(modInverse(BigInt(yChat), BigInt(p)));
  const R = (gs * invYChat) % p;
  return { fakeS: s, R, guessedC };
}

// Prover responds: s = (r + c * x) mod (p - 1)
export function schnorrRespondHonest(params: SchnorrParams, x: number, r: number, c: number): number {
  const q = params.p - 1;
  return ((r + c * x) % q + q) % q;
}

// Verifier checks: g^s ?= R * y^c mod p
export function schnorrVerify(
  params: SchnorrParams,
  y: number,
  R: number,
  c: number,
  s: number
): { isValid: boolean; lhs: number; rhs: number; formula: string } {
  const { p, g } = params;
  const lhs = Number(modPow(BigInt(g), BigInt(s), BigInt(p)));
  const yc = Number(modPow(BigInt(y), BigInt(c), BigInt(p)));
  const rhs = (R * yc) % p;

  const formula = `g^s mod p = ${g}^${s} mod ${p} = ${lhs} vs R · y^c mod p = (${R} · ${y}^${c}) mod ${p} = ${rhs}`;
  return {
    isValid: lhs === rhs,
    lhs,
    rhs,
    formula,
  };
}

// Fiat-Shamir non-interactive challenge: c = H(g || y || R) mod q
export function fiatShamirChallenge(params: SchnorrParams, y: number, R: number): number {
  const q = params.p - 1;
  const digest = sha256Sync(`${params.g}:${y}:${R}`);
  const num = Number.parseInt(digest.slice(0, 8), 16);
  return (num % (q - 1)) + 1;
}

// ==========================================
// 2. Graph 3-Coloring Interactive ZKP
// ==========================================

export interface GraphVertex {
  id: number;
  label: string;
  x: number; // 2D position for SVG rendering
  y: number;
}

export interface GraphEdge {
  u: number;
  v: number;
}

export type ColorId = 0 | 1 | 2; // 0: Red, 1: Green, 2: Blue

export const COLOR_NAMES: Record<ColorId, string> = {
  0: "Crimson Red",
  1: "Emerald Green",
  2: "Cobalt Blue",
};

export const COLOR_HEX: Record<ColorId, string> = {
  0: "#f43f5e",
  1: "#10b981",
  2: "#3b82f6",
};

export interface GraphInstance {
  vertices: GraphVertex[];
  edges: GraphEdge[];
  coloring: Record<number, ColorId>; // True secret 3-coloring
}

// Standard educational 5-vertex graph instance (Wheel / Pentagram subgraph)
export const DEFAULT_GRAPH: GraphInstance = {
  vertices: [
    { id: 0, label: "V₀", x: 200, y: 50 },
    { id: 1, label: "V₁", x: 330, y: 130 },
    { id: 2, label: "V₂", x: 280, y: 270 },
    { id: 3, label: "V₃", x: 120, y: 270 },
    { id: 4, label: "V₄", x: 70, y: 130 },
  ],
  edges: [
    { u: 0, v: 1 },
    { u: 1, v: 2 },
    { u: 2, v: 3 },
    { u: 3, v: 4 },
    { u: 4, v: 0 },
    { u: 0, v: 2 },
    { u: 0, v: 3 },
  ],
  coloring: {
    0: 0, // Red
    1: 1, // Green
    2: 2, // Blue
    3: 1, // Green
    4: 2, // Blue
  },
};

export interface ZkpRoundCommitment {
  permutedColors: Record<number, ColorId>;
  nonces: Record<number, string>;
  commitments: Record<number, string>; // SHA256(color + ":" + nonce)
}

// Prover applies random permutation π ∈ S3 and commits to each vertex color
export function commitGraphRound(graph: GraphInstance, isCheating = false): ZkpRoundCommitment {
  // Generate random permutation of {0, 1, 2}
  const perms: ColorId[][] = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ];
  const p = perms[Math.floor(Math.random() * perms.length)]!;

  const permutedColors: Record<number, ColorId> = {};
  const nonces: Record<number, string> = {};
  const commitments: Record<number, string> = {};

  graph.vertices.forEach((v) => {
    let rawColor = graph.coloring[v.id] ?? 0;
    if (isCheating && v.id === 1) {
      // Cheater introduces a conflict on edge (0, 1)
      rawColor = graph.coloring[0] ?? 0;
    }
    const permuted = p[rawColor]!;
    const nonce = Math.random().toString(36).substring(2, 10);
    const commit = sha256Sync(`${permuted}:${nonce}`);

    permutedColors[v.id] = permuted;
    nonces[v.id] = nonce;
    commitments[v.id] = commit;
  });

  return { permutedColors, nonces, commitments };
}

// Verifier checks edge challenge (u, v)
export function verifyGraphRound(
  round: ZkpRoundCommitment,
  edge: GraphEdge
): {
  isValid: boolean;
  uColor: ColorId;
  vColor: ColorId;
  uValidCommit: boolean;
  vValidCommit: boolean;
} {
  const uColor = round.permutedColors[edge.u]!;
  const vColor = round.permutedColors[edge.v]!;
  const uNonce = round.nonces[edge.u]!;
  const vNonce = round.nonces[edge.v]!;

  const uValidCommit = sha256Sync(`${uColor}:${uNonce}`) === round.commitments[edge.u];
  const vValidCommit = sha256Sync(`${vColor}:${vNonce}`) === round.commitments[edge.v];
  const distinctColors = uColor !== vColor;

  return {
    isValid: uValidCommit && vValidCommit && distinctColors,
    uColor,
    vColor,
    uValidCommit,
    vValidCommit,
  };
}
