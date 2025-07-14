"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import NextLayout from "@/components/NextLayout";

export default function CreateRoom() {
  const router = useRouter();
  
  const [roomSettings, setRoomSettings] = useState({
    roomName: "",
    numQuestions: 5,
    timePerQuestion: 5,
    mic: "on",
    camera: "on",
    participants: 15,
    availability: "public",
    allowReview: false,
  });

  const setValue = (key: string, value: any) => {
    setRoomSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveToDatabase = async () => {
    try {
      const res = await fetch('/api/room-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomSettings),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/meetups/compete/choose-topic?settings=${data.id}`);
      }
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  };
  return (
    <NextLayout>
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Create Room</h1>

      <label className="block mb-2 font-medium">Room Name:</label>
      <input
        type="text"
        value={roomSettings.roomName}
        onChange={(e) => setValue("roomName", e.target.value)}
        className="w-full p-2 mb-4 rounded-[8px]"
      />

      <div className="mb-4">
        <label className="block mb-2 font-medium">Number of Questions:</label>
        <div className="flex gap-2 flex-wrap">
          {[5, 10, 15, 20, 25, 30].map((num) => (
            <button
              key={num}
              className={`px-4 py-2 rounded-[8px] ${
                roomSettings.numQuestions === num ? "bg-thanodi-peach text-white" : ""
              }`}
              onClick={() => setValue("numQuestions", num)}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Time per Question (sec):</label>
        <div className="flex gap-2 flex-wrap">
          {[5, 10, 15, 20, 25, 30, 'Unlimited'].map((num) => (
            <button
              key={num}
              className={`px-4 py-2 rounded-[8px] ${
                (num === 'Unlimited' && roomSettings.timePerQuestion === null) || roomSettings.timePerQuestion === num
                  ? "bg-thanodi-peach text-white"
                  : ""
              }`}
              onClick={() => setValue("timePerQuestion", num === 'Unlimited' ? null : num)}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

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
        <label className="block mb-2 font-medium">Number of People:</label>
        <select
          className="w-full p-2 rounded-[8px]"
          value={roomSettings.participants}
          onChange={(e) => setValue("participants", parseInt(e.target.value))}
        >
          {[5, 10, 15, 20, 25, 30].map((n) => (
            <option key={n} value={n}>{`${n}`}</option>
          ))}
        </select>
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

      <div className="mb-4">
        <label className="block mb-2 font-medium">
          Ability to Revise Before Match:
        </label>
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded-[8px] ${
              roomSettings.allowReview ? "bg-thanodi-peach text-white" : ""
            }`}
            onClick={() => setValue("allowReview", true)}
          >
            Yes
          </button>
          <button
            className={`px-4 py-2 rounded-[8px] ${
              !roomSettings.allowReview ? "bg-thanodi-peach text-white" : ""
            }`}
            onClick={() => setValue("allowReview", false)}
          >
            No
          </button>
        </div>
      </div>

      <button
        className="w-full bg-orange-300 text-white py-3 rounded-[8px] text-lg font-semibold hover:bg-orange-200 transition-colors"
        onClick={saveToDatabase}
      >
        NEXT
      </button>
    </div>
    </NextLayout>
  );
}
