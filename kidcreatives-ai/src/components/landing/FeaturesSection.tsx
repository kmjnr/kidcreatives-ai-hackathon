import { motion } from 'framer-motion'
import { Brain, Sparkles, Award } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Learn AI Literacy',
    description: 'Discover how AI really works - not magic, but smart technology you can control',
    subtitle: 'Build skills that will matter in the future',
    gradient: 'from-subject-blue to-variable-purple'
  },
  {
    icon: Sparkles,
    title: 'Boost Your Creativity',
    description: 'Your drawings stay YOURS - AI just helps make them even more amazing',
    subtitle: 'Express your imagination in ways you never thought possible',
    gradient: 'from-variable-purple to-context-orange'
  },
  {
    icon: Award,
    title: 'Earn Real Certificates',
    description: 'Prove you can work with AI technology',
    subtitle: 'Print certificates to show parents, teachers, and friends your new skills',
    gradient: 'from-context-orange to-action-green'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-subject-blue via-variable-purple to-context-orange">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-white text-center mb-16 font-display"
        >
          Why KidCreatives AI?
        </motion.h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {/* Icon with Gradient Background */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-700 mb-3 leading-relaxed">
                {feature.description}
              </p>

              {/* Subtitle */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.subtitle}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
