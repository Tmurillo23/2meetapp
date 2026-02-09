// "use client"

// import { createContext, useContext, useState } from "react"

// type Message = {
//   id: string
//   chatId: string
//   text: string
//   senderId: string
//   createdAt: string
// }

// type ChatContextType = {
//   messages: Message[]
//   sendMessage: (text: string) => void
//   receiveMessage: (message: Message) => void
// }

// const ChatContext = createContext<ChatContextType | null>(null)

// export function ChatProvider({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const [messages, setMessages] = useState<Message[]>([])

//   const sendMessage = (text: string) => {
//     // 🔴 Backend lo implementa después
//     console.log("send message:", text)
//   }

//   const receiveMessage = (message: Message) => {
//     setMessages(prev => [...prev, message])
//   }

//   return (
//     <ChatContext.Provider
//       value={{ messages, sendMessage, receiveMessage }}
//     >
//       {children}
//     </ChatContext.Provider>
//   )
// }

// export function useChat() {
//   const ctx = useContext(ChatContext)
//   if (!ctx) throw new Error("useChat must be used inside ChatProvider")
//   return ctx
// }

"use client"

import { createContext, useContext, useState } from "react"
import { mockChats } from "./mock-data"
import { Chat } from "./types"   // 👈 IMPORTAMOS DESDE types.tsx

type ChatContextType = {
  chats: Chat[]
  sendMessage: (chatId: string, text: string) => void
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>(mockChats)

  function sendMessage(chatId: string, text: string) {
    if (!text.trim()) return

    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: Date.now(),
                  fromMe: true,
                  text,
                  createdAt: Date.now(), // 👈 AQUÍ agregamos la hora
                },
              ],
            }
          : chat
      )
    )
  }

  return (
    <ChatContext.Provider value={{ chats, sendMessage }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)

  if (!context) {
    throw new Error("useChat must be used inside ChatProvider")
  }

  return context
}

