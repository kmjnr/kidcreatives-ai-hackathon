import { motion } from 'framer-motion'

export function ExampleGallerySection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-display">
            See How Kids Add AI Magic to Their Art
          </h2>
          <p className="text-xl text-white/80">
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
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
            >
              {/* Before/After Placeholder */}
              <div className="space-y-4">
                {/* Before */}
                <div>
                  <p className="text-white/70 text-sm mb-2">Before (Your Drawing)</p>
                  <div className="aspect-square bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                    <span className="text-white/50">Original Sketch</span>
                  </div>
                </div>

                {/* After */}
                <div>
                  <p className="text-white/70 text-sm mb-2">After (AI Enhanced)</p>
                  <div className="aspect-square bg-gradient-to-br from-subject-blue/20 to-variable-purple/20 rounded-xl flex items-center justify-center border border-white/10">
                    <span className="text-white/50">AI Magic Added!</span>
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
