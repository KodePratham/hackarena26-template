import { useEffect, useRef, useState } from 'react'
import { getBandConfig } from '../../data/mockData'

interface HeartbeatProps {
    score: number
}

export default function HeartbeatVisualizer({ score }: HeartbeatProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animRef = useRef<number>()
    const band = getBandConfig(score)
    const [displayScore, setDisplayScore] = useState(0)

    // Animate score count-up
    useEffect(() => {
        let start = 0
        const duration = 1200
        const step = (timestamp: number) => {
            if (!start) start = timestamp
            const progress = Math.min((timestamp - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplayScore(Math.round(eased * score))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [score])

    // Animate heartbeat ECG line on canvas
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let t = 0
        const w = canvas.width
        const h = canvas.height

        const getECGValue = (x: number): number => {
            const mod = x % 180
            if (band.rhythm === 'flatline') {
                // Flatline with tiny noise
                return h / 2 + (Math.random() - 0.5) * 3
            }
            if (band.rhythm === 'strong') {
                if (mod < 80) return h / 2
                if (mod < 90) return h / 2 - (h * 0.42) * Math.sin(((mod - 80) / 10) * Math.PI)
                if (mod < 95) return h / 2 - (h * 0.18) * Math.sin(((mod - 90) / 5) * Math.PI)
                if (mod < 110) return h / 2 + (h * 0.12) * Math.sin(((mod - 95) / 15) * Math.PI)
                return h / 2
            }
            if (band.rhythm === 'steady') {
                if (mod < 100) return h / 2
                if (mod < 108) return h / 2 - (h * 0.35) * Math.sin(((mod - 100) / 8) * Math.PI)
                if (mod < 112) return h / 2 - (h * 0.12) * Math.sin(((mod - 108) / 4) * Math.PI)
                if (mod < 124) return h / 2 + (h * 0.10) * Math.sin(((mod - 112) / 12) * Math.PI)
                return h / 2
            }
            if (band.rhythm === 'irregular') {
                if (mod < 60) return h / 2
                if (mod < 68) return h / 2 - (h * 0.28) * Math.sin(((mod - 60) / 8) * Math.PI) + (Math.random() - 0.5) * 4
                if (mod < 90) return h / 2 + (Math.random() - 0.5) * 6
                if (mod < 98) return h / 2 - (h * 0.18) * Math.sin(((mod - 90) / 8) * Math.PI)
                return h / 2 + (Math.random() - 0.5) * 3
            }
            // erratic
            return h / 2 + Math.sin(x * 0.15) * (h * 0.25) + Math.sin(x * 0.47) * (h * 0.08) + (Math.random() - 0.5) * 8
        }

        const draw = () => {
            ctx.clearRect(0, 0, w, h)

            // Grid lines
            ctx.strokeStyle = 'rgba(255,255,255,0.04)'
            ctx.lineWidth = 1
            for (let x = 0; x < w; x += 40) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
            }
            for (let y = 0; y < h; y += 20) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
            }

            // Glow trail
            const gradient = ctx.createLinearGradient(0, 0, w, 0)
            gradient.addColorStop(0, 'transparent')
            gradient.addColorStop(0.6, band.color + '40')
            gradient.addColorStop(1, band.color)

            ctx.shadowBlur = 18
            ctx.shadowColor = band.color
            ctx.strokeStyle = gradient
            ctx.lineWidth = 2.5
            ctx.lineJoin = 'round'
            ctx.lineCap = 'round'
            ctx.beginPath()

            for (let x = 0; x <= w; x++) {
                const srcX = x + t
                const y = getECGValue(srcX)
                if (x === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
            }
            ctx.stroke()
            ctx.shadowBlur = 0

            // Scan line glow at right edge
            const scanX = w - 8
            ctx.fillStyle = band.color
            ctx.shadowBlur = 20
            ctx.shadowColor = band.color
            ctx.beginPath()
            ctx.arc(scanX, getECGValue(scanX + t), 4, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0

            t += band.rhythm === 'flatline' ? 0.3 : (band.rhythm === 'erratic' ? 1.8 : 1.2)
            animRef.current = requestAnimationFrame(draw)
        }

        animRef.current = requestAnimationFrame(draw)
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
    }, [band])

    return (
        <div style={{
            position: 'relative',
            background: 'rgba(8,13,26,0.8)',
            border: `1px solid ${band.color}33`,
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            overflow: 'hidden',
            boxShadow: `0 0 60px ${band.glowColor}`,
        }}>
            {/* Radial glow bg */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400, height: 400, borderRadius: '50%',
                background: `radial-gradient(circle, ${band.glowColor} 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            {/* Score display */}
            <div style={{ position: 'relative', textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                    color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8,
                }}>VitalScore</div>
                <div style={{
                    fontSize: 76, fontWeight: 900, lineHeight: 1,
                    color: band.color,
                    textShadow: `0 0 40px ${band.glowColor}`,
                    fontVariantNumeric: 'tabular-nums',
                }}>{displayScore}</div>
                <div style={{
                    marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}>
                    <span style={{
                        padding: '4px 14px', borderRadius: 20,
                        background: `${band.color}22`,
                        border: `1px solid ${band.color}44`,
                        color: band.color, fontWeight: 700, fontSize: 13,
                    }}>{band.label}</span>
                    <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>↑ +18 this week</span>
                </div>
            </div>

            {/* ECG Canvas */}
            <canvas
                ref={canvasRef}
                width={640}
                height={100}
                style={{ width: '100%', height: 100, borderRadius: 8 }}
            />

            {/* Band legend */}
            <div style={{
                marginTop: 20, display: 'flex', justifyContent: 'space-between',
                fontSize: 10, color: 'var(--text-muted)', fontWeight: 500,
            }}>
                <span>0 — Vital Emergency</span>
                <span>200 — Vital Critical</span>
                <span>400 — Vital Warning</span>
                <span>600 — Vital Strong</span>
                <span>800 — Vital Elite</span>
            </div>
        </div>
    )
}
