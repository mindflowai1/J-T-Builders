import Header from './components/Header'
import Footer from './components/Footer'
import Hero from './sections/Hero'
import SocialProofBar from './sections/SocialProofBar'
import Services from './sections/Services'
import StatsBand from './sections/StatsBand'
import PartnerSpotlight from './sections/PartnerSpotlight'
import WhyChooseUs from './sections/WhyChooseUs'
import Process from './sections/Process'
import Gallery from './sections/Gallery'
import BuildStory from './sections/BuildStory'
import Testimonials from './sections/Testimonials'

/** Temporary section placeholder — each gets replaced by its real section in later stages. */
function Placeholder({
  id,
  title,
  dark = false,
}: {
  id: string
  title: string
  dark?: boolean
}) {
  return (
    <section
      id={id}
      className={`px-6 py-24 ${dark ? 'bg-ink-950' : 'bg-cream-50'}`}
    >
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">Coming soon</p>
        <div className="accent-rule mt-2 mb-4" />
        <h2
          className={`text-section font-bold uppercase ${
            dark ? 'text-cream-50' : 'text-ink-950'
          }`}
        >
          {title}
        </h2>
      </div>
    </section>
  )
}

function App() {
  return (
    <div id="top">
      <Header />
      <main>
        <Hero />
        <SocialProofBar />
        <Services />
        <StatsBand />
        <PartnerSpotlight />
        <WhyChooseUs />
        <Process />
        <Gallery />
        <BuildStory />
        <Testimonials />
        <Placeholder id="contact" title="Contact" dark />
      </main>
      <Footer />
    </div>
  )
}

export default App
