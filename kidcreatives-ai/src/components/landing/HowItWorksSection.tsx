import { motion } from 'framer-motion'
import { Upload, MessageCircle, Sparkles, Paintbrush, Trophy } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Drawing',
    description: 'Start with YOUR art - a sketch, doodle, or complete drawing',
    color: 'subject-blue'
  },
  {
    icon: MessageCircle,
    title: 'Teach the AI',
    description: 'Answer fun questions to help AI understand your creative vision',
    color: 'variable-purple'
  },
  {
    icon: Sparkles,
    title: 'Watch AI Add Magic',
    description: 'See AI enhance your art while keeping YOUR original ideas',
    color: 'context-orange'
  },
  {
    icon: Paintbrush,
    title: 'Make It Perfect',
    description: "You're in control - add finishing touches exactly how you want",
    color: 'action-green'
  },
  {
    icon: Trophy,
    title: 'Show Off Your Skills',
    description: 'Get a certificate proving you can work with AI like a pro!',
    color: 'subject-blue'
  }
]

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-white text-center mb-16 font-display"
        >
          How It Works - 5 Easy Steps!
        </motion.h2>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105"
            >
              {/* Step Number */}
              <div className={`w-12 h-12 rounded-full bg-${step.color} flex items-center justify-center text-white font-bold text-xl mb-4`}>
                {index + 1}
              </div>

              {/* Icon */}
              <step.icon className={`w-12 h-12 text-${step.color} mb-4`} />

              {/* Title */}
              <h3 className="text-xl font-semibold text-white mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-white/80 text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
