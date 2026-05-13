"use client";

import { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      {status === 'success' && (
        <div className="sm:col-span-2 bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-start gap-3 border border-emerald-100 shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">Your message has been sent successfully! We will get back to you soon.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="sm:col-span-2 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100 shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <div>
        <label htmlFor="firstName" className="block text-sm font-semibold leading-6 text-gray-900">
          First name
        </label>
        <div className="mt-2.5">
          <input
            type="text"
            name="firstName"
            id="firstName"
            required
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
            className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:opacity-50"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div>
        <label htmlFor="lastName" className="block text-sm font-semibold leading-6 text-gray-900">
          Last name
        </label>
        <div className="mt-2.5">
          <input
            type="text"
            name="lastName"
            id="lastName"
            required
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
            className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:opacity-50"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
          Email
        </label>
        <div className="mt-2.5">
          <input
            type="email"
            name="email"
            id="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:opacity-50"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">
          Message
        </label>
        <div className="mt-2.5">
          <textarea
            name="message"
            id="message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:opacity-50"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            "Let's talk"
          )}
        </button>
      </div>
    </form>
  );
}
