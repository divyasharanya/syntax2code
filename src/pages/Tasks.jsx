import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import Input from '../components/ui/Input';
import Card, { CardBody } from '../components/ui/Card';
import { IoSearchOutline, IoFilterOutline, IoRefreshOutline } from 'react-icons/io5';

const Tasks = () => {
  const { tasks } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState('All');
  const [rewardFilter, setRewardFilter] = useState('All');

  const handleReset = () => {
    setSearchTerm('');
    setDifficultyFilter('All');
    setDurationFilter('All');
    setRewardFilter('All');
  };

  const filteredTasks = tasks.filter((task) => {
    // 1. Search term
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Difficulty
    const matchesDifficulty =
      difficultyFilter === 'All' ||
      task.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

    // 3. Duration (task.duration is '4h', '2h', '8h', etc.)
    const hours = parseInt(task.duration) || 0;
    let matchesDuration = true;
    if (durationFilter === 'short') matchesDuration = hours < 3;
    else if (durationFilter === 'medium') matchesDuration = hours >= 3 && hours <= 5;
    else if (durationFilter === 'long') matchesDuration = hours > 5;

    // 4. Reward (number)
    let matchesReward = true;
    if (rewardFilter === 'low') matchesReward = task.reward < 150;
    else if (rewardFilter === 'high') matchesReward = task.reward >= 150;

    return matchesSearch && matchesDifficulty && matchesDuration && matchesReward;
  });

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Available Skill Challenges</h1>
          <p className="text-xs text-slate-400">Complete tasks to show your actual coding skills directly to companies.</p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-primary font-bold">{filteredTasks.length}</span> of {tasks.length} challenges
        </div>
      </div>

      {/* Filter Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: Sidebar Filters */}
        <aside className="w-full lg:w-64 flex flex-col gap-4">
          <Card className="border border-slate-100 shadow-xs">
            <CardBody className="flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <IoFilterOutline size={16} /> Filters
                </span>
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-primary transition-colors cursor-pointer flex items-center gap-0.5 font-semibold"
                >
                  <IoRefreshOutline size={13} /> Reset
                </button>
              </div>

              {/* Difficulty Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty</label>
                <div className="flex flex-col gap-1.5">
                  {['All', 'Easy', 'Intermediate', 'Advanced'].map((diff) => (
                    <label key={diff} className="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="difficulty"
                        value={diff}
                        checked={difficultyFilter === diff}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="text-primary focus:ring-primary w-4 h-4 border-slate-300"
                      />
                      <span>{diff}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reward/Stipend Filter */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completion Reward</label>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'All Rewards', value: 'All' },
                    { label: 'Under $150', value: 'low' },
                    { label: '$150 and above', value: 'high' },
                  ].map((reward) => (
                    <label key={reward.value} className="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="reward"
                        value={reward.value}
                        checked={rewardFilter === reward.value}
                        onChange={(e) => setRewardFilter(e.target.value)}
                        className="text-primary focus:ring-primary w-4 h-4 border-slate-300"
                      />
                      <span>{reward.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Est. Effort</label>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'All Durations', value: 'All' },
                    { label: 'Under 3 hours', value: 'short' },
                    { label: '3 to 5 hours', value: 'medium' },
                    { label: 'Over 5 hours', value: 'long' },
                  ].map((dur) => (
                    <label key={dur.value} className="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="duration"
                        value={dur.value}
                        checked={durationFilter === dur.value}
                        onChange={(e) => setDurationFilter(e.target.value)}
                        className="text-primary focus:ring-primary w-4 h-4 border-slate-300"
                      />
                      <span>{dur.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </aside>

        {/* Right Side: Search and Listings */}
        <div className="flex-grow w-full flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <IoSearchOutline size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by challenge titles, tags, or company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-xs transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
            />
          </div>

          {/* Cards Grid */}
          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card className="border border-slate-100 flex flex-col items-center justify-center p-12 text-center bg-white">
              <CardBody className="flex flex-col items-center gap-4">
                <div className="p-4 bg-slate-50 text-slate-400 rounded-full">
                  <IoSearchOutline size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">No challenges found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    We couldn't find any challenges matching your filters. Try resetting your search or adjustments.
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="mt-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary/20 transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
