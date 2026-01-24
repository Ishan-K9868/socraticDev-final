import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function ComparisonSection() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <section
      ref={sectionRef}
      id="comparison"
      className="section-padding relative overflow-hidden"
    >
      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-display-md font-bold mb-6">
            See the{' '}
            <span className="text-gradient-primary">Difference</span>
          </h2>
          <p className="text-lg text-[color:var(--color-text-secondary)]">
            Compare traditional learning with the Socratic method
          </p>
        </motion.div>

        {/* Comparison Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div
            ref={containerRef}
            className="relative h-[500px] rounded-2xl overflow-hidden shadow-elevated cursor-col-resize select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="slider"
            aria-label="Comparison slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={sliderPosition}
          >
            {/* Before (Traditional) - Left Side */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
              <div className="p-8 h-full flex flex-col">
                <div className="inline-block mb-4">
                  <span className="px-3 py-1 bg-red-500/20 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                    Before
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  Traditional Tutorial
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Copy code, feel stuck when alone
                </p>

                {/* Example conversation */}
                <div className="space-y-4 mb-8 flex-1">
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">"How do I remove duplicates from an array?"</p>
                  </div>
                  <div className="bg-red-100/50 dark:bg-red-900/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tutorial:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">"Use this code:"</p>
                    <code className="text-xs bg-gray-900 text-green-400 px-2 py-1 rounded block">
                      [...new Set(array)]
                    </code>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm italic text-gray-500 dark:text-gray-400">
                      💭 "I copied it... but why does it work?"
                    </p>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-3 mt-auto">
                  {[
                    'Passive learning',
                    'Shallow understanding',
                    "Can't apply to new problems",
                    'Frustration when stuck',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* After (Socratic) - Right Side */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              <div className="p-8 h-full flex flex-col">
                <div className="inline-block mb-4">
                  <span className="px-3 py-1 bg-green-500/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    After
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  Socratic Method
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Discover solutions, build confidence
                </p>

                {/* Example conversation */}
                <div className="space-y-4 mb-8 flex-1">
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">"How do I remove duplicates from an array?"</p>
                  </div>
                  <div className="bg-green-100/50 dark:bg-green-900/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI Guide:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">"What data structure only stores unique values?"</p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">"A Set! So I can use new Set(array)!"</p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm italic text-gray-500 dark:text-gray-400">
                      💡 "I understand WHY it works now!"
                    </p>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-3 mt-auto">
                  {[
                    'Active learning',
                    'Deep understanding',
                    'Transfer knowledge easily',
                    'Confident problem-solving',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-primary-500">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-center text-sm text-[color:var(--color-text-muted)] mt-4">
            Drag the slider or use arrow keys to compare traditional learning vs. Socratic method
          </p>
        </motion.div>
      </div>
    </section>
  );
}
