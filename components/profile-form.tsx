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
import { useState } from "react";

export function ProfileForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


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

      // Use upsert to handle both create and update cases
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
        // Handle specific error cases
        if (error.message.includes("unique constraint")) {
          throw new Error("This username is already taken. Please choose another one.");
        }
        throw new Error(error.message || "Failed to create/update profile");
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