export default function Footer() {
  return (
    <footer className="mt-12 text-center space-y-4">

      {/* Built for Digital Heroes button — REQUIRED */}
      <div>
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-2xl transition shadow-md shadow-purple-100 text-sm"
        >
          Built for Digital Heroes
        </a>
      </div>

      {/* Developer credit — REQUIRED */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-50 rounded-2xl px-6 py-4 inline-block">
        <p className="text-gray-500 text-sm">
          Built with ♥ by{' '}
          <span className="font-semibold text-purple-600">Jyoti Kumari</span>
        </p>
        <a
          href="mailto:jyotika918273@gmail.com"
          className="text-pink-400 hover:text-pink-600 text-sm transition"
        >
          jyotika918273@gmail.com
        </a>
      </div>

      <p className="text-gray-300 text-xs pb-4">
        Free forever · No login required · No ads
      </p>

    </footer>
  )
}