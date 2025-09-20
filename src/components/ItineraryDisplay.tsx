// components/ItineraryDisplay.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Sparkles,
  Plane,
  Bus,
  Train,
  Ship,
  Mountain,
  Umbrella,
  Utensils,
  Camera,
  Wifi,
  Map,
  Compass,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { firebaseService } from "@/services/firebaseService";
import { toast } from "@/hooks/use-toast";

// ✅ Type interfaces
interface Activity {
  time: string;
  activity: string;
  location: string;
  cost: number;
  duration: string;
}
interface DayItinerary {
  day: number;
  date: string;
  activities: Activity[];
}
interface TripPlan {
  destination: {
    name: string;
    country: string;
    overview: string;
    bestTimeToVisit: string;
  };
  dates: {
    startDate: string;
    endDate: string;
    duration: string;
  };
  budget: {
    totalBudget: number;
    currency: string;
    breakdown: {
      accommodation: number;
      transportation: number;
      food: number;
      activities: number;
      miscellaneous: number;
    };
  };
  itinerary: DayItinerary[];
}
interface ItineraryDisplayProps {
  tripData: {
    itinerary: Array<{
      tripPlan: TripPlan;
    }>;
  };
  tripId?: string;
}

// ✅ Currency formatter with fallback
const formatCurrency = (amount: number, currency?: string) => {
  const safeCurrency = currency && currency.trim() ? currency : "USD";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
};

// ✅ Icon chooser
const getActivityIcon = (activity: string) => {
  const lower = activity.toLowerCase();
  if (lower.includes("airport") || lower.includes("flight"))
    return <Plane className="h-4 w-4 mr-2" />;
  if (lower.includes("train") || lower.includes("metro"))
    return <Train className="h-4 w-4 mr-2" />;
  if (lower.includes("bus") || lower.includes("shuttle"))
    return <Bus className="h-4 w-4 mr-2" />;
  if (lower.includes("boat") || lower.includes("ferry"))
    return <Ship className="h-4 w-4 mr-2" />;
  if (lower.includes("hike") || lower.includes("walk") || lower.includes("trek"))
    return <Mountain className="h-4 w-4 mr-2" />;
  if (lower.includes("beach") || lower.includes("swim"))
    return <Umbrella className="h-4 w-4 mr-2" />;
  if (
    lower.includes("food") ||
    lower.includes("eat") ||
    lower.includes("dinner") ||
    lower.includes("lunch") ||
    lower.includes("breakfast")
  )
    return <Utensils className="h-4 w-4 mr-2" />;
  if (lower.includes("photo") || lower.includes("camera"))
    return <Camera className="h-4 w-4 mr-2" />;
  if (lower.includes("wifi") || lower.includes("internet"))
    return <Wifi className="h-4 w-4 mr-2" />;
  if (lower.includes("map") || lower.includes("navigate"))
    return <Map className="h-4 w-4 mr-2" />;
  if (lower.includes("explore") || lower.includes("discover"))
    return <Compass className="h-4 w-4 mr-2" />;
  if (lower.includes("morning") || lower.includes("sunrise"))
    return <Sun className="h-4 w-4 mr-2" />;
  if (lower.includes("night") || lower.includes("sunset"))
    return <Moon className="h-4 w-4 mr-2" />;
  return <Sparkles className="h-4 w-4 mr-2" />;
};

const ItineraryDisplay = ({ tripData, tripId }: ItineraryDisplayProps) => {
  const { currentUser } = useAuth();
  const tripPlan = tripData?.itinerary?.[0]?.tripPlan;

  if (!tripPlan) return <p>No trip data available</p>;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-6">
          Your {tripPlan.dates.duration} Itinerary
        </h2>
        <div className="space-y-8">
          {tripPlan.itinerary.map((day) => (
            <Card key={day.day} className="overflow-hidden">
              <div className="bg-primary/5 p-4 border-b">
                <h3 className="font-medium">Day {day.day}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(day.date)}
                </p>
              </div>
              <div className="divide-y">
                {day.activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="bg-primary/10 p-2 rounded-full mt-1">
                      {getActivityIcon(activity.activity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-medium">{activity.activity}</h4>
                        <Badge variant="outline" className="ml-2 whitespace-nowrap">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.time}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {activity.location}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.duration}
                        </Badge>
                        {activity.cost > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {formatCurrency(
                              activity.cost,
                              tripPlan.budget.currency
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ItineraryDisplay;
