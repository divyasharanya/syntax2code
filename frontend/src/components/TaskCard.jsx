import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardBody, CardFooter } from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { IoTimeOutline, IoWalletOutline, IoPeopleOutline } from 'react-icons/io5';

const TaskCard = ({ task }) => {
  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'green';
      case 'intermediate':
        return 'blue';
      case 'advanced':
        return 'purple';
      default:
        return 'slate';
    }
  };

  return (
    <Card hoverEffect className="flex flex-col h-full">
      <CardBody className="flex-1 flex flex-col gap-4">
        {/* Company Header */}
        <div className="flex items-center gap-3">
          <img
            src={task.companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
            alt={task.companyName}
            className="w-10 h-10 rounded-lg object-cover border border-slate-100"
          />
          <div>
            <h4 className="text-sm font-bold text-slate-800 leading-tight">{task.companyName}</h4>
            <p className="text-xs text-slate-400">Posted recent weeks</p>
          </div>
          <Badge variant={getDifficultyColor(task.difficulty)} className="ml-auto capitalize">
            {task.difficulty}
          </Badge>
        </div>

        {/* Task Info */}
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 hover:text-primary transition-colors">
            {task.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {task.description.replace(/[#*`]/g, '').slice(0, 120)}...
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {task.tags?.map((tag) => (
            <Badge key={tag} variant="slate" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </CardBody>

      {/* Card Footer with Metrics */}
      <CardFooter className="flex items-center justify-between border-t border-slate-50/50">
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1" title="Estimated time required">
            <IoTimeOutline size={15} className="text-slate-400" />
            <span>{task.duration}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600" title="Completion Reward">
            <IoWalletOutline size={15} />
            <span>${task.reward}</span>
          </div>
          <div className="flex items-center gap-1" title="Submissions submitted">
            <IoPeopleOutline size={15} className="text-slate-400" />
            <span>{task.applicantsCount || 0}</span>
          </div>
        </div>

        <Link to={`/tasks/${task.id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
