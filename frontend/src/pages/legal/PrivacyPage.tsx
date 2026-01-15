import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Privacy Policy page
function PrivacyPage() {
    const lastUpdated = 'January 14, 2026';

    const sections = [
        {
            title: '1. Information We Collect',
            content: `
                <h4>1.1 Information You Provide</h4>
                <p>When you use SocraticDev, you may provide us with:</p>
                <ul>
                    <li><strong>Account Information:</strong> Email address and display name (if you create an account)</li>
                    <li><strong>User Content:</strong> Code snippets, messages, and project files you share with our AI assistant</li>
                    <li><strong>Feedback:</strong> Any feedback, bug reports, or suggestions you submit</li>
                </ul>

                <h4>1.2 Information Collected Automatically</h4>
                <p>We automatically collect certain information when you use our services:</p>
                <ul>
                    <li><strong>Usage Data:</strong> Features used, challenge completions, learning progress, and session duration</li>
                    <li><strong>Device Information:</strong> Browser type, operating system, and device type</li>
                    <li><strong>Local Storage:</strong> Preferences, theme settings, and SRS flashcard data stored locally on your device</li>
                </ul>
            `
        },
        {
            title: '2. How We Use Your Information',
            content: `
                <p>We use the collected information to:</p>
                <ul>
                    <li>Provide and improve our AI-powered learning services</li>
                    <li>Process your code queries and generate educational responses</li>
                    <li>Track your learning progress and provide personalized recommendations</li>
                    <li>Analyze usage patterns to improve our platform</li>
                    <li>Communicate with you about updates and new features</li>
                    <li>Ensure security and prevent abuse of our services</li>
                </ul>
            `
        },
        {
            title: '3. AI and Data Processing',
            content: `
                <h4>3.1 Google Gemini API</h4>
                <p>SocraticDev uses the Google Gemini API to power our AI assistant. When you interact with the AI:</p>
                <ul>
                    <li>Your messages are sent to Google's servers for processing</li>
                    <li>Google may process and store this data according to their privacy policy</li>
                    <li>We recommend reviewing <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:underline">Google's Privacy Policy</a></li>
                </ul>

                <h4>3.2 API Key Usage</h4>
                <p>You provide your own Gemini API key to use SocraticDev. This key:</p>
                <ul>
                    <li>Is stored only in your browser's local environment (.env.local)</li>
                    <li>Is never transmitted to our servers</li>
                    <li>Is used directly for API calls from your browser to Google's servers</li>
                </ul>
            `
        },
        {
            title: '4. Data Storage and Security',
            content: `
                <h4>4.1 Local Storage</h4>
                <p>Most of your data is stored locally in your browser:</p>
                <ul>
                    <li>Theme preferences</li>
                    <li>Learning mode selection</li>
                    <li>Flashcard data and SRS schedules</li>
                    <li>Analytics and gamification progress</li>
                    <li>Challenge completion history</li>
                </ul>

                <h4>4.2 No Server-Side Storage</h4>
                <p>SocraticDev is a frontend-only application. We do not operate servers that store your personal data or conversation history. All data remains in your browser.</p>

                <h4>4.3 Security Measures</h4>
                <p>We implement industry-standard security practices including:</p>
                <ul>
                    <li>HTTPS encryption for all connections</li>
                    <li>Secure coding practices</li>
                    <li>Regular security audits</li>
                </ul>
            `
        },
        {
            title: '5. Your Rights and Choices',
            content: `
                <p>You have the following rights regarding your data:</p>
                <ul>
                    <li><strong>Access:</strong> You can view all data stored in your browser's local storage</li>
                    <li><strong>Deletion:</strong> You can clear all stored data by clearing your browser's local storage for our domain</li>
                    <li><strong>Export:</strong> You can export your flashcard data from the SRS dashboard</li>
                    <li><strong>Opt-out:</strong> You can use the application without enabling analytics tracking</li>
                </ul>
                <p>To delete all SocraticDev data from your browser, open Developer Tools (F12), go to Application → Local Storage, and clear all items containing "socraticdev".</p>
            `
        },
        {
            title: '6. Third-Party Services',
            content: `
                <p>SocraticDev integrates with the following third-party services:</p>
                <ul>
                    <li><strong>Google Gemini API:</strong> AI model processing</li>
                    <li><strong>Google Fonts:</strong> Typography (Space Grotesk, Clash Display)</li>
                </ul>
                <p>These services have their own privacy policies. We encourage you to review them.</p>
            `
        },
        {
            title: '7. Children\'s Privacy',
            content: `
                <p>SocraticDev is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.</p>
            `
        },
        {
            title: '8. Changes to This Policy',
            content: `
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this page. We encourage you to review this Privacy Policy periodically.</p>
            `
        },
        {
            title: '9. Contact Us',
            content: `
                <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                <ul>
                    <li>Email: <a href="mailto:privacy@socraticdev.com" class="text-primary-500 hover:underline">privacy@socraticdev.com</a></li>
                </ul>
            `
        }
    ];

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="container-custom max-w-4xl">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="font-display text-display-md font-bold mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-[color:var(--color-text-muted)]">
                            Last updated: {lastUpdated}
                        </p>
                    </div>

                    {/* Introduction */}
                    <div className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] mb-8">
                        <p className="text-[color:var(--color-text-secondary)]">
                            At SocraticDev, we take your privacy seriously. This Privacy Policy explains how we collect,
                            use, and protect your information when you use our AI-powered learning platform. By using
                            SocraticDev, you agree to the collection and use of information in accordance with this policy.
                        </p>
                    </div>

                    {/* Table of Contents */}
                    <div className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] mb-12">
                        <h2 className="font-semibold mb-4">Table of Contents</h2>
                        <ul className="space-y-2">
                            {sections.map((section) => (
                                <li key={section.title}>
                                    <a href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="text-primary-500 hover:underline">
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Sections */}
                    <div className="space-y-10">
                        {sections.map((section) => (
                            <section key={section.title} id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
                                <h2 className="font-display text-xl font-bold mb-4">{section.title}</h2>
                                <div
                                    className="prose prose-invert max-w-none text-[color:var(--color-text-secondary)] [&_h4]:font-semibold [&_h4]:text-[color:var(--color-text-primary)] [&_h4]:mt-4 [&_h4]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[color:var(--color-text-secondary)] [&_p]:mb-3"
                                    dangerouslySetInnerHTML={{ __html: section.content }}
                                />
                            </section>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default PrivacyPage;
