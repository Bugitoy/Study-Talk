import React from 'react';
import { PaginatedGridLayout, SpeakerLayout } from '@stream-io/video-react-sdk';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

interface CallLayoutProps {
  layout: CallLayoutType;
}

const CallLayout = ({ layout }: CallLayoutProps) => {
  switch (layout) {
    case 'grid':
      return <PaginatedGridLayout />;
    case 'speaker-right':
      return <SpeakerLayout participantsBarPosition="left" />;
    default:
      return <SpeakerLayout participantsBarPosition="right" />;
  }
};

export default CallLayout; 