import type { CardFont, CardFontSize, Column, ThemeId } from '../types'

export const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog', accent: '#151f76' },
  { id: 'progress', title: 'In Arbeit', accent: '#0073d2' },
  { id: 'review', title: 'Review', accent: '#a60781' },
  { id: 'done', title: 'Erledigt', accent: '#16cbaf' },
]

export const CATEGORIES: { name: string; color: string }[] = [
  { name: 'Arbeit', color: '#8b5cf6' },
  { name: 'Privat', color: '#22d3ee' },
  { name: 'Projekt', color: '#f59e0b' },
  { name: 'Dringend', color: '#fb7185' },
  { name: 'Idee', color: '#34d399' },
  { name: 'Sonstiges', color: '#94a3b8' },
]

export const CARD_COLORS = [
  '#facc15', // yellow sticky
  '#fca5a5', // rose
  '#93c5fd', // blue
  '#86efac', // green
  '#c4b5fd', // violet
  '#fdba74', // orange
  '#67e8f9', // cyan
  '#f0abfc', // pink
]

export const PERSON_COLORS = [
  '#8b5cf6',
  '#22d3ee',
  '#f59e0b',
  '#fb7185',
  '#34d399',
  '#60a5fa',
  '#f472b6',
  '#a3e635',
]

export const BOARD_COLORS = [
  '#8b5cf6',
  '#22d3ee',
  '#fb7185',
  '#f59e0b',
  '#34d399',
  '#60a5fa',
]

export const CARD_FONT_CLASSES: Record<CardFont, string> = {
  sans: 'font-sans',
  hand: 'font-hand',
  serif: 'font-serif',
}

export const CARD_FONT_OPTIONS: { id: CardFont; label: string; hint: string }[] = [
  { id: 'sans', label: 'Modern', hint: 'Klar & gut lesbar (Inter)' },
  { id: 'serif', label: 'Serifen', hint: 'Klassisch & elegant' },
  { id: 'hand', label: 'Handschrift', hint: 'Verspielt wie ein Notizzettel' },
]

export const CARD_FONT_SIZE_CLASSES: Record<CardFontSize, { title: string; description: string }> = {
  sm: { title: 'text-sm', description: 'text-xs' },
  md: { title: 'text-base', description: 'text-[13px]' },
  lg: { title: 'text-lg', description: 'text-sm' },
}

export const CARD_FONT_SIZE_OPTIONS: { id: CardFontSize; label: string }[] = [
  { id: 'sm', label: 'Klein' },
  { id: 'md', label: 'Normal' },
  { id: 'lg', label: 'Groß' },
]

export interface Theme {
  id: ThemeId
  label: string
  accentFrom: string
  accentTo: string
  auroraFrom: string
  auroraTo: string
}

export const THEMES: Theme[] = [
  { id: 'blue', label: 'Mittelblau', accentFrom: '#0073d2', accentTo: '#16cbaf', auroraFrom: '#0073d2', auroraTo: '#16cbaf' },
  { id: 'teal', label: 'Cyan-Grün', accentFrom: '#16cbaf', accentTo: '#0073d2', auroraFrom: '#16cbaf', auroraTo: '#151f76' },
  { id: 'purple', label: 'Purple', accentFrom: '#a60781', accentTo: '#0073d2', auroraFrom: '#a60781', auroraTo: '#16cbaf' },
  { id: 'navy', label: 'Dunkelblau', accentFrom: '#151f76', accentTo: '#0073d2', auroraFrom: '#151f76', auroraTo: '#16cbaf' },
]

export function themeById(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

export function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}

export function categoryColor(name: string): string {
  const found = CATEGORIES.find((c) => c.name.toLowerCase() === name?.toLowerCase())
  if (found) return found.color
  // deterministic fallback color from string hash
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 60%)`
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
