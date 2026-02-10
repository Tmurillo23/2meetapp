"use client"

import { useEffect, useState } from "react";
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
import Link from "next/link";
import { Loader } from "lucide-react";

interface ProfileData {
  id: string;
  username: string;
  description: string;
}

interface Interest {
  id: string;
  interest: string;
  category?: string | null;
}

type InterestRow = {
  interests: Interest[] | null;
};

export function Profile() {
  const supabase = createClient();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("User not found");
        }

        // Obtener datos del perfil
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, description")
          .eq("id", user.id)
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
          .eq("profile_id", user.id);

        if (interestsError) {
          console.error("Error loading interests:", interestsError);
        } else if (userInterests) {
          const interestsList = (userInterests as InterestRow[])
            .flatMap((item) => item.interests ?? []);
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
      <div className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
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
        <Card>
          <CardHeader>
            <CardTitle>No Profile Found</CardTitle>
            <CardDescription>
              You don&#39;t have a profile yet. Create one to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/main/update-profile">
              <Button>Create Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-3xl">{profile.username}</CardTitle>
            <CardDescription>Your Profile Information</CardDescription>
          </div>
          <Link href="/main/update-profile">
            <Button>Edit Profile</Button>
          </Link>
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
                No interests added yet.{" "}
                <Link
                  href="/main/update-profile"
                  className="text-blue-600 hover:underline"
                >
                  Add some interests
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
