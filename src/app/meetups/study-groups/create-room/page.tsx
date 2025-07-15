"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import NextLayout from "@/components/NextLayout";
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useToast } from '@/hooks/use-toast';
import { Call } from '@stream-io/video-react-sdk';

const initialValues = {
    dateTime: new Date(),
    description: '',
    link: '',
  };

export default function CreateRoom() {
  const router = useRouter();
  const [callDetail, setCallDetail] = useState<Call>();
  const client = useStreamVideoClient();
  const { user } = useKindeBrowserClient();
  const { toast } = useToast();
  const [values, setValues] = useState(initialValues);
  
  const [roomSettings, setRoomSettings] = useState({
    roomName: "",
    mic: "on",
    camera: "on",
    availability: "public",
  });

  const setValue = (key: string, value: any) => {
    setRoomSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveToDatabase = async () => {
    try {
      const res = await fetch('/api/study-room-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomSettings),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/meetups/study-groups/choose-topic?settings=${data.id}`);
      }
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  };

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
            availability: 'public',
            roomName: description,
          },
        },
      });
      await fetch('/api/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: call.id, roomName: description, hostId: user.id }),
      });
      setCallDetail(call);
      if (!values.description) {
        router.push(`/meetups/study-groups/meeting/${call.id}`);
      }
      toast({
        title: 'Meeting Created',
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create Meeting' });
    }
  };

  return (
    <NextLayout>
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Create a Study Group</h1>

      <label className="block mb-2 font-medium">Room Name:</label>
      <input
        type="text"
        value={roomSettings.roomName}
        onChange={(e) => setValue("roomName", e.target.value)}
        className="w-full p-2 mb-4 rounded-[8px]"
      />

      <div className="mb-4">
        <label className="block mb-2 font-medium">Mic:</label>
        <div className="flex gap-2">
          {["on", "off", "flexible"].map((mic) => (
            <button
              key={mic}
              className={`px-4 py-2 rounded-[8px] capitalize ${
                roomSettings.mic === mic ? "bg-thanodi-peach text-white" : ""
              }`}
              onClick={() => setValue("mic", mic)}
            >
              {mic}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Camera:</label>
        <div className="flex gap-2">
          {["on", "off", "flexible"].map((cam) => (
            <button
              key={cam}
              className={`px-4 py-2 rounded-[8px] capitalize ${
                roomSettings.camera === cam ? "bg-thanodi-peach text-white" : ""
              }`}
              onClick={() => setValue("camera", cam)}
            >
              {cam}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Availability:</label>
        <select
          className="w-full p-2 rounded-[8px]"
          value={roomSettings.availability}
          onChange={(e) => setValue("availability", e.target.value)}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      <button
        className="w-full bg-orange-300 text-white py-3 rounded-[8px] text-lg font-semibold hover:bg-orange-200 transition-colors"
        onClick={() => {
          createMeeting();
          saveToDatabase();
        }}
      >
        NEXT
      </button>

    </div>
    </NextLayout>
  );
}
