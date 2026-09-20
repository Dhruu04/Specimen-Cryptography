import { classicalLessons } from "./classical";
import { encodingLessons } from "./encoding";
import { hashingLessons } from "./hashing";
import { numberTheoryLessons } from "./numbertheory";
import { postQuantumLessons } from "./postquantum";
import { publicKeyLessons } from "./publickey";
import { securityLessons } from "./security";
import { symmetricLessons } from "./symmetric";
import type { Lesson, Track } from "./types";

export type { Lesson, Track };

export const tracks: Track[] = [
  {
    id: "classical",
    name: "Classical Ciphers",
    shortName: "Classical",
    blurb: "Substitution, transposition and the birth of cryptanalysis",
    intro:
      "Start where the field started. These ciphers are all breakable by hand, which is exactly why they teach so well: every weakness you find here has a modern descendant.",
  },
  {
    id: "encoding",
    name: "Encoding & Representation",
    shortName: "Encoding",
    blurb: "Base64, hex, binary and why none of it is encryption",
    intro:
      "Before a cipher can touch your message it has to become bytes. This track covers the representations every tool and protocol assumes you understand.",
  },
  {
    id: "symmetric",
    name: "Symmetric Encryption",
    shortName: "Symmetric",
    blurb: "XOR, DES, AES, modes of operation and stream ciphers",
    intro:
      "One shared key, enormous speed, and a long list of ways to misuse it. This is the machinery that protects almost all data at rest and in transit.",
  },
  {
    id: "hashing",
    name: "Hashing & Integrity",
    shortName: "Hashing",
    blurb: "Digests, HMAC, password storage and Merkle trees",
    intro:
      "One-way functions give you fingerprints rather than secrecy. Get them right and you get integrity, authentication and safe password storage.",
  },
  {
    id: "publickey",
    name: "Public Key Cryptography",
    shortName: "Public Key",
    blurb: "Diffie–Hellman, RSA, elliptic curves, signatures and TLS",
    intro:
      "Two keys instead of one, built on problems nobody knows how to solve efficiently. This is what makes secure communication with strangers possible.",
  },
  {
    id: "postquantum",
    name: "Post-Quantum Cryptography",
    shortName: "Post-Quantum",
    blurb: "Lattice cryptography, LWE, Kyber, Dilithium, Falcon, McEliece, hash signatures & quantum threats",
    intro:
      "When quantum computers scale, RSA and ECC fail in polynomial time under Shor's algorithm. This track explores the mathematical frontiers that replace them: high-dimensional lattices, error-correcting codes, multivariate quadratics, and stateless hash trees.",
  },
  {
    id: "numbertheory",
    name: "Number Theory",
    shortName: "Number Theory",
    blurb: "Modular arithmetic, Euclid, primes, totients, groups and fields",
    intro:
      "The mathematics underneath everything above. Each concept here appears directly inside a cipher — nothing is included for its own sake.",
  },
  {
    id: "security",
    name: "Cyber Security Practice",
    shortName: "Security Practice",
    blurb: "Threat models, authentication, web attacks, side channels, key management",
    intro:
      "Cryptography rarely fails at the mathematics. This track covers the operational reality where systems actually break.",
  },
];

const allLessonsRaw: Lesson[] = [
  ...classicalLessons,
  ...encodingLessons,
  ...symmetricLessons,
  ...hashingLessons,
  ...publicKeyLessons,
  ...postQuantumLessons,
  ...numberTheoryLessons,
  ...securityLessons,
];

export const lessons = allLessonsRaw;

export const tracksById = new Map(tracks.map((t) => [t.id, t]));
export const lessonsById = new Map(lessons.map((l) => [l.id, l]));

export const getTrack = (id: string) => tracksById.get(id);
export const getLesson = (id: string) => lessonsById.get(id);
export const lessonsForTrack = (trackId: string) => lessons.filter((l) => l.trackId === trackId);

export function lessonNumber(lesson: Lesson) {
  return lessonsForTrack(lesson.trackId).findIndex((l) => l.id === lesson.id) + 1;
}

export function lessonNeighbours(lesson: Lesson) {
  const list = lessonsForTrack(lesson.trackId);
  const i = list.findIndex((l) => l.id === lesson.id);
  return { prev: i > 0 ? list[i - 1] : undefined, next: i < list.length - 1 ? list[i + 1] : undefined };
}

export const totalLessons = lessons.length;

export const glossary = [...lessons]
  .flatMap((l) => (l.glossary ?? []).map((g) => ({ ...g, lessonId: l.id, lessonTitle: l.title })))
  .sort((a, b) => a.term.localeCompare(b.term));
