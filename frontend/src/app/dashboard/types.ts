// Common types used across the dashboard

export interface UserData {
  name: string;
  email: string;
  role: 'VEHICLE_OWNER' | 'FUEL_STATION_OWNER' | 'FUEL_STATION_OPERATOR' | 'ADMIN_USER';
  quota?: {
    remaining: number;
    total: number;
    lastUpdated: string;
  };
  vehicles?: Vehicle[];
  stations?: FuelStation[];
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  fuelType: string;
  capacity: number;
  remainingQuota: number;
  totalQuota: number;
}

export interface FuelStation {
  id: string;
  name: string;
  location: string;
  availableFuel: {
    petrol: number;
    diesel: number;
    kerosene: number;
  };
}

export interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  location: string;
  status: string;
}

export type SidebarLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
  current: boolean;
};
