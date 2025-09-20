import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Calendar, 
  DollarSign, 
  Edit3, 
  Trash2, 
  Plus, 
  Search,
  Heart,
  Settings,
  LogOut,
  Plane
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { firebaseService, TripData } from '@/services/firebaseService';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
// Import your TripPlanner component
import TripPlanner from '@/components/TripPlanner'; // Adjust path as needed

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'trips' | 'saved' | 'profile'>('trips');
  const [trips, setTrips] = useState<TripData[]>([]);
  const [savedTrips, setSavedTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'planned' | 'booked' | 'completed'>('all');
  const [showTripPlanner, setShowTripPlanner] = useState(false);
  const [editTripId, setEditTripId] = useState<string | undefined>();
  const [savedTripIds, setSavedTripIds] = useState<string[]>([]);

  const { currentUser, logout } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async (preserveSavedState: boolean = false) => {
    try {
      setLoading(true);
      if (!currentUser) return;

      // Load user's trips
      const userTrips = await firebaseService.getUserTrips(currentUser.uid);
      console.log(userTrips, '******user');
      setTrips(userTrips || []);

      // Load saved trips and saved trip IDs (only if not preserving state)
      if (!preserveSavedState) {
        const userProfile = await firebaseService.getUserProfile(currentUser.uid);
        if (userProfile?.savedTrips) {
          setSavedTripIds(userProfile.savedTrips);
          const savedTripPromises = userProfile.savedTrips.map(async (tripId: string) => {
            try {
              return await firebaseService.getTrip(tripId);
            } catch (err) {
              console.warn(`Could not fetch trip ${tripId}`, err);
              return null;
            }
          });
          const savedTripsData = await Promise.all(savedTripPromises);
          setSavedTrips(savedTripsData.filter(Boolean) as TripData[]);
        } else {
          // Initialize empty arrays if no saved trips
          setSavedTripIds([]);
          setSavedTrips([]);
        }
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load your data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async (tripId: string) => {
    if (!currentUser) return;

    try {
      const isCurrentlySaved = savedTripIds.includes(tripId);
      
      if (isCurrentlySaved) {
        // Unsave the trip
        await firebaseService.unsaveTrip(currentUser.uid, tripId);
        const newSavedIds = savedTripIds.filter(id => id !== tripId);
        setSavedTripIds(newSavedIds);
        setSavedTrips(prev => prev.filter(trip => trip.id !== tripId));
        toast({
          title: 'Trip removed',
          description: 'Trip removed from your saved trips'
        });
      } else {
        // Save the trip
        await firebaseService.saveTrip(currentUser.uid, tripId);
        const newSavedIds = [...savedTripIds, tripId];
        setSavedTripIds(newSavedIds);
        
        // Add to saved trips list if we have the trip data
        const tripData = trips.find(trip => trip.id === tripId);
        if (tripData) {
          setSavedTrips(prev => [tripData, ...prev]);
        }
        
        toast({
          title: 'Trip saved',
          description: 'Trip added to your saved trips'
        });
      }
    } catch (error: any) {
      console.error('Error saving/unsaving trip:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save trip',
        variant: 'destructive'
      });
    }
  };

  const handleUnsaveFromSavedPage = async (tripId: string) => {
    if (!currentUser) return;

    try {
      await firebaseService.unsaveTrip(currentUser.uid, tripId);
      const newSavedIds = savedTripIds.filter(id => id !== tripId);
      setSavedTripIds(newSavedIds);
      setSavedTrips(prev => prev.filter(trip => trip.id !== tripId));
      toast({
        title: 'Trip removed',
        description: 'Trip removed from your saved trips'
      });
    } catch (error: any) {
      console.error('Error unsaving trip:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to remove saved trip',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      await firebaseService.deleteTrip(tripId);
      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      
      // Also remove from saved trips if it was saved
      if (savedTripIds.includes(tripId)) {
        const newSavedIds = savedTripIds.filter(id => id !== tripId);
        setSavedTrips(prev => prev.filter(trip => trip.id !== tripId));
        setSavedTripIds(newSavedIds);
      }
      
      toast({
        title: 'Trip deleted',
        description: 'Your trip has been successfully deleted'
      });
    } catch (error: any) {
      console.error('Error deleting trip:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete trip',
        variant: 'destructive'
      });
    }
  };

  const handleEditTrip = (tripId: string) => {
    setEditTripId(tripId);
    setShowTripPlanner(true);
  };

  const handleNewTrip = () => {
    setEditTripId(undefined); // Clear edit mode
    setShowTripPlanner(true);
  };

  // Handle trip planner close and refresh data
  const handleTripPlannerClose = () => {
    setShowTripPlanner(false);
    setEditTripId(undefined);
    // Refresh trips data after closing planner but preserve saved state
    if (currentUser) {
      loadUserData(true); // Pass true to preserve saved state
    }
  };

  // Handle successful trip save/update
  const handleTripSaved = (tripData: TripData) => {
    setShowTripPlanner(false);
    setEditTripId(undefined);
    
    if (editTripId) {
      // Update existing trip in state
      setTrips(prev => prev.map(trip => 
        trip.id === editTripId ? { ...tripData, id: editTripId } : trip
      ));
      
      // Update in saved trips if it exists there
      setSavedTrips(prev => prev.map(trip => 
        trip.id === editTripId ? { ...tripData, id: editTripId } : trip
      ));
      
      toast({
        title: 'Trip updated',
        description: 'Your trip has been successfully updated'
      });
    } else {
      // Add new trip to state
      setTrips(prev => [tripData, ...prev]);
      toast({
        title: 'Trip created',
        description: 'Your new trip has been successfully created'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/planner');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const destination = trip.destination || '';
    const matchesSearch = destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || trip.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'booked': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // If trip planner is open, show it instead of dashboard
  if (showTripPlanner) {
    return (
      <TripPlanner
        isEditing={!!editTripId}
        editTripId={editTripId}
        onClose={handleTripPlannerClose}
        onTripSaved={handleTripSaved}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-white p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {currentUser?.displayName || 'Traveler'}!</h1>
              <p className="text-white/80">Manage your trips and plan new adventures</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="glass" onClick={handleNewTrip}>
              <Plus className="w-5 h-5 mr-2" />
              New Trip
            </Button>
            <Button variant="glass" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6 w-fit">
          <Button variant={activeTab === 'trips' ? 'ocean' : 'ghost'} size="sm" onClick={() => setActiveTab('trips')}>
            <Plane className="w-4 h-4 mr-2" />
            My Trips ({trips.length})
          </Button>
          <Button variant={activeTab === 'saved' ? 'ocean' : 'ghost'} size="sm" onClick={() => setActiveTab('saved')}>
            <Heart className="w-4 h-4 mr-2" />
            Saved ({savedTrips.length})
          </Button>
          <Button variant={activeTab === 'profile' ? 'ocean' : 'ghost'} size="sm" onClick={() => setActiveTab('profile')}>
            <Settings className="w-4 h-4 mr-2" />
            Profile
          </Button>
        </div>

        {/* My Trips */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Search trips by destination..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <div className="flex space-x-2">
                {['all', 'draft', 'planned'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'ocean' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status as any)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Trips Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-3 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </Card>
                ))}
              </div>
            ) : filteredTrips.length === 0 ? (
              <Card className="p-12 text-center">
                <Plane className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No trips found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start planning your first adventure!'}
                </p>
                <Button onClick={handleNewTrip} variant="ocean">
                  <Plus className="w-5 h-5 mr-2" />
                  Plan Your First Trip
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map((trip) => (
                  <Card key={trip.id} className="p-6 shadow-card-travel hover:shadow-travel transition-smooth">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{trip.destination || 'Unknown destination'}</h3>
                        <p className="text-muted-foreground text-sm">
                          {trip.startDate && trip.endDate ? (
                            <>
                              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                            </>
                          ) : 'Dates not set'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(trip.status || 'draft')}>
                        {trip.status || 'draft'}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      {trip.startDate && trip.endDate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </div>
                      )}
                      {trip.budget && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4 mr-2" />
                          ₹{trip.budget}
                        </div>
                      )}
                    </div>

                    {trip.preferences && trip.preferences.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {trip.preferences.slice(0, 3).map((pref, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {pref}
                          </Badge>
                        ))}
                        {trip.preferences.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{trip.preferences.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditTrip(trip.id!)}>
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleSaveTrip(trip.id!)}
                        className={`${savedTripIds.includes(trip.id!) 
                          ? 'text-red-500 hover:bg-red-50 border-red-200' 
                          : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Heart 
                          className={`w-4 h-4 ${savedTripIds.includes(trip.id!) ? 'fill-current' : ''}`} 
                        />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteTrip(trip.id!)} className="text-destructive hover:bg-destructive hover:text-white">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Trips */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            {savedTrips.length === 0 ? (
              <Card className="p-12 text-center">
                <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No saved trips</h3>
                <p className="text-muted-foreground">Save trips you like to view them here later</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedTrips.map((trip) => (
                  <Card key={trip.id} className="p-6 shadow-card-travel hover:shadow-travel transition-smooth">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{trip.destination || 'Unknown destination'}</h3>
                        <p className="text-muted-foreground text-sm">
                          {trip.startDate && trip.endDate ? (
                            <>
                              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                            </>
                          ) : 'Saved trip'}
                        </p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        Saved
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      {trip.startDate && trip.endDate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </div>
                      )}
                      {trip.budget && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4 mr-2" />
                          ₹{trip.budget}
                        </div>
                      )}
                    </div>

                    {trip.preferences && trip.preferences.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {trip.preferences.slice(0, 3).map((pref, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {pref}
                          </Badge>
                        ))}
                        {trip.preferences.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{trip.preferences.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleUnsaveFromSavedPage(trip.id!)}
                        className="text-red-500 hover:bg-red-50 border-red-200"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-ocean rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {currentUser?.displayName?.[0] || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{currentUser?.displayName || 'User'}</h3>
                  <p className="text-muted-foreground">{currentUser?.email}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Account Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Trips:</span>
                      <span className="font-medium">{trips.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saved Trips:</span>
                      <span className="font-medium">{savedTrips.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member Since:</span>
                      <span className="font-medium">
                        {currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;