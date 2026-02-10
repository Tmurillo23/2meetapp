'use client'

import { useCallback, useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import { getOrCreateConversation, loadMessages, saveMessage, getUserName } from '@/lib/messages'

interface UseRealtimeChatProps {
  roomName: string
  username: string
  currentUserId: string
  otherUserId: string
}

export interface ChatMessage {
  id: string
  content: string
  user: {
    name: string
    id: string
  }
  createdAt: string
}

const EVENT_MESSAGE_TYPE = 'message'

export function useRealtimeChat({ roomName, username, currentUserId, otherUserId }: UseRealtimeChatProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  // Initialize conversation and load messages
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Get or create conversation
        const convId = await getOrCreateConversation(currentUserId, otherUserId)
        setConversationId(convId)

        // Load historical messages
        const historicalMessages = await loadMessages(convId)
        const formattedMessages = await Promise.all(
          historicalMessages.map(async (msg) => ({
            id: msg.id,
            content: msg.content,
            user: {
              name: msg.user?.name || (await getUserName(msg.sender_id)),
              id: msg.sender_id,
            },
            createdAt: msg.created_at,
          }))
        )
        setMessages(formattedMessages)
      } catch (error) {
        console.error('Error initializing chat:', error)
      }
    }

    initializeChat()
  }, [currentUserId, otherUserId])

  // Set up realtime subscription
  useEffect(() => {
    if (!conversationId) return

    const newChannel = supabase.channel(roomName)

    newChannel
      .on('broadcast', { event: EVENT_MESSAGE_TYPE }, (payload) => {
        setMessages((current) => [...current, payload.payload as ChatMessage])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      })

    setChannel(newChannel)

    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [roomName, conversationId, supabase])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel || !isConnected || !conversationId) return

      const messageId = crypto.randomUUID()
      const createdAt = new Date().toISOString()

      const message: ChatMessage = {
        id: messageId,
        content,
        user: {
          name: username,
          id: currentUserId,
        },
        createdAt,
      }

      // Update local state immediately for the sender
      setMessages((current) => [...current, message])

      // Send via realtime
      await channel.send({
        type: 'broadcast',
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      })

      // Save to database
      try {
        await saveMessage({
          id: messageId,
          content,
          senderId: currentUserId,
          conversationId,
          createdAt,
        })
      } catch (error) {
        console.error('Error saving message to database:', error)
      }
    },
    [channel, isConnected, conversationId, username, currentUserId]
  )

  return { messages, sendMessage, isConnected }
}
