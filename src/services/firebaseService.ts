import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    setDoc
  } from 'firebase/firestore';
  import { db } from '../../firebase';
  
  export interface TripData {
    id?: string;
    userId: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: string;
    travelers: string;
    preferences: string[];
    specialRequests: string;
    itinerary?: any;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    status: 'draft' | 'planned' | 'booked' | 'completed';
  }
  
  export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Timestamp;
    preferences?: string[];
    savedTrips?: string[];
  }
  
  class FirebaseService {

    // Trip Management
    async createTrip(tripData: Omit<TripData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
      try {
        const now = Timestamp.now();
        const docRef = await addDoc(collection(db, 'trips'), {
          ...tripData,
          createdAt: now,
          updatedAt: now
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating trip:', error);
        throw error;
      }
    }
  
    async updateTrip(tripId: string, updates: Partial<TripData>): Promise<void> {
        try {
          if (!tripId) {
            throw new Error("Trip ID is required for update.");
          }

          const tripRef = doc(db, "trips", tripId);

          // Remove undefined fields (Firestore doesn't allow them)
          const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
          );

          await updateDoc(tripRef, {
            ...cleanUpdates,
            updatedAt: Timestamp.now(),
          });

          console.log(`Trip ${tripId} updated successfully`);
        } catch (error) {
           console.error("Error updating trip:", error);
            throw error;
        }
    }

    async deleteTrip(tripId: string): Promise<void> {
      try {
        await deleteDoc(doc(db, 'trips', tripId));
      } catch (error) {
        console.error('Error deleting trip:', error);
        throw error;
      }
    }
  
    async getTrip(tripId: string): Promise<TripData | null> {
      try {
        const docRef = doc(db, 'trips', tripId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as TripData;
        }
        return null;
      } catch (error) {
        console.error('Error getting trip:', error);
        throw error;
      }
    }
  
      async getUserTrips(userId: string): Promise<TripData[]> {
        try {
          // Try querying without orderBy to avoid Firestore errors
          const q = query(
            collection(db, "trips"),
            where("userId", "==", userId)
          );
          const querySnapshot = await getDocs(q);

          let trips = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt ?? null, // fallback
              updatedAt: data.updatedAt ?? null,
            };
          }) as TripData[];

          // Sort in JS (if createdAt exists)
          trips = trips.sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() ?? 0;
            const bTime = b.createdAt?.toMillis?.() ?? 0;
            return bTime - aTime; // newest first
          });

          return trips;
        } catch (error) {
          console.error("Error getting user trips:", error);
          throw error;
        }
      }
      
    async getRecentTrips(limitCount: number = 10): Promise<TripData[]> {
      try {
        const q = query(
          collection(db, 'trips'),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TripData[];
      } catch (error) {
        console.error('Error getting recent trips:', error);
        throw error;
      }
    }
  
    // User Profile Management
    async createUserProfile(userProfile: UserProfile): Promise<void> {
      try {
        // Use setDoc with the user's UID as document ID instead of addDoc
        const userRef = doc(db, 'users', userProfile.uid);
        await setDoc(userRef, {
          ...userProfile,
          createdAt: Timestamp.now(),
          savedTrips: [] // Initialize empty saved trips array
        });
      } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }
    }
  
    async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, updates);
      } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
    }
  
    async getUserProfile(userId: string): Promise<UserProfile | null> {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return docSnap.data() as UserProfile;
        }
        return null;
      } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
      }
    }
  
    // Save/Unsave trips
    async saveTrip(userId: string, tripId: string): Promise<void> {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          const savedTrips = userData.savedTrips || [];
          
          if (!savedTrips.includes(tripId)) {
            await updateDoc(userRef, {
              savedTrips: [...savedTrips, tripId]
            });
          }
        } else {
          // If user profile doesn't exist, create it with the saved trip
          console.log('User profile not found, this should not happen in normal flow');
        }
      } catch (error) {
        console.error('Error saving trip:', error);
        throw error;
      }
    }
  
    async unsaveTrip(userId: string, tripId: string): Promise<void> {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          const savedTrips = userData.savedTrips || [];
          
          await updateDoc(userRef, {
            savedTrips: savedTrips.filter(id => id !== tripId)
          });
        }
      } catch (error) {
        console.error('Error unsaving trip:', error);
        throw error;
      }
    }
  }
  
  export const firebaseService = new FirebaseService();