"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import NextLayout from "@/components/NextLayout";
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useToast } from '@/hooks/use-toast';

const initialValues = {
    dateTime: new Date(),
    description: '',
    link: '',
  };

export default function CreateRoom() {
  const router = useRouter();
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

  // Check if user is blocked
  useEffect(() => {
    if (user?.id) {
      const checkBlockStatus = async () => {
        try {
          const res = await fetch(`/api/user/check-block?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.isBlocked) {
              toast({
                title: 'Account Blocked',
                description: 'Your account has been blocked by an administrator. You cannot create study groups.',
                variant: 'destructive',
              });
              router.push('/meetups/study-groups');
            }
          }
        } catch (error) {
          console.error('Error checking block status:', error);
        }
      };
      
      checkBlockStatus();
    }
  }, [user?.id, router, toast]);

  const setValue = (key: string, value: any) => {
    setRoomSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    const payload = {
      ...roomSettings,
      // defaults required by RoomSetting schema
      numQuestions: 0,
      timePerQuestion: null,
      participants: 50,
    };

    const res = await fetch('/api/room-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return res.json();
  };

  const createMeeting = async () => {
    if (!client || !user) return null;
    const id = crypto.randomUUID();
    const call = client.call('default', id);
    const startsAt = values.dateTime.toISOString() || new Date().toISOString();
    await call.getOrCreate({
      data: {
        starts_at: startsAt,
        custom: {
          roomName: roomSettings.roomName || 'Study Group',
          availability: roomSettings.availability,
          mic: roomSettings.mic,
          camera: roomSettings.camera,
        },
    },
});
await fetch('/api/study-groups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ callId: call.id, roomName: roomSettings.roomName || 'Study Group', hostId: user.id }),
});
toast({ title: 'Meeting Created' });
return call;
};

const handleNext = async () => {
try {
  const call = await createMeeting();
  if (!call) return;
  const setting = await saveSettings();
  await fetch(`/api/room-settings/${setting.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callId: call.id }),
  });
  await call.update({
    custom: {
      ...call.state.custom,
      roomName: roomSettings.roomName || call.state.custom.roomName,
      availability: roomSettings.availability,
      mic: roomSettings.mic,
      camera: roomSettings.camera,
    },
  });
  router.push(`/meetups/study-groups/meeting/${call.id}?name=${encodeURIComponent(roomSettings.roomName)}`);
} catch (err) {
  console.error('Failed to create room', err);
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
        onClick={handleNext}
      >
        NEXT
      </button>

    </div>
    </NextLayout>
  );
}
