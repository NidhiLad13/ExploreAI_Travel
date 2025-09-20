// components/TripPlanner.tsx - Updated with React Router
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import TripPreferences from "@/components/TripPreferences";
import ItineraryDisplay from "@/components/ItineraryDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { firebaseService } from "@/services/firebaseService";
import { toast } from "@/hooks/use-toast";
import AuthModal from "./auth/AuthModal";
import TripBasicDetails from "./TripBasicDetails";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { tripPlannerPrompt } from "../prompt";

interface TripPlannerProps {
  editTripId?: string;
}

export enum TripStatus {
  draft = "draft",
  planned = "planned",
  booked = "booked",
  completed = "completed"
}

const TripPlanner = ({ editTripId: propEditTripId }: TripPlannerProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const editTripId = propEditTripId || id;
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [promptResponses, setpromptResponses] = useState([]);
  const { currentUser } = useAuth();

  const genAI = new GoogleGenerativeAI(
    import.meta.env.VITE_GEMINI_API_KEY
  );
  
    const [tripData, setTripData] = useState({
    destination: "",
    startDate: "",  
    endDate: "",
    budget: "",
    travelers: "1",
    preferences: [] as string[],
    specialRequests: "",
    status: TripStatus.draft,
    itinerary: []
  });
  console.log(tripData ,"****tripdata")

  // Load existing trip data if editing
  React.useEffect(() => {
    if (editTripId && currentUser) {
      loadTripData(editTripId);
    }
  }, [editTripId, currentUser]);

  const loadTripData = async (tripId: string) => {
    try {
      const trip = await firebaseService.getTrip(tripId);
      if (trip && trip.userId === currentUser?.uid) {
        setTripData({
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          budget: trip.budget,
          travelers: trip.travelers,
          preferences: trip.preferences,
          specialRequests: trip.specialRequests,
          status: trip.status as TripStatus,
          itinerary: trip.itinerary
        });
      }
    } catch (error) {
      console.error('Error loading trip:', error);
      toast({
        title: "Error",
        description: "Failed to load trip data",
        variant: "destructive"
      });
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const updateTripData = (data: Partial<typeof tripData>) => {
    setTripData(prev => ({ ...prev, ...data }));
  };

  const saveTripData = async (status: TripStatus = TripStatus.draft) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      setSaving(true);
      
      const tripPayload = {
        ...tripData,
        userId: currentUser.uid,
        status
      };


      let tripId: string;
      
      if (editTripId) {
        await firebaseService.updateTrip(editTripId, tripPayload);
        tripId = editTripId;
      } else {
        tripId = await firebaseService.createTrip(tripPayload);
      }

      toast({
        title: "Success",
        description: editTripId ? "Trip updated successfully!" : "Trip saved successfully!",
      });

      return tripId;
    } catch (error) {
      console.error('Error saving trip:', error);
      toast({
        title: "Error",
        description: "Failed to save trip",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  console.log(promptResponses, "***")

  const getResponseForGivenPrompt = async (input: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(input);
      const response = await result.response;
      const text = await response.text();
      // Remove Markdown fences if present
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

      const parsedResponse = JSON.parse(cleanText);
      const updatedResponses = [...promptResponses, parsedResponse];
      
      // Update both states in a way that ensures consistency
      setpromptResponses(updatedResponses);
      setTripData(prevTripData => ({
        ...prevTripData,
        itinerary: updatedResponses
      }));
      
      return updatedResponses;
    } catch (error) {
      console.error("Error generating response:", error);
      throw error; // Re-throw to handle in the calling function
    }
  };

    
  const handleGenerateItinerary = async () => {

    const { destination, startDate, endDate, budget, travelers, preferences, specialRequests } = tripData
    // And update the usage:
    const systemPrompt = tripPlannerPrompt
    .replace("[destination]", destination)
    .replace("[startDate]", startDate)
    .replace("[endDate]", endDate)
    .replace("[budget]", budget)
    .replace("[travelers]", travelers)
    .replace("[preferences]", preferences.map((preference) => `"${preference}"`).join(", "))
    .replace("[specialRequests]", specialRequests);

    const updatedResponses = await getResponseForGivenPrompt(systemPrompt);
    
    // Save the trip with the updated itinerary
    const tripId = await saveTripData(TripStatus.planned);
    if (tripId) {
      handleNext();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-hero text-white p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="glass" size="icon" onClick={handleBack} className="mr-4">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {editTripId ? 'Edit Trip' : 'AI Trip Planner'}
                </h1>
                <p className="text-white/80">Let's create your perfect itinerary</p>
              </div>
            </div>
            
            {/* Save Draft Button */}
            {currentUser && step < 3 && (
              <Button 
                variant="glass" 
                onClick={() => saveTripData( TripStatus.draft)}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Step {step} of 3</span>
              <span className="text-sm text-muted-foreground">
                {step === 1 ? "Basic Details" : step === 2 ? "Preferences" : "Your Itinerary"}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-ocean h-2 rounded-full transition-smooth"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {step === 1 && (
            <TripBasicDetails 
              data={tripData} 
              onUpdate={updateTripData} 
              onNext={handleNext}
              onSave={() => saveTripData(TripStatus.draft)}
              saving={saving}
            />
          )}
          {step === 2 && (
            <TripPreferences 
              data={tripData} 
              onUpdate={updateTripData} 
              onNext={handleGenerateItinerary}
              onSave={() => saveTripData(TripStatus.draft)}
              saving={saving}
            />
          )}
          {step === 3 && promptResponses.length > 0 && (
            <ItineraryDisplay 
              tripData={tripData}
              onSave={() => saveTripData(TripStatus.planned)}
              saving={saving}
            />
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default TripPlanner;