import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Brain, Award } from 'lucide-react'

export function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* Logo */}
        <motion.img
          src="/logo/logo.png"
          alt="KidCreatives AI"
          className="h-16 md:h-20 w-auto mx-auto mb-8"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-display">
            Your Art + AI Magic = <br />
            <span className="text-action-green">Amazing Creations!</span> ✨
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Add AI superpowers to your drawings! Learn how AI thinks, boost your creativity, 
            and create art you'll be proud to show everyone.
          </p>

          {/* CTA Button */}
          <motion.button
            onClick={() => navigate('/app')}
            className="bg-action-green hover:bg-action-green-600 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Creating
          </motion.button>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm md:text-base text-white/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-action-green" />
              <span>Boost Your Creativity</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-subject-blue" />
              <span>Learn AI Literacy</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-context-orange" />
              <span>Earn Real Certificates</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
