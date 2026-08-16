import { apiClient } from './axios';
import { Booking, BookingCreateData } from '../types/booking';

export const bookingsApi = {
  createBooking: async (data: BookingCreateData): Promise<{ message: string; booking_number: string; booking_id: number }> => {
    const res = await apiClient.post('/bookings', data);
    return res.data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const res = await apiClient.get('/bookings');
    return res.data;
  },

  getBookingById: async (id: number): Promise<Booking> => {
    const res = await apiClient.get(`/bookings/${id}`);
    return res.data;
  },

  cancelBooking: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/bookings/${id}`);
    return res.data;
  },
};
