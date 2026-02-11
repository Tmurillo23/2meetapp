"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

interface ProfileData {
  id: string;
  username: string;
  description: string;
}

interface Interest {
  id: string;
  interest: string;
  category?: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const userId = params.id as string;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!userId) {
          throw new Error("User ID not found");
        }

        // Obtener datos del perfil
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, description")
          .eq("id", userId)
          .single();

        if (profileError) {
          throw new Error(profileError.message || "Failed to load profile");
        }

        setProfile(profileData);

        // Obtener intereses del usuario
        const { data: userInterests, error: interestsError } = await supabase
          .from("interest_per_profile")
          .select(
            `
            id,
            interests (
              id,
              interest,
              category
            )
          `
          )
          .eq("profile_id", userId);

        if (interestsError) {
          console.error("Error loading interests:", interestsError);
        } else if (userInterests) {
          const interestsList = userInterests
            .map((item: Record<string, unknown>) => item.interests as Interest)
            .filter((interest): interest is Interest => interest !== undefined && interest !== null);
          setInterests(interestsList);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        console.error("Error loading profile:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
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
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
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
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

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

      <Card className="bg-white border border-purple-500 shadow-xl rounded-2xl">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-3xl">{profile.username}</CardTitle>
            <CardDescription>User Profile</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Description */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-sm">Description</h3>
            <p className="text-muted-foreground">{profile.description}</p>
          </div>

          {/* Interests */}
          {interests.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-sm">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest.id} variant="secondary">
                    {interest.interest}
                    {interest.category && (
                      <span className="ml-1 text-xs opacity-70">
                        ({interest.category})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {interests.length === 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-sm">Interests</h3>
              <p className="text-muted-foreground text-sm">
                No interests added yet.
              </p>
            </div>
          )}

          {/* Chat Button */}
          <Link href={`/main/chats/${profile.id}`}>
            <Button className="w-full gap-2">
              <MessageCircle className="w-4 h-4" />
              Open Chat
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

