"use client";

import NextLayout from "@/components/NextLayout";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Heart, Zap, Crown, Star, Sparkles, Coffee } from "lucide-react";
import Link from "next/link";
import PaymentLink from "@/components/PaymentLink";
import { useState } from "react";

enum PopularPlanType {
  NO = 0,
  YES = 1,
}

interface PricingProps {
  title: string;
  popular: PopularPlanType;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
  href: string;
  billing: string;
  paymentLink?: string;
  yearlyPaymentLink?: string;
  yearlyPrice?: number;
  icon: React.ReactNode;
  color: string;
}

const pricingList: PricingProps[] = [
  {
    title: "Free",
    popular: 0,
    price: 0,
    description: "Perfect for getting started with basic study features.",
    buttonText: "Get Started",
    benefitList: [
      "3 hours max study time per day",
      "Basic quizzes updated weekly",
      "5 max study-group participants",
      "5 max compete participants",
      "5 confessions per day",
    ],
    href: "/api/auth/login",
    billing: "/month",
    icon: <Coffee className="w-5 h-5" />,
    color: "text-yellow-600",
  },
  {
    title: "Plus",
    popular: 1,
    price: 9.99,
    yearlyPrice: 99,
    description: "Enhanced study features with extended study time and custom quizzes.",
    buttonText: "Get Started",
    benefitList: [
      "10 hours max study time per day",
      "Create custom quizzes",
      "30 max study-group participants",
      "30 max compete participants",
      "20 confessions per day",
      "Advanced study features (screen sharing & recording)",
      "Priority support",
    ],
    href: "/api/auth/login",
    paymentLink: process.env.NEXT_PUBLIC_STRIPE_PLUS_MONTHLY_PLAN_LINK,
    yearlyPaymentLink: process.env.NEXT_PUBLIC_STRIPE_PLUS_YEARLY_PLAN_LINK,
    billing: "/month",
    icon: <Star className="w-5 h-5" />,
    color: "text-purple-600",
  },
  {
    title: "Premium",
    popular: 0,
    price: 19.99,
    yearlyPrice: 180,
    description: "Unlimited access to all study features for serious learners.",
    buttonText: "Get Started",
    benefitList: [
      "Unlimited study time",
      "Create unlimited study quizzes",
      "Unlimited study-group participants",
      "Unlimited confessions per day",
      "Advanced study features (screen sharing & recording)",
      "Priority support",
    ],
    href: "/api/auth/login",
    paymentLink: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PLAN_LINK,
    yearlyPaymentLink: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PLAN_LINK,
    billing: "/month",
    icon: <Crown className="w-5 h-5" />,
    color: "text-orange-600",
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('annually');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to send message');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NextLayout>
      <main id="main-content" role="main" className="min-h-screen">
        {/* Skip to main content link for keyboard users */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-gray-900 text-white px-4 py-2 rounded z-50">
          Skip to main content
        </a>

        <section aria-labelledby="pricing-heading" id="pricing" className="py-10 sm:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-16">
              <div className="mb-6">
                <span className="text-sm font-medium text-gray-500 tracking-wide uppercase">
                  [ CHOOSE YOUR PLAN ]
                </span>
              </div>
              <h1 id="pricing-heading" className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Pay once, use forever
              </h1>
              <h2 className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
                Get started with Study-Talk today and experience the power of collaborative learning!
              </h2>
            </header>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
              <div className="bg-gray-100 rounded-lg p-1 inline-flex">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingPeriod === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annually')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingPeriod === 'annually'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Annually
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16" role="list" aria-label="Pricing plans">
              {pricingList.map((pricing: PricingProps) => (
                <Card
                  key={pricing.title}
                  className={`group relative bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 ${
                    pricing.popular === PopularPlanType.YES
                      ? "ring-2 ring-purple-500 ring-offset-2"
                      : ""
                  }`}
                  role="listitem"
                  aria-labelledby={`${pricing.title.toLowerCase()}-plan-title`}
                >
                  {pricing.popular === PopularPlanType.YES && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-500 text-white text-xs px-3 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-8 h-8 ${pricing.color} flex items-center justify-center`}>
                        {pricing.icon}
                      </div>
                    </div>
                    
                    <CardTitle className={`text-2xl font-bold ${pricing.color}`} id={`${pricing.title.toLowerCase()}-plan-title`}>
                      {pricing.title}
                    </CardTitle>
                    
                    <CardDescription className="text-gray-600 mt-2">
                      {pricing.description}
                    </CardDescription>

                    <div className="mt-6">
                      <div className="text-4xl font-bold text-gray-900">
                        ${billingPeriod === 'annually' && pricing.yearlyPrice ? pricing.yearlyPrice : pricing.price}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {billingPeriod === 'annually' ? '/year' : '/month'}
                      </div>
                      {billingPeriod === 'annually' && pricing.yearlyPrice && (
                        <div className="text-green-600 text-sm mt-1">
                          Save ${(pricing.price * 12 - pricing.yearlyPrice).toFixed(0)}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <PaymentLink
                        href={pricing.href}
                        text={pricing.buttonText}
                        paymentLink={billingPeriod === 'annually' ? pricing.yearlyPaymentLink : pricing.paymentLink}
                        variant="default"
                        className={`px-8 py-3 text-lg ${
                          pricing.title === "Free" 
                            ? "bg-gray-600 hover:bg-gray-700 text-white" 
                            : pricing.title === "Plus"
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-orange-600 hover:bg-orange-700 text-white"
                        }`}
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="pt-6">
                    <div className="space-y-3 w-full">
                      {pricing.benefitList.map((benefit: string) => (
                        <div key={benefit} className="flex items-start space-x-3">
                          <Check className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Personal Message from Creator */}
            <div className="max-w-5xl mx-auto mb-9">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-8">
                  <div className="prose prose-lg mx-auto text-gray-700 leading-relaxed">
                    <p className="mb-4">
                      Hi,
                    </p>
                    <p className="mb-4">
                      My name is <span className="font-semibold text-blue-600">Lefika Moalosi</span>, the sole programmer behind this platform. I am a Computer Engineering and Electrical Engineering Double Major at the University of Cincinnati. While I major on the hardware side of computing, I personally take great joy in coding and working with software.
                    </p>
                    <p className="mb-4">
                      At the beginning of July 2025, I decided to build this website, with the goal of providing a website where students can converse with each other. After working on it for a few weeks, I decided it was a good idea to share it to the wider world. So here we are…
                    </p>
                    <p className="mb-4">
                      Running this website is quite expensive so I would prefer it if you could help me out by purchasing one of the subscriptions above. I understand that purchasing a subscription can be too expensive for some people, so you can instead donate if you feel the need to.
                    </p>
                    <p className="mb-6">
                      Again, thank you all for using this platform. 👋
                    </p>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-blue-600 font-medium">— Lefika Moalosi</p>
                      <p className="text-sm text-gray-500">Creator of Study-Talk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Donation Section */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            {/* Creative Donation Section */}
            <div className="relative">
              {/* Background decorative elements */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <div className="w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                {/* Header with icon */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Support Study-Talk</h2>
                  <p className="text-gray-600">Your generosity helps us keep the platform free for everyone</p>
                </div>

                {/* Impact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">✨</span>
                      <h3 className="font-semibold text-green-800">Improve Study Features</h3>
                    </div>
                    <p className="text-sm text-green-700">Enhanced tools and functionality for better learning experiences</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">🚀</span>
                      <h3 className="font-semibold text-blue-800">Add New Learning Tools</h3>
                    </div>
                    <p className="text-sm text-blue-700">Innovative study methods and cutting-edge features</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">💙</span>
                      <h3 className="font-semibold text-purple-800">Keep Platform Free</h3>
                    </div>
                    <p className="text-sm text-purple-700">Ensure Study-Talk remains accessible to all students worldwide</p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">🎯</span>
                      <h3 className="font-semibold text-orange-800">Support Student Success</h3>
                    </div>
                    <p className="text-sm text-orange-700">Help students achieve their academic goals and dreams</p>
                  </div>
                </div>

        

                {/* Call to Action */}
                <div className="text-center space-y-4">
                  <PaymentLink
                    href="/api/auth/login"
                    text="Support Study-Talk"
                    paymentLink={process.env.NEXT_PUBLIC_STRIPE_DONATION_PLAN_LINK}
                    variant="default"
                    className=" w-full py-8 text-lg bg-purple-500 hover:bg-purple-400 text-white"
                  />
                  
                  <p className="text-sm text-gray-600">
                    Every donation, no matter the size, makes a real difference 💙
                  </p>
                </div>
              </div>
            </div>
          </div>
  
        {/* Contact Form Section */}
        <section className="py-16 bg-white/60 rounded-t-[50px]" aria-labelledby="contact-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <div className="mb-6">
                <span className="text-sm font-medium text-gray-500 tracking-wide uppercase">
                  [ GET IN TOUCH ]
                </span>
              </div>
              <h2 id="contact-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Have Questions or Feedback?
              </h2>
              <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
                Questions about Study-Talk or need technical support? Contact me directly for assistance.
              </p>
            </header>

            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-100">
              {submitStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
                  <p className="text-gray-600 mb-6">Thank you for your message. I'll get back to you within 24 hours.</p>
                  <button
                    onClick={() => setSubmitStatus('idle')}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{errorMessage}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-50"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-50"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-50"
                      placeholder="Subject"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none disabled:opacity-50"
                      placeholder="Have a question or feedback?"
                    ></textarea>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-4 text-lg bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Reach customer support directly at:
                  </p>
                  <div className="space-y-2">
                    <p className="text-purple-600 font-medium">
                      📧 lefika.moalosi@example.com
                    </p>
                    <p className="text-gray-600 text-sm">
                      Hear a response within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </NextLayout>
  );
}
