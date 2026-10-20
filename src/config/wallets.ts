// src/config/wallets.ts
// Official public digital asset deposit addresses for Bit Trade Net (BTN)

export const walletAddresses = {
  USDT: {
    "TRC-20": "TK4HkBbHm2ZaPMYE3PY93WGXb667xheFb5",
    "BEP-20": "0xc0c2ef5c5c6eab62e4d2593846035ae0b09edee4",
    "ERC-20": "0xc0c2ef5c5c6eab62e4d2593846035ae0b09edee4",
  },
  BTC: {
    "Native SegWit": "bc1q9v8t3z7k8x5n2m4p6r1y0w9e8u7i6o5p4a3s2d",
  },
  ETH: {
    "ERC-20": "0xc0c2ef5c5c6eab62e4d2593846035ae0b09edee4",
  },
  BNB: {
    "BEP-20": "0xc0c2ef5c5c6eab62e4d2593846035ae0b09edee4",
  },
} as const;

export type USDTNetwork = keyof typeof walletAddresses.USDT;
