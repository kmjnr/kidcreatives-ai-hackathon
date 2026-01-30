import { HeroSection } from './HeroSection'
import { HowItWorksSection } from './HowItWorksSection'
import { FeaturesSection } from './FeaturesSection'
import { ExampleGallerySection } from './ExampleGallerySection'
import { ParentSection } from './ParentSection'
import { Footer } from './Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ExampleGallerySection />
      <ParentSection />
      <Footer />
    </div>
  )
}
