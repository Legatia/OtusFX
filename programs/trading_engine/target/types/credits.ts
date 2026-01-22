/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/credits.json`.
 */
export type Credits = {
  "address": "GGnGnYrqv1iFaNzPsVTBAt8Cs2Zkn8qFMMHxNttU91LF",
  "metadata": {
    "name": "credits",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "burnCredits",
      "docs": [
        "Burn credits (spend in marketplace)"
      ],
      "discriminator": [
        44,
        105,
        37,
        185,
        114,
        18,
        97,
        88
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  100,
                  105,
                  116,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "creditAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  100,
                  105,
                  116,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "itemId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createAccount",
      "docs": [
        "Create a credit account for a user (soul-bound, no transfer)"
      ],
      "discriminator": [
        99,
        20,
        130,
        119,
        196,
        235,
        131,
        149
      ],
      "accounts": [
        {
          "name": "creditAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  100,
                  105,
                  116,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "getBalance",
      "docs": [
        "Get balance (view function)"
      ],
      "discriminator": [
        5,
        173,
        180,
        151,
        243,
        81,
        233,
        55
      ],
      "accounts": [
        {
          "name": "creditAccount"
        }
      ],
      "args": [],
      "returns": "u64"
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the credits config (admin only)"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  100,
                  105,
                  116,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tradingRate",
          "type": "u64"
        },
        {
          "name": "depositRate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "mintCredits",
      "docs": [
        "Mint credits to a user (authorized callers only)"
      ],
      "discriminator": [
        210,
        43,
        79,
        176,
        4,
        212,
        31,
        116
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  100,
                  105,
                  116,
                  115,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "creditAccount",
          "writable": true
        },
        {
          "name": "authority",
          "docs": [
            "Authority or authorized program (trading_engine, bootstrap, etc.)"
          ],
          "signer": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "source",
          "type": {
            "defined": {
              "name": "creditSource"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "creditAccount",
      "discriminator": [
        196,
        171,
        234,
        132,
        239,
        255,
        21,
        96
      ]
    },
    {
      "name": "creditsConfig",
      "discriminator": [
        51,
        127,
        46,
        105,
        211,
        170,
        215,
        16
      ]
    }
  ],
  "events": [
    {
      "name": "creditsPurchase",
      "discriminator": [
        0,
        151,
        89,
        213,
        60,
        246,
        136,
        127
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6001,
      "name": "insufficientBalance",
      "msg": "Insufficient balance"
    },
    {
      "code": 6002,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6003,
      "name": "overflow",
      "msg": "Arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "creditAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "lifetimeEarned",
            "type": "u64"
          },
          {
            "name": "lifetimeSpent",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "creditSource",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "trading"
          },
          {
            "name": "deposit"
          },
          {
            "name": "referral"
          },
          {
            "name": "bootstrap"
          },
          {
            "name": "copyTrading"
          }
        ]
      }
    },
    {
      "name": "creditsConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "tradingRate",
            "type": "u64"
          },
          {
            "name": "depositRate",
            "type": "u64"
          },
          {
            "name": "totalMinted",
            "type": "u64"
          },
          {
            "name": "totalBurned",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "creditsPurchase",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "itemId",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
