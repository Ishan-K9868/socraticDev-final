import { useMemo } from 'react';
import { SkillScore } from './types';

interface SkillRadarProps {
    skills: SkillScore[];
    size?: number;
}

function SkillRadar({ skills, size = 300 }: SkillRadarProps) {
    const center = size / 2;
    const radius = (size - 60) / 2;

    const { points, labels, gridLines } = useMemo(() => {
        const angleStep = (2 * Math.PI) / skills.length;

        // Calculate points for the skill polygon
        const pts = skills.map((skill, i) => {
            const angle = i * angleStep - Math.PI / 2; // Start from top
            const r = (skill.score / 100) * radius;
            return {
                x: center + r * Math.cos(angle),
                y: center + r * Math.sin(angle),
            };
        });

        // Calculate label positions
        const lbls = skills.map((skill, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = radius + 30;
            return {
                x: center + r * Math.cos(angle),
                y: center + r * Math.sin(angle),
                skill,
            };
        });

        // Grid lines (20%, 40%, 60%, 80%, 100%)
        const grid = [0.2, 0.4, 0.6, 0.8, 1].map(pct => {
            const r = radius * pct;
            return skills.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                return {
                    x: center + r * Math.cos(angle),
                    y: center + r * Math.sin(angle),
                };
            });
        });

        return { points: pts, labels: lbls, gridLines: grid };
    }, [skills, center, radius]);

    // Convert points to SVG path
    const polygonPath = points.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ') + ' Z';

    return (
        <div className="relative">
            <svg width={size} height={size} className="mx-auto">
                {/* Grid circles */}
                {gridLines.map((line, i) => (
                    <polygon
                        key={i}
                        points={line.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity={0.1}
                        strokeWidth={1}
                    />
                ))}

                {/* Axis lines */}
                {skills.map((_, i) => {
                    const angle = (i * 2 * Math.PI) / skills.length - Math.PI / 2;
                    const endX = center + radius * Math.cos(angle);
                    const endY = center + radius * Math.sin(angle);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={endX}
                            y2={endY}
                            stroke="currentColor"
                            strokeOpacity={0.1}
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Skill polygon */}
                <path
                    d={polygonPath}
                    fill="rgba(var(--color-primary-rgb), 0.2)"
                    stroke="rgb(var(--color-primary-rgb))"
                    strokeWidth={2}
                />

                {/* Skill points */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={4}
                        fill="rgb(var(--color-primary-rgb))"
                    />
                ))}
            </svg>

            {/* Labels */}
            {labels.map((label, i) => (
                <div
                    key={i}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center"
                    style={{ left: label.x, top: label.y }}
                >
                    <div className="text-xs font-medium whitespace-nowrap">
                        {label.skill.name}
                    </div>
                    <div className={`text-xs ${label.skill.trend === 'up' ? 'text-green-400' :
                            label.skill.trend === 'down' ? 'text-red-400' :
                                'text-[color:var(--color-text-muted)]'
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
