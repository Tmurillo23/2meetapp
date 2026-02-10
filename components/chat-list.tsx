"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, MessageCircle, Eye } from "lucide-react";
import Link from "next/link";

interface Friend {
  id: string;
  username: string;
  description: string | null;
  interests: Array<{
    id: string;
    interest: string;
    category?: string | null;
  }>;
}

type ProfileRow = {
  id: string;
  username: string;
  description: string | null;
};

type InterestRow = {
  interests: {
    id: string;
    interest: string;
    category?: string | null;
  } | null;
};

export function ChatList() {
  const supabase = createClient();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not found");
        }

        console.log("Current user:", user.id);

        // Obtener lista de amigos del usuario
        const { data: friendsData, error: friendsError } = await supabase
          .from("friends")
          .select("friend_user_id")
          .eq("current_user_id", user.id);

        console.log("Friends data:", friendsData);
        console.log("Friends error:", friendsError);

        if (friendsError) {
          throw new Error(friendsError.message);
        }

        if (!friendsData || friendsData.length === 0) {
          console.log("No friends found, setting empty array");
          setFriends([]);
          return;
        }

        // Obtener detalles de cada amigo
        const friendIds = friendsData.map((f) => f.friend_user_id);
        const { data: friendsProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, description")
          .in("id", friendIds);

        if (profilesError) {
          throw new Error(profilesError.message);
        }

        // Obtener intereses de cada amigo
        const friendsWithInterests = await Promise.all(
          (friendsProfiles || []).map(async (friend: ProfileRow) => {
            const { data: interests } = await supabase
              .from("interest_per_profile")
              .select("interests(id, interest, category)")
              .eq("profile_id", friend.id);

            const interestsList = ((interests as InterestRow[] | null) || [])
              .map((item) => item.interests)
              .filter(Boolean) as Friend["interests"];

            return {
              ...friend,
              interests: interestsList,
            };
          })
        );

        setFriends(friendsWithInterests);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        console.error("Error loading friends:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadFriends();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="border-red-200 bg-red-50 max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>No chats yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Go to the Match section to find people and start conversations.
            </p>
            <Link href="/main/match">
              <Button>Find Matches</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Your matches: {friends.length} person{friends.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-4">
        {friends.map((friend) => (
          <Card key={friend.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl">{friend.username}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {friend.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Interests */}
              {friend.interests.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold text-sm">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {friend.interests.map((interest) => (
                      <Badge key={interest.id} variant="secondary">
                        {interest.interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link href={`/main/profile/${friend.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Eye className="w-4 h-4" />
                    View Profile
                  </Button>
                </Link>
                <Link href={`/main/chats/${friend.id}`} className="flex-1">
                  <Button size="sm" className="w-full gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
