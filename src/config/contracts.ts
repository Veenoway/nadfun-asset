// Nad.fun Contract Addresses (Monad Testnet)
export const NADFUN_CONTRACTS = {
  BONDING_CURVE: '0x52D34d8536350Cd997bCBD0b9E9d722452f341F5',
  BONDING_CURVE_ROUTER: '0x4F5A3518F082275edf59026f72B66AC2838c0414',
  DEX_ROUTER: '0x4FBDC27FAE5f99E7B09590bEc8Bf20481FCf9551',
  FACTORY: '0x961235a9020B05C44DF1026D956D1F4D78014276',
  WMON: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
} as const;

// ERC20 Permit ABI for EIP-2612 permit functionality
export const ERC20_PERMIT_ABI = [
  {
    type: 'function',
    name: 'permit',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'spender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'deadline',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'v',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'r',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 's',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'nonces',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'DOMAIN_SEPARATOR',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'version',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
] as const;

export const BONDING_CURVE_ABI = [
  {
    type: 'function',
    name: 'authorize',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'buy',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amountOut',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'calculateFeeAmount',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'feeAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'config',
    inputs: [],
    outputs: [
      {
        name: 'virtualMonReserve',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'virtualTokenReserve',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'targetTokenAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'create',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IBondingCurve.TokenCreationParams',
        components: [
          {
            name: 'creator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'tokenURI',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'pool',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'curves',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'realMonReserve',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'realTokenReserve',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'virtualMonReserve',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'virtualTokenReserve',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'k',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'targetTokenAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'initVirtualMonReserve',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'initVirtualTokenReserve',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'factory',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'feeConfig',
    inputs: [],
    outputs: [
      {
        name: 'deployFeeAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'listingFeeAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'protocolFee',
        type: 'uint24',
        internalType: 'uint24',
      },
      {
        name: 'dexFee',
        type: 'uint24',
        internalType: 'uint24',
      },
      {
        name: 'treasuryFee',
        type: 'uint24',
        internalType: 'uint24',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: 'config',
        type: 'tuple',
        internalType: 'struct IBondingCurve.Config',
        components: [
          {
            name: 'virtualMonReserve',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'virtualTokenReserve',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'targetTokenAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'feeConfig',
        type: 'tuple',
        internalType: 'struct IBondingCurve.FeeConfig',
        components: [
          {
            name: 'deployFeeAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'listingFeeAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'protocolFee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'dexFee',
            type: 'uint24',
            internalType: 'uint24',
          },
          {
            name: 'treasuryFee',
            type: 'uint24',
            internalType: 'uint24',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isListed',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isLocked',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'listing',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'lpManager',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'sell',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amountOut',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'splitAmountAndFee',
    inputs: [
      {
        name: '_amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'isBuy',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'fee',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'treasury',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'vault',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'wMon',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'wMonReserve',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'CurveBuy',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amountIn',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'amountOut',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CurveCreate',
    inputs: [
      {
        name: 'creator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'pool',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'name',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'symbol',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'tokenURI',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'virtualMon',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'virtualToken',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'targetTokenAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CurveSell',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amountIn',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'amountOut',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CurveSync',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'realMonReserve',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'realTokenReserve',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'virtualMonReserve',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'virtualTokenReserve',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CurveTokenListed',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'pool',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CurveTokenLocked',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AlreadyListing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadySet',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BondingCurveLocked',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BondingCurveNotLocked',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientAmount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientFee',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientWmon',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidAmountIn',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidKValue',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidName',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidSymbol',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidToken',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OverFlow',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TargetAmountOverflow',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Unauthorized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroAddress',
    inputs: [],
  },
] as const;

export const BONDING_CURVE_ROUTER_ABI = [
  {
    type: 'function',
    name: 'availableBuyTokens',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'availableBuyToken',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'requiredMonAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'buy',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IBondingCurveRouter.BuyParams',
        components: [
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'create',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IBondingCurveRouter.TokenCreationParams',
        components: [
          {
            name: 'creator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'tokenURI',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'amountOut',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'pool',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'curve',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'exactOutBuy',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IBondingCurveRouter.ExactOutBuyParams',
        components: [
          {
            name: 'amountInMax',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOut',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'exactOutSell',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IBondingCurveRouter.ExactOutSellParams',
        components: [
          {
            name: 'amountInMax',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOut',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'exactOutSellPermit',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IBondingCurveRouter.ExactOutSellPermitParams',
        components: [
          {
            name: 'amountInMax',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOut',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountAllowance',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'v',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAmountIn',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amountOut',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'is_buy',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: 'amountIn',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAmountOut',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amountIn',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'is_buy',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: 'amountOut',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'sell',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IBondingCurveRouter.SellParams',
        components: [
          {
            name: 'amountIn',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'sellPermit',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IBondingCurveRouter.SellPermitParams',
        components: [
          {
            name: 'amountIn',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountAllowance',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'v',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'wMon',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'error',
    name: 'DeadlineExpired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientAmountIn',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientAmountInMax',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientAmountOut',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientMon',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidAllowance',
    inputs: [],
  },
] as const;

export const DEX_ROUTER_ABI = [
  {
    type: 'function',
    name: 'buy',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IDexRouter.BuyParams',
        components: [
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'amountOut',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'calculateFeeAmount',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'feeAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'exactOutBuy',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IDexRouter.ExactOutBuyParams',
        components: [
          {
            name: 'amountInMax',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOut',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'amountIn',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'exactOutSell',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IDexRouter.ExactOutSellParams',
        components: [
          {
            name: 'amountInMax',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOut',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'amountIn',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'exactOutSellPermit',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IDexRouter.ExactOutSellPermitParams',
        components: [
          {
            name: 'amountInMax',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOut',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountAllowance',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'v',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'amountIn',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAmountIn',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amountOut',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'is_buy',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: 'amountIn',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAmountOut',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amountIn',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'is_buy',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: 'amountOut',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'sell',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IDexRouter.SellParams',
        components: [
          {
            name: 'amountIn',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'amountOut',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'sellPermit',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct IDexRouter.SellPermitParams',
        components: [
          {
            name: 'amountIn',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOutMin',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountAllowance',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'token',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'v',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'amountOut',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'splitAmountAndFee',
    inputs: [
      {
        name: '_amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'isBuy',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'fee',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'DexRouterBuy',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amountIn',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'amountOut',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DexRouterSell',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amountIn',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'amountOut',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'ExpiredDeadLine',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientInput',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientOutput',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidAmountIn',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidAmountOut',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidCallback',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Unauthorized',
    inputs: [],
  },
] as const;
