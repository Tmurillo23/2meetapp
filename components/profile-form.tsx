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
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
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
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Cargar datos del perfil existente
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username, description")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setUsername(profileData.username);
          setDescription(profileData.description);
          setIsEditing(true); // Si hay datos, es edición
        }

        // Cargar intereses del usuario
        const { data: userInterests } = await supabase
          .from("interest_per_profile")
          .select("interest_id")
          .eq("profile_id", user.id);

        if (userInterests) {
          setSelectedInterests(userInterests.map((item: { interest_id: string }) => item.interest_id));
        }
      } catch (err) {
        console.error("Error al cargar los datos del perfil:", err);
        setIsEditing(false);
      }
    };

    loadProfileData();
  }, [supabase]);

  useEffect(() => {
    const loadInterests = async () => {
      setIsLoadingInterests(true);
      try {
        console.log("Iniciando carga de intereses...");
        const { data, error, status } = await supabase
          .from('interests')
          .select('id, interest');

        console.log("Estado de respuesta:", status);
        console.log("Error:", error);
        console.log("Datos:", data);

        if (error) {
          console.error("Error en la consulta:", error);
          setError(`Error al cargar intereses: ${error.message}`);
          return;
        }

        if (!data || data.length === 0) {
          console.warn("No se encontraron intereses en la base de datos");
        }

        console.log("Intereses cargados correctamente:", data);
        setAvailableInterests(data || []);
      } catch (err) {
        console.error("Error al cargar intereses:", err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`Error al cargar intereses: ${errorMsg}`);
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
      setError("El nombre de usuario es obligatorio");
      return;
    }
    if (!description.trim()) {
      setError("La descripcion es obligatoria");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no encontrado");

      const { data, error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            username: username.trim(),
            description: description.trim()
          })
          .select();

      if (error) {
        console.error("Error al crear/actualizar perfil:", error);
        if (error.message.includes("unique constraint")) {
          throw new Error("Este nombre de usuario ya esta en uso. Elige otro.");
        }
        throw new Error(error.message || "No se pudo crear/actualizar el perfil");
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
          console.error("Error al guardar intereses:", interestError);
          throw new Error(interestError.message || "No se pudieron guardar los intereses");
        }
      }

      console.log("Perfil creado/actualizado correctamente:", data);
      router.push("/main/match");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Ocurrio un error";
      console.error("Error al crear perfil:", errorMessage);
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
      <Card className="bg-purple-300 border border-purple-500 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>{isEditing ? "Edita tu perfil" : "Crea tu perfil"}</CardTitle>
          <CardDescription>
           {isEditing
              ? "Actualiza la informacion de tu perfil."
              : "Asi se vera tu perfil para otros usuarios."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input className="bg-white text-black border border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descripcion</Label>
              <Input className="bg-white text-black border border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Intereses</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="justify-between">
                    {isLoadingInterests ? "Cargando intereses..." : `Selecciona intereses (${selectedInterests.length})`}
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {isLoadingInterests ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Cargando intereses...
                    </div>
                  ) : availableInterests.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No hay intereses disponibles
                    </div>
                  ) : (
                    availableInterests.map((interest) => (
                      <DropdownMenuCheckboxItem
                        key={interest.id}
                        checked={selectedInterests.includes(interest.id)}
                        onCheckedChange={() => handleInterestSelect(interest.id)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {interest.interest}
                      </DropdownMenuCheckboxItem>
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
              {isLoading ? (isEditing ? "Actualizando..." : "Creando...") : (isEditing ? "Actualizar perfil" : "Crear perfil")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>

  )
}