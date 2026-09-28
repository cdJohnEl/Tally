import type { ReactNode } from 'react'

interface IconProps {
  size?: number
}

function Svg({ size = 18, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  )
}

export function PencilIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M17.2 3.3a2.4 2.4 0 0 1 3.4 3.4L8 19.2 3 20.6l1.4-5L17.2 3.3Z" />
    </Svg>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 6.5h16M9 6V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V6" />
      <path d="M18.3 6.5 17.5 19a2 2 0 0 1-2 1.9h-7a2 2 0 0 1-2-1.9L5.7 6.5" />
      <path d="M10 10.5v6M14 10.5v6" />
    </Svg>
  )
}
