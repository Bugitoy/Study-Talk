"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface TopicItemProps {
  title: string;
  description: string;
  className?: string;
  handleClick?: () => void;
}

const TopicItem = ({
  title,
  description,
  className,
  handleClick,
}: TopicItemProps) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleClick}
            className={cn(
              "cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100",
              className,
            )}
          >
            {title}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          <p className="max-w-xs text-xs text-gray-700">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TopicItem;