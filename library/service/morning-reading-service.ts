// src/service/morning-reading-service.ts
import { format } from 'date-fns';
import { 
  MorningReadingCreate, 
  MorningReadingUpdate,
  MorningReadingResponse,
  MorningReadingWithDeclarations 
} from '../types/morning-reading';
import axios from '../api/axios';

export const morningReadingService = {
  /**
   * Create a new morning reading
   */
  createMorningReading: async (data: MorningReadingCreate): Promise<MorningReadingWithDeclarations> => {
    console.log('Creating morning reading with payload:', JSON.stringify(data, null, 2));
    const response = await axios.post('/api/v1/readings/morning/', data);
    return response.data;
  },

  /**
   * Get a morning reading by plant ID and date
   */
  getMorningReadingByPlantAndDate: async (plantId: number, date: Date): Promise<MorningReadingWithDeclarations> => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    console.log(`Fetching morning reading for plant ${plantId} on date ${formattedDate}`);
    const response = await axios.get(`/api/v1/readings/morning/plant/${plantId}/date/${formattedDate}`);
    return response.data;
  },

  /**
   * Get a morning reading by ID
   */
  getMorningReadingById: async (readingId: string): Promise<MorningReadingWithDeclarations> => {
    console.log(`Fetching morning reading with ID ${readingId}`);
    const response = await axios.get(`/api/v1/readings/morning/${readingId}`);
    return response.data;
  },

  /**
   * Update an existing morning reading
   * Turbine IDs are now properly included in the API response
   */
  updateMorningReading: async (readingId: string, data: MorningReadingUpdate): Promise<MorningReadingWithDeclarations> => {
    console.log(`Updating morning reading with ID ${readingId} with payload:`, JSON.stringify(data, null, 2));
    const response = await axios.put(`/api/v1/readings/morning/${readingId}`, data);
    return response.data;
  }
};