'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Fuel, Edit3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-lg shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="items-center text-center bg-primary/10 p-8">
          <Fuel className="w-20 h-20 text-primary mb-4" />
          <CardTitle className="text-4xl font-bold text-primary">
            FuelFlow Station Portal
          </CardTitle>
          <CardDescription className="text-lg text-foreground/80 mt-2">
            Streamline Your Fuel Station Management
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-8 text-base leading-relaxed">
            Welcome to the FuelFlow Station Portal. Register your fuel station to
            efficiently manage quotas, track distribution, and serve your customers
            better during critical times.
          </p>

          <Image
            src="https://picsum.photos/800/400"
            alt="Fuel station illustration"
            width={800}
            height={400}
            className="rounded-lg mb-8 shadow-md"
            priority
          />

          <Button asChild size="lg" className="w-full text-lg py-6">
            <Link href="/register">
              <Edit3 className="mr-2 h-5 w-5" />
              Register Your Fuel Station
            </Link>
          </Button>
        </CardContent>

        <CardFooter className="bg-secondary/50 p-6 justify-center">
          <p className="text-sm text-muted-foreground">
            Secure & Reliable Fuel Management.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
