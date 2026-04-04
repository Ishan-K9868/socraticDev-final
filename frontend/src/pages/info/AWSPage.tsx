import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

/* ═══════════════════════════════════════════════════════════════
   ANIMATION
   ═══════════════════════════════════════════════════════════════ */
const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

/* ═══════════════════════════════════════════════════════════════
   SVG ICONS — AWS service icons, all hand-drawn
   ═══════════════════════════════════════════════════════════════ */
const CloudIcon = ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
);
const ContainerIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 6v12M6 6v12M18 6v12M2 12h20" />
    </svg>
);
const DatabaseIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
);
const ShieldIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />
    </svg>
);
const NetworkIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
);

const MonitorIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
    </svg>
);
const RocketIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
);
const LockIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
);
const PipelineIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 21V9a9 9 0 009 9" />
    </svg>
);
const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/* ═══════════════════════════════════════════════════════════════
   ARCHITECTURE SVG ILLUSTRATION
   ═══════════════════════════════════════════════════════════════ */
const ArchitectureDiagram = () => (
    <svg viewBox="0 0 820 440" fill="none" className="w-full h-auto">
        {/* Background VPC */}
        <rect x="100" y="50" width="620" height="360" rx="12" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 4" opacity="0.35" fill="#3B82F608" />
        <text x="120" y="74" fontSize="13" fill="#3B82F6" opacity="0.85" fontWeight="800" letterSpacing="0.8">VPC 10.20.0.0/16 — ap-south-1</text>

        {/* ── User + CloudFront ─── */}
        <circle cx="50" cy="120" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path d="M50 108 C44 108 40 112 40 116M50 108 C56 108 60 112 60 116" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
        <circle cx="50" cy="104" r="4.5" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
        <text x="50" y="152" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7" fontWeight="700">User</text>

        {/* CloudFront + WAF */}
        <rect x="100" y="92" width="82" height="56" rx="7" stroke="#F59E0B" strokeWidth="1.5" opacity="0.6" fill="#F59E0B0C" />
        <text x="141" y="113" textAnchor="middle" fontSize="11" fill="#F59E0B" opacity="0.9" fontWeight="800">CloudFront</text>
        <text x="141" y="127" textAnchor="middle" fontSize="8.5" fill="#F59E0B" opacity="0.7" fontWeight="600">+ WAF + ACM</text>
        <text x="141" y="140" textAnchor="middle" fontSize="7.5" fill="#F59E0B" opacity="0.6" fontWeight="600">TLS + Edge Cache</text>

        {/* Arrow user -> CF */}
        <path d="M68 120 L98 120" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
        <polygon points="98,117 104,120 98,123" fill="#F59E0B" opacity="0.6" />

        {/* S3 Frontend */}
        <rect x="100" y="162" width="82" height="34" rx="6" stroke="#06B6D4" strokeWidth="1.2" opacity="0.5" fill="#06B6D40C" />
        <text x="141" y="183" textAnchor="middle" fontSize="10" fill="#06B6D4" opacity="0.85" fontWeight="700">S3 SPA</text>
        <path d="M141 148 L141 160" stroke="#06B6D4" strokeWidth="1" strokeDasharray="3 2" opacity="0.45" />

        {/* ── Public Subnets ─── */}
        <rect x="205" y="82" width="190" height="76" rx="8" stroke="#10B981" strokeWidth="1.5" opacity="0.35" fill="#10B98108" />
        <text x="215" y="99" fontSize="9" fill="#10B981" opacity="0.75" fontWeight="700" letterSpacing="0.5">PUBLIC SUBNETS (2 AZs)</text>

        {/* ALB */}
        <rect x="220" y="108" width="78" height="38" rx="6" stroke="#10B981" strokeWidth="1.5" opacity="0.6" fill="#10B98114" />
        <text x="259" y="125" textAnchor="middle" fontSize="10" fill="#10B981" opacity="0.95" fontWeight="800">ALB</text>
        <text x="259" y="138" textAnchor="middle" fontSize="7.5" fill="#10B981" opacity="0.65" fontWeight="600">HTTPS 443</text>

        {/* NAT */}
        <rect x="310" y="108" width="72" height="38" rx="6" stroke="#10B981" strokeWidth="1.2" opacity="0.45" fill="#10B9810A" />
        <text x="346" y="125" textAnchor="middle" fontSize="10" fill="#10B981" opacity="0.8" fontWeight="700">NAT GW</text>
        <text x="346" y="138" textAnchor="middle" fontSize="7.5" fill="#10B981" opacity="0.55" fontWeight="600">x2 AZs</text>

        {/* Arrow CF -> ALB */}
        <path d="M182 120 L218 120" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        <polygon points="218,117 224,120 218,123" fill="#10B981" opacity="0.5" />

        {/* ── Private App Subnets ─── */}
        <rect x="205" y="172" width="310" height="120" rx="8" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.3" fill="#8B5CF608" />
        <text x="215" y="189" fontSize="9" fill="#8B5CF6" opacity="0.75" fontWeight="700" letterSpacing="0.5">PRIVATE APP SUBNETS — ECS CLUSTER</text>

        {/* AZ-1 tasks */}
        <rect x="220" y="200" width="68" height="26" rx="5" fill="#8B5CF616" stroke="#8B5CF6" strokeWidth="1" opacity="0.7" />
        <text x="254" y="217" textAnchor="middle" fontSize="9" fill="#8B5CF6" opacity="0.95" fontWeight="700">API Task</text>

        <rect x="220" y="232" width="68" height="26" rx="5" fill="#8B5CF616" stroke="#8B5CF6" strokeWidth="1" opacity="0.6" />
        <text x="254" y="249" textAnchor="middle" fontSize="9" fill="#8B5CF6" opacity="0.85" fontWeight="700">Worker</text>

        <rect x="220" y="264" width="68" height="26" rx="5" fill="#EC489916" stroke="#EC4899" strokeWidth="1" opacity="0.6" />
        <text x="254" y="281" textAnchor="middle" fontSize="9" fill="#EC4899" opacity="0.85" fontWeight="700">Chroma</text>

        <text x="254" y="300" textAnchor="middle" fontSize="8" fill="#8B5CF6" opacity="0.5" fontWeight="600">AZ-1</text>

        {/* AZ-2 tasks */}
        <rect x="300" y="200" width="68" height="26" rx="5" fill="#8B5CF616" stroke="#8B5CF6" strokeWidth="1" opacity="0.7" />
        <text x="334" y="217" textAnchor="middle" fontSize="9" fill="#8B5CF6" opacity="0.95" fontWeight="700">API Task</text>

        <rect x="300" y="232" width="68" height="26" rx="5" fill="#8B5CF616" stroke="#8B5CF6" strokeWidth="1" opacity="0.6" />
        <text x="334" y="249" textAnchor="middle" fontSize="9" fill="#8B5CF6" opacity="0.85" fontWeight="700">Worker</text>

        <text x="334" y="300" textAnchor="middle" fontSize="8" fill="#8B5CF6" opacity="0.5" fontWeight="600">AZ-2</text>

        {/* Other private app services */}
        <rect x="385" y="200" width="60" height="26" rx="5" fill="#06B6D416" stroke="#06B6D4" strokeWidth="1" opacity="0.6" />
        <text x="415" y="217" textAnchor="middle" fontSize="9" fill="#06B6D4" opacity="0.85" fontWeight="700">EFS</text>

        <rect x="385" y="232" width="60" height="26" rx="5" fill="#10B98116" stroke="#10B981" strokeWidth="1" opacity="0.6" />
        <text x="415" y="249" textAnchor="middle" fontSize="8" fill="#10B981" opacity="0.85" fontWeight="700">Neo4j EC2</text>

        <rect x="455" y="200" width="55" height="26" rx="5" fill="#F59E0B16" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />
        <text x="482" y="217" textAnchor="middle" fontSize="9" fill="#F59E0B" opacity="0.85" fontWeight="700">ECR</text>

        {/* ALB -> API arrows */}
        <path d="M259 146 L254 198" stroke="#8B5CF6" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.45" />
        <path d="M264 146 L334 198" stroke="#8B5CF6" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.45" />

        {/* ── Private Data Subnets ─── */}
        <rect x="205" y="310" width="310" height="82" rx="8" stroke="#F59E0B" strokeWidth="1.5" opacity="0.3" fill="#F59E0B08" />
        <text x="215" y="328" fontSize="9" fill="#F59E0B" opacity="0.75" fontWeight="700" letterSpacing="0.5">PRIVATE DATA SUBNETS (Multi-AZ)</text>

        <rect x="220" y="338" width="80" height="34" rx="6" fill="#3B82F616" stroke="#3B82F6" strokeWidth="1" opacity="0.6" />
        <text x="260" y="355" textAnchor="middle" fontSize="8.5" fill="#3B82F6" opacity="0.9" fontWeight="800">RDS PostgreSQL</text>
        <text x="260" y="366" textAnchor="middle" fontSize="7" fill="#3B82F6" opacity="0.6" fontWeight="600">Multi-AZ</text>

        <rect x="310" y="338" width="70" height="34" rx="6" fill="#EF444416" stroke="#EF4444" strokeWidth="1" opacity="0.6" />
        <text x="345" y="355" textAnchor="middle" fontSize="9" fill="#EF4444" opacity="0.9" fontWeight="800">Redis</text>
        <text x="345" y="366" textAnchor="middle" fontSize="7" fill="#EF4444" opacity="0.6" fontWeight="600">ElastiCache</text>

        <rect x="390" y="338" width="70" height="34" rx="6" fill="#10B98116" stroke="#10B981" strokeWidth="1" opacity="0.6" />
        <text x="425" y="355" textAnchor="middle" fontSize="9" fill="#10B981" opacity="0.9" fontWeight="800">RabbitMQ</text>
        <text x="425" y="366" textAnchor="middle" fontSize="7" fill="#10B981" opacity="0.6" fontWeight="600">Amazon MQ</text>

        <rect x="470" y="338" width="38" height="34" rx="6" fill="#F59E0B16" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />
        <text x="489" y="359" textAnchor="middle" fontSize="10" fill="#F59E0B" opacity="0.9" fontWeight="800">S3</text>

        {/* ── Right side: Observability + CI/CD ── */}
        <rect x="550" y="82" width="155" height="85" rx="8" stroke="#06B6D4" strokeWidth="1.5" opacity="0.35" fill="#06B6D408" />
        <text x="562" y="100" fontSize="9" fill="#06B6D4" opacity="0.8" fontWeight="700" letterSpacing="0.5">OBSERVABILITY</text>
        <rect x="562" y="108" width="60" height="22" rx="4" fill="#06B6D416" stroke="#06B6D4" strokeWidth="0.8" opacity="0.55" />
        <text x="592" y="123" textAnchor="middle" fontSize="8" fill="#06B6D4" opacity="0.85" fontWeight="700">CloudWatch</text>
        <rect x="630" y="108" width="60" height="22" rx="4" fill="#06B6D416" stroke="#06B6D4" strokeWidth="0.8" opacity="0.55" />
        <text x="660" y="123" textAnchor="middle" fontSize="8" fill="#06B6D4" opacity="0.85" fontWeight="700">Alarms</text>
        <rect x="562" y="136" width="60" height="22" rx="4" fill="#06B6D416" stroke="#06B6D4" strokeWidth="0.8" opacity="0.55" />
        <text x="592" y="151" textAnchor="middle" fontSize="8" fill="#06B6D4" opacity="0.85" fontWeight="700">Dashboards</text>
        <rect x="630" y="136" width="60" height="22" rx="4" fill="#06B6D416" stroke="#06B6D4" strokeWidth="0.8" opacity="0.55" />
        <text x="660" y="151" textAnchor="middle" fontSize="8" fill="#06B6D4" opacity="0.85" fontWeight="700">Metrics</text>

        {/* CI/CD */}
        <rect x="550" y="182" width="155" height="58" rx="8" stroke="#EC4899" strokeWidth="1.5" opacity="0.35" fill="#EC489908" />
        <text x="562" y="200" fontSize="9" fill="#EC4899" opacity="0.8" fontWeight="700" letterSpacing="0.5">CI/CD</text>
        <rect x="562" y="208" width="66" height="22" rx="4" fill="#EC489916" stroke="#EC4899" strokeWidth="0.8" opacity="0.55" />
        <text x="595" y="223" textAnchor="middle" fontSize="8" fill="#EC4899" opacity="0.85" fontWeight="700">GitHub Actions</text>
        <rect x="636" y="208" width="55" height="22" rx="4" fill="#EC489916" stroke="#EC4899" strokeWidth="0.8" opacity="0.55" />
        <text x="663" y="223" textAnchor="middle" fontSize="7.5" fill="#EC4899" opacity="0.85" fontWeight="700">Rolling Deploy</text>

        {/* Security box */}
        <rect x="550" y="255" width="155" height="58" rx="8" stroke="#10B981" strokeWidth="1.5" opacity="0.35" fill="#10B98108" />
        <text x="562" y="273" fontSize="9" fill="#10B981" opacity="0.8" fontWeight="700" letterSpacing="0.5">SECURITY</text>
        <rect x="562" y="280" width="50" height="22" rx="4" fill="#10B98116" stroke="#10B981" strokeWidth="0.8" opacity="0.55" />
        <text x="587" y="295" textAnchor="middle" fontSize="7.5" fill="#10B981" opacity="0.85" fontWeight="700">Secrets Mgr</text>
        <rect x="620" y="280" width="38" height="22" rx="4" fill="#10B98116" stroke="#10B981" strokeWidth="0.8" opacity="0.55" />
        <text x="639" y="295" textAnchor="middle" fontSize="8" fill="#10B981" opacity="0.85" fontWeight="700">IAM</text>
        <rect x="666" y="280" width="35" height="22" rx="4" fill="#10B98116" stroke="#10B981" strokeWidth="0.8" opacity="0.55" />
        <text x="683" y="295" textAnchor="middle" fontSize="8" fill="#10B981" opacity="0.85" fontWeight="700">KMS</text>

        {/* Route53 label */}
        <text x="141" y="86" textAnchor="middle" fontSize="8" fill="#F59E0B" opacity="0.6" fontWeight="700">Route 53 DNS</text>

        {/* Budget label */}
        <rect x="550" y="335" width="155" height="34" rx="7" fill="#10B98110" stroke="#10B981" strokeWidth="1" opacity="0.45" />
        <text x="627" y="356" textAnchor="middle" fontSize="10" fill="#10B981" opacity="0.8" fontWeight="800">~$280-320/mo est.</text>
    </svg>
);

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

