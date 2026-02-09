// "use client"

// import { useState } from "react"
// import { useChat } from "./chat-context"

// export default function ChatInput() {
//   const [text, setText] = useState("")
//   const { sendMessage } = useChat()

//   const handleSend = () => {
//     if (!text.trim()) return
//     sendMessage(text)
//     setText("")
//   }

//   return (
//     <div className="h-16 bg-[#202c33] flex items-center px-4 gap-3">
//       <input
//         className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2 outline-none"
//         value={text}
//         onChange={e => setText(e.target.value)}
//         placeholder="Escribe un mensaje"
//       />
//       <button onClick={handleSend}>Enviar</button>
//     </div>
//   )
// }
"use client"

import { useState } from "react"
import { useChat } from "./chat-context"

type Props = {
  chatId: string
}

export default function ChatInput({ chatId }: Props) {
  const [text, setText] = useState("")
  const { sendMessage } = useChat()

  function handleSend() {
    if (!text.trim()) return
    sendMessage(chatId, text)
    setText("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-16 bg-[#202c33] flex items-center px-4 gap-3 border-t border-[#2a3942]">

      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un mensaje"
        className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2 text-sm text-white outline-none"
      />

      <button
        onClick={handleSend}
        className="text-green-400 font-semibold hover:opacity-80"
      >
        Enviar
      </button>

    </div>
  )
}
