import { motion } from 'framer-motion'
import { Upload, MessageCircle, Sparkles, Paintbrush, Trophy } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Drawing',
    description: 'Start with YOUR art - a sketch, doodle, or complete drawing',
    color: 'bg-subject-blue',
    textColor: 'text-subject-blue'
  },
  {
    icon: MessageCircle,
    title: 'Teach the AI',
    description: 'Answer fun questions to help AI understand your creative vision',
    color: 'bg-variable-purple',
    textColor: 'text-variable-purple'
  },
  {
    icon: Sparkles,
    title: 'Watch AI Add Magic',
    description: 'See AI enhance your art while keeping YOUR original ideas',
    color: 'bg-context-orange',
    textColor: 'text-context-orange'
  },
  {
    icon: Paintbrush,
    title: 'Make It Perfect',
    description: "You're in control - add finishing touches exactly how you want",
    color: 'bg-action-green',
    textColor: 'text-action-green'
  },
  {
    icon: Trophy,
    title: 'Show Off Your Skills',
    description: 'Get a certificate proving you can work with AI like a pro!',
    color: 'bg-subject-blue',
    textColor: 'text-subject-blue'
  }
]

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-gray-900 text-center mb-16 font-display"
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
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
            >
              {/* Step Number */}
              <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-xl mb-4`}>
                {index + 1}
              </div>

              {/* Icon */}
              <step.icon className={`w-12 h-12 ${step.textColor} mb-4`} />

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