interface Phase {
    id: string;
    title: string;
    days: string;
    icon: React.ReactNode;
    color: string;
    items: string[];
}

const phases: Phase[] = [
    { id: '0', title: 'Foundation & Guardrails', days: 'Day 1', icon: <ShieldIcon />, color: '#64748B', items: ['IaC repo module structure (network, ecs, data, security, dns)', 'Naming standard: socraticdev-{env}-{component}', 'Enable CloudTrail, Config, GuardDuty, IAM Access Analyzer', 'Define tag policy: Project, Env, Owner, CostCenter'] },
    { id: '1', title: 'Network & Access Layer', days: 'Day 1-2', icon: <NetworkIcon />, color: '#3B82F6', items: ['VPC with 2 AZs: public, private app, private data subnets', 'Internet Gateway + 2 NAT Gateways (one per AZ)', 'Security groups: ALB, API, Worker, RDS, Redis, MQ, Neo4j', 'ACM certificate + Route53 hosted zone'] },
    { id: '2', title: 'Container Registry & Pipeline', days: 'Day 2', icon: <PipelineIcon />, color: '#EC4899', items: ['ECR repos: socraticdev-api, socraticdev-worker, socraticdev-chroma', 'Lifecycle policy: keep 30 images + protect 5 tagged releases', 'GitHub Actions: build, push, scan, deploy', 'Image scan gate — fail on critical vulnerabilities'] },
    { id: '3', title: 'Managed Stateful Services', days: 'Day 2-4', icon: <DatabaseIcon />, color: '#F59E0B', items: ['RDS PostgreSQL Multi-AZ, encrypted, 7-14 day backups', 'ElastiCache Redis replication group with failover', 'Amazon MQ (RabbitMQ) with durable queues', 'Neo4j on dedicated EC2 + EBS gp3 + snapshots', 'Chroma via ECS + EFS, S3 buckets with versioning'] },
    { id: '4', title: 'ECS Runtime & Traffic', days: 'Day 4-6', icon: <ContainerIcon />, color: '#8B5CF6', items: ['ECS cluster: socraticdev-prod, Fargate capacity provider', 'API: 0.5 vCPU/1GB, port 8000, /health endpoint', 'Worker: 1 vCPU/2GB, Celery consumer, no exposed port', 'ALB: HTTPS 443, health check 15s interval', 'Autoscaling: CPU >70% scale-out, queue depth >50 for workers', 'IAM: execution role for image pull, task role for S3/Secrets/CW'] },
    { id: '5', title: 'Application Integration', days: 'Day 5-7', icon: <RocketIcon />, color: '#10B981', items: ['Replace localhost assumptions with service endpoints', 'Session metadata to Redis, files to S3', 'Secret loading: prefer Secrets Manager, fallback env', 'Frontend API base URL via CloudFront /api path'] },
    { id: '6', title: 'Frontend Hosting & Edge', days: 'Day 6-7', icon: <CloudIcon size={22} />, color: '#F59E0B', items: ['Build artifact in CI, upload to S3 origin', 'CloudFront with SPA routing (custom error -> index.html)', 'Cache policy tuned by file type', 'WAF attached with managed rules'] },
    { id: '7', title: 'Security Hardening', days: 'Day 7-8', icon: <LockIcon />, color: '#EF4444', items: ['TLS everywhere, disable plaintext credentials', 'KMS encryption: RDS, EBS, EFS, S3, Secrets', 'Least-privilege IAM policies per task role', 'Secrets rotation policy for DB/MQ credentials'] },
    { id: '8', title: 'Observability & Operations', days: 'Day 8-9', icon: <MonitorIcon />, color: '#06B6D4', items: ['CloudWatch dashboards: latency, 5xx rate, CPU, queue depth', 'Alarms: 5xx spike, task crash loops, queue depth, Redis failover', 'Structured logs with request ID correlation', 'SLOs: 99.9% availability, p95 latency target'] },
    { id: '9', title: 'Cutover & Rollback', days: 'Day 9-10', icon: <RocketIcon />, color: '#10B981', items: ['Pre-cutover validation in staging mirror', 'Weighted Route53 shift: 10% -> 50% -> 100%', 'Monitor error budget during each shift window', 'Rollback: reset Route53 weight, revert ECS task definition'] },
];

