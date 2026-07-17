// lib/gradingSystems.ts

export type GradingSystem = {
  countryCode: string;
  scaleLabel: string;
  min: number;
  max: number;
  decimals: number;
  convert: (score0to100: number) => number;
  normalize: (localGrade: number) => number;
};

function makeLinear(
  min: number,
  max: number
): Pick<GradingSystem, 'convert' | 'normalize'> {
  return {
    convert:   (s) => min + (s / 100) * (max - min),
    normalize: (g) => ((g - min) / (max - min)) * 100,
  };
}

// Escala genérica 0-100
function make100(): Pick<GradingSystem, 'convert' | 'normalize'> {
  return { convert: (s) => s, normalize: (g) => g };
}

export const gradingSystems: Record<string, GradingSystem> = {
  // ── América ──────────────────────────────────────────────────────────────
  AR: { countryCode: 'AR', scaleLabel: '0-10',    min: 0,  max: 10,  decimals: 2, ...makeLinear(0,  10)  },
  BO: { countryCode: 'BO', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  BR: { countryCode: 'BR', scaleLabel: '0-10',    min: 0,  max: 10,  decimals: 1, ...makeLinear(0,  10)  },
  CA: { countryCode: 'CA', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  CL: { countryCode: 'CL', scaleLabel: '1.0-7.0', min: 1,  max: 7,   decimals: 1, ...makeLinear(1,  7)   },
  CO: { countryCode: 'CO', scaleLabel: '0-5',     min: 0,  max: 5,   decimals: 2, ...makeLinear(0,  5)   },
  CR: { countryCode: 'CR', scaleLabel: '0-10',    min: 0,  max: 10,  decimals: 1, ...makeLinear(0,  10)  },
  CU: { countryCode: 'CU', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  EC: { countryCode: 'EC', scaleLabel: '0-10',    min: 0,  max: 10,  decimals: 2, ...makeLinear(0,  10)  },
  SV: { countryCode: 'SV', scaleLabel: '0-10',    min: 0,  max: 10,  decimals: 1, ...makeLinear(0,  10)  },
  US: { countryCode: 'US', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  GT: { countryCode: 'GT', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  HN: { countryCode: 'HN', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  MX: { countryCode: 'MX', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 1, ...make100()           },
  NI: { countryCode: 'NI', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  PA: { countryCode: 'PA', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  PY: { countryCode: 'PY', scaleLabel: '0-10',    min: 0,  max: 10,  decimals: 1, ...makeLinear(0,  10)  },
  PE: { countryCode: 'PE', scaleLabel: '0-20',    min: 0,  max: 20,  decimals: 0, ...makeLinear(0,  20)  },
  DO: { countryCode: 'DO', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  UY: { countryCode: 'UY', scaleLabel: '1-12',    min: 1,  max: 12,  decimals: 1, ...makeLinear(1,  12)  },
  VE: { countryCode: 'VE', scaleLabel: '0-20',    min: 0,  max: 20,  decimals: 0, ...makeLinear(0,  20)  },

  // ── Europa ───────────────────────────────────────────────────────────────
  DE: { countryCode: 'DE', scaleLabel: '1-6',     min: 1,  max: 6,   decimals: 1, ...makeLinear(1,  6)   },
  AT: { countryCode: 'AT', scaleLabel: '1-5',     min: 1,  max: 5,   decimals: 1, ...makeLinear(1,  5)   },
  BE: { countryCode: 'BE', scaleLabel: '0-20',    min: 0,  max: 20,  decimals: 1, ...makeLinear(0,  20)  },
  BG: { countryCode: 'BG', scaleLabel: '2-6',     min: 2,  max: 6,   decimals: 1, ...makeLinear(2,  6)   },
  HR: { countryCode: 'HR', scaleLabel: '1-5',     min: 1,  max: 5,   decimals: 1, ...makeLinear(1,  5)   },
  DK: { countryCode: 'DK', scaleLabel: '00-12',   min: 0,  max: 12,  decimals: 0, ...makeLinear(0,  12)  },
  ES: { countryCode: 'ES', scaleLabel: '0-10',    min: 0,  max: 10,  decimals: 2, ...makeLinear(0,  10)  },
  FI: { countryCode: 'FI', scaleLabel: '4-10',    min: 4,  max: 10,  decimals: 1, ...makeLinear(4,  10)  },
  FR: { countryCode: 'FR', scaleLabel: '0-20',    min: 0,  max: 20,  decimals: 1, ...makeLinear(0,  20)  },
  GR: { countryCode: 'GR', scaleLabel: '0-20',    min: 0,  max: 20,  decimals: 1, ...makeLinear(0,  20)  },
  HU: { countryCode: 'HU', scaleLabel: '1-5',     min: 1,  max: 5,   decimals: 1, ...makeLinear(1,  5)   },
  IE: { countryCode: 'IE', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  IT: { countryCode: 'IT', scaleLabel: '1-10',    min: 1,  max: 10,  decimals: 1, ...makeLinear(1,  10)  },
  NL: { countryCode: 'NL', scaleLabel: '1-10',    min: 1,  max: 10,  decimals: 1, ...makeLinear(1,  10)  },
  NO: { countryCode: 'NO', scaleLabel: '1-6',     min: 1,  max: 6,   decimals: 1, ...makeLinear(1,  6)   },
  PL: { countryCode: 'PL', scaleLabel: '1-6',     min: 1,  max: 6,   decimals: 1, ...makeLinear(1,  6)   },
  PT: { countryCode: 'PT', scaleLabel: '0-20',    min: 0,  max: 20,  decimals: 1, ...makeLinear(0,  20)  },
  GB: { countryCode: 'GB', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  RO: { countryCode: 'RO', scaleLabel: '1-10',    min: 1,  max: 10,  decimals: 1, ...makeLinear(1,  10)  },
  RU: { countryCode: 'RU', scaleLabel: '1-5',     min: 1,  max: 5,   decimals: 1, ...makeLinear(1,  5)   },
  SE: { countryCode: 'SE', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  CH: { countryCode: 'CH', scaleLabel: '1-6',     min: 1,  max: 6,   decimals: 1, ...makeLinear(1,  6)   },
  TR: { countryCode: 'TR', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },

  // ── Asia ─────────────────────────────────────────────────────────────────
  AF: { countryCode: 'AF', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  SA: { countryCode: 'SA', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  BD: { countryCode: 'BD', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  CN: { countryCode: 'CN', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  KR: { countryCode: 'KR', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  PH: { countryCode: 'PH', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  IN: { countryCode: 'IN', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  ID: { countryCode: 'ID', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  IR: { countryCode: 'IR', scaleLabel: '0-20',    min: 0,  max: 20,  decimals: 1, ...makeLinear(0,  20)  },
  JP: { countryCode: 'JP', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  MY: { countryCode: 'MY', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  PK: { countryCode: 'PK', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  SG: { countryCode: 'SG', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  TH: { countryCode: 'TH', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  VN: { countryCode: 'VN', scaleLabel: '0-10',    min: 0,  max: 10,  decimals: 1, ...makeLinear(0,  10)  },

  // ── África ───────────────────────────────────────────────────────────────
  AO: { countryCode: 'AO', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  EG: { countryCode: 'EG', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  ET: { countryCode: 'ET', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  GH: { countryCode: 'GH', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  KE: { countryCode: 'KE', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  MA: { countryCode: 'MA', scaleLabel: '0-20',    min: 0,  max: 20,  decimals: 1, ...makeLinear(0,  20)  },
  NG: { countryCode: 'NG', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  ZA: { countryCode: 'ZA', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  TZ: { countryCode: 'TZ', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  UG: { countryCode: 'UG', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },

  // ── Oceanía ──────────────────────────────────────────────────────────────
  AU: { countryCode: 'AU', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  NZ: { countryCode: 'NZ', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  FJ: { countryCode: 'FJ', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
  PG: { countryCode: 'PG', scaleLabel: '0-100',   min: 0,  max: 100, decimals: 0, ...make100()           },
};

export const defaultGradingSystem: GradingSystem = {
  countryCode: 'XX',
  scaleLabel: '0-100',
  min: 0, max: 100, decimals: 1,
  ...make100(),
};

export function getGradingSystem(countryCode: string): GradingSystem {
  return gradingSystems[countryCode] ?? { ...defaultGradingSystem, countryCode };
}

// Países con escala configurada — aparecen primero en el selector
export const supportedCountryOrder = Object.keys(gradingSystems);