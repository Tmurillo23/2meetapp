"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RealtimeChat } from "@/components/realtime-chat";

interface FriendProfile {
  id: string;
  username: string;
  description: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const friendId = params.id as string;

  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [friend, setFriend] = useState<FriendProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not found");
        }

        // Obtener perfil del usuario actual
        const { data: currentUserProfile } = await supabase
          .from("profiles")
          .select("id, username")
          .eq("id", user.id)
          .single();

        if (currentUserProfile) {
          setCurrentUser(currentUserProfile);
        }

        if (!friendId) {
          throw new Error("Friend ID not found");
        }

        // Obtener perfil del amigo
        const { data: friendProfile, error: friendError } = await supabase
          .from("profiles")
          .select("id, username, description")
          .eq("id", friendId)
          .single();

        if (friendError) {
          throw new Error(friendError.message || "Failed to load friend profile");
        }

        setFriend(friendProfile);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        console.error("Error loading chat data:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [friendId, supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !currentUser || !friend) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="w-fit gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error || "Failed to load chat"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create a unique room name for this chat
  const roomName = [currentUser.id, friend.id].sort().join("_");

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/main/chats")}
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{friend.username}</h2>
              <p className="text-sm text-muted-foreground">{friend.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full">
        <RealtimeChat
          roomName={roomName}
          username={currentUser.username}
        />
      </div>
    </div>
  );
}

