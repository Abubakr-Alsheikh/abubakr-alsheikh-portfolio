"use client";

import { motion } from "framer-motion";
import {
  Database,
  CalendarDays,
  Code2,
  AppWindow,
  TableProperties,
  Users,
  UserCog,
  LayoutGrid,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function SchoolManagementVisual() {
  // Cycle through WinForms application states
  const [opState, setOpState] = useState(0);

  useEffect(() => {
    // 0 = Fetching Students, 1 = Managing Employees, 2 = Generating Schedule
    const interval = setInterval(() => {
      setOpState((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Generate a 5x6 grid for the schedule matrix (Days x Periods)
  const scheduleGrid = Array.from({ length: 30 }, (_, i) => i);
  // Generate fake data rows for the grid
  const dataRows = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="relative w-full h-full min-h-[500px] xl:min-h-[450px] bg-[#020617] border border-slate-800 flex flex-col group overflow-hidden font-mono text-slate-300">
      {/* 1. Hardware Header */}
      <div className="h-8 border-b border-slate-800 flex items-center px-4 justify-between bg-[#020617] z-30 shadow-[0_4px_20px_rgba(0,0,0,0.8)] shrink-0">
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 bg-slate-700" />
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-[#F97316]"
          />
          <div className="w-1.5 h-1.5 bg-[#3B82F6]" />
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest truncate pl-2">
          School_Management_Sys.exe
        </span>
      </div>

      {/* 2. Main HUD Area */}
      <div className="flex-1 relative bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem]">
        {/* Radar Overlay */}
        <motion.div
          animate={{ backgroundPosition: ["0% -100%", "0% 200%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-10 bg-[linear-gradient(to_bottom,transparent_0%,#3B82F6_50%,transparent_100%)] bg-[length:100%_100%] pointer-events-none z-0"
        />

        {/* 3. The SVG Interconnect Layer (Data Access Layer Wiring) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          preserveAspectRatio="none"
        >
          <defs>
            <filter
              id="glowOrange"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter
              id="glowEmerald"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* C# Kernel <-> WinForms UI (Left Path) */}
          <path
            d="M 25% 50% L 50% 50%"
            stroke="#1e293b"
            strokeWidth="2"
            fill="none"
          />
          <motion.path
            d={
              opState === 0 || opState === 1
                ? "M 50% 50% L 25% 50%"
                : "M 25% 50% L 50% 50%"
            }
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
            strokeDasharray="15 150"
            filter="url(#glowBlue)"
            animate={{
              strokeDashoffset:
                opState === 0 || opState === 1 ? [-165, 165] : [165, -165],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />

          {/* C# Kernel <-> Oracle DB (Top Right Path) */}
          <path
            d="M 50% 50% L 50% 25% L 75% 25%"
            stroke="#1e293b"
            strokeWidth="2"
            fill="none"
          />
          <motion.path
            d="M 75% 25% L 50% 25% L 50% 50%"
            stroke="#F97316"
            strokeWidth="2"
            fill="none"
            strokeDasharray="15 150"
            filter="url(#glowOrange)"
            animate={{ strokeDashoffset: [-165, 165] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />

          {/* C# Kernel -> Schedule Matrix (Bottom Right Path) */}
          <path
            d="M 50% 50% L 50% 75% L 75% 75%"
            stroke="#1e293b"
            strokeWidth="2"
            fill="none"
          />
          {opState === 2 && (
            <motion.path
              d="M 50% 50% L 50% 75% L 75% 75%"
              stroke="#10B981"
              strokeWidth="2"
              fill="none"
              strokeDasharray="20 200"
              filter="url(#glowEmerald)"
              animate={{ strokeDashoffset: [220, -220] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          )}
        </svg>

        {/* 4. LEFT: Windows Forms UI Wireframe */}
        <div className="absolute left-[5%] md:left-[10%] top-1/3 -translate-y-1/2 z-20 w-[55%] max-w-[340px] hidden sm:block">
          <div className="border border-slate-700 bg-[#020617]/90 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col h-[220px]">
            {/* WinForms Title Bar */}
            <div className="h-6 border-b border-slate-700 flex items-center px-2 bg-[#1e293b]/50 justify-between">
              <div className="flex items-center gap-2">
                <AppWindow className="w-3 h-3 text-[#3B82F6]" />
                <span className="text-[9px] text-slate-300 tracking-widest font-sans">
                  School Admin Dashboard
                </span>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 border border-slate-500" />
                <div className="w-2 h-2 border border-slate-500" />
                <div className="w-2 h-2 bg-slate-500" />
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Navigation */}
              <div className="w-[80px] border-r border-slate-800 p-2 flex flex-col gap-2">
                <div
                  className={`flex items-center gap-1.5 p-1 transition-colors ${opState === 0 ? "bg-[#3B82F6]/20 text-[#3B82F6]" : "text-slate-500"}`}
                >
                  <Users className="w-3 h-3" />{" "}
                  <span className="text-[7px] uppercase tracking-wider">
                    Students
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1.5 p-1 transition-colors ${opState === 1 ? "bg-[#F97316]/20 text-[#F97316]" : "text-slate-500"}`}
                >
                  <UserCog className="w-3 h-3" />{" "}
                  <span className="text-[7px] uppercase tracking-wider">
                    Staff
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1.5 p-1 transition-colors ${opState === 2 ? "bg-[#10B981]/20 text-[#10B981]" : "text-slate-500"}`}
                >
                  <LayoutGrid className="w-3 h-3" />{" "}
                  <span className="text-[7px] uppercase tracking-wider">
                    Classes
                  </span>
                </div>
              </div>

              {/* Main DataGrid Area */}
              <div className="flex-1 p-3 flex flex-col">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                  <TableProperties className="w-4 h-4 text-slate-400" />
                  <span className="text-[8px] uppercase tracking-widest text-slate-400">
                    {opState === 0
                      ? "DATAGRID: TBL_STUDENTS"
                      : opState === 1
                        ? "DATAGRID: TBL_EMPLOYEES"
                        : "TIMETABLE_PREVIEW"}
                  </span>
                </div>

                {/* Simulated Data Rows */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-2 border-b border-slate-800 pb-1 mb-1">
                    <div className="w-6 h-1 bg-slate-700" />
                    <div className="w-16 h-1 bg-slate-700" />
                    <div className="w-10 h-1 bg-slate-700" />
                  </div>
                  {dataRows.map((row) => (
                    <motion.div
                      key={`${opState}-${row}`}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: row * 0.1 }}
                      className="flex gap-2 items-center"
                    >
                      <div className="w-6 h-1.5 bg-slate-800" />
                      <div
                        className={`w-16 h-1.5 ${opState === 0 ? "bg-[#3B82F6]/50" : opState === 1 ? "bg-[#F97316]/50" : "bg-slate-600"}`}
                      />
                      <div
                        className={`w-10 h-1.5 ${opState === 0 ? "bg-[#3B82F6]/30" : opState === 1 ? "bg-[#F97316]/30" : "bg-[#10B981]/50"}`}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. HARDWARE NODES */}

        {/* CENTER NODE: C# OOP Application Kernel */}
        <div className="absolute left-1/2 top-9/12 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center w-14 h-14 lg:w-20 lg:h-20 shrink-0 mb-3">
            {/* Stacked Window Forms effect representing OOP Layers */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 border border-slate-700 bg-[#020617] translate-x-2 translate-y-2"
            />
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
              className="absolute inset-0 border border-[#3B82F6]/50 bg-[#020617] translate-x-1 translate-y-1"
            />

            {/* Main Application Core */}
            <div className="absolute inset-0 bg-[#020617] border-2 border-[#3B82F6] flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Code2 className="w-5 h-5 lg:w-7 lg:h-7 text-white mb-1" />
              <span className="text-[6px] lg:text-[7px] text-[#3B82F6] font-bold">
                C#_CORE
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center bg-[#020617]/90 px-2 py-1 border border-slate-800 whitespace-nowrap">
            <span className="text-[9px] lg:text-[11px] font-bold text-white tracking-widest">
              APP KERNEL
            </span>
            <span className="text-[7px] lg:text-[8px] text-[#3B82F6]">
              OOP_RUNTIME
            </span>
          </div>
        </div>

        {/* TOP RIGHT NODE: Oracle Relational Database */}
        <div className="absolute left-[80%] top-[25%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
          <div className="w-12 h-12 lg:w-16 lg:h-16 shrink-0 border-2 border-[#F97316] flex items-center justify-center bg-[#020617] relative">
            {/* Oracle Database platters */}
            <div className="absolute top-2 w-8 h-2 border border-[#F97316] rounded-[100%]" />
            <div className="absolute top-5 w-8 h-2 border border-[#F97316] rounded-[100%]" />
            <div className="absolute top-8 w-8 h-2 border border-[#F97316] rounded-[100%]" />
            <Database className="w-5 h-5 lg:w-6 lg:h-6 text-[#F97316] opacity-0" />
            {opState <= 1 && (
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -left-1 -top-1 w-2 h-2 bg-[#F97316] shadow-[0_0_10px_#F97316]"
              />
            )}
          </div>

          <div className="flex flex-col items-center bg-[#020617]/90 px-2 py-1 border border-slate-800 text-center">
            <span className="text-[9px] lg:text-[11px] font-bold text-white tracking-widest whitespace-nowrap">
              ORACLE_DB
            </span>
            <span className="text-[7px] lg:text-[8px] text-[#F97316] whitespace-nowrap">
              RELATIONAL_SQL
            </span>
          </div>
        </div>

        {/* BOTTOM RIGHT NODE: The Schedule Matrix Algorithm */}
        <div className="absolute left-[80%] top-[75%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
          <div className="relative p-1.5 lg:p-2 border-2 border-[#10B981]/50 bg-[#020617] shrink-0">
            {/* The 5x6 Matrix Grid for Class Scheduling */}
            <div className="grid grid-cols-5 gap-0.5 w-[60px] lg:w-[80px]">
              {scheduleGrid.map((index) => {
                const isProcessing = opState === 2 && Math.random() > 0.5;
                const isResolved = opState !== 2 && index % 4 !== 0;

                return (
                  <motion.div
                    key={index}
                    animate={{
                      backgroundColor: isProcessing
                        ? "#10B981"
                        : isResolved
                          ? "rgba(16, 185, 129, 0.3)"
                          : "rgba(30, 41, 59, 0.5)",
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="aspect-square border border-slate-800"
                  />
                );
              })}
            </div>

            <div className="absolute -top-2.5 -right-2.5 w-5 h-5 lg:w-6 lg:h-6 bg-[#020617] border border-[#10B981] flex items-center justify-center">
              <CalendarDays className="w-3 h-3 text-[#10B981]" />
            </div>
          </div>

          <div className="flex flex-col items-center bg-[#020617]/90 px-2 py-1 border border-slate-800 text-center">
            <span className="text-[9px] lg:text-[11px] font-bold text-white tracking-widest whitespace-nowrap">
              MATRIX_ENGINE
            </span>
            <span className="text-[7px] lg:text-[8px] text-[#10B981] whitespace-nowrap">
              TIMETABLE_SYNC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
