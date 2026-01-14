'use client'

import React from 'react'
import Image from 'next/image'

interface IndianEmblemProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const IndianEmblem: React.FC<IndianEmblemProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {/* Use the actual Government of India emblem image */}
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png"
        alt="Government of India Emblem"
        width={80}
        height={80}
        className="w-full h-full object-contain"
        priority
        onError={(e) => {
          // Fallback to a local placeholder or the original SVG if image fails
          console.warn('Failed to load Government emblem image')
        }}
      />
    </div>
  )
}

export default IndianEmblem
