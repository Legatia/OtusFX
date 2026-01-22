/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/trading_engine.json`.
 */
export type TradingEngine = {
  "address": "97L7s86Gz4CLzgkvfaDMqGR1mqj9MqEcQTYj2GWe4HTk",
  "metadata": {
    "name": "tradingEngine",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addMargin",
      "docs": [
        "Add margin to position"
      ],
      "discriminator": [
        211,
        238,
        238,
        90,
        223,
        228,
        228,
        76
      ],
      "accounts": [
        {
          "name": "position",
          "writable": true
        },
        {
          "name": "owner",
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
      "name": "closePosition",
      "docs": [
        "Close a position and settle PnL"
      ],
      "discriminator": [
        123,
        134,
        81,
        0,
        49,
        68,
        98,
        98
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
          "name": "position",
          "writable": true
        },
        {
          "name": "owner",
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
          "name": "priceFeed"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the trading config (admin only)"
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
          "name": "tradingFeeBps",
          "type": "u16"
        },
        {
          "name": "maxLeverage",
          "type": "u8"
        }
      ]
    },
    {
      "name": "liquidate",
      "docs": [
        "Liquidate underwater position (keeper function)"
      ],
      "discriminator": [
        223,
        179,
        226,
        125,
        48,
        46,
        39,
        74
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "position",
          "writable": true
        },
        {
          "name": "keeper",
          "writable": true,
          "signer": true
        },
        {
          "name": "keeperUsdc",
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
          "name": "priceFeed"
        }
      ],
      "args": []
    },
    {
      "name": "openPosition",
      "docs": [
        "Open a leveraged position"
      ],
      "discriminator": [
        135,
        128,
        47,
        77,
        15,
        152,
        240,
        49
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
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "config.total_positions",
                "account": "tradingConfig"
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
          "name": "priceFeed"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pair",
          "type": {
            "defined": {
              "name": "fxPair"
            }
          }
        },
        {
          "name": "side",
          "type": {
            "defined": {
              "name": "side"
            }
          }
        },
        {
          "name": "margin",
          "type": "u64"
        },
        {
          "name": "leverage",
          "type": "u8"
        },
        {
          "name": "isPrivate",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "position",
      "discriminator": [
        170,
        188,
        143,
        228,
        122,
        64,
        247,
        208
      ]
    },
    {
      "name": "tradingConfig",
      "discriminator": [
        109,
        81,
        251,
        175,
        168,
        237,
        45,
        186
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidLeverage",
      "msg": "Invalid leverage"
    },
    {
      "code": 6001,
      "name": "invalidMargin",
      "msg": "Invalid margin amount"
    },
    {
      "code": 6002,
      "name": "overflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6003,
      "name": "positionClosed",
      "msg": "Position already closed"
    },
    {
      "code": 6004,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6005,
      "name": "notLiquidatable",
      "msg": "Position not liquidatable"
    },
    {
      "code": 6006,
      "name": "invalidPriceFeed",
      "msg": "Invalid Price Feed"
    },
    {
      "code": 6007,
      "name": "oracleStale",
      "msg": "Oracle Price Stale"
    },
    {
      "code": 6008,
      "name": "invalidOraclePrice",
      "msg": "Invalid Oracle Price"
    }
  ],
  "types": [
    {
      "name": "fxPair",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "eurUsd"
          },
          {
            "name": "gbpUsd"
          },
          {
            "name": "usdJpy"
          },
          {
            "name": "audUsd"
          },
          {
            "name": "usdCad"
          },
          {
            "name": "eurGbp"
          },
          {
            "name": "usdChf"
          }
        ]
      }
    },
    {
      "name": "position",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "pair",
            "type": {
              "defined": {
                "name": "fxPair"
              }
            }
          },
          {
            "name": "side",
            "type": {
              "defined": {
                "name": "side"
              }
            }
          },
          {
            "name": "size",
            "type": "u64"
          },
          {
            "name": "margin",
            "type": "u64"
          },
          {
            "name": "entryPrice",
            "type": "u64"
          },
          {
            "name": "liquidationPrice",
            "type": "u64"
          },
          {
            "name": "leverage",
            "type": "u8"
          },
          {
            "name": "isPrivate",
            "type": "bool"
          },
          {
            "name": "openedAt",
            "type": "i64"
          },
          {
            "name": "isOpen",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "side",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "long"
          },
          {
            "name": "short"
          }
        ]
      }
    },
    {
      "name": "tradingConfig",
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
            "name": "tradingFeeBps",
            "type": "u16"
          },
          {
            "name": "maxLeverage",
            "type": "u8"
          },
          {
            "name": "totalPositions",
            "type": "u64"
          },
          {
            "name": "totalVolume",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
