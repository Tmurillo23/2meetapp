"use client"
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, X } from "lucide-react";

export function ProfileForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInterests, setIsLoadingInterests] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [availableInterests, setAvailableInterests] = useState<Array<{ id: string; interest: string }>>([]);
  const router = useRouter();

  useEffect(() => {
    const loadInterests = async () => {
      setIsLoadingInterests(true);
      try {
        console.log("Starting to load interests...");
        const { data, error, status } = await supabase
          .from('interests')
          .select('id, interest');

        console.log("Response status:", status);
        console.log("Error:", error);
        console.log("Data:", data);

        if (error) {
          console.error("Query error:", error);
          setError(`Failed to load interests: ${error.message}`);
          return;
        }

        if (!data || data.length === 0) {
          console.warn("No interests found in database");
        }

        console.log("Interests loaded successfully:", data);
        setAvailableInterests(data || []);
      } catch (err) {
        console.error("Error loading interests:", err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`Error loading interests: ${errorMsg}`);
      } finally {
        setIsLoadingInterests(false);
      }
    };

    loadInterests();
  }, [supabase]);


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Crear/actualizar perfil
      const { data, error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            username: username.trim(),
            description: description.trim()
          })
          .select();

      if (error) {
        console.error("Profile upsert error:", error);
        if (error.message.includes("unique constraint")) {
          throw new Error("This username is already taken. Please choose another one.");
        }
        throw new Error(error.message || "Failed to create/update profile");
      }

      if (selectedInterests.length > 0) {
        await supabase
          .from('interest_per_profile')
          .delete()
          .eq('profile_id', user.id);

        // Agregar nuevos interests
        const interestInserts = selectedInterests.map((interestId) => ({
          profile_id: user.id,
          interest_id: interestId,
        }));

        const { error: interestError } = await supabase
          .from('interest_per_profile')
          .insert(interestInserts);

        if (interestError) {
          console.error("Interest insert error:", interestError);
          throw new Error(interestError.message || "Failed to save interests");
        }
      }

      console.log("Profile created/updated successfully:", data);
      router.push("/protected");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      console.error("Error creating profile:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterestSelect = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleRemoveInterest = (interestId: string) => {
    setSelectedInterests((prev) => prev.filter((id) => id !== interestId));
  };

  const getSelectedInterestNames = () => {
    return selectedInterests
      .map((id) => availableInterests.find((interest) => interest.id === id)?.interest)
      .filter(Boolean);
  };

  return (
<div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create your profile</CardTitle>
          <CardDescription>
            This is how your profile will appear to other users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Interests</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="justify-between">
                    {isLoadingInterests ? "Loading interests..." : `Select Interests (${selectedInterests.length})`}
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {isLoadingInterests ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Loading interests...
                    </div>
                  ) : availableInterests.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No interests available
                    </div>
                  ) : (
                    availableInterests.map((interest) => (
                      <DropdownMenuItem
                        key={interest.id}
                        onClick={() => handleInterestSelect(interest.id)}
                        className="cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedInterests.includes(interest.id)}
                          onChange={() => {}}
                          className="mr-2"
                        />
                        {interest.interest}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex flex-wrap gap-2">
                {getSelectedInterestNames().map((interestName) => {
                  const interestId = availableInterests.find(
                    (interest) => interest.interest === interestName
                  )?.id;
                  return (
                    <Badge key={interestId} variant="secondary" className="px-2 py-1">
                      {interestName}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() =>
                          interestId && handleRemoveInterest(interestId)
                        }
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>

  )
}