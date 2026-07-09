import React from 'react';
import { Link } from 'react-router-dom';
import { IoTerminal, IoLogoGithub, IoLogoTwitter, IoLogoLinkedin } from 'react-icons/io5';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
              <div className="p-1.5 bg-primary rounded-lg text-white">
                <IoTerminal size={20} />
              </div>
              <span className="tracking-tight font-black text-white">Micro<span className="text-primary font-bold">Intern</span></span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Skip resumes. Prove your talent by building real things for real companies.
            </p>
            <div className="flex items-center gap-4 text-slate-500">
              <a href="#" className="hover:text-white transition-colors"><IoLogoGithub size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><IoLogoTwitter size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><IoLogoLinkedin size={20} /></a>
            </div>
          </div>

          {/* Candidates */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">For Candidates</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tasks" className="hover:text-white transition-colors">Browse Micro-tasks</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Leaderboard & Points</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Interview Guarantee</a></li>
            </ul>
          </div>

          {/* Companies */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">For Companies</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Post a Challenge</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Candidate Verification</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing Plans</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Enterprise Portal</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Code of Conduct</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} MicroIntern Inc. All rights reserved.</p>
          <p className="text-slate-500">Built for modern engineers and progressive hiring teams.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
