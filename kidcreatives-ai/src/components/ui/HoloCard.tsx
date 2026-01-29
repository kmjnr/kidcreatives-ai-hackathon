import { useMemo } from 'react'
import Tilt from 'react-parallax-tilt'
import { motion } from 'framer-motion'
import { Trophy, Sparkles, Clock, Edit, Zap } from 'lucide-react'
import type { HoloCardData } from '@/types/TrophyTypes'
import { formatTimeSpent } from '@/lib/statsExtractor'

interface HoloCardProps {
  data: HoloCardData
  className?: string
}

export function HoloCard({ data, className = '' }: HoloCardProps) {
  const { finalImage, stats, intentStatement, creationDate } = data

  const imageDataURL = useMemo(
    () => `data:image/png;base64,${finalImage}`,
    [finalImage]
  )

  return (
    <Tilt
      tiltMaxAngleX={15}
      tiltMaxAngleY={15}
      perspective={1000}
      scale={1.05}
      transitionSpeed={2000}
      glareEnable={true}
      glareMaxOpacity={0.3}
      glareColor="#ffffff"
      glarePosition="all"
      className={className}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 1, type: 'spring', stiffness: 100 }}
        className="relative w-full max-w-md mx-auto rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4A90E2 0%, #9B59B6 50%, #E67E22 100%)'
        }}
      >
        {/* Holographic overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none" />
        
        {/* Card content */}
        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-300" />
              <h2 className="text-2xl font-bold text-white">
                Prompt Master
              </h2>
            </div>
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>

          {/* Final artwork */}
          <div className="relative aspect-square bg-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
            <img
              src={imageDataURL}
              alt="Final artwork"
              className="w-full h-full object-contain"
            />
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
          </div>

          {/* Intent statement */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm text-white/90 italic text-center">
              "{intentStatement}"
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatBadge
              icon={<Sparkles className="w-4 h-4" />}
              label="Creativity"
              value={`${stats.creativityScore}/100`}
            />
            <StatBadge
              icon={<Edit className="w-4 h-4" />}
              label="Edits"
              value={stats.totalEdits.toString()}
            />
            <StatBadge
              icon={<Clock className="w-4 h-4" />}
              label="Time"
              value={formatTimeSpent(stats.timeSpent)}
            />
            <StatBadge
              icon={<Zap className="w-4 h-4" />}
              label="Questions"
              value={stats.totalQuestions.toString()}
            />
          </div>

          {/* Date */}
          <div className="text-center">
            <p className="text-xs text-white/70">
              Created on {creationDate.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Corner decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-300/20 rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-yellow-300/20 rounded-tr-full" />
      </motion.div>
    </Tilt>
  )
}

interface StatBadgeProps {
  icon: React.ReactNode
  label: string
  value: string
}

function StatBadge({ icon, label, value }: StatBadgeProps) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
      <div className="text-yellow-300">{icon}</div>
      <div>
        <p className="text-xs text-white/70">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  )
}
