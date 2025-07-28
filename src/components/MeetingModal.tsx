"use client";
import { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import Image from "next/image";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  instantMeeting?: boolean;
  image?: string;
  buttonClassName?: string;
  buttonIcon?: string;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  instantMeeting,
  image,
  buttonClassName,
  buttonIcon,
}: MeetingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="flex w-full max-w-[520px] flex-col gap-6 border-none bg-blue-400 px-6 py-9 text-white"
        role="dialog"
        aria-modal="true"
        aria-describedby="modal-description"
      >
        {image && (
          <div className="flex justify-center">
            <Image 
              src={image} 
              alt="Modal illustration" 
              width={72} 
              height={72} 
              aria-hidden="true"
            />
          </div>
        )}
        
        <DialogTitle 
          className={cn("text-3xl font-bold leading-[42px]", className)}
        >
          {title}
        </DialogTitle>
        
        <div id="modal-description" className="flex flex-col gap-6">
          {children}
          
          <Button
            className={cn(
              "bg-blue-300 hover:bg-blue-500 text-white rounded-[8px] focus-visible:ring-0 focus-visible:ring-offset-0",
              buttonClassName
            )}
            onClick={handleClick}
            aria-label={buttonText || "Schedule Meeting"}
          >
            {buttonIcon && (
              <Image
                src={buttonIcon}
                alt=""
                width={13}
                height={13}
                aria-hidden="true"
              />
            )}
            {buttonIcon && <span className="sr-only">Icon</span>}
            &nbsp;
            {buttonText || "Schedule Meeting"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;
