declare global {
  // eslint-disable-next-line no-var
  var __XANTA_BEST_BANNER__: boolean | undefined
}

const ANSI = { reset: "\x1b[0m" }

function rgb(text: string, r: number, g: number, b: number) {
  return `\x1b[38;2;${r};${g};${b}m${text}${ANSI.reset}`
}

function gradient(text: string, from: [number, number, number], to: [number, number, number]) {
  const chars = [...text]
  const n = Math.max(chars.length - 1, 1)
  return chars
    .map((ch, i) => {
      const t = i / n
      const r = Math.round(from[0] + (to[0] - from[0]) * t)
      const g = Math.round(from[1] + (to[1] - from[1]) * t)
      const b = Math.round(from[2] + (to[2] - from[2]) * t)
      return rgb(ch, r, g, b)
    })
    .join("")
}

function padRight(s: string, n: number) {
  if (s.length >= n) return s.slice(0, n)
  return s + " ".repeat(n - s.length)
}

function bytesToMB(n: number) {
  return `${(n / (1024 * 1024)).toFixed(0)} MB`
}

function fmtUptime(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  return `${h}h ${m}m ${s}s`
}

function clampLine(s: string, max = 56) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s
}

function xantaLogo() {
  const lines = [
    "██╗  ██╗ █████╗ ███╗   ██╗████████╗ █████╗",
    "╚██╗██╔╝██╔══██╗████╗  ██║╚══██╔══╝██╔══██╗",
    " ╚███╔╝ ███████║██╔██╗ ██║   ██║   ███████║",
    " ██╔██╗ ██╔══██║██║╚██╗██║   ██║   ██╔══██║",
    "██╔╝ ██╗██║  ██║██║ ╚████║   ██║   ██║  ██║",
    "╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝",
    "",
    "X A N T A",
  ]
  // biru -> ungu
  return lines.map((l) => gradient(l, [0, 120, 255], [180, 0, 255])).join("\n")
}

function makeBox(title: string, rows: string[]) {
  // width dalam box (biar rapi di terminal)
  const W = 58
  const top = `╔${"═".repeat(W)}╗`
  const bot = `╚${"═".repeat(W)}╝`

  const line = (content: string) => `║ ${padRight(content, W - 2)} ║`

  const out: string[] = [top, line(title)]
  out.push(`╟${"─".repeat(W)}╢`)
  for (const r of rows) out.push(line(r))
  out.push(bot)
  return out.join("\n")
}

function getSysRows() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const os = require("os") as typeof import("os")

  const cpus = os.cpus?.() || []
  const cores = cpus.length || 0
  const model = cpus[0]?.model?.trim() || "unknown"
  const total = os.totalmem()
  const free = os.freemem()
  const used = total - free
  const load1 = os.loadavg?.()?.[0] ?? 0

  // ram bar
  const pct = total > 0 ? used / total : 0
  const barLen = 18
  const fill = Math.round(pct * barLen)
  const bar = "█".repeat(fill) + "░".repeat(Math.max(0, barLen - fill))
  const ramLine = `RAM  : ${bytesToMB(used)} / ${bytesToMB(total)}  [${bar}] ${(pct * 100).toFixed(0)}%`

  return [
    `CPU  : ${cores} core`,
    `Model: ${clampLine(model, 56)}`,
    ramLine,
    `Load : ${load1.toFixed(2)}`,
    `OS   : ${process.platform} ${process.arch}`,
    `Node : ${process.version}`,
    `Up   : ${fmtUptime(process.uptime())}`,
    `Time : ${new Date().toLocaleString()}`,
  ]
}

function bestBanner() {
  const logo = xantaLogo()

  const box = makeBox(
    "XANTA SYSTEM",
    getSysRows()
  )
    .split("\n")
    .map((l) => gradient(l, [0, 180, 255], [180, 0, 255]))
    .join("\n")

  const scan = gradient("═".repeat(60), [0, 120, 255], [180, 0, 255])

  return `\n${logo}\n${scan}\n${box}\n${scan}\n`
}

// permanent on load + once per process
if (!globalThis.__XANTA_BEST_BANNER__) {
  globalThis.__XANTA_BEST_BANNER__ = true
  console.log(bestBanner())
}

/* jangan hapus exports asli lu di bawah ini */
import makeWASocket from './Socket/index'

export * from '../WAProto/index.js'
export * from './Utils/index'
export * from './Types/index'
export * from './Defaults/index'
export * from './WABinary/index'
export * from './WAM/index'
export * from './WAUSync/index'

export type WASocket = ReturnType<typeof makeWASocket>
export { makeWASocket }
export default makeWASocket
