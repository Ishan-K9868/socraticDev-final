import { useRef, useEffect } from 'react';
import Lenis from 'lenis';
import { useStore } from '../store/useStore';

// Components
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProblemSection from '../components/ProblemSection';
import SolutionHorizontalScroll from '../components/SolutionHorizontalScroll';
import GraphRAGPipelineSection from '../components/GraphRAGPipelineSection';
import SocraticDemoSection from '../components/SocraticDemoSection';
import ComparisonSection from '../components/ComparisonSection';
import FeatureSection from '../components/FeatureSection';
import DojoSection from '../components/DojoSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TechStackSection from '../components/TechStackSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import ScrollProgress from '../components/ScrollProgress';
import SectionIndicators from '../components/SectionIndicators';

function LandingPage() {
    const mainRef = useRef<HTMLElement>(null);
    const { isLoading } = useStore();

    useEffect(() => {
        if (isLoading) return;

        const root = document.documentElement;
        const previousScrollBehavior = root.style.scrollBehavior;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Prevent browser smooth-scroll from fighting Lenis interpolation.
        root.style.scrollBehavior = 'auto';

        const lenis = new Lenis({
            autoRaf: true,
            lerp: 0.1,
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.5,
            syncTouch: true,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            anchors: true,
        });

        return () => {
            lenis.destroy();
            root.style.scrollBehavior = previousScrollBehavior;
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

            {/* Section Indicators */}
            <SectionIndicators />

            {/* Navigation */}
            <Navbar />

            {/* Hero Section */}
            <Hero />

            {/* Problem Section */}
            <ProblemSection />

            {/* Solution Section — Horizontal Scroll with 3 panels */}
            <SolutionHorizontalScroll />

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

            {/* GraphRAG Pipeline Section */}
            <GraphRAGPipelineSection />

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

