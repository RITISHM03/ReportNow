import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { reportSchema } from "@/schemas/reportSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Info,
  ArrowRight,
  MapPin,
  TriangleAlert,
  X,
  LoaderCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image as ImgIcon } from "lucide-react";
import { Textarea } from "../ui/textarea";
import Image from "next/image";
import axios from "axios";
import crypto from "crypto";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "../ui/checkbox";
import dynamic from "next/dynamic";

// Dynamically import MapLogic with SSR disabled
const MapLogic = dynamic(() => import("../MapLogic"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[200px] flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
      Loading Map...
    </div>
  ),
});

interface ReportFormProps {
  onComplete: (data: string) => void;
}

const INCIDENT_TYPES = [
  "Theft",
  "Fire Outbreak",
  "Medical Emergency",
  "Natural Disaster",
  "Violence",
  "Other",
  "Lost Item",
  "Found Item",
  "Suspicious Activity",
  "Traffic Accident",
];

export default function ReportForm({ onComplete }: ReportFormProps) {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // State for map coordinates
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportId: "",
      incidentType: "",
      location: "",
      title: "",
      description: "",
      reportType: undefined,
      status: "PENDING",
      wantsNotifications: false,
      email: "",
    },
  });

  const { handleSubmit, control, setValue, watch, getValues } = form;
  const reportType = watch("reportType");
  const wantsNotifications = watch("wantsNotifications");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await axios.post("/api/analyze-image", { image: base64 });
      const data = response.data;
      setValue("title", data.title || "");
      setValue("description", data.description || "");
      setValue("incidentType", data.incidentType || "");

      setImage(base64);
    } catch (err: any) {
      console.error("Error in analyzing image", err);
      const errorMessage = err.response?.data?.error || "Failed to analyze image. Please try again or fill details manually.";
      setError(errorMessage);
      toast({
        title: "Image Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setValue("location", data.display_name);
      } else {
        setError("Address not found for this location.");
      }
    } catch (err) {
      console.error("Error fetching address:", err);
      setError("Failed to fetch address details.");
    }
  };

  const getLocation = async () => {
    setError("");
    setLoading(true);
    setCoordinates(null);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setValue("latitude", latitude);
          setValue("longitude", longitude);

          setCoordinates({ lat: latitude, lng: longitude });

          // Use OpenStreetMap Nominatim directly instead of backend API
          await fetchAddress(latitude, longitude);

          setLoading(false);
        },
        (error) => {
          setLoading(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError("User denied the request for Geolocation.");
              break;
            case error.POSITION_UNAVAILABLE:
              setError("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              setError("The request to get user location timed out.");
              break;
            default:
              setError("An unknown error occurred.");
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLoading(false);
      setError("Geolocation is not supported by this browser.");
    }
  };

  const generateReportID = useCallback(() => {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString("hex");
    const combinedString = `${timestamp}-${randomBytes}`;
    return crypto
      .createHash("sha256")
      .update(combinedString)
      .digest("hex")
      .slice(0, 16);
  }, []);

  useEffect(() => {
    setValue("reportId", generateReportID());
  }, [generateReportID, setValue]);

  const onSubmit = async (data: z.infer<typeof reportSchema>) => {
    setIsSubmitting(true);

    if (data.wantsNotifications && (!data.email || data.email.trim() === "")) {
      setError("Email is required when notifications are enabled");
      toast({
        title: "Validation Error",
        description: "Please provide an email address for notifications",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post("/api/reports/create", {
        ...data,
        image,
      });
      onComplete(response?.data.reportId);
    } catch (err) {
      let displayError = "Something went wrong.";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        displayError = err.response.data.error;
      }
      setError(displayError);
      toast({
        title: "Error in submitting report",
        description: displayError,
        variant: "destructive",
      });
    } finally {
      console.log("Resetting isSubmitting state");
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <button
            type="button"
            onClick={() => setValue("reportType", "EMERGENCY")}
            className={`border-2 px-16 py-6 rounded-2xl transition-all ${reportType === "EMERGENCY"
              ? "bg-red-500/10 border-red-500 shadow-lg shadow-red-500/20"
              : "border-white/10 hover:bg-red-500/10 hover:border-red-500"
              }`}
          >
            <div className="flex flex-col justify-center items-center space-y-2">
              <TriangleAlert className="text-red-500 w-8 h-8" />
              <span className="text-red-500 font-medium">Emergency</span>
              <span className="text-zinc-400 text-xs">
                Immediate Response Required
              </span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setValue("reportType", "NON_EMERGENCY")}
            className={`border-2 px-16 py-6 rounded-2xl transition-all ${reportType === "NON_EMERGENCY"
              ? "bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/20"
              : "border-white/10 hover:bg-orange-500/10 hover:border-orange-500"
              }`}
          >
            <div className="flex flex-col justify-center items-center space-y-2">
              <Info className="text-orange-500 w-8 h-8" />
              <span className="text-orange-500 font-medium">Non-Emergency</span>
              <span className="text-zinc-400 text-xs">General Report</span>
            </div>
          </button>
        </div>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            id="image-upload"
            className="hidden"
            ref={fileInputRef}
          />
          <label
            htmlFor="image-upload"
            className={`border-2 px-8 py-8 w-full block rounded-lg border-dashed border-white/10 hover:border-sky-400/50 hover:bg-sky-400/10 transition-colors
            ${image && "border-sky-400/50 bg-sky-400/10"}`}
          >
            {!image ? (
              <div className="flex flex-col justify-center items-center space-y-4">
                <ImgIcon className="w-11 h-11 text-zinc-500" />
                <span className="text-sm text-zinc-400">
                  Drop an image here or click to upload
                </span>
              </div>
            ) : (
              <div className="flex justify-center items-center relative">
                <div
                  className="absolute top-2 right-2 bg-zinc-800 p-2 rounded-full hover:bg-zinc-700 cursor-pointer z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeImage();
                  }}
                >
                  <X className="text-white w-5 h-5" />
                </div>
                <Image
                  src={image}
                  alt="Uploaded image"
                  width={500}
                  height={500}
                  className="rounded-xl object-cover max-h-[300px]"
                />
              </div>
            )}
          </label>
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/70 rounded-lg flex justify-center items-center z-20">
              <div className="flex justify-center items-center gap-2">
                <LoaderCircle className="text-sky-500 animate-spin h-5 w-5" />
                <span className="text-sky-500 font-medium">
                  Analyzing image...
                </span>
              </div>
            </div>
          )}
        </div>
        <FormField
          control={control}
          name="incidentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incident Type</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full border-zinc-800 bg-zinc-900/50">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="relative">
                    <Input placeholder="Enter a location or use pin" {...field} className="bg-zinc-900/50 border-zinc-800" />
                    <button
                      type="button"
                      className={`absolute bg-sky-500/10 p-2 rounded-lg top-[5px] right-2 hover:bg-sky-500/20 transition-colors ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
                      onClick={getLocation}
                      disabled={loading}
                    >
                      {loading ? (
                        <LoaderCircle className="text-sky-500 animate-spin h-5 w-5" />
                      ) : (
                        <MapPin className="text-sky-500 w-5 h-5" />
                      )}
                    </button>
                    {error && (
                      <p className="text-sm text-red-500 mt-2">
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Map Integration */}
                  {coordinates && (
                    <div className="w-full h-[250px] rounded-xl overflow-hidden shadow-lg border border-zinc-700 mt-4">
                      <MapLogic location={coordinates} />
                    </div>
                  )}
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Report Title</FormLabel>
              <FormControl>
                <Input placeholder="Brief title of the incident" {...field} className="bg-zinc-900/50 border-zinc-800" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea className="h-[150px] bg-zinc-900/50 border-zinc-800" placeholder="Please describe what happened..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="wantsNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-white/10 p-4 bg-zinc-900/30">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Receive Email Notifications</FormLabel>
                <FormDescription>
                  Get updates about your report status via email
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {wantsNotifications && (
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    {...field}
                    className="bg-zinc-900/50 border-zinc-800"
                  />
                </FormControl>
                <FormDescription>
                  We&apos;ll send updates about your report to this email address
                </FormDescription>
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="group bg-blue-600 hover:bg-blue-700 w-full h-11 rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="text-white animate-spin h-5 w-5 mr-2" />
              Submitting...
            </>
          ) : (
            <>
              Submit Report{" "}
              <ArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
