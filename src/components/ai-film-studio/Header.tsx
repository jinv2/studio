import type { FC } from 'react';
import { Clapperboard } from 'lucide-react';

export const Header: FC = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clapperboard className="h-8 w-8" />
          <h1 className="text-2xl font-bold">AI 电影工作室</h1>
        </div>
        <div className="text-sm text-right">
          <p className="font-semibold">天算AI科技研发实验室</p>
          <p className="opacity-80">(Natural Algorithm AI R&amp;D Lab)</p>
        </div>
      </div>
    </header>
  );
};
