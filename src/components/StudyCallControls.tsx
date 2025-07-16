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
};

const StudyCallControls = ({ onLeave, showMic, showCamera }: StudyCallControlsProps) => (
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
    <CancelCallButton onLeave={onLeave} />
  </div>
);

export default StudyCallControls;