interface AWSComponent {
    name: string;
    purpose: string;
    color: string;
}

const awsComponents: AWSComponent[] = [
    { name: 'ECS Fargate', purpose: 'Runs containers without managing servers; stateless API/worker scaling', color: '#8B5CF6' },
    { name: 'ECR', purpose: 'Private Docker image registry; immutable artifact source for deployments', color: '#EC4899' },
    { name: 'ALB', purpose: 'Layer-7 routing, health checks, TLS termination, target failover', color: '#10B981' },
    { name: 'RDS PostgreSQL', purpose: 'Managed PostgreSQL with backups and Multi-AZ failover', color: '#3B82F6' },
    { name: 'ElastiCache Redis', purpose: 'Low-latency cache and session store with replication', color: '#EF4444' },
    { name: 'Amazon MQ', purpose: 'Managed RabbitMQ broker for Celery-compatible queueing', color: '#10B981' },
    { name: 'EFS', purpose: 'Shared POSIX filesystem for workloads needing persistent mount', color: '#06B6D4' },
    { name: 'S3', purpose: 'Durable object store for uploads, session artifacts, static content', color: '#F59E0B' },
    { name: 'CloudFront', purpose: 'Edge CDN for frontend performance and global TLS delivery', color: '#F59E0B' },
    { name: 'Secrets Manager', purpose: 'Secure storage and rotation for credentials and API keys', color: '#10B981' },
    { name: 'CloudWatch', purpose: 'Metrics, logs, alarms, and operational dashboards', color: '#06B6D4' },
    { name: 'IAM Task Roles', purpose: 'Per-service permission boundary; removes static credentials', color: '#8B5CF6' },
    { name: 'Route 53', purpose: 'DNS routing and progressive traffic shifting during migration', color: '#3B82F6' },
];

