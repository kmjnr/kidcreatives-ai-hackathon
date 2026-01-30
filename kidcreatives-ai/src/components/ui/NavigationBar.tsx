import { motion } from 'framer-motion'
import { Images, LogOut } from 'lucide-react'
import { Button } from './button'
import { ProgressIndicator } from './ProgressIndicator'
import { Phase } from '@/types/PhaseTypes'

interface NavigationBarProps {
  currentPhase: Phase
  onGalleryClick: () => void
  onLogout: () => void
  showGallery?: boolean
  userName?: string
}

export function NavigationBar({
  currentPhase,
  onGalleryClick,
  onLogout,
  showGallery = true,
  userName,
}: NavigationBarProps) {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/logo/logo.png" 
              alt="KidCreatives AI" 
              className="h-10 w-auto md:h-12"
            />
          </div>

          {/* Progress Indicator (center) */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <ProgressIndicator currentPhase={currentPhase} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* User name (desktop only) */}
            {userName && (
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {userName}
              </span>
            )}
            
            {/* Gallery button */}
            {showGallery && (
              <Button
                variant="outline"
                size="sm"
                onClick={onGalleryClick}
                className="gap-2"
              >
                <Images className="w-4 h-4" />
                <span className="hidden md:inline">Gallery</span>
              </Button>
            )}

            {/* Logout button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile progress indicator */}
        <div className="md:hidden mt-4 flex justify-center">
          <ProgressIndicator currentPhase={currentPhase} />
        </div>
      </div>
    </motion.nav>
  )
}
