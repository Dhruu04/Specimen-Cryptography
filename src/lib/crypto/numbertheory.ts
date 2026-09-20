import type { TraceStep } from "./types";

export function gcdTrace(a: number, b: number) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0)
    return { output: "", error: "Enter two positive whole numbers." };
  const steps: TraceStep[] = [];
  let x = Math.max(a, b);
  let y = Math.min(a, b);
  while (y !== 0) {
    const q = Math.floor(x / y);
    const r = x % y;
    steps.push({ label: `${x} = ${q}·${y} + ${r}`, detail: `gcd(${x}, ${y}) = gcd(${y}, ${r})` });
    x = y;
    y = r;
    if (steps.length > 40) break;
  }
  return {
    output: `gcd(${a}, ${b}) = ${x}`,
    steps,
    note: x === 1 ? "They are coprime, so modular inverses exist." : `They share the factor ${x}.`,
  };
}

export function extendedEuclid(a: number, b: number) {
  if (a <= 0 || b <= 0) return { output: "", error: "Enter two positive whole numbers." };
  const steps: TraceStep[] = [];
  let [oldR, r] = [a, b];
  let [oldS, s] = [1, 0];
  let [oldT, t] = [0, 1];
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    steps.push({ label: `q = ${q}`, detail: `r: ${oldR} → ${r}, s: ${oldS}, t: ${oldT}` });
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
    [oldT, t] = [t, oldT - q * t];
    if (steps.length > 40) break;
  }
  return {
    output: `${a}·(${oldS}) + ${b}·(${oldT}) = ${oldR}`,
    steps,
    note: "Bézout's identity. When gcd = 1, the coefficient of a is the modular inverse of a mod b.",
  };
}

export function modInverseTool(a: number, m: number) {
  if (m <= 1) return { output: "", error: "Modulus must be greater than 1." };
  let [oldR, r] = [((a % m) + m) % m, m];
  let [oldS, s] = [1, 0];
  const steps: TraceStep[] = [];
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
    if (steps.length < 20) steps.push({ label: `quotient ${q}`, detail: `remainder ${oldR}` });
  }
  if (oldR !== 1)
    return {
      output: "",
      error: `gcd(${a}, ${m}) = ${oldR} ≠ 1, so ${a} has no inverse modulo ${m}.`,
    };
  const inv = ((oldS % m) + m) % m;
  return {
    output: `${a}⁻¹ ≡ ${inv} (mod ${m})`,
    steps,
    note: `Check: ${a} · ${inv} = ${a * inv} ≡ ${(a * inv) % m} (mod ${m}).`,
  };
}

export function modInverse(a: bigint | number, m: bigint | number): number {
  const bigA = BigInt(a);
  const bigM = BigInt(m);
  let [oldR, r] = [((bigA % bigM) + bigM) % bigM, bigM];
  let [oldS, s] = [1n, 0n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  if (oldR !== 1n) {
    throw new Error(`gcd(${a}, ${m}) ≠ 1, so no modular inverse exists.`);
  }
  return Number(((oldS % bigM) + bigM) % bigM);
}

export function modPow(base: bigint, exp: bigint, mod: bigint) {
  let result = 1n;
  let b = base % mod;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= 1n;
  }
  return result;
}

export function modPowTool(baseS: string, expS: string, modS: string) {
  try {
    const base = BigInt(baseS);
    const exp = BigInt(expS);
    const mod = BigInt(modS);
    if (mod <= 1n) return { output: "", error: "Modulus must be greater than 1." };
    const steps: TraceStep[] = [];
    let result = 1n;
    let b = base % mod;
    let e = exp;
    let bit = 0;
    while (e > 0n && steps.length < 24) {
      steps.push({
        label: `bit ${bit} = ${e & 1n}`,
        detail: `${(e & 1n) === 1n ? `multiply in ${b}` : "skip"} · square base → ${(b * b) % mod}`,
      });
      if (e & 1n) result = (result * b) % mod;
      b = (b * b) % mod;
      e >>= 1n;
      bit++;
    }
    return {
      output: `${base}^${exp} mod ${mod} = ${modPow(base, exp, mod)}`,
      steps,
      note: "Square-and-multiply needs only about log₂(exponent) multiplications — this is what makes RSA practical.",
    };
  } catch {
    return { output: "", error: "Enter whole numbers." };
  }
}

