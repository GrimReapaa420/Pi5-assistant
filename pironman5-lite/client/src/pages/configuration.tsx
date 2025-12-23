import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Settings,
  Fan,
  Palette,
  Monitor,
  Timer,
  Save,
  RotateCcw,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RGBPreview } from "@/components/rgb-preview";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { configSchema, DEFAULT_CONFIG, type AddonConfig } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Configuration() {
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery<AddonConfig>({
    queryKey: ["/api/config"],
  });

  const form = useForm<AddonConfig>({
    resolver: zodResolver(configSchema),
    defaultValues: config || DEFAULT_CONFIG,
    values: config,
  });

  const updateMutation = useMutation({
    mutationFn: (data: AddonConfig) => apiRequest("PATCH", "/api/config", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Configuration saved",
        description: "Your settings have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/config/reset"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      form.reset(DEFAULT_CONFIG);
      toast({
        title: "Configuration reset",
        description: "Settings have been restored to defaults.",
      });
    },
  });

  const onSubmit = (data: AddonConfig) => {
    updateMutation.mutate(data);
  };

  const watchRgbEnabled = form.watch("rgbEnabled");
  const watchRgbColor = form.watch("rgbColor");
  const watchRgbBrightness = form.watch("rgbBrightness");
  const watchRgbStyle = form.watch("rgbStyle");
  const watchRgbSpeed = form.watch("rgbSpeed");
  const watchRgbLedCount = form.watch("rgbLedCount");

  if (isLoading) {
    return <ConfigurationSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-config-title">
            Configuration
          </h1>
          <p className="text-sm text-muted-foreground">
            Customize addon behavior and hardware settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
            data-testid="button-reset-config"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
            data-testid="button-save-config"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Accordion type="multiple" defaultValue={["polling", "webui", "fan", "rgb"]} className="space-y-4">
            <AccordionItem value="polling" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Polling Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardContent className="p-0 space-y-6">
                    <FormField
                      control={form.control}
                      name="pollingInterval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Polling Interval (seconds)</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Slider
                                min={1}
                                max={60}
                                step={1}
                                value={[field.value]}
                                onValueChange={(v) => field.onChange(v[0])}
                                className="flex-1"
                                data-testid="slider-polling-interval"
                              />
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                className="w-20 font-mono"
                                data-testid="input-polling-interval"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            How often to read hardware values. Higher values reduce log spam.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="debugLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Debug Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-debug-level">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DEBUG">Debug</SelectItem>
                              <SelectItem value="INFO">Info</SelectItem>
                              <SelectItem value="WARNING">Warning</SelectItem>
                              <SelectItem value="ERROR">Error</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Controls log verbosity. Use WARNING or ERROR to minimize logs.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="webui" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Web UI Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardContent className="p-0 space-y-6">
                    <FormField
                      control={form.control}
                      name="webUiEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between gap-4">
                          <div>
                            <FormLabel>Enable Web UI</FormLabel>
                            <FormDescription>
                              Toggle the dashboard web interface on/off
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-webui-enabled"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="webUiPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="w-32 font-mono"
                              data-testid="input-webui-port"
                            />
                          </FormControl>
                          <FormDescription>
                            Port for the web dashboard (default: 34001)
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="temperatureUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature Unit</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-32" data-testid="select-temp-unit">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="C">Celsius (°C)</SelectItem>
                              <SelectItem value="F">Fahrenheit (°F)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="fan" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Fan className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Fan Control</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardContent className="p-0 space-y-6">
                    <FormField
                      control={form.control}
                      name="fanMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fan Mode</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-fan-mode">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="always_on">Always On</SelectItem>
                              <SelectItem value="performance">Performance (50°C)</SelectItem>
                              <SelectItem value="cool">Cool (60°C)</SelectItem>
                              <SelectItem value="balanced">Balanced (67.5°C)</SelectItem>
                              <SelectItem value="quiet">Quiet (70°C)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Temperature threshold at which the fan activates
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fanGpioPin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fan GPIO Pin</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                className="font-mono"
                                data-testid="input-fan-gpio"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fanLedPin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fan LED Pin</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                className="font-mono"
                                data-testid="input-fan-led-pin"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="fanLedMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fan LED Mode</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-40" data-testid="select-fan-led-mode">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="on">Always On</SelectItem>
                              <SelectItem value="off">Always Off</SelectItem>
                              <SelectItem value="follow">Follow Fan</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rgb" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">RGB LED Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardContent className="p-0 space-y-6">
                    <FormField
                      control={form.control}
                      name="rgbEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between gap-4">
                          <div>
                            <FormLabel>Enable RGB LEDs</FormLabel>
                            <FormDescription>
                              Turn RGB lighting on or off
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-rgb-enabled"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="bg-muted/30 rounded-lg p-4">
                      <Label className="text-sm text-muted-foreground mb-2 block">Preview</Label>
                      <RGBPreview
                        color={watchRgbColor}
                        brightness={watchRgbBrightness}
                        style={watchRgbStyle}
                        speed={watchRgbSpeed}
                        ledCount={watchRgbLedCount}
                        enabled={watchRgbEnabled}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="rgbColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={field.value}
                                onChange={field.onChange}
                                className="w-12 h-9 rounded-md border cursor-pointer"
                                data-testid="input-rgb-color"
                              />
                              <Input
                                {...field}
                                className="w-28 font-mono uppercase"
                                data-testid="input-rgb-color-hex"
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rgbBrightness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brightness: {field.value}%</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={1}
                              value={[field.value]}
                              onValueChange={(v) => field.onChange(v[0])}
                              data-testid="slider-rgb-brightness"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rgbStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Animation Style</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-rgb-style">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="solid">Solid</SelectItem>
                              <SelectItem value="breathing">Breathing</SelectItem>
                              <SelectItem value="flow">Flow</SelectItem>
                              <SelectItem value="rainbow">Rainbow</SelectItem>
                              <SelectItem value="hue_cycle">Hue Cycle</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rgbSpeed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Animation Speed: {field.value}%</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={1}
                              value={[field.value]}
                              onValueChange={(v) => field.onChange(v[0])}
                              data-testid="slider-rgb-speed"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rgbLedCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LED Count</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 4)}
                              className="w-24 font-mono"
                              data-testid="input-rgb-led-count"
                            />
                          </FormControl>
                          <FormDescription>
                            Number of RGB LEDs connected (default: 4)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="oled" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">OLED Display</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardContent className="p-0 space-y-6">
                    <FormField
                      control={form.control}
                      name="oledEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between gap-4">
                          <div>
                            <FormLabel>Enable OLED Display</FormLabel>
                            <FormDescription>
                              Show system info on the OLED screen
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-oled-enabled"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="oledRotation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rotation</FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(parseInt(v) as 0 | 180)}
                            value={String(field.value)}
                          >
                            <FormControl>
                              <SelectTrigger className="w-32" data-testid="select-oled-rotation">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Normal (0°)</SelectItem>
                              <SelectItem value="180">Flipped (180°)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="oledSleepEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between gap-4">
                          <div>
                            <FormLabel>Auto Sleep</FormLabel>
                            <FormDescription>
                              Turn off display after inactivity
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-oled-sleep"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="oledSleepTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sleep Timeout (seconds)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                              className="w-24 font-mono"
                              data-testid="input-oled-timeout"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </form>
      </Form>
    </div>
  );
}

function ConfigurationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}
