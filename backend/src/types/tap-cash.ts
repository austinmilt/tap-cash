export type TapCash = {
  "version": "0.1.0",
  "name": "tap_cash",
  "instructions": [
    {
      "name": "initializeBank",
      "accounts": [
        {
          "name": "bankAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initializeMember",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "memberPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bank",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initializeAccount",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bank",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "accountAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "sendSpl",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userId",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bank",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bank",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "feePayer",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "memberAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "member",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "ata",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "acctNo",
            "type": "u8"
          },
          {
            "name": "acctType",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "member",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bank",
            "type": "publicKey"
          },
          {
            "name": "userId",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "numAccounts",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "MemberError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidAuthority"
          },
          {
            "name": "AlreadyInitialized"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAuthority",
      "msg": "Authority must be owned by System Program"
    },
    {
      "code": 6001,
      "name": "AlreadyInitialized",
      "msg": "Bank already initialized"
    }
  ]
};

export const IDL: TapCash = {
  "version": "0.1.0",
  "name": "tap_cash",
  "instructions": [
    {
      "name": "initializeBank",
      "accounts": [
        {
          "name": "bankAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initializeMember",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "memberPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bank",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initializeAccount",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bank",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "accountAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "sendSpl",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userId",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bank",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bank",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "feePayer",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "memberAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "member",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "ata",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "acctNo",
            "type": "u8"
          },
          {
            "name": "acctType",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "member",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bank",
            "type": "publicKey"
          },
          {
            "name": "userId",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "numAccounts",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "MemberError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidAuthority"
          },
          {
            "name": "AlreadyInitialized"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAuthority",
      "msg": "Authority must be owned by System Program"
    },
    {
      "code": 6001,
      "name": "AlreadyInitialized",
      "msg": "Bank already initialized"
    }
  ]
};
