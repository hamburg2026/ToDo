import { useEffect, useRef, useState } from 'react'
import { Database, Download, Upload, RotateCcw, ChevronDown, Check, X as XIcon } from 'lucide-react'
import { useStore } from '../store/useStore'
import ConfirmDialog from './ConfirmDialog'

function timestampForFilename(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`
}

export default function BackupMenu() {
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const resetData = useStore((s) => s.resetData)

  const [open, setOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<{ name: string; json: string } | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  function handleBackup() {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `taskwall-backup_${timestampForFilename()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setOpen(false)
    setToast({ ok: true, text: 'Backup wurde heruntergeladen.' })
  }

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPendingFile({ name: file.name, json: String(reader.result ?? '') })
      setOpen(false)
    }
    reader.readAsText(file)
  }

  function confirmImport() {
    if (!pendingFile) return
    const result = importData(pendingFile.json)
    setPendingFile(null)
    setToast(
      result.ok
        ? { ok: true, text: 'Daten wurden erfolgreich wiederhergestellt.' }
        : { ok: false, text: result.error },
    )
  }

  function confirmReset() {
    resetData()
    setResetOpen(false)
    setToast({ ok: true, text: 'Taskwall wurde zurückgesetzt.' })
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
        >
          <Database size={14} /> Daten
          <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 overflow-hidden rounded-xl glass p-1.5 shadow-glow animate-pop-in">
            <button
              onClick={handleBackup}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10"
            >
              <Download size={15} className="text-violet-300" />
              Backup erstellen
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10"
            >
              <Upload size={15} className="text-cyan-300" />
              Backup laden
            </button>
            <div className="my-1 h-px bg-white/10" />
            <button
              onClick={() => {
                setResetOpen(true)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-500/10"
            >
              <RotateCcw size={15} />
              Zurücksetzen
            </button>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFilePicked} className="hidden" />
      </div>

      {pendingFile && (
        <ConfirmDialog
          title="Backup wiederherstellen?"
          message={`„${pendingFile.name}“ wird geladen und ersetzt alle aktuellen Aufgaben und Personen. Dieser Schritt kann nicht rückgängig gemacht werden.`}
          confirmLabel="Wiederherstellen"
          danger
          onConfirm={confirmImport}
          onCancel={() => setPendingFile(null)}
        />
      )}

      {resetOpen && (
        <ConfirmDialog
          title="Taskwall zurücksetzen?"
          message="Alle Aufgaben, Personen und Boards werden gelöscht und durch die Beispieldaten ersetzt. Erstelle vorher ein Backup, falls du deine Daten behalten möchtest."
          confirmLabel="Zurücksetzen"
          danger
          onConfirm={confirmReset}
          onCancel={() => setResetOpen(false)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2.5 rounded-xl glass px-4 py-3 text-sm text-white shadow-glow animate-pop-in">
          {toast.ok ? <Check size={16} className="text-emerald-400" /> : <XIcon size={16} className="text-rose-400" />}
          {toast.text}
        </div>
      )}
    </>
  )
}
