import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface UsernameModalProps {
  onClose: () => void
}

export function UsernameModal({ onClose }: UsernameModalProps) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const { signInAnonymously, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('Please enter your name')
      return
    }

    if (username.trim().length < 3) {
      setError('Name must be at least 3 characters')
      return
    }

    try {
      await signInAnonymously(username.trim())
      onClose()
    } catch {
      setError('Failed to start session. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-subject-blue to-variable-purple rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">
            Welcome to KidCreatives AI! 🎨
          </h2>
          <p className="text-gray-600 text-lg">
            Enter your name to start creating amazing art!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              placeholder="Your name (e.g., Alex)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-subject-blue focus:outline-none transition-colors text-lg"
              autoFocus
              disabled={loading}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full bg-gradient-to-r from-action-green to-green-500 text-white py-3 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Starting...' : 'Start Creating! 🚀'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          No email or password needed - just jump in and create!
        </p>
      </motion.div>
    </div>
  )
}
