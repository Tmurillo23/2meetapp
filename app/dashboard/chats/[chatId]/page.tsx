// import MessageList from "@/components/chat/message-list"
// import ChatInput from "@/components/chat/chat-input"

// type PageProps = {
//   params: Promise<{
//     chatId: string
//   }>
// }

// export default async function ChatRoom({ params }: PageProps) {
//   const { chatId } = await params

//   return (
//     <div className="flex flex-col h-full bg-[#0b141a]">

//       {/* HEADER */}
//       <div className="h-16 bg-[#202c33] flex items-center px-4 shrink-0 border-b border-[#2a3942]">
//         <div className="w-10 h-10 rounded-full bg-gray-500 mr-3" />
//         <span className="font-semibold">Nombre del usuario</span>
//       </div>

//       <MessageList chatId={chatId} />
//       <ChatInput chatId={chatId} />

//     </div>
//   )
// }
"use client"

import { useChat } from "@/components/chat/chat-context"
import MessageList from "@/components/chat/message-list"
import ChatInput from "@/components/chat/chat-input"
import { useParams } from "next/navigation"

export default function ChatRoom() {
  const { chatId } = useParams<{ chatId: string }>()
  const { chats } = useChat()

  const chat = chats.find(c => c.id === chatId)

  if (!chat) return null

  return (
    <div className="flex flex-col h-full bg-[#0b141a]">

      {/* HEADER */}
      <div className="h-16 bg-[#202c33] flex items-center px-4 shrink-0 border-b border-[#2a3942]">
        <span className="font-semibold">{chat.name}</span>
      </div>

      <MessageList chatId={chatId} />
      <ChatInput chatId={chatId} />

    </div>
  )
}
