import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Cookie Policy page with consent management
function CookiePage() {
    const [preferences, setPreferences] = useState({
        necessary: true, // Always required
        analytics: true,
        functional: true
    });
    const [saved, setSaved] = useState(false);

    const lastUpdated = 'January 14, 2026';

    const handleSavePreferences = () => {
        localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const cookieTypes = [
        {
            type: 'necessary',
            title: 'Strictly Necessary',
            description: 'These are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot disable these.',
            examples: ['Session management', 'Security tokens', 'Load balancing'],
            required: true
        },
        {
            type: 'functional',
            title: 'Functional',
            description: 'These help us remember your preferences and settings, like your theme choice (dark/light mode) and learning mode selection. Disabling these may affect your experience.',
            examples: ['Theme preferences', 'Mode selection', 'UI customization'],
            required: false
        },
        {
            type: 'analytics',
            title: 'Analytics',
            description: 'These help us understand how you use SocraticDev so we can improve the learning experience. All analytics data is anonymized and stored locally.',
            examples: ['Learning progress', 'Feature usage', 'Session duration'],
            required: false
        }
    ];

    const localStorageItems = [
        { key: 'socraticdev-storage', purpose: 'Theme and mode preferences', retention: 'Until cleared' },
        { key: 'srs-cards', purpose: 'Flashcard data', retention: 'Until cleared' },
        { key: 'srs-stats', purpose: 'SRS learning statistics', retention: 'Until cleared' },
        { key: 'learning-metrics', purpose: 'Analytics and progress', retention: 'Until cleared' },
        { key: 'gamification-stats', purpose: 'XP, streaks, achievements', retention: 'Until cleared' },
        { key: 'dojo-stats', purpose: 'Challenge completion history', retention: 'Until cleared' }
    ];

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="container-custom max-w-4xl">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="font-display text-display-md font-bold mb-4">
                            Cookie Policy
                        </h1>
                        <p className="text-[color:var(--color-text-muted)]">
                            Last updated: {lastUpdated}
                        </p>
                    </div>

                    {/* Introduction */}
                    <div className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] mb-8">
                        <p className="text-[color:var(--color-text-secondary)]">
                            SocraticDev uses cookies and similar technologies (like localStorage) to provide, protect,
                            and improve our services. This policy explains what technologies we use, why we use them,
                            and how you can control your preferences.
                        </p>
                    </div>

                    {/* Key Notice */}
                    <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30 mb-12">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="font-semibold text-blue-400 mb-2">Important: We Don't Use Traditional Cookies</h3>
                                <p className="text-sm text-[color:var(--color-text-secondary)]">
                                    SocraticDev is a frontend-only application. We don't use traditional HTTP cookies or
                                    tracking cookies. Instead, we use your browser's <strong>localStorage</strong> to save
                                    your preferences and learning data. This data never leaves your device.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What We Use */}
                    <section className="mb-12">
                        <h2 className="font-display text-2xl font-bold mb-6">What We Use</h2>
                        <div className="space-y-4">
                            {cookieTypes.map((cookie) => (
                                <div key={cookie.type} className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold">{cookie.title}</h3>
                                                {cookie.required && (
                                                    <span className="px-2 py-0.5 rounded text-xs bg-primary-500/20 text-primary-400">Required</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-[color:var(--color-text-secondary)] mb-3">{cookie.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {cookie.examples.map((example) => (
                                                    <span key={example} className="px-2 py-1 rounded text-xs bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-muted)]">
                                                        {example}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={preferences[cookie.type as keyof typeof preferences]}
                                                    onChange={(e) => setPreferences(prev => ({
                                                        ...prev,
                                                        [cookie.type]: e.target.checked
                                                    }))}
                                                    disabled={cookie.required}
                                                    className="sr-only peer"
                                                />
                                                <div className={`w-11 h-6 rounded-full peer ${cookie.required
                                                        ? 'bg-primary-500 cursor-not-allowed'
                                                        : 'bg-neutral-600 peer-checked:bg-primary-500'
                                                    } peer-focus:ring-2 peer-focus:ring-primary-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full`}></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSavePreferences}
                            className="mt-6 px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                        >
                            {saved ? '✓ Preferences Saved' : 'Save Preferences'}
                        </button>
                    </section>

                    {/* LocalStorage Details */}
                    <section className="mb-12">
                        <h2 className="font-display text-2xl font-bold mb-6">LocalStorage Items</h2>
                        <p className="text-[color:var(--color-text-secondary)] mb-6">
                            Here's a complete list of data we store in your browser's localStorage:
                        </p>
                        <div className="rounded-xl overflow-hidden border border-[color:var(--color-border)]">
                            <table className="w-full text-sm">
                                <thead className="bg-[color:var(--color-bg-secondary)]">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Storage Key</th>
                                        <th className="px-4 py-3 text-left font-medium">Purpose</th>
                                        <th className="px-4 py-3 text-left font-medium">Retention</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {localStorageItems.map((item) => (
                                        <tr key={item.key} className="border-t border-[color:var(--color-border)]">
                                            <td className="px-4 py-3 font-mono text-cyan-400">{item.key}</td>
                                            <td className="px-4 py-3 text-[color:var(--color-text-secondary)]">{item.purpose}</td>
                                            <td className="px-4 py-3 text-[color:var(--color-text-muted)]">{item.retention}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* How to Clear */}
                    <section className="mb-12">
                        <h2 className="font-display text-2xl font-bold mb-6">How to Clear Your Data</h2>
                        <div className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                            <p className="text-[color:var(--color-text-secondary)] mb-4">
                                You can clear all SocraticDev data from your browser at any time:
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-[color:var(--color-text-secondary)]">
                                <li>Open your browser's Developer Tools (F12 or Right-click → Inspect)</li>
                                <li>Go to the <strong>Application</strong> tab (Chrome) or <strong>Storage</strong> tab (Firefox)</li>
                                <li>Find <strong>Local Storage</strong> in the sidebar</li>
                                <li>Click on the SocraticDev domain</li>
                                <li>Delete all items, or selectively remove specific keys</li>
                            </ol>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to clear all SocraticDev data? This cannot be undone.')) {
                                        Object.keys(localStorage).filter(k =>
                                            k.includes('socratic') || k.includes('srs') || k.includes('dojo') || k.includes('gamification') || k.includes('learning')
                                        ).forEach(k => localStorage.removeItem(k));
                                        alert('All SocraticDev data has been cleared.');
                                    }
                                }}
                                className="mt-6 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                            >
                                Clear All My Data
                            </button>
                        </div>
                    </section>

                    {/* Third Parties */}
                    <section className="mb-12">
                        <h2 className="font-display text-2xl font-bold mb-6">Third-Party Services</h2>
                        <div className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                            <p className="text-[color:var(--color-text-secondary)] mb-4">
                                SocraticDev integrates with the following third-party services that may set their own cookies:
                            </p>
                            <ul className="space-y-3 text-[color:var(--color-text-secondary)]">
                                <li>
                                    <strong className="text-[color:var(--color-text-primary)]">Google Gemini API:</strong> Used for AI responses.
                                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline ml-1">View Google's Privacy Policy</a>
                                </li>
                                <li>
                                    <strong className="text-[color:var(--color-text-primary)]">Google Fonts:</strong> Used for typography (Space Grotesk, Clash Display).
                                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline ml-1">View Google's Privacy Policy</a>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="font-display text-2xl font-bold mb-6">Questions?</h2>
                        <p className="text-[color:var(--color-text-secondary)]">
                            If you have questions about our use of cookies or this policy, please contact us at{' '}
                            <a href="mailto:privacy@socraticdev.com" className="text-primary-500 hover:underline">privacy@socraticdev.com</a>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default CookiePage;
