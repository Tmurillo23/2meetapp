// export type Message = {
//   id: number
//   fromMe: boolean
//   text: string
// }

// export type Chat = {
//   id: string
//   name: string
//   avatar: string
//   messages: Message[]
// }
export type Message = {
  id: number
  fromMe: boolean
  text: string
  createdAt: number
}

export type Chat = {
  id: string
  name: string
  avatar: string
  messages: Message[]
}
