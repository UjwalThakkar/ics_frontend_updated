'use client'

import React from 'react'

const TempleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Temple Silhouettes */}

        {/* Red Fort Style Architecture - Left */}
        <g className="opacity-60">
          <rect x="50" y="400" width="200" height="300" fill="#D4AF37" />
          <rect x="70" y="350" width="160" height="50" fill="#DAA520" />
          <polygon points="70,350 150,300 230,350" fill="#FFD700" />

          {/* Domes */}
          <circle cx="100" cy="320" r="20" fill="#FF6B35" />
          <circle cx="150" cy="320" r="20" fill="#FF6B35" />
          <circle cx="200" cy="320" r="20" fill="#FF6B35" />

          {/* Minarets */}
          <rect x="40" y="200" width="15" height="200" fill="#DAA520" />
          <rect x="245" y="200" width="15" height="200" fill="#DAA520" />
          <circle cx="47.5" cy="200" r="10" fill="#FF6B35" />
          <circle cx="252.5" cy="200" r="10" fill="#FF6B35" />
        </g>

        {/* Lotus Temple Style - Center */}
        <g className="opacity-50" transform="translate(400, 200)">
          {/* Lotus Petals */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30) * Math.PI / 180
            const x = 80 * Math.cos(angle)
            const y = 40 * Math.sin(angle)
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y + 300}
                rx="25"
                ry="60"
                fill="#FFE5B4"
                transform={`rotate(${i * 30} ${x} ${y + 300})`}
              />
            )
          })}

          {/* Central Dome */}
          <ellipse cx="0" cy="300" rx="60" ry="80" fill="#F0E68C" />
        </g>

        {/* Taj Mahal Style - Right */}
        <g className="opacity-40" transform="translate(800, 250)">
          {/* Main Dome */}
          <ellipse cx="100" cy="200" rx="60" ry="80" fill="#FFF8DC" />

          {/* Side Structures */}
          <rect x="20" y="250" width="40" height="150" fill="#FFF8DC" />
          <rect x="140" y="250" width="40" height="150" fill="#FFF8DC" />

          {/* Small Domes */}
          <circle cx="40" cy="240" r="20" fill="#FFE4B5" />
          <circle cx="160" cy="240" r="20" fill="#FFE4B5" />

          {/* Central Gateway */}
          <rect x="60" y="280" width="80" height="120" fill="#FFF8DC" />
          <path d="M60 320 Q100 280 140 320 L140 400 L60 400 Z" fill="#F5DEB3" />

          {/* Minarets */}
          <rect x="10" y="100" width="20" height="200" fill="#FFF8DC" />
          <rect x="170" y="100" width="20" height="200" fill="#FFF8DC" />
          <circle cx="20" cy="100" r="15" fill="#FFE4B5" />
          <circle cx="180" cy="100" r="15" fill="#FFE4B5" />
        </g>

        {/* Decorative Patterns */}

        {/* Mandala Pattern - Top Left */}
        <g className="opacity-30" transform="translate(100, 100)">
          <circle cx="0" cy="0" r="40" fill="none" stroke="#FFD700" strokeWidth="2" />
          <circle cx="0" cy="0" r="30" fill="none" stroke="#FFD700" strokeWidth="1" />
          <circle cx="0" cy="0" r="20" fill="none" stroke="#FFD700" strokeWidth="1" />
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45) * Math.PI / 180
            const x1 = 20 * Math.cos(angle)
            const y1 = 20 * Math.sin(angle)
            const x2 = 40 * Math.cos(angle)
            const y2 = 40 * Math.sin(angle)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#FFD700"
                strokeWidth="1"
              />
            )
          })}
        </g>

        {/* Ashoka Chakra - Top Right */}
        <g className="opacity-40" transform="translate(1000, 120)">
          <circle cx="0" cy="0" r="50" fill="#000080" opacity="0.3" />
          <circle cx="0" cy="0" r="40" fill="white" opacity="0.8" />
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i * 15) * Math.PI / 180
            const x1 = 15 * Math.cos(angle)
            const y1 = 15 * Math.sin(angle)
            const x2 = 40 * Math.cos(angle)
            const y2 = 40 * Math.sin(angle)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#000080"
                strokeWidth="1"
                opacity="0.7"
              />
            )
          })}
        </g>

        {/* Peacock Silhouette - Bottom */}
        <g className="opacity-25" transform="translate(600, 600)">
          <path
            d="M0 0 Q20 -30 50 -20 Q80 -10 100 -30 Q120 -50 150 -30 Q170 -10 190 -20 Q210 -30 220 0 Q200 20 170 15 Q140 10 100 20 Q60 30 30 20 Q10 10 0 0"
            fill="#4169E1"
          />
          <ellipse cx="50" cy="10" rx="30" ry="15" fill="#32CD32" />
          <circle cx="40" cy="5" r="3" fill="#FFD700" />
        </g>

        {/* Lotus Flowers - Scattered */}
        <g className="opacity-30">
          <g transform="translate(200, 600)">
            <path d="M0 0 Q-10 -15 0 -20 Q10 -15 0 0" fill="#FF69B4" />
            <path d="M0 0 Q-15 -10 -20 0 Q-15 10 0 0" fill="#FF69B4" />
            <path d="M0 0 Q10 -15 20 0 Q15 10 0 0" fill="#FF69B4" />
            <path d="M0 0 Q15 -10 20 0 Q15 10 0 0" fill="#FF69B4" />
          </g>

          <g transform="translate(900, 550)">
            <path d="M0 0 Q-8 -12 0 -16 Q8 -12 0 0" fill="#FF1493" />
            <path d="M0 0 Q-12 -8 -16 0 Q-12 8 0 0" fill="#FF1493" />
            <path d="M0 0 Q8 -12 16 0 Q12 8 0 0" fill="#FF1493" />
            <path d="M0 0 Q12 -8 16 0 Q12 8 0 0" fill="#FF1493" />
          </g>
        </g>

        {/* Gateway Arches */}
        <g className="opacity-35" transform="translate(300, 500)">
          <path d="M0 100 Q0 50 50 50 Q100 50 100 100 L100 150 L0 150 Z" fill="#DEB887" />
          <path d="M10 90 Q10 60 50 60 Q90 60 90 90 L90 140 L10 140 Z" fill="#F5DEB3" />
        </g>

      </svg>
    </div>
  )
}

export default TempleBackground
