"use client";

import { useActionState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LoginState } from "@/app/(auth)/login/actions";
import { login } from "@/app/(auth)/login/actions";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Loader, MessageCircle } from "lucide-react";

export default function LoginForm() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const [state, formAction, isPending] = useActionState<LoginState, FormData>(
        login,
        {
            success: null,
            message: ""   
        }
    ) //Esse hook retorna um array com  tres elementos, sendo eles
    //estado, acao e estado da acao

    return (
        //sm é igual a 384px ou 24rem
        //mx-auto = margin left e right auto
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">
                    Login
                </CardTitle>
                <CardDescription>
                    Digite seu e-mail para receber o link de login
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" name="email" placeholder="maria@gmail.com" required/>
                        </div>
                        {state.success === true && (
                            <div>
                                <Alert className="text-muted-foreground">
                                    <MessageCircle className="h-4 w-4 !text-green-600"/>
                                    <AlertTitle className="text-gray-50">
                                        {state.message} 
                                    </AlertTitle>
                                    <AlertDescription>
                                        Confira seu inbox para acessar o link de login
                                    </AlertDescription>
                                </Alert>    
                            </div>
                        )}

                        {state.success === false && (
                            <div>
                                <Alert className="text-muted-foreground">
                                    <MessageCircle className="h-4 w-4 !text-red-600"/>
                                    <AlertTitle className="text-gray-50">
                                        {state.message} 
                                    </AlertTitle>
                                    <AlertDescription>
                                        Ocorreu um erro ao enviar o link de login, por favor entre em contato com o suporte
                                    </AlertDescription>
                                </Alert>    
                            </div>
                        )}
                        <Button type="submit" className="w-full">
                            {isPending && <Loader className="animate-spin"/>}
                            Enviar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}