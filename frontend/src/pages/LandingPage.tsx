import { useRef, useEffect } from 'react';
import Lenis from 'lenis';
import { useStore } from '../store/useStore';

// Components
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProblemSection from '../components/ProblemSection';
import SolutionSection from '../components/SolutionSection';
import SocraticDemoSection from '../components/SocraticDemoSection';
import ComparisonSection from '../components/ComparisonSection';
import FeatureSection from '../components/FeatureSection';
import DojoSection from '../components/DojoSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TechStackSection from '../components/TechStackSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import CustomCursor from '../components/CustomCursor';
import ScrollProgress from '../components/ScrollProgress';
import SectionIndicators from '../components/SectionIndicators';

function LandingPage() {
    const mainRef = useRef<HTMLElement>(null);
    const { isLoading } = useStore();

    useEffect(() => {
        if (isLoading) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const lenis = new Lenis({
            duration: 1.1,
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.15,
        });

        let rafId = 0;
        const raf = (time: number) => {
            lenis.raf(time);
            rafId = window.requestAnimationFrame(raf);
        };
        rafId = window.requestAnimationFrame(raf);

        return () => {
            window.cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, [isLoading]);

    // Hide main content while loading
    if (isLoading) {
        return null;
    }

    return (
        <main ref={mainRef} className="relative">
            {/* Scroll Progress Bar */}
            <ScrollProgress />

            {/* Custom Cursor (Desktop Only) */}
            <CustomCursor />

            {/* Section Indicators */}
            <SectionIndicators />

            {/* Navigation */}
            <Navbar />

            {/* Hero Section */}
            <Hero />

            {/* Problem Section */}
            <ProblemSection />

            {/* Solution Section */}
            <SolutionSection />

            {/* Socratic Demo Section - Interactive Dialogue */}
            <section id="socratic-demo">
                <SocraticDemoSection />
            </section>

            {/* Comparison Section - Before/After */}
            <section id="comparison">
                <ComparisonSection />
            </section>

            {/* Features Section */}
            <FeatureSection />

            {/* The Dojo - Interactive Challenges */}
            <DojoSection />

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Tech Stack Section */}
            <TechStackSection />

            {/* CTA Section */}
            <section id="cta">
                <CTASection />
            </section>

            {/* Footer */}
            <Footer />
        </main>
    );
}

export default LandingPage;

