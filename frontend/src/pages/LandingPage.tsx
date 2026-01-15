import { useRef, useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '../store/useStore';

// Components
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProblemSection from '../components/ProblemSection';
import SolutionSection from '../components/SolutionSection';
import FeatureSection from '../components/FeatureSection';
import DojoSection from '../components/DojoSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TechStackSection from '../components/TechStackSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

function LandingPage() {
    const mainRef = useRef<HTMLElement>(null);
    const { isLoading } = useStore();

    useEffect(() => {
        // Refresh ScrollTrigger after content loads
        if (!isLoading) {
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
        }

        // Cleanup ScrollTriggers on unmount
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [isLoading]);

    // Hide main content while loading
    if (isLoading) {
        return null;
    }

    return (
        <main ref={mainRef} className="relative">
            {/* Navigation */}
            <Navbar />

            {/* Hero Section */}
            <Hero />

            {/* Problem Section */}
            <ProblemSection />

            {/* Solution Section */}
            <SolutionSection />

            {/* Features Section */}
            <FeatureSection />

            {/* The Dojo - Interactive Challenges */}
            <DojoSection />

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Tech Stack Section */}
            <TechStackSection />

            {/* CTA Section */}
            <CTASection />

            {/* Footer */}
            <Footer />
        </main>
    );
}

export default LandingPage;

