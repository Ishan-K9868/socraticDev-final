import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Contact page with form and support options
function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would send to an API
        console.log('Form submitted:', formData);
        setSubmitted(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const contactOptions = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            title: 'Email Us',
            description: 'For general inquiries and support',
            action: 'hello@socraticdev.com',
            link: 'mailto:hello@socraticdev.com'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            title: 'Discord Community',
            description: 'Chat with other learners and get help',
            action: 'Join Discord',
            link: 'https://discord.gg/socraticdev'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Help Center',
            description: 'Browse FAQs and documentation',
            action: 'Visit Docs',
            link: '/docs'
        }
    ];

    const faqs = [
        {
            question: 'How do I get my Gemini API key?',
            answer: 'Visit Google AI Studio at aistudio.google.com/app/apikey, sign in with your Google account, and create a new API key. Add it to your .env.local file as VITE_GEMINI_API_KEY.'
        },
        {
            question: 'Is SocraticDev free to use?',
            answer: 'Yes! SocraticDev is currently free to use. You only need to provide your own Gemini API key. Google provides generous free tier usage for Gemini API.'
        },
        {
            question: 'What languages does The Dojo support?',
            answer: 'The Dojo challenges support Python, JavaScript, TypeScript, Java, and C++. We\'re constantly adding more languages based on user feedback.'
        },
        {
            question: 'How does spaced repetition work?',
            answer: 'Our SRS system uses the SM-2 algorithm to schedule flashcard reviews. Cards you find difficult appear more often, while cards you know well are scheduled further out. This optimizes long-term retention.'
        }
    ];

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="container-custom">
                    {/* Header */}
                    <div className="max-w-3xl mb-12">
                        <h1 className="font-display text-display-md font-bold mb-4">
                            Get in Touch
                        </h1>
                        <p className="text-lg text-[color:var(--color-text-secondary)]">
                            Have a question, feedback, or just want to say hi? We'd love to hear from you.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            {submitted ? (
                                <div className="p-8 rounded-2xl bg-green-500/10 border border-green-500/30 text-center">
                                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="font-display text-2xl font-bold mb-2">Message Sent!</h2>
                                    <p className="text-[color:var(--color-text-secondary)]">
                                        Thanks for reaching out. We'll get back to you within 24 hours.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Your Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-lg bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-lg bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium mb-2">Subject</label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="">Select a topic...</option>
                                            <option value="support">Technical Support</option>
                                            <option value="feedback">Product Feedback</option>
                                            <option value="bug">Bug Report</option>
                                            <option value="partnership">Partnership Inquiry</option>
                                            <option value="press">Press & Media</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium mb-2">Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            className="w-full px-4 py-3 rounded-lg bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                            placeholder="Tell us how we can help..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                                    >
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {contactOptions.map((option) => (
                                <a
                                    key={option.title}
                                    href={option.link}
                                    className="block p-5 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] hover:border-primary-500/50 transition-colors group"
                                >
                                    <div className="text-primary-500 mb-3">{option.icon}</div>
                                    <h3 className="font-semibold mb-1 group-hover:text-primary-500 transition-colors">{option.title}</h3>
                                    <p className="text-sm text-[color:var(--color-text-muted)] mb-2">{option.description}</p>
                                    <span className="text-sm text-primary-500">{option.action}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* FAQs */}
                    <section className="mt-20">
                        <h2 className="font-display text-2xl font-bold mb-8">Frequently Asked Questions</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {faqs.map((faq) => (
                                <div key={faq.question} className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                                    <p className="text-sm text-[color:var(--color-text-secondary)]">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default ContactPage;
