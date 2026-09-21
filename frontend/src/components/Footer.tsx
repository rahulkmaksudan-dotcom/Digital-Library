import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, MapPin, Mail, Phone, Clock, Heart, Users } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 text-sm border-t border-navy-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Institutional Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-dps-600 flex items-center justify-center text-white font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base tracking-tight leading-tight">
                  DIGITAL LIBRARY
                </h3>
                <p className="text-[10px] font-semibold text-dps-400 uppercase">
                  DPS College Management
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Thakur Shree DPS College of Engineering and Management
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering students, researchers and faculty with 24/7 digital access to engineering textbooks, research publications, syllabus schemes, and verified lecture notes.
            </p>
          </div>

          {/* Col 2: Project Team */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-dps-400" />
              <span>Project Team</span>
            </h4>
            <div className="bg-navy-900/80 p-3.5 rounded-xl border border-navy-800 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-dps-800/80 text-dps-300 text-xs font-bold flex items-center justify-center">
                  A
                </div>
                <span className="text-xs text-slate-200 font-medium">Ashish Yadav</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-dps-800/80 text-dps-300 text-xs font-bold flex items-center justify-center">
                  R
                </div>
                <span className="text-xs text-slate-200 font-medium">Rahul Yadav</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-dps-800/80 text-dps-300 text-xs font-bold flex items-center justify-center">
                  P
                </div>
                <span className="text-xs text-slate-200 font-medium">Priyanshu Yadav</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Digital Library Management System Capstone Project Presentation
            </p>
          </div>

          {/* Col 3: Academic Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              Academic Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/digital-resources?tab=NOTES" className="hover:text-white transition">
                  Verified Lecture Notes
                </Link>
              </li>
              <li>
                <Link to="/digital-resources?tab=SYLLABUS" className="hover:text-white transition">
                  University Curriculum & Syllabus
                </Link>
              </li>
              <li>
                <Link to="/digital-resources?tab=QUESTION_PAPER" className="hover:text-white transition">
                  Previous Year Question Papers
                </Link>
              </li>
              <li>
                <Link to="/digital-resources?tab=LAB_MANUAL" className="hover:text-white transition">
                  Engineering Lab Manuals
                </Link>
              </li>
              <li>
                <Link to="/books" className="hover:text-white transition">
                  Textbook Catalog (OPAC)
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition">
                  Department Disciplines
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Library Hours & Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              Library Info
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-dps-400 flex-shrink-0 mt-0.5" />
                <span>Mon – Sat: 8:00 AM – 8:00 PM<br/>Sunday: Closed (Reading Hall Open)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-dps-400 flex-shrink-0 mt-0.5" />
                <span>Central Knowledge Resource Centre, 2nd Floor, Main Academic Block</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-dps-400 flex-shrink-0" />
                <span>library@dpscollege.edu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-navy-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} Thakur Shree DPS College of Engineering and Management. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white transition">About Project</Link>
            <Link to="/contact" className="hover:text-white transition">Contact Desk</Link>
            <span className="text-slate-500">v1.0.0 Production</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

