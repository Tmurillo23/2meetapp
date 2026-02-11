"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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


export function Profile() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);

        // Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/auth/login");
          return;
        }

        // Obtener datos del perfil
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, description")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile error:", profileError);
          router.push("/main/update-profile");
          return;
        }

        if (!profileData) {
          router.push("/main/update-profile");
          return;
        }

        setProfile(profileData);

        // Obtener intereses del usuario
        const { data: userInterestsData, error: interestsError } = await supabase
          .from("interest_per_profile")
          .select("interest_id")
          .eq("profile_id", user.id);

        if (interestsError) {
          console.error("Error loading interests:", interestsError);
        } else if (userInterestsData && Array.isArray(userInterestsData) && userInterestsData.length > 0) {
          try {
            // Obtener los detalles de los intereses
            const interestIds = userInterestsData
              .map((item: { interest_id: string }) => item.interest_id)
              .filter((id): id is string => Boolean(id));

            if (interestIds.length > 0) {
              const { data: interestDetails, error: detailsError } = await supabase
                .from("interests")
                .select("id, interest, category")
                .in("id", interestIds);

              if (!detailsError && interestDetails && Array.isArray(interestDetails)) {
                setInterests(interestDetails as Interest[]);
              }
            }
          } catch (err) {
            console.error("Error processing interests:", err);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        router.push("/main/update-profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [supabase, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex gap-6 max-w-2xl items-center mx-auto p-6">
      <Card className="bg-white border border-purple-500 shadow-xl rounded-2xl">
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
