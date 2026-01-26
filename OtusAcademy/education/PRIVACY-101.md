# Privacy Technology 101

> *Understanding the fundamentals of blockchain privacy.*

## Introduction

Blockchain privacy is about controlling who can see what information about your transactions. Different technologies offer different trade-offs between privacy, performance, and complexity.

---

## The Three Pillars of Privacy

```
1. WHAT you're doing      (Transaction type)
2. HOW MUCH is involved   (Amounts)
3. WHO is involved        (Addresses)
```

Different privacy technologies hide different combinations:

| Technology | What | How Much | Who |
|------------|------|----------|-----|
| **Public Blockchain** | Visible | Visible | Visible |
| **Bulletproofs** | Visible | Hidden | Visible |
| **ZK Proofs** | Hidden | Hidden | Partial |
| **MPC** | Hidden | Hidden | Hidden |
| **Mixers** | Visible | Visible | Hidden |

---

## 1. Zero-Knowledge Proofs (ZK)

### What Is It?

A proof that you know something without revealing what you know.

### Analogy: The Cave

```
Imagine a circular cave with a locked door in the middle.
You claim to have the key.

Instead of showing me the key:
1. I wait outside while you enter
2. I shout "come out the LEFT side"
3. You appear from the left (proving you went through the locked door)

You proved you have the key without ever showing it.
```

### Types of ZK Proofs

| Type | Setup | Proof Size | Speed |
|------|-------|------------|-------|
| **ZK-SNARKs** | Trusted setup | Small (~200 bytes) | Fast to verify |
| **ZK-STARKs** | No trusted setup | Larger (~100 KB) | Slower |
| **Bulletproofs** | No trusted setup | Medium (~1 KB) | Fast |

### OtusFX Uses

- **Privacy Cash**: ZK proofs for hidden deposit amounts
- **Aggregate Proofs**: "TVL > $1M" without revealing deposits

---

## 2. Multi-Party Computation (MPC)

### What Is It?

Multiple parties compute a result together without any single party seeing all the inputs.

### Analogy: The Millionaire's Problem

```
Two millionaires want to know who is richer
without revealing their exact wealth.

MPC Solution:
1. Each encrypts their wealth
2. A computation runs on the encrypted data
3. Only the result is revealed: "Alice is richer" or "Bob is richer"
4. Neither learns the other's exact wealth
```

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│   INPUT A (encrypted) + INPUT B (encrypted)                 │
│                        ↓                                    │
│              MPC NETWORK (multiple nodes)                   │
│                        ↓                                    │
│              RESULT (e.g., A > B? true/false)               │
│                                                             │
│   No single node ever sees both A and B                     │
└─────────────────────────────────────────────────────────────┘
```

### OtusFX Uses

- **Arcium MPC**: Encrypted deleverage trigger checks

---

## 3. Bulletproofs

### What Is It?

A type of ZK proof specifically designed for **range proofs**—proving a value is within a range without revealing the exact value.

### Why "Bulletproofs"?

They're:
- **Short** (small proof size)
- **Fast** (quick to verify)
- **No trusted setup** (unlike SNARKs)

### Example

```
Prove: "My bank balance is between $0 and $1,000,000"
Reveal: true/false
Hidden: My actual balance (e.g., $50,000)
```

### OtusFX Uses

- **ShadowWire**: Hidden transfer amounts

---

## 4. Encryption vs. Privacy

### Encryption
Scrambles data so only authorized parties can read it.
```
Plaintext: "Send 100 USDC to Bob"
Encrypted: "xK9#mP2$vL8..."
Decrypted: "Send 100 USDC to Bob" (with key)
```

### Privacy
Hides information even from the system processing it.
```
Private Transaction: "Someone sent someone some USDC"
Verification: Valid (via ZK proof)
Content: Unknown to anyone except parties
```

### Key Difference

| | Encryption | Privacy (ZK/MPC) |
|-|------------|------------------|
| **Who can decrypt** | Anyone with key | No one (even with key) |
| **Computation** | Must decrypt first | Compute on encrypted data |
| **Trust** | Trust key holder | Trustless (math-based) |

---

## 5. Comparison Summary

| Technology | Privacy Level | Performance | Complexity |
|------------|--------------|-------------|------------|
| **ZK-SNARKs** | High | Fast verify | High (trusted setup) |
| **ZK-STARKs** | High | Slower | Medium |
| **Bulletproofs** | Medium (amounts) | Fast | Low |
| **MPC** | High | Slower | High |
| **Homomorphic Encryption** | Very High | Slow | Very High |

---

## 6. Trade-offs in Privacy Technology

### The Privacy Trilemma

```
        PRIVACY
           △
          /|\
         / | \
        /  |  \
       /   |   \
      /    |    \
     /____ | ____\
PERFORMANCE    COMPLIANCE
```

**You can optimize for two, but the third suffers.**

| Approach | Sacrifices |
|----------|------------|
| **Maximum Privacy** (Tornado Cash) | Compliance, sometimes performance |
| **Maximum Performance** (Public chains) | Privacy |
| **Maximum Compliance** (Transparent audits) | Some privacy |

### OtusFX Approach

**Selective Disclosure**: Full privacy by default, with opt-in transparency for audits.

---

## 7. Further Reading

### Papers
- [ZK-SNARKs Explained](https://z.cash/technology/zksnarks/) — Zcash Team
- [Bulletproofs Paper](https://eprint.iacr.org/2017/1066) — Academic paper
- [MPC Introduction](https://en.wikipedia.org/wiki/Secure_multi-party_computation)

### Videos
- [Zero Knowledge Proofs - Computerphile](https://www.youtube.com/watch?v=HUs1bH85X9I)
- [What is MPC? - Fireblocks](https://www.youtube.com/watch?v=WDkFzl4Fz-0)

### Courses
- [ZK Learning Resources](https://zkhack.dev/learning/)
- [a]( MIT Cryptography Course](https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-875-cryptography-and-cryptanalysis-spring-2005/)

---

## Summary

| Technology | Best For | OtusFX Use |
|------------|----------|------------|
| **ZK Proofs** | Proving without revealing | Private deposits |
| **MPC** | Compute on encrypted data | Encrypted triggers |
| **Bulletproofs** | Hidden amounts | Private transfers |
