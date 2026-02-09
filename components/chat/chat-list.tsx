// export default function ChatList() {
//   const chats = [
//     { id: "1", name: "My Boy ❤️", last: "Sí amorcito", time: "10:12" },
//     { id: "2", name: "Valen", last: "Te escribo luego", time: "9:40" },
//   ]

//   return (
//     <div className="flex flex-col h-full">

//       {/* Header */}
//       <div className="h-16 flex items-center px-4 border-b border-[#202c33]">
//         <h2 className="text-lg font-semibold">Chats</h2>
//       </div>

//       {/* Lista */}
//       <div className="flex-1 overflow-y-auto">
//         {chats.map(chat => (
//           <div
//             key={chat.id}
//             className="flex items-center gap-3 px-4 py-3 hover:bg-[#202c33] cursor-pointer"
//           >
//             <div className="w-12 h-12 rounded-full bg-gray-600" />
//             <div className="flex-1">
//               <p className="font-medium">{chat.name}</p>
//               <p className="text-sm text-gray-400 truncate">
//                 {chat.last}
//               </p>
//             </div>
//             <span className="text-xs text-gray-400">
//               {chat.time}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

"use client"

import Link from "next/link"
import { useChat } from "./chat-context"

export default function ChatList() {
  const { chats } = useChat()

  return (
    <div>
      <div className="h-16 flex items-center px-4 font-semibold border-b border-[#202c33]">
        Chats
      </div>

      {chats.map(chat => (
        <Link
          key={chat.id}
          href={`/dashboard/chats/${chat.id}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-[#202c33]"
        >
          <div className="w-10 h-10 rounded-full bg-gray-600" />
          <div>
            <p>{chat.name}</p>
            <p className="text-sm text-gray-400">
              {chat.messages.at(-1)?.text}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}