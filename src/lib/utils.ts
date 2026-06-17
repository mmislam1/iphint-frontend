import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateText(value: string | null | undefined, maxLength: number) {
  if (!value) {
    return ''
  }

  const normalizedValue = value.trim()
  if (normalizedValue.length <= maxLength) {
    return normalizedValue
  }

  return `${normalizedValue.slice(0, Math.max(maxLength - 3, 1)).trimEnd()}...`
}
