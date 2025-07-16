import { OwnCapability } from '@stream-io/video-client';
import { Restricted } from '@stream-io/video-react-bindings';
import {
  SpeakingWhileMutedNotification,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ScreenShareButton,
  ReactionsButton,
  RecordCallButton,
  CancelCallButton,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';

export type StudyCallControlsProps = {
  onLeave?: () => void;
  showMic: boolean;
  showCamera: boolean;
};

const StudyCallControls = ({ onLeave, showMic, showCamera }: StudyCallControlsProps) => {
  console.log('🎮 StudyCallControls rendered with onLeave:', !!onLeave);
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const router = useRouter();
  
  const handleLeave = async () => {
    console.log('🎮 Custom leave button clicked - calling onLeave and leaving call');
    try {
      // Call our onLeave handler first (to end tracking)
      await onLeave?.();
      
      // Then leave the call using Stream SDK's internal methods
      if (call) {
        console.log('🎮 Leaving call using Stream SDK internal methods');
        // Try to leave the call by updating the calling state
        await call.leave();
      }
    } catch (error) {
      console.error('🎮 Error leaving call:', error);
    }
  };

  // Add debugging to see if CancelCallButton is rendered
  console.log('🎮 StudyCallControls - rendering CancelCallButton with onLeave handler');

  return (
    <div className="str-video__call-controls">
      {showMic && (
        <Restricted requiredGrants={[OwnCapability.SEND_AUDIO]}>
          <SpeakingWhileMutedNotification>
            <ToggleAudioPublishingButton />
          </SpeakingWhileMutedNotification>
        </Restricted>
      )}
      {showCamera && (
        <Restricted requiredGrants={[OwnCapability.SEND_VIDEO]}>
          <ToggleVideoPublishingButton />
        </Restricted>
      )}
      <Restricted requiredGrants={[OwnCapability.CREATE_REACTION]}>
        <ReactionsButton />
      </Restricted>
      <Restricted requiredGrants={[OwnCapability.SCREENSHARE]}>
        <ScreenShareButton />
      </Restricted>
      <Restricted
        requiredGrants={[OwnCapability.START_RECORD_CALL, OwnCapability.STOP_RECORD_CALL]}
      >
        <RecordCallButton />
      </Restricted>

      
      {/* Custom leave button that handles both tracking and call leaving */}
      <button 
        onClick={handleLeave}
        className="str-video__call-controls__button str-video__call-controls__button--leave bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold border-2 border-white"
        title="Leave call"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

export default StudyCallControls;