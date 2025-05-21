import { z } from 'zod';

export const fuelStationRegistrationSchema = z.object({
  stationName: z.string().min(3, { message: "Station name must be at least 3 characters long." }),
  contactPerson: z.string().min(3, { message: "Contact person name must be at least 3 characters long." }),
  phone: z.string()
    .min(10, { message: "Phone number must be at least 10 digits."})
    .regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, { message: "Invalid phone number format. Expected format like +1 1234567890 or 1234567890." }),
  email: z.string().email({ message: "Invalid email address." }),
  address: z.string().min(10, { message: "Address must be at least 10 characters long." }),
  operatingHours: z.string().min(5, { message: "Operating hours must be at least 5 characters. E.g., 9 AM - 5 PM" }),
});

export type FuelStationRegistrationData = z.infer<typeof fuelStationRegistrationSchema>;
