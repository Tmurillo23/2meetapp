import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RealtimeChat } from "@/components/realtime-chat";

type ChatContentProps = {
  friendId: string;
};

async function ChatContent({ friendId }: ChatContentProps) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
        <Link href="/main/chats">
          <Button variant="ghost" className="w-fit gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: currentUserProfile, error: currentUserError } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .single();

  if (currentUserError || !currentUserProfile) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
        <Link href="/main/chats">
          <Button variant="ghost" className="w-fit gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Failed to load current user</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!friendId) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
        <Link href="/main/chats">
          <Button variant="ghost" className="w-fit gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Friend ID not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: friendProfile, error: friendError } = await supabase
    .from("profiles")
    .select("id, username, description")
    .eq("id", friendId)
    .single();

  if (friendError || !friendProfile) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
        <Link href="/main/chats">
          <Button variant="ghost" className="w-fit gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Failed to load friend profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roomName = [currentUserProfile.id, friendProfile.id].sort().join("_");

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/main/chats">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-lg font-semibold">{friendProfile.username}</h2>
              <p className="text-sm text-muted-foreground">{friendProfile.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full">
        <RealtimeChat
          roomName={roomName}
          username={currentUserProfile.username}
          currentUserId={currentUserProfile.id}
          otherUserId={friendProfile.id}
        />
      </div>
    </div>
  );
}

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <ChatContent friendId={id} />
    </Suspense>
  );
}
