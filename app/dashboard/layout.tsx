import ChatList from "@/components/chat/chat-list"
import { ChatProvider } from "@/components/chat/chat-context"
import SidebarIcon from "@/components/sidebar-icon"
import { MessageCircle, Users, User } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ChatProvider>
      <div className="flex h-screen bg-[#0b141a] text-white">

        {/* SIDEBAR */}
        <aside className="w-[80px] bg-[#111b21] flex flex-col items-center py-6 gap-6 border-r border-[#202c33]">
          <SidebarIcon href="" icon={<MessageCircle size={22} />} label="Chats" />
          <SidebarIcon href="" icon={<Users size={22} />} label="Amigos" />
          <SidebarIcon href="" icon={<User size={22} />} label="Perfil" />
        </aside>

        {/* LISTA DE CHATS */}
        <div className="w-[350px] bg-[#111b21] border-r border-[#202c33] overflow-y-auto">
          <ChatList />
        </div>

        {/* CONTENIDO DINÁMICO */}
        <div className="flex-1">
          {children}
        </div>

      </div>
    </ChatProvider>/* se supone que ese ChatProvider es loq ue ayuda al front a conectarse con WebSockets / 
                         Realtime, solo se debe conectar receiveMessage(...)*/
  )
}

