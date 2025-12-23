import {
  Github,
  ExternalLink,
  Cpu,
  Heart,
  Shield,
  Zap,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const features = [
  {
    icon: Zap,
    title: "Lightweight",
    description: "Minimal resource usage, no bloatware or unnecessary dependencies",
  },
  {
    icon: Settings,
    title: "Fully Configurable",
    description: "All settings accessible via Home Assistant addon config tab",
  },
  {
    icon: Shield,
    title: "Reduced Log Spam",
    description: "Customizable polling intervals to prevent supervisor log flooding",
  },
];

export default function About() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-about-title">
          About
        </h1>
        <p className="text-sm text-muted-foreground">
          A clean, standalone Home Assistant addon for Pironman 5
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center">
              <Cpu className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">Pironman5 Lite</CardTitle>
              <CardDescription>
                Home Assistant Addon for Raspberry Pi 5 Case
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A streamlined, modular alternative to the original SunFounder Pironman5 
            Home Assistant addon. Built from the ground up with a focus on simplicity, 
            configurability, and reduced system overhead.
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge>v1.0.0</Badge>
            <Badge variant="outline">Raspberry Pi 5</Badge>
            <Badge variant="outline">Home Assistant OS</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h2 className="text-lg font-medium">Key Features</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="hover-elevate">
              <CardContent className="pt-6">
                <feature.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-medium mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hardware Support</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              CPU/GPU temperature monitoring
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              RGB LED control (WS2812 via SPI)
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              GPIO fan control with multiple modes
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              OLED display support
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              System stats (CPU, Memory, Disk, Network)
            </li>
          </ul>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart className="w-4 h-4 text-red-500" />
          <span>for the Home Assistant community</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://github.com/sunfounder/pironman5"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
              data-testid="link-original-repo"
            >
              <Github className="w-4 h-4" />
              Original Repo
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
