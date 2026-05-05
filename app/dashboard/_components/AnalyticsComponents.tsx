"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";

/* ── KPI Card with Glassmorphism ── */
export function KPICard({ label, value, change, trend, icon: Icon, color, delay = 0 }: {
  label: string; value: string; change: string; trend: "up" | "down"; icon: any; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        borderRadius: "24px",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "16px",
          background: `${color}15`, color: color,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon size={24} />
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.25rem",
          fontSize: "0.85rem", fontWeight: 700,
          color: trend === "up" ? "#10b981" : "#ef4444",
          background: trend === "up" ? "#10b98110" : "#ef444410",
          padding: "0.25rem 0.6rem", borderRadius: "999px"
        }}>
          {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
      <div>
        <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500, marginBottom: "0.25rem" }}>{label}</div>
        <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.02em" }}>{value}</div>
      </div>
    </motion.div>
  );
}

/* ── Interactive Area Chart ── */
export function AreaChart({ data, color = "#6366f1", height = 200 }: { data: number[], color?: string, height?: number }) {
  const points = data.length;
  const max = Math.max(...data) * 1.2;
  const min = Math.min(...data) * 0.8;
  const range = max - min;
  
  const width = 800;
  const stepX = width / (points - 1);
  
  const getX = (i: number) => i * stepX;
  const getY = (v: number) => height - ((v - min) / range) * height;

  const pathData = data.map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`).join(" ");
  const areaData = `${pathData} L ${getX(points - 1)} ${height} L 0 ${height} Z`;

  return (
    <div style={{ width: "100%", height: height, position: "relative" }}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={areaData}
          fill="url(#chartGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {data.map((v, i) => (
          <motion.circle
            key={i}
            cx={getX(i)}
            cy={getY(v)}
            r="4"
            fill="#fff"
            stroke={color}
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            whileHover={{ scale: 1.5, r: 6 }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ── Donut Chart for Plan Distribution ── */
export function DonutChart({ segments }: { segments: { label: string, value: number, color: string }[] }) {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  let currentAngle = 0;
  const radius = 40;
  const strokeWidth = 12;
  const center = 50;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ width: "120px", height: "120px" }}>
        <svg viewBox="0 0 100 100">
          {segments.map((s, i) => {
            const angle = (s.value / total) * 360;
            const x1 = center + radius * Math.cos((currentAngle - 90) * (Math.PI / 180));
            const y1 = center + radius * Math.sin((currentAngle - 90) * (Math.PI / 180));
            currentAngle += angle;
            const x2 = center + radius * Math.cos((currentAngle - 90) * (Math.PI / 180));
            const y2 = center + radius * Math.sin((currentAngle - 90) * (Math.PI / 180));
            const largeArc = angle > 180 ? 1 : 0;

            return (
              <motion.path
                key={i}
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke={s.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
              />
            );
          })}
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: s.color }} />
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: "0.85rem", color: "#1e293b", fontWeight: 800 }}>{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
