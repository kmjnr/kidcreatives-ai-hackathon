import { motion } from 'framer-motion'

export function ExampleGallerySection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 font-display">
            See How Kids Add AI Magic to Their Art
          </h2>
          <p className="text-xl text-gray-600">
            Your drawing + AI enhancement = Something amazing!
          </p>
        </motion.div>

        {/* Placeholder Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Before/After Placeholder */}
              <div className="space-y-4">
                {/* Before */}
                <div>
                  <p className="text-gray-700 font-medium text-sm mb-2">Before (Your Drawing)</p>
                  <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                    <span className="text-gray-400 font-medium">Original Sketch</span>
                  </div>
                </div>

                {/* After */}
                <div>
                  <p className="text-gray-700 font-medium text-sm mb-2">After (AI Enhanced)</p>
                  <div className="aspect-square bg-gradient-to-br from-subject-blue/20 via-variable-purple/20 to-context-orange/20 rounded-xl flex items-center justify-center border-2 border-dashed border-subject-blue/30">
                    <span className="text-subject-blue font-medium">AI Magic Added!</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
