/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Resend } from "resend";

export type CreateGroupState = {
    success: boolean | null
    message: string
}

export async function createGroup(previousState: CreateGroupState, formData: FormData) {
    const supabase = await createClient();
    const { data: authUser, error: authError } = await supabase.auth.getUser();

    if(authError) {
        return {
            success: false,
            message: "Ocorreu um erro ao criar o grupo"
        }
    }

    const names = formData.getAll("name");
    const emails = formData.getAll("email");
    const groupName = formData.get("group-name");

    const {data: newGroup, error} = await supabase.from("groups").insert({
        name: groupName,
        owner_id: authUser?.user?.id
    })
    .select()
    .single();

    if(error) {
        return {
            success: false, 
            message: "Ocorreu um erro ao criar o grupo"
        }
    }


    const participantes = names.map((name, index) => ({
        group_id: newGroup.id,
        name,
        email: emails[index]
    }))

     
    const { data: createdParticipants, error: errorParticipants } = await supabase.from("participants").insert(participantes)
    .select();

    if(errorParticipants) {
        return {
            success: false,
            message: "Ocorreu um erro ao adicionar os participantes ao grupo. Por favor, tente novamente"
        }
    }

     
    const drawParticipants = drawGroup(createdParticipants);

    const  { error: errorDraw } = await supabase.from("participants").upsert(drawParticipants);

    if(errorDraw) {
        return {
            success: false,
            message: "Ocorreu um erro ao sortear os participantes do grupo. Por favor, tente novamente"
        }
    }


    //enviar os emails
    const { error: errorResend } = await sendEmailToParticipants(drawParticipants, groupName as string);

    if(errorResend) {
        return {
            success: false,
            message: errorResend
        }
    }   

    redirect(`/app/groups/${newGroup.id}`)

}

async function sendEmailToParticipants(participants: Participante[], groupName: string) {
    const resend =  new Resend(process.env.API_KEY_RESEND!);

    try {
        await Promise.all(
            participants.map(async (participante) => {
                resend.emails.send({
                    from: "Amigo Secreto <onboarding@resend.dev>",
                    to: participante.email,
                    subject: "Amigo Secreto",
                    html: `<p>Você está participando do amigo secreto do grupo ${groupName} <br /> <br /> O seu amigo secreto é: <strong>${participants.find((p) => p.id == participante.assigned_to)?.name}</strong></p>`
                })
            })
        )

        return {error: null}
    } catch (error) {
        return { error: "Ocorreu um erro ao enviar os emails. Por favor, tente novamente" }  
    }
}

type Participante =  {
    id: string,
    group_id: string,
    name: string,
    email: string
    assigned_to: string | null
    created_at: string
}


function drawGroup(participants: Participante[]) {
    const selectedParticipants: string[] = [];

    return participants.map((participante) => {
        const availableParticipants = participants.filter((p) => p.id != participante.id && !selectedParticipants.includes(p.id));

        const assignedParticipant = availableParticipants[Math.floor(Math.random() * availableParticipants.length)];

        selectedParticipants.push(assignedParticipant.id);

        return {
            ...participante,
            assigned_to: assignedParticipant.id
        }
    })

}