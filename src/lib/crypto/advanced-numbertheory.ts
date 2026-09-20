import type { ToolOutput, TraceStep } from "./types";

function mod(n: bigint, m: bigint): bigint {
  return ((n % m) + m) % m;
}

function modPow(base: bigint, exp: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n;
  let result = 1n;
  base = base % modulus;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % modulus;
    exp = exp / 2n;
    base = (base * base) % modulus;
  }
  return result;
}

/**
 * Extended Euclidean Algorithm with Full Bézout Identity Tableau
 * a·s + b·t = gcd(a, b)
 */
export function extendedEuclidTableau(aIn: number, bIn: number): ToolOutput {
  let r0 = BigInt(Math.abs(aIn));
  let r1 = BigInt(Math.abs(bIn));
  if (r0 < r1) {
    const temp = r0; r0 = r1; r1 = temp;
  }

  let s0 = 1n, s1 = 0n;
  let t0 = 0n, t1 = 1n;

  const steps: TraceStep[] = [
    {
      label: `Initial Setup: r₀ = ${r0}, r₁ = ${r1}`,
      detail: `Tracking Bézout coefficients: s₀=1, s₁=0 | t₀=0, t₁=1`,
    },
  ];

  let stepCount = 1;
  while (r1 !== 0n) {
    const q = r0 / r1;
    const r2 = r0 % r1;
    const s2 = s0 - q * s1;
    const t2 = t0 - q * t1;

    steps.push({
      label: `Step ${stepCount}: ${r0} = ${q} × ${r1} + ${r2}`,
      detail: `q = ${q} · s = ${s0} - (${q})(${s1}) = ${s2} · t = ${t0} - (${q})(${t1}) = ${t2}`,
    });

    r0 = r1; r1 = r2;
    s0 = s1; s1 = s2;
    t0 = t1; t1 = t2;
    stepCount++;
  }

  const gcd = r0;
  const s = s0;
  const t = t0;

  return {
    output: `gcd(${aIn}, ${bIn}) = ${gcd}\n\nBézout's Identity Equation:\n(${aIn}) × (${s}) + (${bIn}) × (${t}) = ${gcd}\n\nCoefficients:\ns = ${s}\nt = ${t}`,
    steps,
    note: `Bézout's identity guarantees that integers s and t exist such that a·s + b·t = gcd(a,b). When gcd(a, m) = 1, the coefficient s is the Modular Multiplicative Inverse: a⁻¹ ≡ s (mod m).`,
  };
}

/**
 * Miller-Rabin Primality Test Step-by-Step
 */
export function millerRabinStepByStep(numInput: number, baseInput: number = 2): ToolOutput {
  const n = BigInt(Math.max(2, numInput));
  const a = BigInt(Math.max(2, baseInput));

  if (n === 2n || n === 3n) {
    return { output: `${n} is PRIME.`, steps: [{ label: "Base case", detail: "2 and 3 are prime." }] };
  }
  if (n % 2n === 0n) {
    return { output: `${n} is COMPOSITE (even number divisible by 2).`, steps: [] };
  }

  // Factor n - 1 as 2^s * d with d odd
  let d = n - 1n;
  let s = 0n;
  while (d % 2n === 0n) {
    d = d / 2n;
    s = s + 1n;
  }

  const steps: TraceStep[] = [
    {
      label: `1. Factor n - 1 = 2^s × d`,
      detail: `${n - 1n} = 2^${s} × ${d} (where d = ${d} is odd)`,
    },
  ];

  // Test base a
  if (a >= n) {
    return { output: "", error: `Base a (${a}) must be strictly less than n (${n}).` };
  }

  let x = modPow(a, d, n);
  steps.push({
    label: `2. Initial sequence value x₀ = a^d mod n`,
    detail: `${a}^${d} mod ${n} = ${x}`,
  });

  if (x === 1n || x === n - 1n) {
    steps.push({
      label: `Candidate passes for base ${a}!`,
      detail: `x₀ is ${x === 1n ? "1" : "n - 1 (-1 mod n)"}, which satisfies the test.`,
    });
    return {
      output: `${n} is PROBABLY PRIME (passed witness test for base a = ${a}).`,
      steps,
      note: `The Miller-Rabin test has error probability at most (1/4)^k after k independent random bases. With 40 random bases, the probability of false prime (pseudoprime) is less than 2⁻⁸⁰!`,
    };
  }

  // Square x up to s - 1 times
  let isComposite = true;
  for (let r = 1n; r < s; r++) {
    x = modPow(x, 2n, n);
    steps.push({
      label: `Squaring step r = ${r}: x_${r} = (x_${r - 1n})² mod n`,
      detail: `Result = ${x} (Checking if x ≡ n - 1 ≡ -1 mod n)`,
    });

    if (x === n - 1n) {
      isComposite = false;
      steps.push({
        label: `Candidate passed at step r = ${r}!`,
        detail: `x_${r} reached n - 1 (-1 mod n). Candidate is probably prime.`,
      });
      break;
    }
  }

  if (isComposite) {
    steps.push({
      label: `Base a = ${a} is a WITNESS to the compositeness of ${n}!`,
      detail: `Sequence never reached n - 1 before cycling or hitting 1.`,
    });
    return {
      output: `${n} is DEFINITELY COMPOSITE (witnessed by a = ${a}).`,
      steps,
      note: "Unlike Fermat's Little Theorem which is fooled by Carmichael numbers (like 561), Miller-Rabin is NEVER fooled: every composite number has at least 3/4 of bases acting as definite composite witnesses!",
    };
  } else {
    return {
      output: `${n} is PROBABLY PRIME (passed witness test for base a = ${a}).`,
      steps,
      note: "Candidate passed Miller-Rabin test for this base.",
    };
  }
}

