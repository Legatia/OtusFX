/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/bootstrap.json`.
 */
export type Bootstrap = {
  "address": "71eGRTPxxUV6zE9eKnCCXu5SUbaUvd534QqbFv28C7sH",
  "metadata": {
    "name": "bootstrap",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimNft",
      "docs": [
        "Claim NFT after bootstrap ends (based on rank)"
      ],
      "discriminator": [
        6,
        193,
        146,
        120,
        48,
        218,
        69,
        33
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  111,
                  116,
                  115,
                  116,
                  114,
                  97,
                  112,
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
          "name": "contribution",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "claimer"
              }
            ]
          }
        },
        {
          "name": "claimer",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "docs": [
        "Deposit to bootstrap (earn credits + rank for NFT tier)"
      ],
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
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
                  98,
                  111,
                  111,
                  116,
                  115,
                  116,
                  114,
                  97,
                  112,
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
          "name": "contribution",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "depositor"
              }
            ]
          }
        },
        {
          "name": "depositor",
          "writable": true,
          "signer": true
        },
        {
          "name": "userUsdc",
          "writable": true
        },
        {
          "name": "usdcVault",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "endPhase",
      "docs": [
        "End bootstrap phase (admin only)"
      ],
      "discriminator": [
        50,
        112,
        111,
        150,
        18,
        190,
        244,
        201
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
                  98,
                  111,
                  111,
                  116,
                  115,
                  116,
                  114,
                  97,
                  112,
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
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize bootstrap phase"
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
                  98,
                  111,
                  111,
                  116,
                  115,
                  116,
                  114,
                  97,
                  112,
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
          "name": "usdcVault"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "creditsMultiplier",
          "type": "u8"
        }
      ]
    },
    {
      "name": "voteForPair",
      "docs": [
        "Vote for a trading pair to be enabled"
      ],
      "discriminator": [
        217,
        101,
        255,
        156,
        166,
        148,
        209,
        89
      ],
      "accounts": [
        {
          "name": "contribution",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "pairVote",
          "writable": true
        },
        {
          "name": "voter",
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
          "name": "pairId",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bootstrapConfig",
      "discriminator": [
        83,
        179,
        226,
        46,
        144,
        225,
        170,
        46
      ]
    },
    {
      "name": "contribution",
      "discriminator": [
        182,
        187,
        14,
        111,
        72,
        167,
        242,
        212
      ]
    },
    {
      "name": "pairVote",
      "discriminator": [
        148,
        253,
        199,
        12,
        123,
        21,
        6,
        220
      ]
    }
  ],
  "events": [
    {
      "name": "bootstrapDeposit",
      "discriminator": [
        79,
        72,
        107,
        162,
        37,
        136,
        175,
        78
      ]
    },
    {
      "name": "nftClaimed",
      "discriminator": [
        4,
        232,
        63,
        124,
        139,
        205,
        168,
        234
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "phaseEnded",
      "msg": "Bootstrap phase has ended"
    },
    {
      "code": 6001,
      "name": "phaseNotEnded",
      "msg": "Bootstrap phase has not ended yet"
    },
    {
      "code": 6002,
      "name": "invalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6003,
      "name": "notDepositor",
      "msg": "Not a depositor"
    },
    {
      "code": 6004,
      "name": "alreadyClaimed",
      "msg": "NFT already claimed"
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6006,
      "name": "overflow",
      "msg": "Arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "bootstrapConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "usdcVault",
            "type": "pubkey"
          },
          {
            "name": "totalRaised",
            "type": "u64"
          },
          {
            "name": "totalDepositors",
            "type": "u64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "creditsMultiplier",
            "type": "u8"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "bootstrapDeposit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "creditsEarned",
            "type": "u64"
          },
          {
            "name": "totalContribution",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "contribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "creditsEarned",
            "type": "u64"
          },
          {
            "name": "depositedAt",
            "type": "i64"
          },
          {
            "name": "rank",
            "type": "u64"
          },
          {
            "name": "tier",
            "type": {
              "defined": {
                "name": "owlTier"
              }
            }
          },
          {
            "name": "nftClaimed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "nftClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositor",
            "type": "pubkey"
          },
          {
            "name": "rank",
            "type": "u64"
          },
          {
            "name": "tier",
            "type": {
              "defined": {
                "name": "owlTier"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "owlTier",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "snowy"
          },
          {
            "name": "greatHorned"
          },
          {
            "name": "eagle"
          },
          {
            "name": "barn"
          },
          {
            "name": "screech"
          }
        ]
      }
    },
    {
      "name": "pairVote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pairId",
            "type": "u8"
          },
          {
            "name": "totalVotes",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
