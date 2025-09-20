// components/TripPreferences.tsx - Updated with Firebase integration
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mountain, 
  Waves, 
  Camera, 
  Utensils, 
  ShoppingBag, 
  Music, 
  TreePine,
  Building2,
  Heart,
  Star,
  Compass,
  Sparkles,
  Save
} from "lucide-react";

interface TripPreferencesProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onSave: () => void;
  saving: boolean;
}

const preferenceOptions = [
  { id: "adventure", label: "Adventure", icon: Mountain, color: "bg-gradient-adventure" },
  { id: "beach", label: "Beach & Coastal", icon: Waves, color: "bg-gradient-ocean" },
  { id: "cultural", label: "Cultural Heritage", icon: Building2, color: "bg-gradient-sunset" },
  { id: "food", label: "Food & Cuisine", icon: Utensils, color: "bg-primary" },
  { id: "photography", label: "Photography", icon: Camera, color: "bg-accent" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, color: "bg-secondary" },
  { id: "nightlife", label: "Nightlife", icon: Music, color: "bg-destructive" },
  { id: "nature", label: "Nature & Wildlife", icon: TreePine, color: "bg-gradient-adventure" },
  { id: "wellness", label: "Wellness & Spa", icon: Heart, color: "bg-gradient-sunset" },
  { id: "luxury", label: "Luxury Experience", icon: Star, color: "bg-gradient-hero" },
];

const TripPreferences = ({ data, onUpdate, onNext, onSave, saving }: TripPreferencesProps) => {
  const togglePreference = (prefId: string) => {
    const currentPrefs = data.preferences || [];
    const newPrefs = currentPrefs.includes(prefId)
      ? currentPrefs.filter((p: string) => p !== prefId)
      : [...currentPrefs, prefId];
    
    onUpdate({ preferences: newPrefs });
  };

  return (
    <div className="space-y-8">
      <Card className="p-8 shadow-card-travel">
        <div className="text-center mb-8">
          <Compass className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-bold mb-2">What interests you most?</h2>
          <p className="text-muted-foreground">
            Select your travel preferences to get personalized recommendations
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {preferenceOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = (data.preferences || []).includes(option.id);
            
            return (
              <Card
                key={option.id}
                className={`p-6 cursor-pointer transition-all border-2 hover:shadow-travel ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-travel' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => togglePreference(option.id)}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-sm">{option.label}</h3>
                  {isSelected && (
                    <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20">
                      Selected
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-2 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            AI Recommendations
          </h3>
          <p className="text-sm text-muted-foreground">
            Based on your destination <strong>{data.destination}</strong> and preferences, 
            our AI will suggest the best activities, restaurants, and hidden gems that match your interests.
          </p>
        </div>

        {(data.preferences || []).length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-3">Selected Preferences:</h4>
            <div className="flex flex-wrap gap-2">
              {(data.preferences || []).map((prefId: string) => {
                const option = preferenceOptions.find(opt => opt.id === prefId);
                if (!option) return null;
                
                const Icon = option.icon;
                return (
                  <Badge 
                    key={prefId} 
                    variant="secondary" 
                    className="bg-primary/10 text-primary border-primary/20 px-3 py-1"
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {option.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            onClick={onNext}
            variant="ocean"
            size="lg"
            className="flex-1"
            disabled={(data.preferences || []).length === 0 || saving}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate My Itinerary
          </Button>

          <Button 
            onClick={onSave}
            disabled={saving}
            variant="outline"
            size="lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TripPreferences;