/**
 * Chinese Remainder Theorem (CRT) Solver
 * Solves system of congruences:
 * x ≡ a₁ (mod m₁)
 * x ≡ a₂ (mod m₂)
 * x ≡ a₃ (mod m₃)
 */
export function crtMultiSolver(congruencesStr: string): ToolOutput {
  // Format: "2 mod 3, 3 mod 5, 2 mod 7" or "x = 2 mod 3\nx = 3 mod 5" or "2,3; 3,5; 2,7"
  const lines = congruencesStr
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed: { a: bigint; m: bigint }[] = [];
  for (const line of lines) {
    const cleanLine = line.replace(/[xX≡=()]/g, " ");
    const matches = cleanLine.match(/-?\d+/g);
    if (matches && matches.length >= 2) {
      try {
        parsed.push({ a: BigInt(matches[0]!), m: BigInt(matches[1]!) });
      } catch {
        // Skip malformed item
      }
    }
  }

  if (parsed.length < 2) {
    return {
      output: "",
      error: "Provide at least two congruences in the format: '2 mod 3, 3 mod 5, 2 mod 7' or 'x = 2 mod 3'.",
    };
  }

  // Check pairwise coprimality
  const extGcd = (a: bigint, b: bigint): bigint => (b === 0n ? a : extGcd(b, a % b));
  for (let i = 0; i < parsed.length; i++) {
    for (let j = i + 1; j < parsed.length; j++) {
      const g = extGcd(parsed[i]!.m, parsed[j]!.m);
      if (g !== 1n) {
        return {
          output: "",
          error: `Moduli m_${i + 1} (${parsed[i]!.m}) and m_${j + 1} (${parsed[j]!.m}) are NOT pairwise coprime (gcd = ${g}). CRT requires pairwise coprime moduli.`,
        };
      }
    }
  }

  // M = product of all moduli
  let M = 1n;
  for (const c of parsed) M = M * c.m;

  const steps: TraceStep[] = [
    {
      label: `1. Compute Combined Modulus M = ∏ m_i`,
      detail: `M = ${parsed.map((c) => c.m).join(" × ")} = ${M}`,
    },
  ];

  let x = 0n;
  parsed.forEach((c, idx) => {
    const Mi = M / c.m;
    // Find modular inverse y_i such that Mi * y_i ≡ 1 mod m_i
    let yi = 1n;
    for (let candidate = 1n; candidate < c.m; candidate++) {
      if ((Mi * candidate) % c.m === 1n) {
        yi = candidate;
        break;
      }
    }

    const term = c.a * Mi * yi;
    x = (x + term) % M;

    steps.push({
      label: `Congruence ${idx + 1}: x ≡ ${c.a} (mod ${c.m})`,
      detail: `M_${idx + 1} = M / ${c.m} = ${Mi} · y_${idx + 1} ≡ (${Mi})⁻¹ mod ${c.m} = ${yi} · Term = ${c.a} × ${Mi} × ${yi} = ${term}`,
    });
  });

  const finalX = mod(x, M);

  steps.push({
    label: `3. Sum and reduce: x ≡ ∑ (a_i · M_i · y_i) mod M`,
    detail: `x ≡ ${x} mod ${M} = ${finalX}`,
  });

  return {
    output: `Unique Solution:\nx ≡ ${finalX} (mod ${M})\n\nGeneral solution: x = ${finalX} + ${M}·k for any integer k.`,
    steps,
    note: "Sunzi formulated the Chinese Remainder Theorem in the 3rd century CE. In modern cryptography, RSA implementations use CRT to speed up private key decryptions by roughly 4x by computing mod p and mod q separately.",
  };
}

