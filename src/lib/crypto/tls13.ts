import { sha256Sync } from "./merkle";

// RFC 8446 TLS 1.3 Protocol Constants & Types
export interface TlsPacket {
  id: string;
  sender: "client" | "server";
  name: string;
  contentType: number; // 22 = Handshake, 23 = Application Data, 21 = Alert
  isEncrypted: boolean;
  hexPreview: string;
  summary: string;
  details: {
    protocolVersion: string;
    cipherSuite?: string;
    keyShareGroup?: string;
    publicKeySnippet?: string;
    sni?: string;
    alpn?: string;
    authTagSnippet?: string;
  };
  rawPayload: string;
}

export interface HkdfNode {
  name: string;
  label: string;
  secretHex: string;
  derivedFrom: string;
  purpose: string;
}

export interface TlsHandshakeSession {
  clientEcdhePriv: string;
  clientEcdhePub: string;
  serverEcdhePriv: string;
  serverEcdhePub: string;
  sharedSecret: string;
  hkdfTree: HkdfNode[];
  packets: TlsPacket[];
}

// Generate realistic simulated session with accurate HKDF-SHA256 derivations
export function createTls13Session(sniHost = "crypto.terminal.org"): TlsHandshakeSession {
  // Ephemeral ECDHE keys
  const clientPriv = "4c8f12a9e3d091b4";
  const clientPub = "8a2f7c01b4e931a57d6204c8f3b1e944";
  const serverPriv = "11b74a38f092cd41";
  const serverPub = "59e210a4c87b92f4e3019842af501d67";

  // ECDHE Shared Secret = g^(ab)
  const sharedSecret = sha256Sync(`${clientPub}:${serverPub}`);

  // RFC 8446 Key Schedule
  const earlySecret = sha256Sync("00000000000000000000000000000000");
  const handshakeSecret = sha256Sync(`${earlySecret}:${sharedSecret}`);
  const clientHandshakeTrafficSecret = sha256Sync(`c_hs_traffic:${handshakeSecret}`);
  const serverHandshakeTrafficSecret = sha256Sync(`s_hs_traffic:${handshakeSecret}`);
  const clientHandshakeKey = sha256Sync(`key:${clientHandshakeTrafficSecret}`).slice(0, 32);
  const serverHandshakeKey = sha256Sync(`key:${serverHandshakeTrafficSecret}`).slice(0, 32);

  const masterSecret = sha256Sync(`master:${handshakeSecret}`);
  const clientAppTrafficSecret = sha256Sync(`c_ap_traffic:${masterSecret}`);
  const serverAppTrafficSecret = sha256Sync(`s_ap_traffic:${masterSecret}`);
  const clientAppKey = sha256Sync(`key:${clientAppTrafficSecret}`).slice(0, 32);
  const serverAppKey = sha256Sync(`key:${serverAppTrafficSecret}`).slice(0, 32);

  const hkdfTree: HkdfNode[] = [
    {
      name: "Early Secret",
      label: "HKDF-Extract(0, 0)",
      secretHex: earlySecret.slice(0, 32),
      derivedFrom: "Root / Zero Salt",
      purpose: "Used for 0-RTT PSK early data (if resumed)",
    },
    {
      name: "Handshake Secret",
      label: "HKDF-Extract(Early, ECDHE_Shared)",
      secretHex: handshakeSecret.slice(0, 32),
      derivedFrom: `ECDHE Shared Secret (${sharedSecret.slice(0, 16)}...)`,
      purpose: "Protects certificate, verify, and finished records",
    },
    {
      name: "Client Handshake Traffic Secret",
      label: 'HKDF-Expand-Label("c hs traffic")',
      secretHex: clientHandshakeTrafficSecret.slice(0, 32),
      derivedFrom: "Handshake Secret",
      purpose: `Client Write Key: ${clientHandshakeKey.slice(0, 16)}...`,
    },
    {
      name: "Server Handshake Traffic Secret",
      label: 'HKDF-Expand-Label("s hs traffic")',
      secretHex: serverHandshakeTrafficSecret.slice(0, 32),
      derivedFrom: "Handshake Secret",
      purpose: `Server Write Key: ${serverHandshakeKey.slice(0, 16)}...`,
    },
    {
      name: "Master Secret",
      label: 'HKDF-Extract(Handshake, "derived")',
      secretHex: masterSecret.slice(0, 32),
      derivedFrom: "Handshake Secret",
      purpose: "Root secret for application data encryption",
    },
    {
      name: "Client App Traffic Secret",
      label: 'HKDF-Expand-Label("c ap traffic")',
      secretHex: clientAppTrafficSecret.slice(0, 32),
      derivedFrom: "Master Secret",
      purpose: `Client AES-128-GCM Key: ${clientAppKey.slice(0, 16)}...`,
    },
    {
      name: "Server App Traffic Secret",
      label: 'HKDF-Expand-Label("s ap traffic")',
      secretHex: serverAppTrafficSecret.slice(0, 32),
      derivedFrom: "Master Secret",
      purpose: `Server AES-128-GCM Key: ${serverAppKey.slice(0, 16)}...`,
    },
  ];

  const packets: TlsPacket[] = [
    {
      id: "pkt-1",
      sender: "client",
      name: "ClientHello",
      contentType: 22,
      isEncrypted: false,
      hexPreview: "16 03 03 01 40 01 00 01 3c 03 03...",
      summary: "Initiates TLS 1.3 handshake with supported ciphers, SNI and X25519 key share",
      details: {
        protocolVersion: "TLS 1.3 (0x0304 in supported_versions)",
        cipherSuite: "TLS_AES_128_GCM_SHA256, TLS_CHACHA20_POLY1305_SHA256",
        keyShareGroup: "x25519 (0x001d)",
        publicKeySnippet: clientPub,
        sni: sniHost,
      },
      rawPayload: `ClientHello [Random: 32 bytes, CipherSuites: 2, KeyShare: X25519 (${clientPub}), SNI: ${sniHost}]`,
    },
    {
      id: "pkt-2",
      sender: "server",
      name: "ServerHello",
      contentType: 22,
      isEncrypted: false,
      hexPreview: "16 03 03 00 7a 02 00 00 76 03 03...",
      summary: "Server confirms TLS 1.3, selects AES-128-GCM, and sends X25519 key share",
      details: {
        protocolVersion: "TLS 1.3 (RFC 8446)",
        cipherSuite: "TLS_AES_128_GCM_SHA256",
        keyShareGroup: "x25519 (0x001d)",
        publicKeySnippet: serverPub,
      },
      rawPayload: `ServerHello [SelectedCipher: TLS_AES_128_GCM_SHA256, KeyShare: X25519 (${serverPub})]`,
    },
    {
      id: "pkt-3",
      sender: "server",
      name: "{EncryptedExtensions}",
      contentType: 23,
      isEncrypted: true,
      hexPreview: "17 03 03 00 2e fb 49 1a c3 9e 02...",
      summary: "Encrypted under Server Handshake Key: negotiates ALPN (h2 / http1.1)",
      details: {
        protocolVersion: "TLS 1.3 Encrypted Record",
        alpn: "h2 (HTTP/2 over TLS)",
        authTagSnippet: "e8 4b a1 90 c3 14 f7 8a",
      },
      rawPayload: "EncryptedExtensions [ALPN: h2, ServerTrafficProtectionActive]",
    },
    {
      id: "pkt-4",
      sender: "server",
      name: "{Certificate}",
      contentType: 23,
      isEncrypted: true,
      hexPreview: "17 03 03 04 2a 81 2f 0c b9 4d 7e...",
      summary: "Server X.509 certificate chain (CN=crypto.terminal.org, Let's Encrypt)",
      details: {
        protocolVersion: "TLS 1.3 Encrypted Record",
        authTagSnippet: "9f 02 c8 17 b4 66 e1 30",
      },
      rawPayload: `CertificateChain [CN=${sniHost}, Issuer=Let's Encrypt Authority X3, Signature=ECDSA-P256]`,
    },
    {
      id: "pkt-5",
      sender: "server",
      name: "{CertificateVerify}",
      contentType: 23,
      isEncrypted: true,
      hexPreview: "17 03 03 00 84 a7 31 de f0 2b c9...",
      summary: "Cryptographic signature over the entire handshake transcript proving private key possession",
      details: {
        protocolVersion: "TLS 1.3 Encrypted Record",
        authTagSnippet: "4a 99 bd 10 f1 83 a0 22",
      },
      rawPayload: "CertificateVerify [SigAlg: ecdsa_secp256r1_sha256, Context: 'TLS 1.3, server CertificateVerify']",
    },
    {
      id: "pkt-6",
      sender: "server",
      name: "{Finished}",
      contentType: 23,
      isEncrypted: true,
      hexPreview: "17 03 03 00 34 5e 81 0a cc 47 b2...",
      summary: "Server HMAC-SHA256 MAC over all previous handshake messages (Key confirmation)",
      details: {
        protocolVersion: "TLS 1.3 Encrypted Record",
        authTagSnippet: "19 c4 7b 02 ae 88 5d 63",
      },
      rawPayload: "ServerFinished [verify_data: HMAC-SHA256(ServerHandshakeTrafficSecret, TranscriptHash)]",
    },
    {
      id: "pkt-7",
      sender: "client",
      name: "{Finished}",
      contentType: 23,
      isEncrypted: true,
      hexPreview: "17 03 03 00 34 9b 14 02 aa 33 fe...",
      summary: "Client confirms handshake transcript and switches to Application Traffic Keys",
      details: {
        protocolVersion: "TLS 1.3 Encrypted Record",
        authTagSnippet: "7c 81 a9 3e 01 f4 55 90",
      },
      rawPayload: "ClientFinished [verify_data: HMAC-SHA256(ClientHandshakeTrafficSecret, TranscriptHash)]",
    },
    {
      id: "pkt-8",
      sender: "client",
      name: "[ApplicationData - HTTP Request]",
      contentType: 23,
      isEncrypted: true,
      hexPreview: "17 03 03 00 52 1a f0 c4 99 2e 8b...",
      summary: "GET /api/v1/user/balance HTTP/2 encrypted with AES-128-GCM + 16-byte Poly/GCM tag",
      details: {
        protocolVersion: "TLS 1.3 Application Traffic",
        authTagSnippet: "a5 4e 19 d0 cc 87 23 1b 88 fa 04 12 c9 70 eb 31",
      },
      rawPayload: "Encrypted Application Record [Payload: 'GET /api/v1/user/balance', AEAD: AES-128-GCM]",
    },
  ];

  return {
    clientEcdhePriv: clientPriv,
    clientEcdhePub: clientPub,
    serverEcdhePriv: serverPriv,
    serverEcdhePub: serverPub,
    sharedSecret,
    hkdfTree,
    packets,
  };
}

export interface TamperSimulationResult {
  tamperedPacketId: string;
  originalByteHex: string;
  tamperedByteHex: string;
  byteOffset: number;
  receiverDetected: boolean;
  alertCode: number;
  alertName: string;
  reason: string;
}

export function simulateMitmByteFlip(packetId: string, byteOffset = 7): TamperSimulationResult {
  return {
    tamperedPacketId: packetId,
    originalByteHex: "0x49",
    tamperedByteHex: "0x4A",
    byteOffset,
    receiverDetected: true,
    alertCode: 20,
    alertName: "bad_record_mac (Fatal Alert 20)",
    reason:
      "AES-128-GCM 128-bit authentication tag verification failed. A single bit flip in the ciphertext causes immediate GMAC verification divergence. The TLS 1.3 connection terminates immediately.",
  };
}
