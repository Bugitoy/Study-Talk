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
} from '@stream-io/video-react-sdk';

export type StudyCallControlsProps = {
  onLeave?: () => void;
  showMic: boolean;
  showCamera: boolean;
  roomSettings?: {
    availability?: string;
  } | null;
};

const StudyCallControls = ({ onLeave, showMic, showCamera, roomSettings }: StudyCallControlsProps) => (
  <div className="str-video__call-controls flex flex-wrap justify-center gap-2 sm:gap-3">
    <div className="flex flex-row gap-2 sm:gap-3">
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
    </div>
    <div className="flex flex-row gap-2 sm:gap-3">
      <Restricted requiredGrants={[OwnCapability.SCREENSHARE]}>
        <ScreenShareButton />
      </Restricted>
      {roomSettings?.availability !== 'public' && (
        <Restricted
          requiredGrants={[OwnCapability.START_RECORD_CALL, OwnCapability.STOP_RECORD_CALL]}
        >
          <RecordCallButton />
        </Restricted>
      )}
      <CancelCallButton onLeave={onLeave} />
    </div>
  </div>
);

export default StudyCallControls;