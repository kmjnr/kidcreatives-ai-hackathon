import { motion } from 'framer-motion'
import { Sparkles, Brain, Award } from 'lucide-react'

interface HeroSectionProps {
  onStartCreating: () => void
}

export function HeroSection({ onStartCreating }: HeroSectionProps) {

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-subject-blue via-variable-purple to-context-orange">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* Logo */}
        <motion.img
          src="/logo/logo.png"
          alt="KidCreatives AI - Teaching AI literacy through creative expression"
          className="h-16 md:h-20 w-auto mx-auto mb-8 drop-shadow-2xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Card with Strong Background */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-display leading-tight">
            Your Art + AI Magic = <br />
            <span className="bg-gradient-to-r from-action-green to-subject-blue bg-clip-text text-transparent">
              Amazing Creations!
            </span> ✨
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Add AI superpowers to your drawings! Learn how AI thinks, boost your creativity, 
            and create art you'll be proud to show everyone.
          </p>

          {/* CTA Button */}
          <motion.button
            onClick={onStartCreating}
            className="bg-gradient-to-r from-action-green to-action-green-600 hover:from-action-green-600 hover:to-action-green-700 text-white font-semibold text-lg px-10 py-4 rounded-xl shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 20px 40px rgba(39, 174, 96, 0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            Start Creating
          </motion.button>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm md:text-base">
            <div className="flex items-center gap-2 text-gray-700">
              <div className="w-10 h-10 rounded-full bg-action-green/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-action-green" />
              </div>
              <span className="font-medium">Boost Your Creativity</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <div className="w-10 h-10 rounded-full bg-subject-blue/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-subject-blue" />
              </div>
              <span className="font-medium">Learn AI Literacy</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <div className="w-10 h-10 rounded-full bg-context-orange/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-context-orange" />
              </div>
              <span className="font-medium">Earn Real Certificates</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
