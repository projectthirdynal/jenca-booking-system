'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, Clock, CheckCircle2, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, Search, Scissors, Tag, User,
  Mail, Phone, ArrowRight, CalendarCheck,
} from 'lucide-react';
import { DatePicker } from '@/components/DatePicker';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { Service } from '@/types';
import { formatPHP, formatTime, formatDate, cn } from '@/lib/utils';

interface BookingWizardProps {
  services: Service[];
  preselectedServiceId?: string;
}

const STEPS = ['Service', 'Date & Time', 'Your Details', 'Review'] as const;

export function BookingWizard({ services, preselectedServiceId }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Selections
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    preselectedServiceId || null
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Contact details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Search
  const [serviceSearch, setServiceSearch] = useState('');

  // Returning customer autofill
  const [autofillNotice, setAutofillNotice] = useState<string | null>(null);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const lastLookupEmail = useRef<string>('');

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const fetchSlots = useCallback(async (serviceId: string, date: string) => {
    setLoadingSlots(true);
    setSlotError(null);
    setSelectedTime(null);

    try {
      const response = await fetch(
        `/api/availability?serviceId=${serviceId}&date=${date}`
      );
      if (response.ok) {
        const { data } = await response.json();
        setSlots(data || []);
      } else {
        const data = await response.json();
        setSlotError(data?.error?.message || 'Failed to load time slots');
        setSlots([]);
      }
    } catch {
      setSlotError('Network error. Please try again.');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedServiceId && selectedDate) {
      fetchSlots(selectedServiceId, selectedDate);
    } else {
      setSlots([]);
      setSelectedTime(null);
    }
  }, [selectedServiceId, selectedDate, fetchSlots]);

  // If preselected, jump to step 1 (date & time)
  useEffect(() => {
    if (preselectedServiceId) setStep(1);
  }, [preselectedServiceId]);

  const filteredServices = services.filter((s) => {
    if (!serviceSearch) return true;
    const q = serviceSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q)
    );
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedDate(null);
    setSelectedTime(null);
    setSlots([]);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleEmailBlur = async () => {
    const email = clientEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (email === lastLookupEmail.current) return;
    lastLookupEmail.current = email;

    setAutofillLoading(true);
    setAutofillNotice(null);

    try {
      const res = await fetch(`/api/bookings/lookup?email=${encodeURIComponent(email)}`);
      if (!res.ok) { setAutofillLoading(false); return; }
      const { data } = await res.json();

      if (data && data.length > 0) {
        const latest = data[0];
        if (!clientName.trim() && latest.client_name) {
          setClientName(latest.client_name);
        }
        if (!clientPhone.trim() && latest.client_phone) {
          setClientPhone(latest.client_phone);
        }
        setAutofillNotice(`Welcome back! We've pre-filled your details from your last booking.`);
      }
    } catch {
      // Silent fail — autofill is a convenience
    } finally {
      setAutofillLoading(false);
    }
  };

  const checkDetailsValid = () => {
    if (!clientName.trim() || clientName.trim().length < 2) return false;
    if (!clientPhone.trim()) return false;
    if (!clientEmail.trim() || !clientEmail.includes('@')) return false;
    return true;
  };

  const validateDetails = () => {
    const errors: Record<string, string> = {};
    if (!clientName.trim() || clientName.trim().length < 2) {
      errors.client_name = 'Please enter your full name';
    }
    if (!clientPhone.trim()) {
      errors.client_phone = 'Please enter your phone number';
    }
    if (!clientEmail.trim() || !clientEmail.includes('@')) {
      errors.client_email = 'Please enter a valid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canProceed = () => {
    if (step === 0) return !!selectedServiceId;
    if (step === 1) return !!selectedDate && !!selectedTime;
    if (step === 2) return checkDetailsValid();
    if (step === 3) return agreedToTerms;
    return false;
  };

  const handleNext = () => {
    if (step === 2 && !validateDetails()) return;
    setSubmitError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setSubmitError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleConfirm = async () => {
    if (!agreedToTerms) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: selectedServiceId,
          booking_date: selectedDate,
          booking_time: selectedTime,
          client_name: clientName,
          client_phone: clientPhone,
          client_email: clientEmail,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        if (response.status === 409) {
          setSubmitError('That time slot was just taken. Please go back and select another time.');
          setStep(1);
        } else {
          setSubmitError(result.error?.message || 'Failed to create booking. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      router.push(`/book/confirmation?token=${result.booking_token}`);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (services.length === 0) {
    return (
      <div className="mt-8 card p-8 text-center">
        <p className="text-sm text-neutral-500">
          No services are currently available for booking. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    i < step && 'bg-green-500 text-white',
                    i === step && 'bg-brand-600 text-white',
                    i > step && 'bg-neutral-200 text-neutral-400'
                  )}
                >
                  {i < step ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </div>
                <span className={cn(
                  'mt-1.5 hidden text-xs font-medium sm:block',
                  i <= step ? 'text-neutral-900' : 'text-neutral-400'
                )}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'mx-2 h-0.5 flex-1 transition-colors',
                  i < step ? 'bg-green-500' : 'bg-neutral-200'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Service Selection */}
      {step === 0 && (
        <div>
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search treatments..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className={cn(
                    'card overflow-hidden p-0 text-left transition-all hover:shadow-md',
                    selectedServiceId === service.id && 'ring-2 ring-brand-500'
                  )}
                >
                  {service.image_url ? (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center bg-brand-50">
                      <Scissors className="h-10 w-10 text-brand-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display text-base font-semibold text-neutral-900">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <Clock className="h-3.5 w-3.5" />
                        {service.duration_minutes} min
                      </span>
                      <span className="font-semibold text-brand-700">
                        {formatPHP(service.price_php)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-sm text-neutral-500">
                No treatments match your search. Try a different keyword.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Date & Time */}
      {step === 1 && selectedService && (
        <div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Date picker */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
                <Calendar className="h-4 w-4 text-brand-600" />
                Select a date
              </div>
              <DatePicker
                selectedDate={selectedDate}
                onChange={handleDateChange}
                minDate={today}
                maxDate={maxDateStr}
              />
            </div>

            {/* Time slots */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
                <Clock className="h-4 w-4 text-brand-600" />
                Select a time
              </div>
              {!selectedDate ? (
                <div className="card p-6 text-center">
                  <Clock className="mx-auto h-8 w-8 text-neutral-300" />
                  <p className="mt-2 text-sm text-neutral-500">
                    Pick a date first to see available times.
                  </p>
                </div>
              ) : slotError ? (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-700">{slotError}</p>
                </div>
              ) : (
                <TimeSlotPicker
                  slots={slots}
                  selectedTime={selectedTime}
                  onChange={setSelectedTime}
                  loading={loadingSlots}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Your Details */}
      {step === 2 && (
        <div className="mx-auto max-w-lg">
          <div className="card p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => { setClientName(e.target.value); if (formErrors.client_name) setFormErrors({}); }}
                    placeholder="Juan Dela Cruz"
                    className="input-field pl-9"
                    autoComplete="name"
                  />
                </div>
                {formErrors.client_name && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.client_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Phone number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => { setClientPhone(e.target.value); if (formErrors.client_phone) setFormErrors({}); }}
                    placeholder="0917 123 4567"
                    className="input-field pl-9"
                    autoComplete="tel"
                  />
                </div>
                {formErrors.client_phone && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.client_phone}</p>
                )}
                <p className="mt-1 text-xs text-neutral-400">
                  We&apos;ll send your booking confirmation via SMS
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => { setClientEmail(e.target.value); if (formErrors.client_email) setFormErrors({}); setAutofillNotice(null); }}
                    onBlur={() => handleEmailBlur()}
                    placeholder="juan@example.com"
                    className="input-field pl-9"
                    autoComplete="email"
                  />
                </div>
                {formErrors.client_email && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.client_email}</p>
                )}
                {autofillLoading && (
                  <p className="mt-1 text-xs text-neutral-400 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Checking for previous bookings...
                  </p>
                )}
                {autofillNotice && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {autofillNotice}
                  </p>
                )}
                <p className="mt-1 text-xs text-neutral-400">
                  We&apos;ll send your confirmation and manage-booking link here
                </p>
              </div>

              {/* Honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="absolute -left-[9999px]"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && selectedService && (
        <div className="mx-auto max-w-lg">
          <div className="card p-6">
            <h3 className="font-display text-lg font-semibold text-neutral-900">
              Review your booking
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Please confirm the details below before proceeding.
            </p>

            {/* Service */}
            <div className="mt-5 space-y-4">
              <div className="flex items-start justify-between rounded-lg border border-neutral-200 p-4">
                <div className="flex items-start gap-3">
                  {selectedService.image_url ? (
                    <img
                      src={selectedService.image_url}
                      alt={selectedService.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                      <Scissors className="h-6 w-6 text-brand-300" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{selectedService.name}</p>
                    <p className="text-xs text-neutral-500">
                      {selectedService.duration_minutes} min · {formatPHP(selectedService.price_php)}
                    </p>
                  </div>
                </div>
                <button onClick={() => setStep(0)} className="text-xs text-brand-600 hover:text-brand-700">
                  Edit
                </button>
              </div>

              {/* Date & Time */}
              <div className="flex items-start justify-between rounded-lg border border-neutral-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                    <Calendar className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {selectedDate && formatDate(selectedDate)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {selectedTime && formatTime(selectedTime)}
                    </p>
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-brand-600 hover:text-brand-700">
                  Edit
                </button>
              </div>

              {/* Contact */}
              <div className="flex items-start justify-between rounded-lg border border-neutral-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                    <User className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{clientName}</p>
                    <p className="text-xs text-neutral-500">{clientPhone}</p>
                    <p className="text-xs text-neutral-500">{clientEmail}</p>
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="text-xs text-brand-600 hover:text-brand-700">
                  Edit
                </button>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between rounded-lg bg-brand-50 p-4">
                <span className="text-sm font-medium text-brand-800">Total</span>
                <span className="text-xl font-bold text-brand-700">
                  {formatPHP(selectedService.price_php)}
                </span>
              </div>
            </div>

            {/* Terms */}
            <label className="mt-5 flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs text-neutral-500">
                I agree to Jenca Aesthetics&apos; terms of service and cancellation policy.
                My personal data is handled in compliance with the Philippine Data Privacy Act of 2012 (RA 10173).
              </span>
            </label>

            {submitError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            step === 0
              ? 'text-neutral-300 cursor-not-allowed'
              : 'text-neutral-700 hover:bg-neutral-100'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors',
              canProceed()
                ? 'bg-brand-600 text-white hover:bg-brand-700'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            )}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={!agreedToTerms || isSubmitting}
            className={cn(
              'flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors',
              agreedToTerms && !isSubmitting
                ? 'bg-brand-600 text-white hover:bg-brand-700'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CalendarCheck className="h-4 w-4" />
                Confirm booking
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
