/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import { TextRevealCard, TextRevealCardTitle } from "@/components/ui/text-reveal";
import { createClient } from "@/utils/supabase/server";
import { Separator } from "@radix-ui/react-separator";

export default async function GroupPage({ params} : { params: { id: string } }) {
    const supabase = await createClient();
    const { data: authUser, error: authError } = await supabase.auth.getUser();

    const groupId = (await params.id); 

    const { data, error } = await supabase.from("groups").select(`
            name,
            participants(*)
        `).eq("id", groupId).single();


    if(error) {
        return <p>Erro ao carregar o grupo</p>
        
    }

    const assignedParticipantId = data.participants.find( (p) => p.email === authUser?.user?.email)?.assigned_to;

    const assignedParticipant = data.participants.find( (p) => p.id === assignedParticipantId);

    return (
        <main className="container mx-auto py-6">
            <Card  className="w-full max-w-3xl mx-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">
                            Grupo{"  "}
                            <span className="font-light underline decoration-red-400">
                                {data.name}
                            </span>
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Informações do grupo e participantes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <h2 className="text-xl font-semibold mb-4">Participantes</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    Nome
                                </TableHead>
                                <TableHead>
                                    Email
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.participants.map((participant) => (
                                <TableRow key={participant.id}>
                                    <TableCell className={participant.id === assignedParticipantId ? "font-semibold" : ""}>{participant.name}</TableCell>
                                    <TableCell>{participant.email}</TableCell>  
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Separator className="my-6"/>

                    <TextRevealCard text="Revele seu amigo secreto" revealText={assignedParticipant?.name} className="my-6">
                        <TextRevealCardTitle className="mb-2 font-semibold">
                            Seu amigo secreto é
                        </TextRevealCardTitle>
                    </TextRevealCard>
                </CardContent>
            </Card>
        </main>
    )
}