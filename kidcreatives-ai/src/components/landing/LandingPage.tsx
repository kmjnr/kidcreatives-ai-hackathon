import { GradientBackground } from '@/components/ui'
import { HeroSection } from './HeroSection'
import { HowItWorksSection } from './HowItWorksSection'
import { FeaturesSection } from './FeaturesSection'
import { ExampleGallerySection } from './ExampleGallerySection'
import { ParentSection } from './ParentSection'
import { Footer } from './Footer'

export function LandingPage() {
  return (
    <GradientBackground variant="mesh-1">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ExampleGallerySection />
      <ParentSection />
      <Footer />
    </GradientBackground>
  )
}
