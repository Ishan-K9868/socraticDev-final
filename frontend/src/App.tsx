import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import LandingPage from './pages/LandingPage';
import AppPage from './pages/AppPage';
import BuildModePage from './pages/BuildModePage';
import LearningHub from './pages/LearningHub';
import CouncilPage from './pages/CouncilPage';
import { DojoPage } from './features/dojo';
import { CodeVisualizer } from './features/visualizer';
import { SRSDashboard, ReviewSession } from './features/srs';
import { AnalyticsDashboard } from './features/analytics';
import { GamificationHub } from './features/gamification';
import CustomCursor from './components/CustomCursor';
import Loader from './components/Loader';
import AppErrorBoundary from './components/AppErrorBoundary';
import { useDeviceType } from './hooks/useDeviceType';
import { useReducedMotion } from './hooks/useReducedMotion';

// Info pages
import {
    DocsPage,
    APIPage,
    BlogPage,
    ChangelogPage,
    AboutPage,
    CareersPage,
    ContactPage,
    PressPage,
    PrivacyPage,
    TermsPage,
    CookiePage
} from './pages';

function App() {
    const { theme, isLoading, setLoading, cursorEnabled } = useStore();
    const { isMobile, isTablet } = useDeviceType();
    const prefersReducedMotion = useReducedMotion();
    const [isCoarsePointer, setIsCoarsePointer] = useState(false);

    // Apply theme class to document
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Simulate initial load
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [setLoading]);

    useEffect(() => {
        const media = window.matchMedia('(pointer: coarse)');
        const syncPointerMode = () => setIsCoarsePointer(media.matches);

        syncPointerMode();
        if (media.addEventListener) {
            media.addEventListener('change', syncPointerMode);
            return () => media.removeEventListener('change', syncPointerMode);
        }

        media.addListener(syncPointerMode);
        return () => media.removeListener(syncPointerMode);
    }, []);

    useEffect(() => {
        const shouldUseEnhancedCursor =
            cursorEnabled &&
            !isMobile &&
            !isTablet &&
            !isCoarsePointer &&
            !prefersReducedMotion;

        document.documentElement.classList.toggle('cursor-enhanced', shouldUseEnhancedCursor);
        return () => {
            document.documentElement.classList.remove('cursor-enhanced');
        };
    }, [cursorEnabled, isCoarsePointer, isMobile, isTablet, prefersReducedMotion]);

    return (
        <AppErrorBoundary>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                {/* Noise overlay for texture */}
                <div className="noise-overlay" aria-hidden="true" />

                {/* Custom cursor - renders above modals with z-9999 */}
                <CustomCursor />

                {/* Loading screen */}
                {isLoading && <Loader />}

                {/* Main content */}
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/app" element={<AppPage />} />
                    <Route path="/build" element={<BuildModePage />} />
                    <Route path="/learn" element={<LearningHub />} />
                    <Route path="/dojo" element={<DojoPage />} />
                    <Route path="/visualizer" element={<CodeVisualizer />} />
                    <Route path="/srs" element={<SRSDashboard />} />
                    <Route path="/srs/review" element={<ReviewSession />} />
                    <Route path="/analytics" element={<AnalyticsDashboard />} />
                    <Route path="/achievements" element={<GamificationHub />} />
                    <Route path="/council" element={<CouncilPage />} />

                    {/* Resources pages */}
                    <Route path="/docs" element={<DocsPage />} />
                    <Route path="/api" element={<APIPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/changelog" element={<ChangelogPage />} />

                    {/* Company pages */}
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/careers" element={<CareersPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/press" element={<PressPage />} />

                    {/* Legal pages */}
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/cookies" element={<CookiePage />} />
                </Routes>
            </Router>
        </AppErrorBoundary>
    );
}

export default App;

