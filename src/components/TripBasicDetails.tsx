// Updated Basic Details Step Component
import { Card } from "@/components/ui/card";
import { Send, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { DollarSign } from "lucide-react";
import { Users } from "lucide-react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const TripBasicDetails = ({ data, onUpdate, onNext, onSave, saving }: any) => {
    const isValid = data.destination && data.startDate && data.endDate && data.budget;
  
    return (
      <Card className="p-8 shadow-card-travel">
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-bold mb-2">Tell us about your trip</h2>
          <p className="text-muted-foreground">We'll use this information to create your perfect itinerary</p>
        </div>
  
        <div className="space-y-6">
          <div>
            <Label htmlFor="destination" className="text-base font-medium">
              Where do you want to go?
            </Label>
            <div className="relative mt-2">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input 
                id="destination"
                placeholder="e.g., Goa, Rajasthan, Kerala..."
                value={data.destination}
                onChange={(e) => onUpdate({ destination: e.target.value })}
                className="pl-10 h-12"
              />
            </div>
          </div>
  
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-base font-medium">
                Start Date
              </Label>
              <div className="relative mt-2">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input 
                  id="startDate"
                  type="date"
                  value={data.startDate}
                  onChange={(e) => onUpdate({ startDate: e.target.value })}
                  className="pl-10 h-12"
                />
              </div>
            </div>
  
            <div>
              <Label htmlFor="endDate" className="text-base font-medium">
                End Date
              </Label>
              <div className="relative mt-2">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input 
                  id="endDate"
                  type="date"
                  value={data.endDate}
                  onChange={(e) => onUpdate({ endDate: e.target.value })}
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </div>
  
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget" className="text-base font-medium">
                Budget (₹)
              </Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input 
                  id="budget"
                  placeholder="e.g., 50,000"
                  value={data.budget}
                  onChange={(e) => onUpdate({ budget: e.target.value })}
                  className="pl-10 h-12"
                />
              </div>
            </div>
  
            <div>
              <Label htmlFor="travelers" className="text-base font-medium">
                Number of Travelers
              </Label>
              <div className="relative mt-2">
                <Users className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input 
                  id="travelers"
                  type="number"
                  min="1"
                  value={data.travelers}
                  onChange={(e) => onUpdate({ travelers: e.target.value })}
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </div>
  
          <div>
            <Label htmlFor="requests" className="text-base font-medium">
              Special Requests (Optional)
            </Label>
            <Textarea 
              id="requests"
              placeholder="Any specific requirements, accessibility needs, or special occasions..."
              value={data.specialRequests}
              onChange={(e) => onUpdate({ specialRequests: e.target.value })}
              className="mt-2 min-h-[100px]"
            />
          </div>
  
          <div className="flex gap-3">
            <Button 
              onClick={onNext}
              disabled={!isValid}
              variant="ocean"
              size="lg"
              className="flex-1"
            >
              <Send className="w-5 h-5 mr-2" />
              Continue to Preferences
            </Button>
            
            <Button 
              onClick={onSave}
              disabled={saving || !data.destination}
              variant="outline"
              size="lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  export default TripBasicDetails;