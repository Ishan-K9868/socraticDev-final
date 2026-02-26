import { useMemo, useRef, useState, useEffect } from 'react';
import { SkillScore } from './types';

interface SkillRadarProps {
    skills: SkillScore[];
    size?: number;
}

function SkillRadar({ skills, size = 300 }: SkillRadarProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [renderSize, setRenderSize] = useState(size);
    const safeSkills = skills.filter((skill) => skill && typeof skill.name === 'string');

    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;

        const resizeObserver = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect?.width || size;
            const clamped = Math.max(220, Math.min(420, Math.floor(width - 12)));
            setRenderSize(clamped);
        });
        resizeObserver.observe(el);

        return () => resizeObserver.disconnect();
    }, [size]);

    const center = renderSize / 2;
    const radius = Math.max(72, (renderSize - 88) / 2);

    const chart = useMemo(() => {
        if (safeSkills.length < 3) return null;
        const angleStep = (2 * Math.PI) / safeSkills.length;

        const points = safeSkills.map((skill, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const normalized = Math.max(0, Math.min(100, skill.score)) / 100;
            const r = normalized * radius;
            return {
                x: center + r * Math.cos(angle),
                y: center + r * Math.sin(angle),
            };
        });

        const labels = safeSkills.map((skill, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const baseR = radius + 30;
            const x = center + baseR * Math.cos(angle);
            const y = center + baseR * Math.sin(angle);
            return {
                x: Math.max(44, Math.min(renderSize - 44, x)),
                y: Math.max(22, Math.min(renderSize - 22, y)),
                skill,
            };
        });

        const gridLines = [0.2, 0.4, 0.6, 0.8, 1].map((pct) => {
            const r = radius * pct;
            return safeSkills.map((_, index) => {
                const angle = index * angleStep - Math.PI / 2;
                return {
                    x: center + r * Math.cos(angle),
                    y: center + r * Math.sin(angle),
                };
            });
        });

        return { points, labels, gridLines, angleStep };
    }, [center, radius, renderSize, safeSkills]);

    if (!chart) {
        return (
            <div ref={containerRef} className="w-full min-h-[260px] flex items-center justify-center text-sm text-[color:var(--color-text-muted)]">
                Skill data will appear after completing a few activities.
            </div>
        );
    }

    const polygonPath = chart.points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ') + ' Z';

    return (
        <div ref={containerRef} className="relative w-full min-h-[260px]">
            <svg width={renderSize} height={renderSize} viewBox={`0 0 ${renderSize} ${renderSize}`} className="mx-auto max-w-full">
                {chart.gridLines.map((line, index) => (
                    <polygon
                        key={index}
                        points={line.map((point) => `${point.x},${point.y}`).join(' ')}
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity={0.12}
                        strokeWidth={1}
                    />
                ))}

                {safeSkills.map((_, index) => {
                    const angle = index * chart.angleStep - Math.PI / 2;
                    const endX = center + radius * Math.cos(angle);
                    const endY = center + radius * Math.sin(angle);
                    return (
                        <line
                            key={index}
                            x1={center}
                            y1={center}
                            x2={endX}
                            y2={endY}
                            stroke="currentColor"
                            strokeOpacity={0.12}
                            strokeWidth={1}
                        />
                    );
                })}

                <path
                    d={polygonPath}
                    fill="#E07A5F33"
                    stroke="#E07A5F"
                    strokeWidth={2}
                />

                {chart.points.map((point, index) => (
                    <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r={4}
                        fill="#E07A5F"
                    />
                ))}
            </svg>

            {chart.labels.map((label, index) => (
                <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
                    style={{ left: `${label.x}px`, top: `${label.y}px`, maxWidth: '120px' }}
                >
                    <div className="text-xs font-medium truncate">{label.skill.name}</div>
                    <div className={`text-xs ${
                        label.skill.trend === 'up'
                            ? 'text-green-400'
                            : label.skill.trend === 'down'
                                ? 'text-red-400'
                                : 'text-[color:var(--color-text-muted)]'
                    }`}>
                        {label.skill.score.toFixed(0)}%
                        {label.skill.trend === 'up' && ' ↑'}
                        {label.skill.trend === 'down' && ' ↓'}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SkillRadar;
