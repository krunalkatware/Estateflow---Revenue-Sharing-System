import React, { useState } from 'react';
import { PropertyDetail } from '../../types/property';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsApi } from '../../api/bookings.api';
import { toast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import { 
  CheckCircle2, 
  User, 
  Building2, 
  Calendar, 
  Clock, 
  FileText, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface BookingWizardProps {
  property: PropertyDetail;
  onClose: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({ property, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<{ booking_number: string; booking_id: number } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    customer_email: user?.email || '',
    customer_phone: '',
    customer_address: '',
    preferred_visit_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    visit_time_slot: '10:00 AM - 12:00 PM',
    special_requirements: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.customer_name || !formData.customer_email || !formData.customer_phone) {
        toast.error('Please fill in all required contact details.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    try {
      const res = await bookingsApi.createBooking({
        property_id: property.id,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        preferred_visit_date: new Date(formData.preferred_visit_date).toISOString(),
        visit_time_slot: formData.visit_time_slot,
        special_requirements: formData.special_requirements,
      });

      setBookingResult({
        booking_number: res.booking_number,
        booking_id: res.booking_id,
      });
      setCurrentStep(5);
      toast.success('Booking successfully submitted!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to complete booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Customer Info' },
    { number: 2, title: 'Property Confirm' },
    { number: 3, title: 'Schedule Visit' },
    { number: 4, title: 'Summary' },
    { number: 5, title: 'Success' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-hover border border-border overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header & Progress Tracker */}
        <div className="bg-slate-900 text-white p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="font-heading font-bold text-xl">Property Booking Wizard</h2>
            </div>
            {currentStep !== 5 && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                ✕ Cancel
              </button>
            )}
          </div>

          {/* Stepper Bar */}
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-800 -z-0" />
            {steps.map((step) => {
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              return (
                <div key={step.number} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-success text-white'
                        : isCurrent
                        ? 'bg-primary text-white ring-4 ring-primary/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                  </div>
                  <span
                    className={`text-[11px] font-medium mt-1 hidden sm:block ${
                      isCurrent ? 'text-white font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* STEP 1: Customer Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Step 1: Your Contact Information
              </h3>
              <p className="text-xs text-text-secondary">Provide details so our estate officer can coordinate your visit.</p>

              <div className="space-y-3">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Email Address *</label>
                    <input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => handleInputChange('customer_email', e.target.value)}
                      placeholder="rahul@example.com"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Current Address (Optional)</label>
                  <textarea
                    rows={2}
                    value={formData.customer_address}
                    onChange={(e) => handleInputChange('customer_address', e.target.value)}
                    placeholder="Enter your residential address..."
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Property Confirmation */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2">
                <Building2 className="w-5 h-5 text-secondary" />
                Step 2: Property Details Confirmation
              </h3>

              <div className="bg-slate-50 border border-border rounded-2xl p-4 flex gap-4">
                <img
                  src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'}
                  alt={property.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1 space-y-1">
                  <span className="badge badge-primary uppercase text-[10px]">{property.property_type}</span>
                  <h4 className="font-heading font-bold text-base text-text-primary">{property.name}</h4>
                  <p className="text-xs text-text-secondary">{property.locality}, {property.city?.name}</p>
                  <p className="text-sm font-bold text-primary">{formatCurrency(property.price)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-white border border-border rounded-2xl p-4">
                <div>
                  <span className="text-text-secondary">Developer:</span>
                  <p className="font-semibold text-text-primary">{property.builder?.name || 'Verified Builder'}</p>
                </div>
                <div>
                  <span className="text-text-secondary">RERA Registration:</span>
                  <p className="font-semibold text-text-primary">{property.rera_number || 'RERA Compliant'}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Configuration:</span>
                  <p className="font-semibold text-text-primary">{property.bedrooms ? `${property.bedrooms} BHK` : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Possession:</span>
                  <p className="font-semibold text-text-primary">{property.possession_date}</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Schedule Visit */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                Step 3: Schedule VIP Site Visit
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="label">Preferred Date *</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.preferred_visit_date}
                    onChange={(e) => handleInputChange('preferred_visit_date', e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Preferred Time Slot *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {['10:00 AM - 12:00 PM', '02:00 PM - 04:00 PM', '04:30 PM - 06:30 PM'].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleInputChange('visit_time_slot', slot)}
                        className={`p-3 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          formData.visit_time_slot === slot
                            ? 'bg-primary-50 border-primary text-primary shadow-soft'
                            : 'bg-white border-border text-text-primary hover:bg-slate-50'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Special Instructions / Requirements</label>
                  <textarea
                    rows={2}
                    value={formData.special_requirements}
                    onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                    placeholder="e.g. Need cab pickup from nearest metro station..."
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Summary & Final Review */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Step 4: Booking Summary Review
              </h3>

              <div className="bg-slate-50 border border-border rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-border font-medium">
                  <span className="text-text-secondary">Property:</span>
                  <span className="font-bold text-text-primary">{property.name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-border font-medium">
                  <span className="text-text-secondary">Customer Name:</span>
                  <span className="font-semibold text-text-primary">{formData.customer_name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-border font-medium">
                  <span className="text-text-secondary">Contact:</span>
                  <span className="font-semibold text-text-primary">{formData.customer_phone} | {formData.customer_email}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-border font-medium">
                  <span className="text-text-secondary">Visit Date & Slot:</span>
                  <span className="font-semibold text-secondary">{formData.preferred_visit_date} ({formData.visit_time_slot})</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-text-secondary">Listing Price:</span>
                  <span className="font-extrabold text-base text-primary">{formatCurrency(property.price)}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Zero Booking Fees. Our Relationship Manager will confirm your visit slot within 2 hours.</span>
              </div>
            </div>
          )}

          {/* STEP 5: Success Screen */}
          {currentStep === 5 && bookingResult && (
            <div className="text-center py-6 space-y-4 animate-scale-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="badge badge-success text-xs font-bold uppercase tracking-wider px-3 py-1 mb-2">Status: Confirmed</span>
                <h3 className="font-heading font-extrabold text-2xl text-text-primary">Booking Confirmed & Completed!</h3>
                <p className="text-xs text-text-secondary mt-1">Your official booking reference number is:</p>
                <div className="inline-block bg-emerald-50 border border-emerald-300 font-mono text-lg font-bold text-emerald-700 px-4 py-1.5 rounded-xl mt-2 shadow-soft">
                  #{bookingResult.booking_number}
                </div>
              </div>

              <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-text-primary">{formData.customer_name}</strong>. A dedicated EstateFlow advisor has been assigned to your booking and will reach out to you at <strong className="text-text-primary">{formData.customer_phone}</strong>.
              </p>

              <div className="pt-4 flex items-center justify-center gap-3">
                <Link
                  to="/dashboard/bookings"
                  onClick={onClose}
                  className="btn btn-primary btn-sm"
                >
                  View My Bookings
                </Link>
                <button
                  onClick={onClose}
                  className="btn btn-outline btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        {currentStep !== 5 && (
          <div className="bg-gray-50 border-t border-border p-4 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="btn btn-outline btn-sm gap-1"
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="btn btn-primary btn-sm gap-1 ml-auto"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
                className="btn btn-primary btn-sm gap-1.5 ml-auto bg-emerald-600 hover:bg-emerald-700 shadow-soft"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Complete Booking'}
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
