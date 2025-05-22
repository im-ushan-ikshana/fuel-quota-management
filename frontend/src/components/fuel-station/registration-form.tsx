"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fuelStationRegistrationSchema, type FuelStationRegistrationData } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, User, Phone, Mail, MapPin, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";


// Mock API call function
async function registerFuelStationApi(data: FuelStationRegistrationData): Promise<{ success: boolean; message: string }> {
  console.log("Submitting registration data to API:", data);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate API response
  if (data.stationName.toLowerCase().includes("testfail")) {
    return { success: false, message: "Registration failed: This station name is blacklisted." };
  }
  if (Math.random() < 0.8) { // 80% success rate
    return { success: true, message: `Station "${data.stationName}" registered successfully! A confirmation email has been sent to ${data.email}.` };
  } else {
    return { success: false, message: "An unexpected error occurred on the server. Please try again later." };
  }
}


export function FuelStationRegistrationForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<FuelStationRegistrationData>({
    resolver: zodResolver(fuelStationRegistrationSchema),
    defaultValues: {
      stationName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      operatingHours: "",
    },
  });

  async function onSubmit(data: FuelStationRegistrationData) {
    setIsLoading(true);
    try {
      const response = await registerFuelStationApi(data);
      if (response.success) {
        toast({
          title: (
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Success!
            </div>
          ),
          description: response.message,
          variant: "default",
          className: "bg-green-50 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300",
        });
        form.reset();
      } else {
        toast({
          title: (
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
              Registration Failed
            </div>
          ),
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: (
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
              Error
            </div>
          ),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const inputFields = [
    { name: "stationName" as const, label: "Station Name", placeholder: "e.g., City Central Fuel", icon: Store, type: "text" },
    { name: "contactPerson" as const, label: "Contact Person", placeholder: "e.g., John Doe", icon: User, type: "text" },
    { name: "phone" as const, label: "Contact Phone", placeholder: "e.g., +1 123 456 7890", icon: Phone, type: "tel" },
    { name: "email" as const, label: "Contact Email", placeholder: "e.g., contact@station.com", icon: Mail, type: "email" },
    { name: "address" as const, label: "Station Address", placeholder: "e.g., 123 Main St, Anytown, USA", icon: MapPin, type: "textarea" as const },
    { name: "operatingHours" as const, label: "Operating Hours", placeholder: "e.g., Mon-Fri 8 AM - 8 PM, Sat-Sun 9 AM - 6 PM", icon: Clock, type: "text" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          {inputFields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem className={field.type === "textarea" ? "md:col-span-2" : ""}>
                  <FormLabel className="flex items-center text-sm font-medium">
                    <field.icon className="mr-2 h-4 w-4 text-primary" />
                    {field.label}
                  </FormLabel>
                  <FormControl>
                    {field.type === "textarea" ? (
                      <Textarea
                        placeholder={field.placeholder}
                        className="resize-none"
                        rows={3}
                        {...formField}
                        disabled={isLoading}
                      />
                    ) : (
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        {...formField}
                        disabled={isLoading}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        
        <Button type="submit" className="w-full py-3 text-base font-semibold" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Registering...
            </>
          ) : (
            "Register Station"
          )}
        </Button>
      </form>
    </Form>
  );
}
