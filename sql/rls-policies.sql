-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages from their conversations
CREATE POLICY "Users can view messages from their conversations"
ON messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE participant1_id = auth.uid() OR participant2_id = auth.uid()
  )
);

-- Policy: Users can insert messages to their conversations
CREATE POLICY "Users can insert messages to their conversations"
ON messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE (participant1_id = auth.uid() OR participant2_id = auth.uid())
  )
);

-- Enable RLS on conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view conversations they're part of
CREATE POLICY "Users can view conversations they're part of"
ON conversations FOR SELECT
USING (participant1_id = auth.uid() OR participant2_id = auth.uid());

-- Policy: Users can create conversations
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (participant1_id = auth.uid() OR participant2_id = auth.uid());

-- Policy: Users can update conversations
CREATE POLICY "Users can update conversations"
ON conversations FOR UPDATE
USING (participant1_id = auth.uid() OR participant2_id = auth.uid());
