import { motion } from 'framer-motion'
import { CheckCircle, Lock, FileText } from 'lucide-react'

const trustBadges = [
  {
    icon: CheckCircle,
    title: 'Builds Real Skills',
    points: [
      'Teaches AI literacy and prompt engineering fundamentals',
      'Develops critical thinking about how AI technology works'
    ]
  },
  {
    icon: Lock,
    title: 'Child-Centered & Safe',
    points: [
      'Kids stay in creative control - AI enhances, doesn\'t replace',
      'COPPA-compliant with no data sharing or tracking'
    ]
  },
  {
    icon: FileText,
    title: 'Pride & Achievement',
    points: [
      'Tangible certificates prove real AI collaboration skills',
      'Physical artwork they\'ll be proud to display and share'
    ]
  }
]

export function ParentSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-variable-purple via-subject-blue to-action-green">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-white text-center mb-16 font-display"
        >
          For Parents & Educators
        </motion.h2>

        {/* Trust Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-action-green/10 flex items-center justify-center mb-4">
                <badge.icon className="w-8 h-8 text-action-green" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {badge.title}
              </h3>

              {/* Points */}
              <ul className="space-y-3">
                {badge.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-action-green flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
