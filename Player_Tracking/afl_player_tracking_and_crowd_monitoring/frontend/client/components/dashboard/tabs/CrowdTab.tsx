import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MapPin, Eye } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { generateTimelineFromStadiumData } from "@/data/mock";

export type CrowdZone = { zone: string; capacity: number; current: number; density: number; trend: string; color: string; position: any };

export default function CrowdTab({ zones }: { zones: CrowdZone[] }) {
  const timeline = generateTimelineFromStadiumData(zones);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Stadium Zone Density</CardTitle>
                <CardDescription>Real-time crowd distribution across stadium zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {zones.map((zone, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{zone.zone}</span>
                        <div className="text-sm text-gray-600">{zone.current.toLocaleString()} / {zone.capacity.toLocaleString()}</div>
                      </div>
                      <Progress value={zone.density} className="h-3" />
                      <div className="text-xs text-gray-600 text-right">{zone.density}% capacity</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" /> Visual Stadium Map</CardTitle>
                <CardDescription>Interactive crowd density visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-orange-50 rounded-lg p-4 min-h-80">
                  <div className="absolute inset-6 border-4 border-orange-600 bg-orange-200" style={{ borderRadius: "50%", clipPath: "ellipse(45% 40% at 50% 50%)" }} />
                  {zones.map((zone, index) => (
                    <div key={index} className="absolute transition-all duration-1000 cursor-pointer hover:scale-105" style={{ ...zone.position, backgroundColor: zone.color, opacity: (zone.density / 100) * 0.8 + 0.2, borderRadius: 8, border: "2px solid rgba(255,255,255,0.8)" }} title={`${zone.zone}: ${zone.current.toLocaleString()}/${zone.capacity.toLocaleString()} (${zone.density}%)`} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Crowd Density Timeline</CardTitle><CardDescription>Attendance and density across time</CardDescription></CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="attendance" orientation="left" tick={{ fontSize: 12 }} label={{ value: "Attendance", angle: -90, position: "insideLeft" }} />
                    <YAxis yAxisId="density" orientation="right" tick={{ fontSize: 12 }} label={{ value: "Density %", angle: 90, position: "insideRight" }} />
                    <Tooltip />
                    <Legend />
                    <Area yAxisId="attendance" type="monotone" dataKey="attendance" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Total Attendance" />
                    <Area yAxisId="density" type="monotone" dataKey="density" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Average Density %" />
                    <Area yAxisId="density" type="monotone" dataKey="critical" stackId="3" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} name="Critical Zones" />
                    <Area yAxisId="density" type="monotone" dataKey="high" stackId="4" stroke="#f97316" fill="#f97316" fillOpacity={0.8} name="High Density Zones" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Peak Hours</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeline.sort((a: any, b: any) => b.attendance - a.attendance).slice(0, 3).map((entry: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded"><span className="text-sm font-medium">{entry.time}</span><div className="text-right"><div className="text-sm font-bold">{entry.attendance.toLocaleString()}</div><div className="text-xs text-gray-600">{entry.density}% density</div></div></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
