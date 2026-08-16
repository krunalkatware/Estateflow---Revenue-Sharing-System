import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../../api/bookings.api';
import { formatCurrency } from '../../utils/formatters';
import { toast } from '../../contexts/ToastContext';
import { Calendar, MapPin, Clock, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsApi.getMyBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: bookingsApi.cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled successfully.');
    },
  });

  return (
    <div className="bg-white rounded-3xl p-8 border border-border shadow-card space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="font-heading font-bold text-2xl text-text-primary">My Property Bookings</h2>
          <p className="text-xs text-text-secondary mt-1">Track reservation status and scheduled site visits</p>
        </div>
        <Link to="/properties" className="btn btn-primary btn-sm gap-1">
          + Book New Property
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs text-text-secondary">Loading your bookings...</div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-slate-50 border border-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex gap-4">
                <img
                  src={booking.property_image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'}
                  alt={booking.property_name}
                  className="w-24 h-24 rounded-2xl object-cover shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">#{booking.booking_number}</span>
                    <span className={`badge capitalize text-[10px] ${
                      booking.status === 'confirmed' ? 'badge-success' : booking.status === 'cancelled' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-text-primary">{booking.property_name}</h3>
                  <p className="text-xs text-text-secondary flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {booking.property_locality}, {booking.property_city}
                  </p>
                  {booking.preferred_visit_date && (
                    <p className="text-xs text-secondary font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Scheduled Visit: {new Date(booking.preferred_visit_date).toLocaleDateString()} ({booking.visit_time_slot})
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-border">
                <div className="text-right">
                  <span className="text-[10px] text-text-secondary uppercase">Listed Price</span>
                  <p className="font-heading font-bold text-lg text-primary">
                    {booking.property_price ? formatCurrency(booking.property_price) : 'Contact Advisor'}
                  </p>
                </div>

                {booking.status !== 'cancelled' && (
                  <button
                    onClick={() => cancelMutation.mutate(booking.id)}
                    className="btn btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50 gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-heading font-bold text-lg text-text-primary">No Bookings Yet</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            You haven't reserved or requested site visits for any property yet.
          </p>
          <Link to="/properties" className="btn btn-primary btn-sm inline-flex">
            Browse Properties
          </Link>
        </div>
      )}
    </div>
  );
};