export function isPrime(n: bigint) {
  if (n < 2n) return false;
  for (const p of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  let d = n - 1n;
  let r = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    r++;
  }
  for (const a of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]) {
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let ok = false;
    for (let i = 0n; i < r - 1n; i++) {
      x = (x * x) % n;
      if (x === n - 1n) {
        ok = true;
        break;
      }
    }
    if (!ok) return false;
  }
  return true;
}

export function primeTest(input: string) {
  try {
    const n = BigInt(input.trim());
    if (n < 0n) return { output: "", error: "Enter a non-negative whole number." };
    const prime = isPrime(n);
    return {
      output: `${n} is ${prime ? "prime" : "composite"}`,
      note: prime
        ? "Verified with a deterministic Miller–Rabin test over small witness bases."
        : "A Miller–Rabin witness proved compositeness — no factor is revealed by the test itself.",
    };
  } catch {
    return { output: "", error: "Enter a whole number." };
  }
}

export function factorize(input: string) {
  try {
    let n = BigInt(input.trim());
    if (n < 2n) return { output: "", error: "Enter a whole number of 2 or more." };
    if (n > 10n ** 16n) return { output: "", error: "Keep the number below 10^16 for trial division." };
    const original = n;
    const factors: bigint[] = [];
    const steps: TraceStep[] = [];
    for (let p = 2n; p * p <= n; p += p === 2n ? 1n : 2n) {
      while (n % p === 0n) {
        factors.push(p);
        if (steps.length < 20) steps.push({ label: `divide by ${p}`, detail: `remaining ${n / p}` });
        n /= p;
      }
    }
    if (n > 1n) factors.push(n);
    const grouped = new Map<string, number>();
    for (const f of factors) grouped.set(f.toString(), (grouped.get(f.toString()) ?? 0) + 1);
    const pretty = [...grouped.entries()]
      .map(([p, e]) => (e === 1 ? p : `${p}^${e}`))
      .join(" · ");
    return {
      output: `${original} = ${pretty}`,
      steps,
      note:
        factors.length === 1
          ? "Prime — it has no factorisation."
          : "RSA's security rests on this being infeasible for 2048-bit numbers.",
    };
  } catch {
    return { output: "", error: "Enter a whole number." };
  }
}

export function totient(input: string) {
  try {
    let n = BigInt(input.trim());
    if (n < 1n) return { output: "", error: "Enter a positive whole number." };
    const original = n;
    let result = n;
    const steps: TraceStep[] = [];
    for (let p = 2n; p * p <= n; p++) {
      if (n % p === 0n) {
        while (n % p === 0n) n /= p;
        result -= result / p;
        steps.push({ label: `prime factor ${p}`, detail: `multiply by (1 − 1/${p}) → ${result}` });
      }
    }
    if (n > 1n) {
      result -= result / n;
      steps.push({ label: `prime factor ${n}`, detail: `multiply by (1 − 1/${n}) → ${result}` });
    }
    return {
      output: `φ(${original}) = ${result}`,
      steps,
      note: "φ(n) counts integers below n that are coprime with n. For RSA, φ(pq) = (p−1)(q−1).",
    };
  } catch {
    return { output: "", error: "Enter a whole number." };
  }
}

export function sieve(limitS: string) {
  const limit = Number(limitS);
  if (!Number.isInteger(limit) || limit < 2 || limit > 20000)
    return { output: "", error: "Enter a limit between 2 and 20000." };
  const flags = new Array(limit + 1).fill(true);
  flags[0] = flags[1] = false;
  const steps: TraceStep[] = [];
  for (let p = 2; p * p <= limit; p++) {
    if (!flags[p]) continue;
    let struck = 0;
    for (let m = p * p; m <= limit; m += p) {
      if (flags[m]) struck++;
      flags[m] = false;
    }
    if (steps.length < 12)
      steps.push({ label: `cross out multiples of ${p}`, detail: `${struck} numbers removed` });
  }
  const primes = flags.reduce<number[]>((acc, ok, i) => (ok ? [...acc, i] : acc), []);
  return {
    output: primes.join(", "),
    steps,
    note: `${primes.length} primes up to ${limit}.`,
  };
}

