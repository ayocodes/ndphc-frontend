// src/store/morning-reading-store.ts
import { create } from "zustand";
import {
  MorningReadingCreate,
  MorningReadingUpdate,
  MorningReadingWithDeclarations,
} from "../types/morning-reading";
import { morningReadingService } from "../service/morning-reading-service";

interface MorningReadingState {
  currentReading: MorningReadingWithDeclarations | null;
  isLoading: boolean;
  error: string | null;
  createMorningReading: (data: MorningReadingCreate) => Promise<MorningReadingWithDeclarations>;
  updateMorningReading: (
    readingId: string,
    data: MorningReadingUpdate
  ) => Promise<MorningReadingWithDeclarations>;
  fetchMorningReading: (
    plantId: number,
    date: Date
  ) => Promise<MorningReadingWithDeclarations>;
  fetchMorningReadingById: (readingId: string) => Promise<void>;
  resetState: () => void;
}

export const useMorningReadingStore = create<MorningReadingState>((set) => ({
  currentReading: null,
  isLoading: false,
  error: null,

  /**
   * Create a new morning reading
   */
  createMorningReading: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await morningReadingService.createMorningReading(data);
      set({
        currentReading: response,
        isLoading: false,
      });
      return response;
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to create morning reading",
      });
      throw error;
    }
  },

  /**
   * Update an existing morning reading
   */
  updateMorningReading: async (readingId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await morningReadingService.updateMorningReading(
        readingId,
        data
      );

      set({ currentReading: response, isLoading: false });
      return response;
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to update morning reading",
      });
      throw error;
    }
  },

  /**
   * Fetch a morning reading by plant ID and date
   */
  fetchMorningReading: async (plantId, date) => {
    set({ isLoading: true, error: null });
    try {
      const response =
        await morningReadingService.getMorningReadingByPlantAndDate(
          plantId,
          date
        );
      set({ currentReading: response, isLoading: false });
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // If not found, clear the current reading
        set({ currentReading: null, isLoading: false });
      } else {
        set({
          isLoading: false,
          error:
            error.response?.data?.detail ||
            error.message ||
            "Failed to fetch morning reading",
        });
      }
      throw error;
    }
  },

  /**
   * Fetch a morning reading by ID
   */
  fetchMorningReadingById: async (readingId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await morningReadingService.getMorningReadingById(
        readingId
      );
      set({ currentReading: response, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to fetch morning reading",
      });
      throw error;
    }
  },

  /**
   * Reset the store state
   */
  resetState: () => {
    set({ currentReading: null, error: null });
  },
}));