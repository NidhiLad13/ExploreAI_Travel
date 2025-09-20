import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, DollarSign, Star, Sparkles, Globe, Clock, Users, User, LogIn } from 'lucide-react';
import heroImage from '@/assets/hero-travel.jpg';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import { firebaseService } from "@/services/firebaseService";

const MainApp = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [tripCount, setTripCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleStartPlanning = () => {
    if (currentUser) {
      navigate('/planner');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleDashboard = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  // Load user trips count when user is authenticated
  useEffect(() => {
    const loadTrips = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          const trips = await firebaseService.getUserTrips(currentUser.uid);
          setTripCount(trips.length);
        } catch (error) {
          console.error('Error loading trips:', error);
          setTripCount(0);
        } finally {
          setLoading(false);
        }
      } else {
        setTripCount(0);
      }
    };

    loadTrips();
  }, [currentUser]);

  // If there's an outlet (nested route), render it
  if (window.location.pathname !== '/') {
    return <Outlet />;
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 p-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="text-white font-bold text-xl">
              TripAI
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <Button variant="glass" onClick={handleDashboard}>
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <div className="text-white text-sm">
                    Welcome, {currentUser.displayName || 'Traveler'}!
                  </div>
                </>
              ) : (
                <Button variant="glass" onClick={() => setShowAuthModal(true)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${heroImage})` }} 
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-hero/30" />
          
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Trip Planning
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Your Perfect Trip
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Planned by AI
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Get personalized itineraries that adapt to your budget, interests, and real-time conditions. Book everything in one click.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="xl" 
                onClick={handleStartPlanning}
                className="shadow-2xl"
              >
                <Calendar className="w-6 h-6 mr-2" />
                Start Planning Now
              </Button>
              <Button variant="glass" size="xl">
                <Globe className="w-6 h-6 mr-2" />
                Explore Destinations
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose Our AI Planner?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Advanced AI technology meets local expertise to create unforgettable travel experiences
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-6 shadow-card-travel hover:shadow-travel transition-smooth border-0 bg-gradient-to-br from-white to-blue-50">
                <div className="w-12 h-12 bg-gradient-ocean rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Destinations</h3>
                <p className="text-muted-foreground">
                  AI analyzes millions of data points to suggest hidden gems and perfect matches for your interests.
                </p>
              </Card>

              <Card className="p-6 shadow-card-travel hover:shadow-travel transition-smooth border-0 bg-gradient-to-br from-white to-orange-50">
                <div className="w-12 h-12 bg-gradient-sunset rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Budget Optimization</h3>
                <p className="text-muted-foreground">
                  Get maximum value with intelligent budget allocation across accommodation, transport, and activities.
                </p>
              </Card>

              <Card className="p-6 shadow-card-travel hover:shadow-travel transition-smooth border-0 bg-gradient-to-br from-white to-green-50">
                <div className="w-12 h-12 bg-gradient-adventure rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
                <p className="text-muted-foreground">
                  Adaptive itineraries that adjust for weather, events, and unexpected opportunities.
                </p>
              </Card>

              <Card className="p-6 shadow-card-travel hover:shadow-travel transition-smooth border-0 bg-gradient-to-br from-white to-purple-50">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">One-Click Booking</h3>
                <p className="text-muted-foreground">
                  Seamlessly book flights, hotels, and experiences through our integrated platform.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* User Stats Section (if logged in) */}
        {currentUser && (
          <section className="py-20 bg-muted/30">
            <div className="max-w-4xl mx-auto text-center px-6">
              <h2 className="text-3xl font-bold mb-8">Your Travel Journey</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {loading ? '...' : tripCount}
                  </div>
                  <div className="text-muted-foreground">Trips Planned</div>
                </Card>
                
                <Card className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">0</div>
                  <div className="text-muted-foreground">Countries Visited</div>
                </Card>
                
                <Card className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">0</div>
                  <div className="text-muted-foreground">Money Saved</div>
                </Card>
              </div>
              
              <Button 
                className="mt-8" 
                variant="ocean" 
                size="lg" 
                onClick={handleDashboard}
              >
                View Dashboard
              </Button>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-gradient-hero text-white">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl font-bold mb-4">Ready for Your Next Adventure?</h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of travelers who trust AI to plan their perfect trips
            </p>
            <Button variant="glass" size="xl" onClick={handleStartPlanning}>
              <Star className="w-6 h-6 mr-2" />
              Create My Trip
            </Button>
          </div>
        </section>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default MainApp;