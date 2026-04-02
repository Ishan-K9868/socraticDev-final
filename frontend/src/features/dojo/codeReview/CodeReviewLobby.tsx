import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { REVIEW_FILES } from './codeReviewData';
import CodeReviewArena from './CodeReviewArena';
import { ICON_MAGNIFIER, ICON_CODE_FILE } from './codeReviewIcons';

const ease = [0.25, 0.1, 0.25, 1] as const;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

export default function CodeReviewLobby() {
    const [showArena, setShowArena] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState(REVIEW_FILES[0].id);
    const navigate = useNavigate();

    if (showArena) return <CodeReviewArena initialFileId={selectedFileId} />;

    return (
        <div className="min-h-screen relative overflow-hidden bg-[color:var(--color-bg-primary)]">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-500/10 to-transparent blur-3xl" />
                <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-500/8 to-transparent blur-3xl" />
                <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-violet-500/8 to-transparent blur-3xl" />
            </div>
            <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
                backgroundImage: `linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)`,
                backgroundSize: '60px 60px', zIndex: 0,
            }} />

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[color:var(--color-bg-primary)]/80 border-b border-[color:var(--color-border)]">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/learn')} className="p-2 -ml-2 rounded-xl hover:bg-[color:var(--color-bg-muted)] transition-colors">
                        <svg className="w-5 h-5 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-display font-bold text-[color:var(--color-text-primary)]">AI Code Reviews</h1>
                </div>
            </header>

            <motion.main variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-5xl mx-auto px-6 py-16">
                {/* Hero */}
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-br from-blue-500/15 to-emerald-500/15"
                    >
                        <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d={ICON_MAGNIFIER} />
                        </svg>
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-[color:var(--color-text-primary)] mb-6 leading-tight">
                        AI Code
                        <br />
                        <span className="bg-gradient-to-r from-blue-500 via-emerald-500 to-violet-500 bg-clip-text text-transparent">
                            Reviews
                        </span>
                    </h2>
                    <p className="text-lg text-[color:var(--color-text-muted)] max-w-xl mx-auto">
                        Watch an AI reviewer scan your code in real-time. Security flaws, performance issues, and style suggestions — all caught instantly.
                    </p>
                </motion.div>

                {/* File Picker */}
                <motion.div variants={itemVariants} className="mb-16">
                    <h3 className="text-sm uppercase tracking-widest text-center mb-6 text-[color:var(--color-text-muted)]">
                        Select a File to Review
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {REVIEW_FILES.map((file, i) => {
                            const isSelected = file.id === selectedFileId;
                            return (
                                <motion.button
                                    key={file.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.08, duration: 0.45, ease }}
                                    onClick={() => setSelectedFileId(file.id)}
                                    className={`relative rounded-2xl p-5 border text-left group transition-all duration-300 cursor-pointer ${
                                        isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                                    }`}
                                    style={{
                                        background: 'var(--color-bg-secondary)',
                                        borderColor: isSelected ? file.accentColor : 'var(--color-border)',
                                        boxShadow: isSelected ? `0 0 30px ${file.accentColor}15` : 'none',
                                    }}
                                >
                                    {isSelected && (
                                        <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: file.accentColor }} />
                                    )}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${file.accentColor}15` }}>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={file.accentColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                                <path d={ICON_CODE_FILE} />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-display font-bold text-sm text-[color:var(--color-text-primary)]">{file.name}</h4>
                                            <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">{file.language}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[color:var(--color-text-muted)] leading-relaxed">{file.description}</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: `${file.accentColor}15`, color: file.accentColor }}>
                                            {file.comments.length} issues
                                        </span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Code Preview */}
                <motion.div variants={itemVariants} className="mb-12">
                    <div className="rounded-2xl border bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)] overflow-hidden">
                        <div className="px-4 py-3 border-b border-[color:var(--color-border)] flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/60" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                            <div className="w-3 h-3 rounded-full bg-green-500/60" />
                            <span className="ml-2 text-xs text-[color:var(--color-text-muted)] font-mono">
                                {REVIEW_FILES.find(f => f.id === selectedFileId)?.name}
                            </span>
                        </div>
                        <pre className="px-4 py-4 text-xs font-mono text-[color:var(--color-text-muted)] overflow-x-auto max-h-48 leading-relaxed">
                            {REVIEW_FILES.find(f => f.id === selectedFileId)?.code}
                        </pre>
                    </div>
                </motion.div>

                {/* Start Button */}
                <motion.div variants={itemVariants} className="text-center">
                    <motion.button
                        onClick={() => setShowArena(true)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-display font-bold text-lg text-white cursor-pointer bg-gradient-to-r from-blue-500 to-emerald-500 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d={ICON_MAGNIFIER} />
                        </svg>
                        Start Review
                    </motion.button>
                    <p className="text-xs mt-4 text-[color:var(--color-text-muted)]">
                        Frontend simulation — watch an AI reviewer analyze code in real time
                    </p>
                </motion.div>
            </motion.main>
        </div>
    );
}
