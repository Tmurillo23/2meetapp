"use client"

import { useEffect, useRef } from "react"
import { useChat } from "./chat-context"

type Props = {
  chatId: string
}

export default function MessageList({ chatId }: Props) {
  const { chats } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  const chat = chats.find(c => c.id === chatId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat?.messages])

  if (!chat) return null

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">

      {chat.messages.map(msg => (
        <div
          key={msg.id}
          className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
              msg.fromMe
                ? "bg-[#005c4b] text-white"
                : "bg-[#202c33] text-white"
            }`}
          >
            <div>{msg.text}</div>

            <div className="text-[10px] opacity-70 text-right mt-1">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  )
}