const acceptanceCriteria = [
    'Upload, query, visualization, async processing succeed under new endpoints',
    'Kill one API task — no outage through ALB failover',
    'Kill one AZ — service remains available from second AZ',
    'Restart workers — queued jobs continue without loss',
    'No secrets in container env dumps or logs',
    'IAM role denies unintended AWS actions',
    'Autoscaling triggers and stabilizes under load',
    'Deploy new image with rolling update + health gate',
    'Execute rollback to prior image in under 10 minutes',
    '99.9% monthly API availability target achievable',
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function PhaseCard({ phase }: { phase: Phase }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div variants={fadeUp} className="group">
            <button
                onClick={() => setOpen(!open)}
                className="w-full text-left rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-4 transition-all duration-200 hover:border-[color:var(--color-border-hover)]"
            >
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${phase.color}12`, color: phase.color }}>
                        {phase.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${phase.color}15`, color: phase.color }}>Phase {phase.id}</span>
                            <span className="text-[10px] text-[color:var(--color-text-muted)]">{phase.days}</span>
                        </div>
                        <h3 className="font-display font-bold text-sm text-[color:var(--color-text-primary)] mt-0.5">{phase.title}</h3>
                    </div>
                    <svg className={`w-4 h-4 text-[color:var(--color-text-muted)] transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6,9 12,15 18,9" /></svg>
                </div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease }}
                        className="overflow-hidden"
                    >
                        <ul className="pt-3 pb-1 pl-[52px] space-y-2">
                            {phase.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-[color:var(--color-text-secondary)] leading-relaxed">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: phase.color }} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

function AWSPage() {
    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="container-custom max-w-6xl">

                    {/* ── Hero ─────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ backgroundColor: '#F59E0B14', color: '#F59E0B' }}>
                            <CloudIcon size={32} />
                        </div>
                        <h1 className="font-display text-display-md font-bold mb-4">AWS Infrastructure</h1>
                        <p className="text-lg text-[color:var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed">
                            ECS Fargate for stateless services. Managed AWS services for stateful dependencies.
                            ALB + CloudFront for secure public access. Zero EC2 host management for application services.
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
                            {[
                                { label: 'Region', value: 'ap-south-1', color: '#3B82F6' },
                                { label: 'Availability', value: '2 AZs', color: '#10B981' },
                                { label: 'Budget', value: '~$280-320/mo', color: '#F59E0B' },
                                { label: 'Target Uptime', value: '99.9%', color: '#8B5CF6' },
                            ].map(stat => (
                                <div key={stat.label} className="px-4 py-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]">
                                    <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: stat.color }}>{stat.label}</div>
                                    <div className="text-sm font-bold text-[color:var(--color-text-primary)]">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Architecture Diagram ─────────────── */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease }} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-6 mb-16">
                        <h2 className="font-display text-xl font-bold mb-4 text-[color:var(--color-text-primary)]">Architecture Overview</h2>
                        <div className="text-[color:var(--color-text-secondary)]">
                            <ArchitectureDiagram />
                        </div>
                    </motion.div>

                    {/* ── Implementation Phases ─────────────── */}
                    <div className="mb-16">
                        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-display text-2xl font-bold mb-2 text-[color:var(--color-text-primary)]">
                            Implementation Phases
                        </motion.h2>
                        <p className="text-sm text-[color:var(--color-text-muted)] mb-6">10-day execution plan. Click any phase to expand.</p>
                        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="space-y-3">
                            {phases.map((p) => <PhaseCard key={p.id} phase={p} />)}
                        </motion.div>
                    </div>

                    {/* ── AWS Components Grid ──────────────── */}
                    <div className="mb-16">
                        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-display text-2xl font-bold mb-6 text-[color:var(--color-text-primary)]">
                            AWS Components
                        </motion.h2>
                        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {awsComponents.map((c) => (
                                <motion.div key={c.name} variants={fadeUp} className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-4 flex items-start gap-3">
                                    <span className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: c.color }} />
                                    <div>
                                        <div className="font-semibold text-sm text-[color:var(--color-text-primary)]">{c.name}</div>
                                        <p className="text-xs text-[color:var(--color-text-muted)] leading-relaxed mt-0.5">{c.purpose}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* ── Acceptance Criteria ──────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-8 mb-16">
                        <h2 className="font-display text-xl font-bold mb-6 text-[color:var(--color-text-primary)]">Acceptance Criteria</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {acceptanceCriteria.map((c, i) => (
                                <div key={i} className="flex items-start gap-2.5 text-sm text-[color:var(--color-text-secondary)]">
                                    <span className="flex-shrink-0 mt-0.5 text-emerald-400"><CheckIcon /></span>
                                    {c}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Assumptions ─────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }} className="rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 p-6">
                        <h3 className="font-display font-bold mb-4 text-[color:var(--color-text-primary)]">Locked Assumptions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                'Primary path: ECS Fargate (Alt C), not Beanstalk/Lightsail',
                                'Neo4j: dedicated EC2 phase-1, optional Aura migration later',
                                'Chroma: ECS + EFS temporary, future managed vector service',
                                'upload_sessions refactor to S3 + Redis mandatory before prod',
                                'GitHub Actions is CI/CD tool of choice',
                                'Budget target: ~$280-320/month for this topology',
                            ].map((a, i) => (
                                <div key={i} className="flex items-start gap-2.5 text-sm text-[color:var(--color-text-muted)]">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 bg-primary-500" />
                                    {a}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default AWSPage;
