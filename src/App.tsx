import Header from './components/Header'
import Footer from './components/Footer'
import MobileActionBar from './components/MobileActionBar'
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
import Contact from './sections/Contact'

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
        <Contact />
      </main>
      <Footer />
      <MobileActionBar />
    </div>
  )
}

export default App
