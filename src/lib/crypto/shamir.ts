import { modInverse } from "./numbertheory";

export interface ShamirShare {
  x: number;
  y: number;
}

export interface ShamirSetup {
  secret: number;
  k: number; // threshold
  n: number; // total shares
  prime: number;
  coefficients: number[]; // [S, a1, a2, ...]
  shares: ShamirShare[];
}

export const SHAMIR_PRIME = 257; // Fits byte secrets [0..255]

// Evaluate polynomial f(x) = c0 + c1*x + c2*x^2 + ... mod p
export function evaluatePolynomial(coeffs: number[], x: number, p: number = SHAMIR_PRIME): number {
  let result = 0;
  let power = 1;
  for (const c of coeffs) {
    result = (result + c * power) % p;
    power = (power * x) % p;
  }
  return (result + p) % p;
}

// Generate a random polynomial with secret S as constant term: f(0) = S
export function generateShamirSetup(secret: number, k: number, n: number, p: number = SHAMIR_PRIME): ShamirSetup {
  const safeSecret = ((secret % p) + p) % p;
  const coefficients: number[] = [safeSecret];

  for (let i = 1; i < k; i++) {
    // Random non-zero coefficients
    coefficients.push(1 + Math.floor(Math.random() * (p - 2)));
  }

  const shares: ShamirShare[] = [];
  for (let x = 1; x <= n; x++) {
    shares.push({
      x,
      y: evaluatePolynomial(coefficients, x, p),
    });
  }

  return {
    secret: safeSecret,
    k,
    n,
    prime: p,
    coefficients,
    shares,
  };
}

// Recover secret using Lagrange Interpolation over GF(p):
// S = f(0) = sum( y_i * prod( -x_j * (x_i - x_j)^(-1) ) ) mod p
export function lagrangeInterpolateSecret(shares: ShamirShare[], p: number = SHAMIR_PRIME): { secret: number; steps: string[] } {
  if (shares.length === 0) return { secret: 0, steps: ["No shares provided."] };

  const steps: string[] = [];
  let secret = 0;
  const k = shares.length;

  for (let i = 0; i < k; i++) {
    const xi = shares[i]!.x;
    const yi = shares[i]!.y;

    let num = 1;
    let den = 1;
    const basisFactors: string[] = [];

    for (let j = 0; j < k; j++) {
      if (i === j) continue;
      const xj = shares[j]!.x;
      num = (num * (-xj)) % p;
      den = (den * (xi - xj)) % p;
      basisFactors.push(`(0 - ${xj}) / (${xi} - ${xj})`);
    }

    num = ((num % p) + p) % p;
    den = ((den % p) + p) % p;

    // Modular inverse of denominator in GF(p)
    const invDen = Number(modInverse(BigInt(den), BigInt(p)));
    const li0 = (num * invDen) % p;
    const term = (yi * li0) % p;
    secret = (secret + term) % p;

    steps.push(`Share (${xi}, ${yi}): ℓ_${i}(0) = [${basisFactors.join(" × ")}] ≡ ${li0} (mod ${p}) → Term: ${yi} × ${li0} = ${term}`);
  }

  secret = ((secret % p) + p) % p;
  steps.push(`Recovered Secret S = f(0) = ∑ Term_i ≡ ${secret} (mod ${p})`);

  return { secret, steps };
}

// Real-space continuous Lagrange polynomial evaluation for smooth canvas plotting
export function evaluateRealLagrange(shares: ShamirShare[], x: number): number {
  if (shares.length === 0) return 0;
  let y = 0;
  for (let i = 0; i < shares.length; i++) {
    let basis = 1;
    for (let j = 0; j < shares.length; j++) {
      if (i !== j) {
        const xi = shares[i]!.x;
        const xj = shares[j]!.x;
        if (xi !== xj) {
          basis *= (x - xj) / (xi - xj);
        }
      }
    }
    y += shares[i]!.y * basis;
  }
  return y;
}
