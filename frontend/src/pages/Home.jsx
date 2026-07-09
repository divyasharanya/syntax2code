import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import { IoArrowForwardOutline, IoTerminalOutline, IoShieldCheckmarkOutline, IoTrophyOutline, IoBriefcaseOutline, IoGitCommitOutline, IoCodeWorkingOutline } from 'react-icons/io5';

const Home = () => {
  return (
    <div className="flex flex-col flex-grow bg-slate-50/30 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 border-b border-slate-100 bg-linear-to-b from-blue-50/40 via-white to-transparent">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 text-xs font-semibold animate-fade-in">
            <IoCodeWorkingOutline size={14} />
            <span>Internship & Project Challenges</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight max-w-3xl leading-tight">
            Build Proof, Not <span className="text-primary bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent">Resumes</span>
          </h1>

          <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
            Skip generic applications and automated filters. Complete micro-tasks designed by top engineering teams, showcase your code, and secure direct technical interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <Link to="/tasks">
              <Button size="lg" className="gap-2 group">
                Browse Challenges
                <IoArrowForwardOutline className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/register?role=company">
              <Button size="lg" variant="outline">
                Hire Candidates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 p-4 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="p-3 bg-blue-50 text-primary rounded-xl">
              <IoTerminalOutline size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">4,200+</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Submissions Evaluated</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <IoShieldCheckmarkOutline size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">$85,400+</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Rewards & Stipends Paid</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <IoTrophyOutline size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">320+</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Interviews Granted</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 flex flex-col gap-12">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
          <h2 className="text-3xl font-black text-slate-900">A Faster Path to Interviews</h2>
          <p className="text-sm text-slate-500">
            MicroIntern shifts the hiring paradigm. Instead of sending hundreds of dry resumes, prove your abilities directly with high-quality deliverables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* For Candidates */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <IoBriefcaseOutline size={22} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">For Candidates</h3>
            </div>

            <div className="flex flex-col gap-4">
              <Card className="border border-slate-100 hover:border-blue-100 transition-colors">
                <CardBody className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-primary font-extrabold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Select a Task</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Choose from a variety of mini-projects matching your skill levels (e.g., UI building, payment integrations, visual state widgets).
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card className="border border-slate-100 hover:border-blue-100 transition-colors">
                <CardBody className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-primary font-extrabold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Submit Code & Live URLs</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Build the solution, push it to GitHub, deploy live, and submit your link. We index your results and notify company engineers.
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card className="border border-slate-100 hover:border-blue-100 transition-colors">
                <CardBody className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-primary font-extrabold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Get Reviewed & Interviewed</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Get real review scores and comments from project authors. Top scorers receive direct invitation links to full hiring interviews.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* For Companies */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <IoGitCommitOutline size={22} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">For Hiring Teams</h3>
            </div>

            <div className="flex flex-col gap-4">
              <Card className="border border-slate-100 hover:border-emerald-100 transition-colors">
                <CardBody className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Publish Real Tasks</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Stop writing standard job descriptions. Outline small real-world tasks that align with what your team actually builds.
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card className="border border-slate-100 hover:border-emerald-100 transition-colors">
                <CardBody className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Verify Candidate Skills</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Review ready-made code repos and live previews directly. Rate candidate submissions and give feedback using our intuitive console.
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card className="border border-slate-100 hover:border-emerald-100 transition-colors">
                <CardBody className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Unlock Screened Talent</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Instantly schedule interviews with proven candidates. Slash screening time, eliminate coding assessment drop-off, and hire high-performers.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary relative py-16 overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 border border-white/10 rounded-full" />
        <div className="absolute top-1/3 right-10 w-96 h-96 border border-white/5 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6 relative z-10">
          <h2 className="text-3xl font-extrabold text-white">Ready to prove what you can build?</h2>
          <p className="text-slate-100/80 text-sm max-w-lg leading-relaxed">
            Stop waiting in candidate review queues. Create your profile, select a technical project, and secure interviews through raw ability.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <Link to="/register">
              <Button variant="white" size="lg">
                Create Candidate Profile
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
