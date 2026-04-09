import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Plus, Trash2, Bot, User, Hash, Terminal } from "lucide-react";
import { 
  useSettings, useUpdateSettings, 
  useBotTokens, useAddBotToken, useDeleteBotToken,
  useUserTokens, useAddUserToken, useDeleteUserToken
} from "@/hooks/use-bot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const settingsSchema = z.object({
  checkIntervalSeconds: z.coerce.number().min(1),
  words: z.string().transform(v => v.split('\n').map(s => s.trim()).filter(s => s.length > 0)),
  rotationalProxyUrl: z.string().optional(),
});

const botTokenSchema = z.object({
  token: z.string().min(1, "Token required"),
  channelId: z.string().min(1, "Channel ID required"),
});

const userTokenSchema = z.object({
  token: z.string().min(1, "Token required"),
  label: z.string().optional(),
});

export default function Settings() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { data: botTokens = [] } = useBotTokens();
  const addBotToken = useAddBotToken();
  const deleteBotToken = useDeleteBotToken();
  const { data: userTokens = [] } = useUserTokens();
  const addUserToken = useAddUserToken();
  const deleteUserToken = useDeleteUserToken();

  const settingsForm = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      checkIntervalSeconds: 180,
      words: "",
      rotationalProxyUrl: "",
    },
  });

  const botForm = useForm({
    resolver: zodResolver(botTokenSchema),
    defaultValues: { token: "", channelId: "" },
  });

  const userForm = useForm({
    resolver: zodResolver(userTokenSchema),
    defaultValues: { token: "", label: "" },
  });

  useEffect(() => {
    if (settings) {
      settingsForm.reset({
        checkIntervalSeconds: settings.checkIntervalSeconds || 180,
        words: (settings.words || []).join('\n'),
        rotationalProxyUrl: settings.rotationalProxyUrl || "",
      });
    }
  }, [settings, settingsForm]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle>Target Engine Configuration</CardTitle>
          <CardDescription>Configure specific usernames to hunt and rotational proxies.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...settingsForm}>
            <form onSubmit={settingsForm.handleSubmit(v => updateSettings.mutate(v))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={settingsForm.control} name="checkIntervalSeconds" render={({ field }) => (
                  <FormItem><FormLabel>Check Interval (Seconds)</FormLabel><FormControl><Input type="number" {...field} className="bg-background" /></FormControl></FormItem>
                )} />
                <FormField control={settingsForm.control} name="rotationalProxyUrl" render={({ field }) => (
                  <FormItem><FormLabel>Rotational Proxy API URL</FormLabel><FormControl><Input placeholder="http://user:pass@endpoint:port" {...field} className="bg-background" /></FormControl></FormItem>
                )} />
              </div>
              
              <FormField control={settingsForm.control} name="words" render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Usernames (One per line)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="yes&#10;9of&#10;cdn&#10;Sys" className="min-h-[150px] font-mono bg-background" />
                  </FormControl>
                  <FormDescription>The bot will cycle through these specific words and check availability.</FormDescription>
                </FormItem>
              )} />
              
              <Button type="submit" disabled={updateSettings.isPending} className="w-full">Save Target Settings</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center"><Bot className="w-5 h-5 mr-2 text-primary" /> Discord Bot Tokens</CardTitle>
            <CardDescription>Status updates for all targets will be sent to these channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...botForm}>
              <form onSubmit={botForm.handleSubmit(v => addBotToken.mutate(v, { onSuccess: () => botForm.reset() }))} className="space-y-4 p-4 border border-white/10 rounded-lg bg-white/5">
                <FormField control={botForm.control} name="token" render={({ field }) => (
                  <FormItem><FormLabel>Bot Token</FormLabel><FormControl><Input type="password" {...field} className="bg-background" /></FormControl></FormItem>
                )} />
                <FormField control={botForm.control} name="channelId" render={({ field }) => (
                  <FormItem><FormLabel>Channel ID</FormLabel><FormControl><Input {...field} className="bg-background" /></FormControl></FormItem>
                )} />
                <Button type="submit" size="sm" className="w-full" disabled={addBotToken.isPending}><Plus className="w-4 h-4 mr-2" /> Add Bot</Button>
              </form>
            </Form>
            <Table>
              <TableHeader><TableRow><TableHead>Bot</TableHead><TableHead className="text-right"></TableHead></TableRow></TableHeader>
              <TableBody>
                {botTokens.map(bt => (
                  <TableRow key={bt.id}>
                    <TableCell className="font-mono text-xs">{bt.token.substring(0, 15)}...</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => deleteBotToken.mutate(bt.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center"><User className="w-5 h-5 mr-2 text-primary" /> User Tokens Pool</CardTitle>
            <CardDescription>Tokens used to claim target usernames. Removed after successful claim.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(v => addUserToken.mutate(v, { onSuccess: () => userForm.reset() }))} className="space-y-4 p-4 border border-white/10 rounded-lg bg-white/5">
                <FormField control={userForm.control} name="label" render={({ field }) => (
                  <FormItem><FormLabel>Account Label (e.g. My Account 1)</FormLabel><FormControl><Input {...field} className="bg-background" /></FormControl></FormItem>
                )} />
                <FormField control={userForm.control} name="token" render={({ field }) => (
                  <FormItem><FormLabel>User Token</FormLabel><FormControl><Input type="password" {...field} className="bg-background" /></FormControl></FormItem>
                )} />
                <Button type="submit" size="sm" className="w-full" disabled={addUserToken.isPending}><Plus className="w-4 h-4 mr-2" /> Add Token</Button>
              </form>
            </Form>
            <Table>
              <TableHeader><TableRow><TableHead>Label</TableHead><TableHead>Token</TableHead><TableHead className="text-right"></TableHead></TableRow></TableHeader>
              <TableBody>
                {userTokens.map(ut => (
                  <TableRow key={ut.id}>
                    <TableCell className="text-xs font-medium">{ut.label || "No Label"}</TableCell>
                    <TableCell className="font-mono text-xs">{ut.token.substring(0, 15)}...</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => deleteUserToken.mutate(ut.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
