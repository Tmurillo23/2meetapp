"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Loader } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  description: string;
}

interface Interest {
  id: string;
  interest: string;
  category: string | null;
}

interface Candidate extends UserProfile {
  interests: Interest[];
  commonCount: number;
}

export function MatchPage() {
  const supabase = createClient();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInterests, setUserInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("No user found");
        return;
      }

      // Cargar intereses del usuario actual
      const userIntrs = await getUserInterests(user.id);
      setUserInterests(userIntrs);

      // Cargar candidatos
      const allCandidates = await getAllCandidates(user.id);

      // Filtrar y calcular compatibilidad
      const compatibleCandidates = allCandidates
        .map((candidate) => {
          const commonCount = candidate.interests.filter((interest) =>
            userIntrs.some((ui) => ui.id === interest.id)
          ).length;
          return { ...candidate, commonCount };
        })
        .filter((candidate) => candidate.commonCount >= 2)
        .sort((a, b) => b.commonCount - a.commonCount);

      setCandidates(compatibleCandidates);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "Error loading data");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInterests = async (userId: string): Promise<Interest[]> => {
    const { data } = await supabase
      .from("interest_per_profile")
      .select("interest_id")
      .eq("profile_id", userId);

    if (!data || data.length === 0) return [];

    const interestIds = data.map((row) => row.interest_id);
    const { data: interests } = await supabase
      .from("interests")
      .select("*")
      .in("id", interestIds);

    return interests || [];
  };

  const getAllCandidates = async (userId: string): Promise<Candidate[]> => {
    // Obtener amigos existentes
    const { data: friends } = await supabase
      .from("friends")
      .select("friend_user_id")
      .eq("current_user_id", userId);

    const friendIds = new Set(friends?.map((f) => f.friend_user_id) || []);

    // Obtener todos los perfiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", userId);

    if (!profiles) return [];

    // Para cada perfil, obtener sus intereses
    const candidatesWithInterests = await Promise.all(
      profiles
        .filter((p) => !friendIds.has(p.id))
        .map(async (profile) => {
          const interests = await getUserInterests(profile.id);
          return { ...profile, interests, commonCount: 0 };
        })
    );

    return candidatesWithInterests;
  };

  const handleMatch = async () => {
    if (currentIndex >= candidates.length) return;

    const candidate = candidates[currentIndex];
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Crear amistad bidireccional
    await supabase.from("friends").insert({
      current_user_id: user.id,
      friend_user_id: candidate.id,
    });

    await supabase.from("friends").insert({
      current_user_id: candidate.id,
      friend_user_id: user.id,
    });

    nextCandidate();
  };

  const handleNoMatch = () => {
    nextCandidate();
  };

  const nextCandidate = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCandidates([]);
    }
  };

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
        <Card className="max-w-md w-full border-red-200 bg-red-50">
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

  if (candidates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>No matches available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No hay personas disponibles con 2 o más intereses en común
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const candidate = candidates[currentIndex];

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{candidate.username}</CardTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {candidate.description}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-sm">
              Intereses en común: {candidate.commonCount}
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidate.interests.map((interest) => {
                const isCommon = userInterests.some((ui) => ui.id === interest.id);
                return (
                  <Badge key={interest.id} variant={isCommon ? "default" : "secondary"}>
                    {interest.interest}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button variant="outline" size="lg" onClick={handleNoMatch} className="flex-1">
              <X className="w-6 h-6" />
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={handleMatch}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              <Heart className="w-6 h-6" />
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            {currentIndex + 1} / {candidates.length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


