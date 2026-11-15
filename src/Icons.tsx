import type { ReactNode } from 'react'

const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

export const MicIcon = () => <Svg><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" /></Svg>
export const StopIcon = () => <Svg><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /></Svg>
export const CameraIcon = () => <Svg><path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="4" /></Svg>
export const PhotoIcon = () => <Svg><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></Svg>
export const SpeakerIcon = () => <Svg><path d="M11 5 6 9H3v6h3l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></Svg>
export const CopyIcon = () => <Svg><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></Svg>
export const CheckIcon = () => <Svg><path d="M20 6 9 17l-5-5" /></Svg>
export const SendIcon = () => <Svg><path d="M12 19V5M5 12l7-7 7 7" /></Svg>
export const XIcon = () => <Svg><path d="M18 6 6 18M6 6l12 12" /></Svg>
