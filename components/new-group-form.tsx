'use client'

import { useActionState, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Mail, Trash2 } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { createGroup, CreateGroupState } from "@/app/app/groups/new/actions";
import { useToast } from "@/hooks/use-toast";

interface Participante {
    name: string,
    email: string
}

export default function NewGroupForm({loggedUser} : {loggedUser: {id: string, email: string}}) {
    const [participantes, setParticipantes] = useState<Participante[]>([{name: "", email: loggedUser.email}]);
    const [groupName, setGroupName] = useState("");
    const [state, formAction, isPending] = useActionState<CreateGroupState, FormData>(createGroup , {
        success: null,
        message: ""
    });

    const { toast } = useToast();

    useEffect( () => {
        if (state.success === false) {
            toast({
                variant: "destructive",
                description: state.message
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state])

    function updateParticipantes(index: number, field: keyof Participante, value: string) {
        const updatedParticipantesName = [...participantes];

        updatedParticipantesName[index][field] = value;
        setParticipantes(updatedParticipantesName);
    }

    function deleteParticipante(index: number) {
        setParticipantes(participantes.filter((_, i) => i !== index));
    }

    function addParticipante() {
        setParticipantes(participantes.concat({ name: "", email: "" }));
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>
                    Novo Grupo
                </CardTitle>
                <CardDescription>
                    Convide seus amigos para o seu grupo
                </CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Grupo</Label>
                        <Input id="group-name" name="group-name" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Digite o nome do grupo" required/>
                    </div>
                    <h2 className="!mt-12"> 
                        Participantes
                    </h2>
                    {participantes.map((participante, index) => (
                        <div key={index} className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex-grow space-y-2 w-full">
                                <Label htmlFor={`name-${index}`}>Nome</Label>
                                <Input id={`name-${index}`} name="name" value={participante.name} onChange={(e) => {
                                  updateParticipantes(index, "name", e.target.value);  
                                }} placeholder="Digite o nome da pessoa" required/>
                            </div>

                            <div className="flex-grow space-y-2 w-full">
                                <Label htmlFor={`email-${index}`}>Email</Label>
                                <Input id={`email-${index}`} name="email" value={participante.email} onChange={(e) => {
                                  updateParticipantes(index, "email", e.target.value);
                                }} type="email" placeholder="Digite o email da pessoa"
                                readOnly={participante.email === loggedUser.email}
                                className="read-only:text-muted-foreground read-only:cursor-not-allowed"
                                required
                                />
                            </div>
                            <div className="min-w-9">
                                {participantes.length > 1 && participante.email !== loggedUser.email && (
                                    <Button variant="outline" type="button" size="icon" onClick={() => deleteParticipante(index)}>
                                        <Trash2  className="h-4 w-4"/>
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
                <Separator className="my-4"/>
                <CardFooter className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                    <Button type="button" variant="outline" onClick={addParticipante} className="w-full md:w-auto">
                        Adicionar Participante
                    </Button>
                    <Button type="submit" className="w-full md:w-auto flex items-center space-x-2">
                        <Mail className="w-3 h-3"/>
                        Criar grupos e enviar emails
                        {isPending && <Loader2 className="animate-spin"/>}
                    </Button>
                </CardFooter> 
            </form>
        </Card>
    )
}