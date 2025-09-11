import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail") || "";
    const storedName = localStorage.getItem("userName") || "";
    const storedUnits = (localStorage.getItem("pref_units") as any) || "metric";
    const storedNotif = localStorage.getItem("pref_notifications");
    setEmail(storedEmail);
    setName(storedName);
    setUnits(storedUnits === "imperial" ? "imperial" : "metric");
    setNotifications(storedNotif ? storedNotif === "true" : true);
  }, []);

  const save = () => {
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", name);
    localStorage.setItem("pref_units", units);
    localStorage.setItem("pref_notifications", String(notifications));
    alert("Settings saved");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="name@example.com" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Personalize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Units</Label>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="units" checked={units==='metric'} onChange={()=>setUnits('metric')} /> Metric (km, km/h)
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="units" checked={units==='imperial'} onChange={()=>setUnits('imperial')} /> Imperial (mi, mph)
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Notifications</Label>
                  <div className="mt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={notifications} onChange={(e)=>setNotifications(e.target.checked)} />
                      Email me when analysis completes
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={save}>Save Changes</Button>
          </div>
          <Separator />
        </div>
      </div>
    </div>
  );
}
