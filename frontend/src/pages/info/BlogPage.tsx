import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Blog page with articles about learning and coding
function BlogPage() {
    const featuredPost = {
        title: 'Why the Best Developers Are Always Learning',
        excerpt: 'The tech industry evolves rapidly. Here\'s how deliberate practice and the Socratic method can help you stay ahead.',
        author: 'SocraticDev Team',
        date: 'January 10, 2026',
        readTime: '8 min read',
        category: 'Learning',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop'
    };

    const posts = [
        {
            title: 'Mastering the Socratic Method for Coding',
            excerpt: 'Learn how asking the right questions can transform your understanding of complex programming concepts.',
            author: 'Alex Chen',
            date: 'January 8, 2026',
            readTime: '5 min read',
            category: 'Methodology'
        },
        {
            title: 'The Science Behind Spaced Repetition',
            excerpt: 'Discover how our SRS system uses cognitive science to help you retain programming knowledge longer.',
            author: 'Dr. Sarah Miller',
            date: 'January 5, 2026',
            readTime: '6 min read',
            category: 'Research'
        },
        {
            title: '10 Dojo Challenges to Level Up Your Skills',
            excerpt: 'Our favorite challenges from the Dojo that will push your problem-solving abilities to the next level.',
            author: 'Marcus Johnson',
            date: 'January 3, 2026',
            readTime: '7 min read',
            category: 'Tutorials'
        },
        {
            title: 'From Tutorial Hell to Real Understanding',
            excerpt: 'Breaking free from the copy-paste cycle and actually learning to think like a programmer.',
            author: 'Emily Rodriguez',
            date: 'December 28, 2025',
            readTime: '9 min read',
            category: 'Learning'
        },
        {
            title: 'Building Mental Models for Programming',
            excerpt: 'How visualization and mental compilation help you understand code before you even run it.',
            author: 'David Park',
            date: 'December 22, 2025',
            readTime: '6 min read',
            category: 'Methodology'
        },
        {
            title: 'The Future of AI-Assisted Learning',
            excerpt: 'How AI tutors like SocraticDev are changing the way we learn to code—without replacing real understanding.',
            author: 'SocraticDev Team',
            date: 'December 15, 2025',
            readTime: '10 min read',
            category: 'AI'
        }
    ];

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Learning': return 'bg-green-500/20 text-green-400';
            case 'Methodology': return 'bg-blue-500/20 text-blue-400';
            case 'Research': return 'bg-purple-500/20 text-purple-400';
            case 'Tutorials': return 'bg-orange-500/20 text-orange-400';
            case 'AI': return 'bg-cyan-500/20 text-cyan-400';
            default: return 'bg-neutral-500/20 text-neutral-400';
        }
    };

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="container-custom">
                    {/* Header */}
                    <div className="max-w-3xl mb-12">
                        <h1 className="font-display text-display-md font-bold mb-4">
                            Blog
                        </h1>
                        <p className="text-lg text-[color:var(--color-text-secondary)]">
                            Insights, tutorials, and research on learning to code more effectively through deliberate practice.
                        </p>
                    </div>

                    {/* Featured Post */}
                    <div className="mb-16">
                        <Link to="#" className="group block rounded-2xl overflow-hidden bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] hover:border-primary-500/50 transition-colors">
                            <div className="grid md:grid-cols-2">
                                <div className="aspect-video md:aspect-auto bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-primary-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="p-8 flex flex-col justify-center">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 w-fit ${getCategoryColor(featuredPost.category)}`}>
                                        {featuredPost.category}
                                    </span>
                                    <h2 className="font-display text-2xl font-bold mb-3 group-hover:text-primary-500 transition-colors">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-[color:var(--color-text-secondary)] mb-4">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-[color:var(--color-text-muted)]">
                                        <span>{featuredPost.author}</span>
                                        <span>•</span>
                                        <span>{featuredPost.date}</span>
                                        <span>•</span>
                                        <span>{featuredPost.readTime}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Posts Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.title}
                                to="#"
                                className="group block p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] hover:border-primary-500/50 transition-colors"
                            >
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${getCategoryColor(post.category)}`}>
                                    {post.category}
                                </span>
                                <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary-500 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-[color:var(--color-text-secondary)] mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
                                    <span>{post.author}</span>
                                    <span>{post.readTime}</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Newsletter */}
                    <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-[color:var(--color-border)] text-center">
                        <h2 className="font-display text-2xl font-bold mb-4">Subscribe to our newsletter</h2>
                        <p className="text-[color:var(--color-text-secondary)] mb-6 max-w-xl mx-auto">
                            Get the latest articles, tutorials, and learning tips delivered directly to your inbox.
                        </p>
                        <div className="flex gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 rounded-lg bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button className="px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default BlogPage;
