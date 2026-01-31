import { motion } from 'framer-motion'

export function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-subject-blue-50 to-variable-purple-50">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 border-4 border-subject-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-system-grey-600 font-medium">Loading...</p>
      </motion.div>
    </div>
  )
}
