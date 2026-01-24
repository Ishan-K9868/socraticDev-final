import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Card from '../ui/Card';

interface DialogueMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  annotation?: string;
}

const dialogueScenario: DialogueMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'How do I remove duplicates from an array?',
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Great question! Before we jump to a solution, let me ask: what makes an element a duplicate?',
    annotation: 'Starting with understanding the problem, not the solution',
  },
  {
    id: '3',
    role: 'user',
    content: 'When the same value appears more than once?',
  },
  {
    id: '4',
    role: 'assistant',
    content: 'Exactly! So we need a way to track which values we\'ve already seen. What JavaScript data structure is perfect for tracking unique values?',
    annotation: 'Guiding toward the concept, not giving the answer',
  },
  {
    id: '5',
    role: 'user',
    content: 'A Set! It only stores unique values.',
  },
  {
    id: '6',
    role: 'assistant',
    content: 'Perfect! Now, how could you convert an array to a Set, and then back to an array?',
    annotation: 'Building on their discovery to reach the solution',
  },
  {
    id: '7',
    role: 'user',
    content: 'Using new Set() and then spreading it back into an array with [...new Set(array)]?',
  },
  {
    id: '8',
    role: 'assistant',
    content: 'Excellent! You\'ve discovered the solution yourself. Now you understand not just how to remove duplicates, but why this approach works. Can you think of when this method might not work as expected?',
    annotation: 'Reinforcing understanding and encouraging deeper thinking',
  },
  {
    id: '9',
    role: 'user',
    content: 'Maybe with objects? Since Set uses strict equality?',
  },
  {
    id: '10',
    role: 'assistant',
    content: 'Exactly right! You\'ve grasped both the solution and its limitations. This is the power of Socratic learning - you\'ll remember this because you discovered it yourself.',
    annotation: 'Celebrating the learning journey',
  },
];

const TypewriterMessage: React.FC<{
  message: DialogueMessage;
  onComplete: () => void;
}> = ({ message, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const isAssistant = message.role === 'assistant';

  // Update ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Only animate once when component first mounts
    if (hasAnimated) return;
    
    setHasAnimated(true);
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= message.content.length) {
        setDisplayedContent(message.content.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setShowAnnotation(true);
        setTimeout(() => onCompleteRef.current(), 300);
      }
    }, 15); // Faster: 15ms per character (was 30ms)

    return () => clearInterval(typingInterval);
  }, []); // Empty dependency array - only run once on mount

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`max-w-[80%] ${isAssistant ? 'mr-auto' : 'ml-auto'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAssistant
              ? 'bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20'
              : 'bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]'
          }`}
        >
          <div className="flex items-start gap-2">
            {isAssistant && (
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
              </div>
            )}
            <p className="text-sm leading-relaxed">
              {displayedContent}
              {displayedContent.length < message.content.length && (
                <span className="inline-block w-0.5 h-4 bg-current ml-1 animate-pulse" />
              )}
            </p>
          </div>
        </div>

        {message.annotation && showAnnotation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
            className="mt-2 px-3 py-2 bg-accent-500/10 border-l-4 border-accent-500 rounded"
          >
            <p className="text-xs text-accent-600 dark:text-accent-400 italic flex items-start gap-2">
              <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {message.annotation}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default function SocraticDemoSection() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<DialogueMessage[]>([]);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

  const handleReset = () => {
    setCurrentMessageIndex(0);
    setDisplayedMessages([]);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    if (currentMessageIndex === 0) {
      setDisplayedMessages([dialogueScenario[0]]);
      setCurrentMessageIndex(1);
    }
    setIsPlaying(true);
  };

  const handleMessageComplete = () => {
    if (currentMessageIndex < dialogueScenario.length) {
      setTimeout(() => {
        setDisplayedMessages((prev) => [...prev, dialogueScenario[currentMessageIndex]]);
        setCurrentMessageIndex((prev) => prev + 1);
      }, 400); // Faster delay between messages (was 800ms)
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying && displayedMessages.length === 0) {
      setDisplayedMessages([dialogueScenario[0]]);
      setCurrentMessageIndex(1);
    }
  }, [isPlaying, displayedMessages.length]);

  return (
    <section
      ref={sectionRef}
      id="socratic-demo"
      className="section-padding relative overflow-hidden bg-[color:var(--color-bg-secondary)]"
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
            See{' '}
            <span className="text-gradient-primary">Socratic Learning</span>
            {' '}in Action
          </h2>
          <p className="text-lg text-[color:var(--color-text-secondary)]">
            Watch how our AI guides you to discover solutions through thoughtful questions
          </p>
        </motion.div>

        {/* Demo Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card variant="terminal" padding="none" className="shadow-elevated">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--color-border)]">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Understanding Array Methods</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlay}
                  disabled={isPlaying || currentMessageIndex >= dialogueScenario.length}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  aria-label="Play dialogue"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Play
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-[color:var(--color-bg-secondary)] hover:bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] rounded-lg text-sm font-medium transition-colors"
                  aria-label="Reset dialogue"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
              {displayedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[350px] text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-[color:var(--color-text-secondary)] mb-2">
                    Click Play to see how Socratic questioning guides learning
                  </p>
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    Watch the AI ask questions that help you discover the solution yourself
                  </p>
                </div>
              ) : (
                <div>
                  {displayedMessages.map((message, index) => (
                    <TypewriterMessage
                      key={message.id}
                      message={message}
                      onComplete={
                        index === displayedMessages.length - 1 && isPlaying
                          ? handleMessageComplete
                          : () => {}
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