export function crt(a1: string, n1: string, a2: string, n2: string) {
  try {
    const A1 = BigInt(a1), N1 = BigInt(n1), A2 = BigInt(a2), N2 = BigInt(n2);
    const g = (x: bigint, y: bigint): bigint => (y === 0n ? x : g(y, x % y));
    if (g(N1, N2) !== 1n) return { output: "", error: "The two moduli must be coprime." };
    const N = N1 * N2;
    let m1 = 1n;
    while ((N1 * m1) % N2 !== 1n % N2) {
      m1++;
      if (m1 > N2) break;
    }
    let x = 0n;
    for (let candidate = 0n; candidate < N; candidate++) {
      if (candidate % N1 === ((A1 % N1) + N1) % N1 && candidate % N2 === ((A2 % N2) + N2) % N2) {
        x = candidate;
        break;
      }
    }
    return {
      output: `x ≡ ${x} (mod ${N})`,
      steps: [
        { label: `x ≡ ${A1} (mod ${N1})`, detail: `check: ${x} mod ${N1} = ${x % N1}` },
        { label: `x ≡ ${A2} (mod ${N2})`, detail: `check: ${x} mod ${N2} = ${x % N2}` },
      ],
      note: "The Chinese Remainder Theorem gives exactly one solution modulo n₁·n₂; RSA implementations use it to speed decryption up ~4×.",
    };
  } catch {
    return { output: "", error: "Enter whole numbers." };
  }
}

export function discreteLog(gS: string, hS: string, pS: string) {
  try {
    const g = BigInt(gS), h = BigInt(hS), p = BigInt(pS);
    if (p <= 1n) return { output: "", error: "Modulus must be greater than 1." };
    if (p > 200003n) return { output: "", error: "Keep the modulus small — this is a brute-force search." };
    const steps: TraceStep[] = [];
    let acc = 1n;
    for (let x = 0n; x < p; x++) {
      if (steps.length < 10) steps.push({ label: `g^${x} mod p`, detail: `= ${acc}` });
      if (acc === h % p) {
        return {
          output: `x = ${x}, since ${g}^${x} ≡ ${h} (mod ${p})`,
          steps,
          note: "No efficient classical algorithm is known for large primes — that hardness is what protects Diffie–Hellman.",
        };
      }
      acc = (acc * g) % p;
    }
    return { output: "", error: "No solution found — check that g generates h." };
  } catch {
    return { output: "", error: "Enter whole numbers." };
  }
}

export function primitiveRoots(pS: string) {
  try {
    const p = Number(pS);
    if (!Number.isInteger(p) || p < 3 || p > 5000) return { output: "", error: "Enter a prime between 3 and 5000." };
    if (!isPrime(BigInt(p))) return { output: "", error: `${p} is not prime.` };
    const roots: number[] = [];
    for (let g = 2; g < p && roots.length < 20; g++) {
      const seen = new Set<number>();
      let acc = 1;
      for (let i = 1; i < p; i++) {
        acc = (acc * g) % p;
        seen.add(acc);
      }
      if (seen.size === p - 1) roots.push(g);
    }
    return {
      output: roots.join(", "),
      note: `Each of these generators cycles through all ${p - 1} non-zero residues mod ${p}. Diffie–Hellman needs one.`,
    };
  } catch {
    return { output: "", error: "Enter a prime." };
  }
}

