import type { TokenId } from '../engine/types'

export function TokenGlyph({ token, color }: { token: TokenId; color: string }) {
  return (
    <svg className="token" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill={color} />
      <circle cx="16" cy="16" r="12" fill="#fffaf3" />
      {token === 'orchid' && <Orchid />}
      {token === 'toast' && <Toast />}
      {token === 'train' && <Train />}
      {token === 'satay' && <Satay />}
    </svg>
  )
}

function Orchid() {
  return (
    <g fill="#c23b22">
      <ellipse cx="16" cy="10" rx="3" ry="5" />
      <ellipse cx="10" cy="16" rx="5" ry="3" />
      <ellipse cx="22" cy="16" rx="5" ry="3" />
      <ellipse cx="12" cy="22" rx="3.2" ry="5" transform="rotate(-20 12 22)" />
      <ellipse cx="20" cy="22" rx="3.2" ry="5" transform="rotate(20 20 22)" />
      <circle cx="16" cy="16" r="2.2" fill="#f2d15c" />
    </g>
  )
}

function Toast() {
  return (
    <g>
      <rect x="8" y="10" width="16" height="13" rx="2" fill="#e0b15a" />
      <rect x="10" y="12" width="12" height="4" rx="1" fill="#6fbf4a" />
      <rect x="10" y="17" width="12" height="3" rx="1" fill="#f4e2b0" />
    </g>
  )
}

function Train() {
  return (
    <g fill="#234e78">
      <rect x="7" y="12" width="18" height="8" rx="2" />
      <circle cx="12" cy="21" r="2" />
      <circle cx="20" cy="21" r="2" />
      <rect x="10" y="14" width="4" height="3" fill="#fffaf3" />
      <rect x="16" y="14" width="4" height="3" fill="#fffaf3" />
    </g>
  )
}

function Satay() {
  return (
    <g>
      <rect x="15" y="6" width="2" height="20" rx="1" fill="#8d5a34" />
      <circle cx="16" cy="12" r="3.2" fill="#c23b22" />
      <circle cx="16" cy="18" r="3.2" fill="#d4672f" />
      <circle cx="16" cy="24" r="2.4" fill="#e0b15a" />
    </g>
  )
}

export const TOKEN_CHOICES: { id: TokenId; label: string }[] = [
  { id: 'orchid', label: 'Orchid' },
  { id: 'toast', label: 'Kaya toast' },
  { id: 'train', label: 'MRT' },
  { id: 'satay', label: 'Satay' },
]
