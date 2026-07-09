import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { IoPlanetOutline } from 'react-icons/io5';

const NotFound = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center py-24 px-4 text-center gap-6">
      <div className="p-4 bg-primary/10 text-primary rounded-full animate-bounce">
        <IoPlanetOutline size={48} />
      </div>
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">404 - Page Not Found</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          The dashboard link or catalog resource you requested could not be located on our platform.
        </p>
      </div>
      <Link to="/">
        <Button>
          Go Back Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
