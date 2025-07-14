'use client'
import { useEffect, useState } from 'react'

export interface RoomSetting {
  id: string
  roomName: string
  numQuestions: number
  timePerQuestion: number | null
  mic: string
  camera: string
  participants: number
  availability: string
  allowReview: boolean
  topicName?: string | null
  callId?: string | null
}

export function useRoomSetting(id: string | undefined) {
  const [data, setData] = useState<RoomSetting | null>(null)
  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const res = await fetch(`/api/room-settings/${id}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error('Failed to load room setting', err)
      }
    }
    load()
  }, [id])
  return data
}

export function useRoomSettingByCallId(callId: string | undefined) {
  const [data, setData] = useState<RoomSetting | null>(null)
  useEffect(() => {
    if (!callId) return
    const load = async () => {
      try {
        const res = await fetch(`/api/room-settings/call/${callId}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error('Failed to load room setting by call', err)
      }
    }
    load()
  }, [callId])
  return data
}