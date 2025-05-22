import { FuelStationRegistrationForm } from "@/components/fuel-station/registration-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-2xl shadow-xl rounded-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Fuel className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-semibold">Fuel Station Registration</CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            Please fill in the details below to register your fuel station.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <FuelStationRegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}
