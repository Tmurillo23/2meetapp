import { createClient } from '@/lib/supabase/client'

interface MessageData {
  id: string
  content: string
  sender_id: string
  conversation_id: string
  created_at: string
  user?: {
    name: string
  }
}

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(
  userId1: string,
  userId2: string
): Promise<string> {
  const supabase = createClient()

  // Check if conversation already exists (in either direction)
  // First try: participant1 = userId1, participant2 = userId2
  const { data: existingConversation1 } = await supabase
    .from('conversations')
    .select('id')
    .eq('participant1_id', userId1)
    .eq('participant2_id', userId2)
    .single()

  if (existingConversation1) {
    return existingConversation1.id
  }

  // Second try: participant1 = userId2, participant2 = userId1
  const { data: existingConversation2 } = await supabase
    .from('conversations')
    .select('id')
    .eq('participant1_id', userId2)
    .eq('participant2_id', userId1)
    .single()

  if (existingConversation2) {
    return existingConversation2.id
  }

  // Create new conversation
  const { data: newConversation, error } = await supabase
    .from('conversations')
    .insert({
      participant1_id: userId1,
      participant2_id: userId2,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    throw error
  }

  return newConversation.id
}

/**
 * Load messages from the database for a conversation
 */
export async function loadMessages(conversationId: string): Promise<MessageData[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('messages')
    .select('id, content, sender_id, conversation_id, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error loading messages:', error)
    return []
  }

  return data || []
}

/**
 * Save a message to the database
 */
export async function saveMessage({
  id,
  content,
  senderId,
  conversationId,
  createdAt,
}: {
  id: string
  content: string
  senderId: string
  conversationId: string
  createdAt: string
}): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('messages').insert({
    id,
    content,
    sender_id: senderId,
    conversation_id: conversationId,
    created_at: createdAt,
  })

  if (error) {
    console.error('Error saving message:', error)
    // Don't throw - message was already sent via realtime
  }
}

/**
 * Get the sender's name from a user ID
 */
export async function getUserName(userId: string): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error loading user name:', error)
    return 'Unknown'
  }

  return data?.username || 'Unknown'
}