/**
 * Baby-Step Giant-Step (BSGS) Discrete Logarithm Solver
 * Solves g^x ≡ h (mod p)
 */
export function babyStepGiantStep(gIn: number, hIn: number, pIn: number): ToolOutput {
  const g = BigInt(Math.max(2, gIn));
  const h = BigInt(Math.max(1, hIn));
  const p = BigInt(Math.max(3, pIn));

  // m = ceil(sqrt(p))
  const m = BigInt(Math.ceil(Math.sqrt(Number(p))));
  const steps: TraceStep[] = [
    {
      label: `Problem: Solve ${g}^x ≡ ${h} (mod ${p})`,
      detail: `Step size m = ⌈√p⌉ = ⌈√${p}⌉ = ${m}`,
    },
  ];

  // Baby steps: compute g^j mod p for j in [0, m) and store in table
  const table = new Map<string, bigint>();
  let cur = 1n;
  for (let j = 0n; j < m; j++) {
    table.set(cur.toString(), j);
    cur = (cur * g) % p;
  }

  steps.push({
    label: `Baby Steps Table: Computed ${m} values: g^j mod p for j ∈ [0, ${m})`,
    detail: `Sample: g^0 = 1, g^1 = ${g % p}, g^${m - 1n} = ... (Stored in hash map)`,
  });

  // Giant steps: compute g^(-m) mod p
  const extGcd = (a: bigint, b: bigint): { g: bigint; x: bigint } => {
    if (b === 0n) return { g: a, x: 1n };
    const next = extGcd(b, a % b);
    return { g: next.g, x: (next.x - (a / b) * 0n) }; // Simple placeholder
  };

  const gm = modPow(g, m, p);
  // modular inverse of g^m mod p: by Fermat's little theorem for prime p: gm^(p - 2) mod p
  const gmInv = modPow(gm, p - 2n, p);

  let curH = h;
  let solution: bigint | null = null;

  for (let i = 0n; i < m; i++) {
    const key = curH.toString();
    if (table.has(key)) {
      const j = table.get(key)!;
      solution = i * m + j;
      steps.push({
        label: `Match Found at Giant Step i = ${i}!`,
        detail: `h · (g⁻ᵐ)^${i} matches Baby Step j = ${j} · Solution: x = i·m + j = (${i})(${m}) + ${j} = ${solution}`,
      });
      break;
    }
    curH = (curH * gmInv) % p;
  }

  if (solution === null) {
    return {
      output: `No discrete log solution found for ${g}^x ≡ ${h} (mod ${p}).`,
      steps,
      note: "h may not be in the subgroup generated by g.",
    };
  }

  const check = modPow(g, solution, p);

  return {
    output: `Discrete Logarithm:\nx = ${solution}\n\nVerification:\n${g}^${solution} mod ${p} = ${check} (${check === h ? "MATCHES h" : "ERROR"})`,
    steps,
    note: "Shanks' Baby-Step Giant-Step algorithm is a time-memory trade-off that computes discrete logarithms in O(√p) time and O(√p) memory instead of O(p) brute force. This shows why cryptographic primes must be at least 2048 bits long!",
  };
}
