export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Logo and Tagline */}
        <div className="text-center mb-8">
          <img 
            src="/logo/logo.png" 
            alt="KidCreatives AI" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Empowering young creators with AI literacy and pride in their art.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            About
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Contact
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm">
          © 2026 KidCreatives AI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
