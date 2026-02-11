"use client"
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";

interface Interest {
  id: string;
  interest: string;
  category?: string;
}

interface InterestPerProfile {
  interests: Interest;
}

interface MatchProfile {
  id: string;
  username: string;
  description: string;
  interest_per_profile: InterestPerProfile[];
}

export function MatchPage() {
  const supabase = createClient();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  useEffect(() => {
    const loadMatches = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Paso 1: Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("User not found");
          setIsLoading(false);
          return;
        }
        console.log("Step 1 - Current user ID:", user.id);

        // Paso 2: Obtener intereses del usuario actual
        const { data: myInterestsData } = await supabase
          .from('interest_per_profile')
          .select('interest_id')
          .eq('profile_id', user.id);

        console.log("Step 2 - My interests:", myInterestsData);

        if (!myInterestsData || myInterestsData.length === 0) {
          setError("Please set your interests first");
          setIsLoading(false);
          return;
        }

        const myInterestIds = myInterestsData.map((item: { interest_id: string }) => item.interest_id);
        console.log("Step 3 - My interest IDs:", myInterestIds);

        // Paso 4: Obtener todos los perfiles
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('id, username, description');

        console.log("Step 4 - All profiles:", allProfiles);

        if (!allProfiles || allProfiles.length === 0) {
          setMatches([]);
          setIsLoading(false);
          return;
        }

        // Paso 5: Obtener amigos existentes
        const { data: friendsData } = await supabase
          .from('friends')
          .select('friend_user_id')
          .eq('current_user_id', user.id);

        console.log("Step 5 - Existing friends:", friendsData);
        const myFriendIds = friendsData?.map((f: { friend_user_id: string }) => f.friend_user_id) || [];
        console.log("Step 6 - My friend IDs:", myFriendIds);

        const matchProfiles: MatchProfile[] = [];

        for (const profile of allProfiles) {
          if (profile.id === user.id) {
            console.log(`Skipping self: ${profile.username}`);
            continue;
          }

          // Skip existing friends
          if (myFriendIds.includes(profile.id)) {
            console.log(`Skipping friend: ${profile.username}`);
            continue;
          }

          // Get interests for this profile
          const { data: theirInterestsData } = await supabase
            .from('interest_per_profile')
            .select('interest_id')
            .eq('profile_id', profile.id);

          const theirInterestIds = theirInterestsData?.map((item: { interest_id: string }) => item.interest_id) || [];
          console.log(`Profile ${profile.username} interests:`, theirInterestIds);

          // Count common interests
          const commonIds = myInterestIds.filter(id => theirInterestIds.includes(id));
          console.log(`${profile.username} has ${commonIds.length} common interests`);

          // Add if 2+ common interests
          if (commonIds.length >= 2) {
            // Get interest details for display
            const { data: interestDetails } = await supabase
              .from('interests')
              .select('id, interest, category')
              .in('id', commonIds);

            matchProfiles.push({
              ...profile,
              interest_per_profile: interestDetails?.map((interest: Interest) => ({
                interests: interest
              })) || []
            });

            console.log(`Added ${profile.username} to matches`);
          }
        }

        console.log("Step 8 - Final matches:", matchProfiles);
        setMatches(matchProfiles);

      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, [supabase]);

  const handleMatch = async (profileId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("User not authenticated");
        return;
      }

      console.log("Adding friendship between", user.id, "and", profileId);

      // Insert first friendship (current user -> friend)
      const { error: firstError, data: firstData } = await supabase
        .from('friends')
        .insert({
          current_user_id: user.id,
          friend_user_id: profileId
        })
        .select();

      if (firstError) {
        console.error("Error adding friend (direction 1):", firstError);
        console.error("Error details:", JSON.stringify(firstError));
        setError(`Failed to add friend: ${firstError.message}`);
        return;
      }

      console.log("First friendship added:", firstData);

      // Insert second friendship (friend -> current user)
      const { error: secondError, data: secondData } = await supabase
        .from('friends')
        .insert({
          current_user_id: profileId,
          friend_user_id: user.id
        })
        .select();

      if (secondError) {
        console.error("Error adding friend (direction 2):", secondError);
        console.warn("First friendship was added but second direction failed");
      } else {
        console.log("Second friendship added:", secondData);
      }

      console.log("Friend added successfully (bidirectional)");
      const newMatches = matches.filter((match) => match.id !== profileId);
      setMatches(newMatches);
      setCurrentMatchIndex(0);

      if (newMatches.length > 0 && currentMatchIndex < newMatches.length) {
        setCurrentMatchIndex(currentMatchIndex);
      } else if (newMatches.length > 0) {
        setCurrentMatchIndex(newMatches.length - 1);
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred while adding friend");
    }
  };

  const handleReject = (profileId: string) => {
    const newMatches = matches.filter((match) => match.id !== profileId);
    setMatches(newMatches);
    if (newMatches.length > 0) {
      setCurrentMatchIndex(0);
    }
  };

  // 🔥 ESTADOS SIN SCROLL
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        <p className="text-lg">Loading matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        <p className="text-lg text-muted-foreground">No matches found</p>
      </div>
    );
  }

  const currentMatch = matches[currentMatchIndex];

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4 overflow-hidden">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="text-2xl font-bold text-center">
              {currentMatch.username}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {currentMatch.description}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {currentMatch.interest_per_profile && Array.isArray(currentMatch.interest_per_profile) && currentMatch.interest_per_profile.length > 0 ? (
                currentMatch.interest_per_profile.map((item: InterestPerProfile, index: number) => {
                  const interestData = item.interests;
                  if (!interestData) return null;

                    return (
                      <div
                        key={interestData.id || index}
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                      >
                        {interestData.interest}
                      </div>
                    );
                  }
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  No interests
                </p>
              )}
            </div>

            <div className="flex justify-between items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleReject(currentMatch.id)}
                className="h-12 flex-1 border-2 border-gray-300 hover:bg-red-50 hover:border-red-400 transition-all"
              >
                <X className="w-6 h-6" />
              </Button>

              <Button
                variant="default"
                size="lg"
                onClick={() => handleMatch(currentMatch.id)}
                className="h-12 flex-1 bg-purple-500 hover:bg-purple-700 text-white transition-all"
              >
                <Heart className="w-6 h-6 fill-current" />
              </Button>
            </div>

            <div className="text-center text-xs text-muted-foreground mt-4">
              {currentMatchIndex + 1} of {matches.length}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
