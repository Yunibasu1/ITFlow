const STORAGE_KEY = 'itflow.notificationSound'

let audioCtx: AudioContext | null = null
let enabled = readEnabled()
let interactionPrimed = false

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

export function isNotificationSoundEnabled(): boolean {
  return enabled
}

export function setNotificationSoundEnabled(value: boolean): void {
  enabled = value
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off')
  } catch {
    // almacenamiento no disponible: ignorar
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!Ctor) return null
  if (!audioCtx) audioCtx = new Ctor()
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
  return audioCtx
}

export function primeNotificationAudio(): void {
  if (interactionPrimed) return
  interactionPrimed = true
  const prime = () => {
    getCtx()
    window.removeEventListener('pointerdown', prime)
    window.removeEventListener('keydown', prime)
  }
  window.addEventListener('pointerdown', prime)
  window.addEventListener('keydown', prime)
}

export function playNotificationSound(): void {
  if (!enabled) return
  const ctx = getCtx()
  if (!ctx) return

  const now = ctx.currentTime
  const notes = [
    { freq: 880, start: 0, dur: 0.09, gain: 0.14 },
    { freq: 1174.66, start: 0.09, dur: 0.16, gain: 0.12 },
  ]

  notes.forEach((note) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = note.freq
    gain.gain.setValueAtTime(0.0001, now + note.start)
    gain.gain.exponentialRampToValueAtTime(note.gain, now + note.start + 0.015)
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + note.start + note.dur,
    )
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + note.start)
    osc.stop(now + note.start + note.dur + 0.05)
  })
}