export function chineseRemainderTheorem(congruencesStr: string) {
  try {
    // Format: "2 mod 3, 3 mod 5, 2 mod 7" or "2,3; 3,5; 2,7"
    const cleaned = congruencesStr.trim();
    if (!cleaned) return { output: "", error: "Enter congruences e.g. '2 mod 3, 3 mod 5, 2 mod 7'" };

    const items = cleaned.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    if (items.length < 2) return { output: "", error: "Provide at least 2 congruences." };

    const aList: bigint[] = [];
    const mList: bigint[] = [];

    for (const item of items) {
      let a: bigint, m: bigint;
      if (item.includes("mod")) {
        const parts = item.split("mod").map((x) => x.trim());
        const part0 = parts[0];
        const part1 = parts[1];
        if (!part0 || !part1) return { output: "", error: `Invalid format in '${item}'. Use 'a mod m'.` };
        a = BigInt(part0);
        m = BigInt(part1);
      } else {
        const parts = item.split(/\s+/).map((x) => x.trim());
        const part0 = parts[0];
        const part1 = parts[1];
        if (parts.length < 2 || !part0 || !part1) return { output: "", error: `Invalid format in '${item}'. Use 'a mod m'.` };
        a = BigInt(part0);
        m = BigInt(part1);
      }
      if (m <= 1n) return { output: "", error: `Modulus ${m} must be greater than 1.` };
      aList.push(((a % m) + m) % m);
      mList.push(m);
    }

    // Check pairwise coprimality
    for (let i = 0; i < mList.length; i++) {
      for (let j = i + 1; j < mList.length; j++) {
        let x = mList[i] ?? 1n, y = mList[j] ?? 1n;
        while (y !== 0n) {
          const t = y;
          y = x % y;
          x = t;
        }
        if (x !== 1n) {
          return {
            output: "",
            error: `Moduli ${mList[i]} and ${mList[j]} are not coprime (gcd = ${x}). CRT requires pairwise coprime moduli.`,
          };
        }
      }
    }

    const M = mList.reduce((acc, val) => acc * val, 1n);
    const steps: TraceStep[] = [];
    let totalX = 0n;

    for (let i = 0; i < mList.length; i++) {
      const a_i = aList[i] ?? 0n;
      const m_i = mList[i] ?? 1n;
      const M_i = M / m_i;

      // Inverse of M_i mod m_i
      let oldR = ((M_i % m_i) + m_i) % m_i;
      let r = m_i;
      let oldS = 1n;
      let s = 0n;
      while (r !== 0n) {
        const q = oldR / r;
        const nextR = oldR - q * r;
        oldR = r;
        r = nextR;
        const nextS = oldS - q * s;
        oldS = s;
        s = nextS;
      }
      const y_i = ((oldS % m_i) + m_i) % m_i;
      const term = a_i * M_i * y_i;
      totalX += term;

      steps.push({
        label: `Equation ${i + 1}: x ≡ ${a_i} (mod ${m_i})`,
        detail: `M_${i + 1} = ${M}/${m_i} = ${M_i} | Inverse y_${i + 1} = ${M_i}⁻¹ mod ${m_i} = ${y_i} | Term = ${a_i}·${M_i}·${y_i} = ${term}`,
      });
    }

    const solution = ((totalX % M) + M) % M;

    return {
      output: `x ≡ ${solution} (mod ${M})`,
      steps,
      note: `Total modulus M = ${mList.join(" × ")} = ${M}. For any integer k, x = ${solution} + ${M}k satisfies all congruences.`,
    };
  } catch (e) {
    return { output: "", error: (e as Error).message || "Invalid input format." };
  }
}

export function fastModExpTrace(baseS: string, expS: string, modS: string) {
  try {
    const base = BigInt(baseS);
    const exp = BigInt(expS);
    const mod = BigInt(modS);

    if (mod <= 0n) return { output: "", error: "Modulus must be positive." };
    if (mod === 1n) return { output: "0", note: "Anything modulo 1 is 0." };
    if (exp < 0n) return { output: "", error: "Exponent must be non-negative." };

    const binExp = exp.toString(2);
    const steps: TraceStep[] = [];
    let result = 1n;
    let currentBase = ((base % mod) + mod) % mod;

    steps.push({
      label: "Binary Decomposition",
      detail: `Exponent ${exp} in binary = (${binExp})₂ (${binExp.length} bits)`,
    });

    for (let i = binExp.length - 1; i >= 0; i--) {
      const bit = binExp[i];
      const bitPos = binExp.length - 1 - i;

      if (bit === "1") {
        const prevRes = result;
        result = (result * currentBase) % mod;
        steps.push({
          label: `Bit 2^${bitPos} = 1`,
          detail: `Multiply: ${prevRes} × ${currentBase} ≡ ${result} (mod ${mod}) | Square base: ${currentBase}² ≡ ${(currentBase * currentBase) % mod} (mod ${mod})`,
        });
      } else {
        steps.push({
          label: `Bit 2^${bitPos} = 0`,
          detail: `Skip multiply | Square base: ${currentBase}² ≡ ${(currentBase * currentBase) % mod} (mod ${mod})`,
        });
      }
      currentBase = (currentBase * currentBase) % mod;
    }

    return {
      output: `${base}^${exp} mod ${mod} = ${result}`,
      steps,
      note: `Computed in ${binExp.length} squarings and ${binExp.split("1").length - 1} multiplications instead of ${exp} naive multiplications. Time complexity: O(log e).`,
    };
  } catch {
    return { output: "", error: "Enter valid integers." };
  }
}
