export const mockChats = [
  {
    id: "1",
    name: "Pedro Perez",
    avatar: "/avatar1.png",
    messages: [
      { id: 1, fromMe: false, text: "Sí dale, hablamos mas tarde", createdAt: Date.now() - 60000 },
      { id: 2, fromMe: true, text: "Te escribo luego", createdAt: Date.now() - 30000 },
    ],
  },
  {
    id: "2",
    name: "Valentina Palacio",
    avatar: "/avatar2.png",
    messages: [
      { id: 1, fromMe: false, text: "Hola 👋", createdAt: Date.now() - 20000 },
    ],
  },
]
