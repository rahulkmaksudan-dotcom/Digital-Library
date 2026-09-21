import React from 'react';
import { BookOpen, GraduationCap, Users, ShieldCheck, CheckCircle2, Award, Heart } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dps-50 text-xs font-semibold text-dps-700 border border-dps-200 mb-4">
          <GraduationCap className="w-4 h-4 text-dps-600" />
          <span>Thakur Shree DPS College of Engineering and Management</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About The Digital Library Management System
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-3 leading-relaxed">
          An enterprise-grade centralized digital knowledge hub developed to modernize book circulation, digital academic access, reservation holds, and student borrowing at Thakur Shree DPS College.
        </p>
      </div>

      {/* Project Team Card */}
      <div className="bg-gradient-to-br from-navy-950 to-dps-950 text-white rounded-3xl p-8 sm:p-12 mb-16 shadow-xl">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-dps-600 text-white mb-4 shadow-lg shadow-dps-600/30">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Capstone Engineering Project Team
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            The Digital Library Management System was researched, designed, and developed by:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center">
            <div className="w-14 h-14 rounded-full bg-dps-500 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4 shadow-md">
              AY
            </div>
            <h3 className="text-base font-bold text-white">Ashish Yadav</h3>
            <p className="text-xs text-dps-300 mt-1">Computer Engineering</p>
            <p className="text-[11px] font-mono text-slate-400 mt-2 bg-navy-900/60 py-1 px-2 rounded-lg inline-block">
              DPS2023CS001
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center">
            <div className="w-14 h-14 rounded-full bg-dps-500 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4 shadow-md">
              RY
            </div>
            <h3 className="text-base font-bold text-white">Rahul Yadav</h3>
            <p className="text-xs text-dps-300 mt-1">Computer Engineering</p>
            <p className="text-[11px] font-mono text-slate-400 mt-2 bg-navy-900/60 py-1 px-2 rounded-lg inline-block">
              DPS2023CS002
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center">
            <div className="w-14 h-14 rounded-full bg-dps-500 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4 shadow-md">
              PY
            </div>
            <h3 className="text-base font-bold text-white">Priyanshu Yadav</h3>
            <p className="text-xs text-dps-300 mt-1">Computer Engineering</p>
            <p className="text-[11px] font-mono text-slate-400 mt-2 bg-navy-900/60 py-1 px-2 rounded-lg inline-block">
              DPS2023CS003
            </p>
          </div>
        </div>
      </div>

      {/* Core Objectives & Features Grid */}
      <div className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Key System Objectives</h2>
          <p className="text-xs text-slate-500 mt-1">Delivering high availability, data security, and seamless academic circulation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-dps-50 text-dps-600 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Automated 10-Day Circulation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time inventory tracking, automatic due date calculation, automated in-app reminder schedules, and configurable fine calculation for overdue items.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Role-Based Access Control</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Granular role authorization for Students, Faculty, Librarians, and Administrators with JWT session tokens and BCrypt encryption standards.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Centralized Digital Repositories</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verified lecture notes, university question papers, lab manuals, and syllabus files accessible 24/7 with protected streaming and download counters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

