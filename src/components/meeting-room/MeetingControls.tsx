import React from 'react';
import { Users, Flag, Shield } from 'lucide-react';
import { CallStatsButton } from '@stream-io/video-react-sdk';
import StudyCallControls from '../StudyCallControls';
import EndCallButton from '../StudyEndCallButton';

interface MeetingControlsProps {
  showParticipants: boolean;
  setShowParticipants: (show: boolean) => void;
  onLeave: () => void;
  showMic?: boolean;
  showCamera?: boolean;
  roomSettings?: any;
  isHost: boolean;
  onReportClick: () => void;
  onBanClick: () => void;
}

const MeetingControls = ({
  showParticipants,
  setShowParticipants,
  onLeave,
  showMic,
  showCamera,
  roomSettings,
  isHost,
  onReportClick,
  onBanClick,
}: MeetingControlsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 rounded-t-xl flex w-full items-center justify-center gap-3 sm:gap-5 flex-nowrap sm:flex-wrap p-2 sm:p-4 bg-black/20 backdrop-blur-sm" role="toolbar" aria-label="Meeting controls">
      <StudyCallControls
        onLeave={onLeave}
        showMic={showMic || false}
        showCamera={showCamera || false}
        roomSettings={roomSettings}
      />

      <div className="hidden sm:block">
        <CallStatsButton />
      </div>
      
      <button 
        onClick={() => setShowParticipants(!showParticipants)}
        aria-label={showParticipants ? "Hide participants list" : "Show participants list"}
        aria-pressed={showParticipants}
        aria-describedby="participants-help"
      >
        <div className="cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-[#4c535b]">
          <Users size={16} className="sm:w-5 text-white" />
        </div>
      </button>
      <div id="participants-help" className="sr-only">
        Click to view or hide the list of participants in this meeting
      </div>
      
      {/* Report Button */}
      <button 
        onClick={onReportClick}
        aria-label="Report a participant"
        aria-describedby="report-help"
      >
        <div className="cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-red-600">
          <Flag size={16} className="sm:w-5 text-white" />
        </div>
      </button>
      <div id="report-help" className="sr-only">
        Click to report inappropriate behavior by a participant
      </div>
      
      {/* Ban User Button (only for host) */}
      {isHost && (
        <>
          <button 
            onClick={onBanClick}
            aria-label="Ban a participant from the room"
            aria-describedby="ban-help"
          >
            <div className="cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-red-600">
              <Shield size={16} className="sm:w-5 text-white" />
            </div>
          </button>
          <div id="ban-help" className="sr-only">
            Click to ban a participant from this room (host only)
          </div>
        </>
      )}
     
      {isHost && <EndCallButton />}
    </div>
  );
};

export default MeetingControls; 