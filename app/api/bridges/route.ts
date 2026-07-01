import { NextResponse } from 'next/server'

export interface BridgeEntry {
  name: string
  status: 'OPEN_CLEAR' | 'RESTRICTED' | 'CLOSED'
  color: 'green' | 'yellow' | 'red'
  desc: string
  source: 'fixed-span' | 'construction' | 'override'
  lastVerified: string
  sourceUrl: string
}

const FDOT_D4_URL = 'https://www.d4fdot.com/tcfdot/TC-Indian_Closures.asp'
const today = new Date().toISOString().split('T')[0]

function get17thStStatus(): Pick<BridgeEntry, 'status' | 'color' | 'desc' | 'source' | 'sourceUrl'> {
  const now = new Date()
  const rehabStart = new Date('2023-01-01')
  const rehabEnd = new Date('2028-12-31')
  if (now >= rehabStart && now <= rehabEnd) {
    return {
      status: 'RESTRICTED',
      color: 'red',
      desc: 'MAJOR REHAB 2023–2028 (Alma Lee Loy Bridge). One lane alternating 24/7 with flagging. Expect 5–15 min delays peak hours. Use Barber or Wabasso as alternates.',
      source: 'construction',
      sourceUrl: FDOT_D4_URL,
    }
  }
  return {
    status: 'OPEN_CLEAR',
    color: 'yellow',
    desc: 'Fixed bridge — SR-656 barrier island crossing. 2 lanes, no restrictions.',
    source: 'fixed-span',
    sourceUrl: FDOT_D4_URL,
  }
}

function buildBridges(): BridgeEntry[] {
  const bridges: BridgeEntry[] = [
    {
      name: 'BARBER (SR_60)',
      status: 'OPEN_CLEAR',
      color: 'yellow',
      desc: 'Fixed bridge — main artery to mainland via SR-60. 4 lanes, no restrictions. Connects to US-1 and I-95 corridor.',
      source: 'fixed-span',
      lastVerified: today,
      sourceUrl: 'https://verotides.com',
    },
    {
      name: '17TH_ST (SR_656)',
      ...get17thStStatus(),
      lastVerified: today,
    },
    {
      name: 'WABASSO (CR_510)',
      status: 'OPEN_CLEAR',
      color: 'yellow',
      desc: 'Fixed bridge — northern barrier island crossing via CR-510. 2 lanes, no restrictions. Best alternate while 17th St is under construction.',
      source: 'fixed-span',
      lastVerified: today,
      sourceUrl: 'https://verotides.com',
    },
    {
      name: 'SEBASTIAN (SR_A1A)',
      status: 'RESTRICTED',
      color: 'red',
      desc: 'LONG-TERM BRIDGE REPLACEMENT started June 1, 2026. Motorists should anticipate weekday lane closures with flaggers and travel delays. South parking lot closed.',
      source: 'construction',
      lastVerified: today,
      sourceUrl: 'https://verotides.com',
    },
  ]

  // Optional env override — set BRIDGE_OVERRIDES={"BARBER (SR_60)":{"status":"RESTRICTED","desc":"..."}}
  // on Vercel to update any bridge without a code deploy.
  const overridesRaw = process.env.BRIDGE_OVERRIDES
  if (overridesRaw) {
    try {
      const overrides: Record<string, Partial<BridgeEntry>> = JSON.parse(overridesRaw)
      for (const bridge of bridges) {
        if (overrides[bridge.name]) {
          Object.assign(bridge, overrides[bridge.name], { source: 'override' as const })
        }
      }
    } catch {
      // malformed override — silently ignore, serve base data
    }
  }

  return bridges
}

export async function GET() {
  return NextResponse.json(buildBridges(), {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}
