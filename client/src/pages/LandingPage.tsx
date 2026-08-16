import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/common/SearchBar';
import { PropertyCard } from '../components/property/PropertyCard';
import { useFeaturedProperties } from '../hooks/useProperties';
import { PropertyCardSkeleton } from '../components/common/SkeletonLoader';
import { 
  Building2, 
  ShieldCheck, 
  Search, 
  Calendar, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Star,
  ChevronDown,
  Lock,
  PhoneCall,
  Volume2,
  VolumeX,
  Play,
  Pause
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: featuredProperties = [], isLoading } = useFeaturedProperties();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const builderLogos = [
    { name: 'Godrej Properties', rating: '4.8 ★', projects: '60+ Projects' },
    { name: 'Lodha Group', rating: '4.9 ★', projects: '85+ Projects' },
    { name: 'Prestige Group', rating: '4.8 ★', projects: '120+ Projects' },
    { name: 'Brigade Group', rating: '4.7 ★', projects: '75+ Projects' },
    { name: 'Shapoorji Pallonji', rating: '4.9 ★', projects: '45+ Projects' },
    { name: 'Sobha Limited', rating: '4.8 ★', projects: '55+ Projects' },
  ];

  const whyChooseUs = [
    {
      title: '100% Verified Listings',
      desc: 'Every property on EstateFlow is physically inspected & RERA verified for complete peace of mind.',
      icon: ShieldCheck,
      color: 'text-primary bg-primary-50',
    },
    {
      title: 'Smart Search & EMI Engine',
      desc: 'Find homes matching your exact budget, ROI expectations, and location preferences in seconds.',
      icon: Search,
      color: 'text-secondary bg-secondary-50',
    },
    {
      title: 'Instant VIP Site Visit Booking',
      desc: 'Schedule private chauffeured site visits directly with top developer relationship managers.',
      icon: Calendar,
      color: 'text-accent bg-amber-50',
    },
    {
      title: 'Tier-1 Trusted Builders',
      desc: 'Direct tie-ups with India\'s most reputable developers ensuring inaugural pricing and zero brokerage.',
      icon: Award,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Secure Digital Process',
      desc: 'Transparent documentation, digital reservation, and end-to-end legal support.',
      icon: Lock,
      color: 'text-indigo-600 bg-indigo-50',
    },
  ];

  const stats = [
    { value: '30+', label: 'Luxury Properties' },
    { value: '5', label: 'Tier 1 Cities' },
    { value: '12,500+', label: 'Happy Customers' },
    { value: '100+', label: 'Delivered Projects' },
  ];

  const testimonials = [
    {
      name: 'Vikram Malhotra',
      role: 'Property Investor, Mumbai',
      text: 'EstateFlow made purchasing our Worli penthouse seamless. The ROI calculator and instant site visit booking were game changers.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    },
    {
      name: 'Ananya Deshmukh',
      role: 'First-time Homebuyer, Pune',
      text: 'The interface is stunning! Filtering by builder and possession date helped us find our dream Prestige villa in Koregaon Park.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80',
    },
    {
      name: 'Rajesh Iyer',
      role: 'Tech Lead, Bangalore',
      text: 'Zero brokerage, transparent RERA numbers, and direct connect with builder relationship managers. Highly recommended!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
  ];

  const faqs = [
    {
      question: 'Is EstateFlow a direct property portal or a broker?',
      answer: 'EstateFlow is an enterprise technology platform connecting home buyers directly with Tier-1 RERA registered developers. We do not charge home buyers any brokerage fee.',
    },
    {
      question: 'How do I schedule a site visit for a property?',
      answer: 'Click on any property, hit "Book Site Visit", select your preferred date and time slot. Our relationship executive will arrange free pickup or meet you at the site location.',
    },
    {
      question: 'Are all properties listed on EstateFlow RERA verified?',
      answer: 'Yes, 100% of properties listed on EstateFlow undergo mandatory legal documentation verification and hold active RERA registration certificates.',
    },
    {
      question: 'What cities does EstateFlow currently operate in?',
      answer: 'EstateFlow currently features prime residential and luxury projects across Mumbai, Pune, Bangalore, Hyderabad, and Delhi NCR.',
    },
  ];

  return (
    <div className="pb-16" style={{ background: '#F7F6F2' }}>
      
      {/* ── HERO SECTION WITH PREMIUM VIDEO BACKGROUND ──────────────── */}
      <section
        className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-20 overflow-hidden text-white"
        style={{ background: '#16324F' }}
      >
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            poster="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
            className="w-full h-full object-cover"
            style={{ opacity: 0.28 }}
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-architecture-40618-large.mp4" type="video/mp4" />
          </video>
          {/* Premium warm navy gradient overlay — NOT pure black */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(160deg, rgba(22,50,79,0.92) 0%, rgba(15,35,60,0.82) 40%, rgba(22,50,79,0.95) 100%)',
            }}
          />
          {/* Subtle champagne gold bottom strip */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(198,161,91,0.4), transparent)' }}
          />
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          <button
            onClick={togglePlay}
            title={isPlaying ? 'Pause Intro Video' : 'Play Intro Video'}
            className="p-2.5 rounded-full backdrop-blur-md transition-all"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
          </button>
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute Video' : 'Mute Video'}
            className="p-2.5 rounded-full backdrop-blur-md transition-all"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            {isMuted ? <VolumeX className="w-4 h-4" style={{ color: '#C6A15B' }} /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Premium Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold animate-fade-in"
            style={{
              background: 'rgba(198,161,91,0.15)',
              border: '1px solid rgba(198,161,91,0.30)',
              color: '#C6A15B',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#C6A15B' }} />
            <span>Premium Enterprise Real Estate Platform</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-5 max-w-5xl mx-auto">
            <h1
              className="text-4xl md:text-6xl lg:text-[4.5rem] font-heading font-extrabold tracking-tight leading-[1.1] text-balance"
              style={{ color: 'white' }}
            >
              Find a Place{' '}
              <span style={{ color: '#C6A15B' }}>Worth Calling</span>{' '}Yours.
            </h1>
            <p
              className="text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              Discover exceptional properties, trusted opportunities, and a smarter way to manage your real estate journey.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/properties"
              className="flex items-center gap-2 px-7 py-3.5 text-base font-bold rounded-xl transition-all hover:scale-105"
              style={{
                background: '#1F7A68',
                color: 'white',
                boxShadow: '0 4px 20px rgba(31,122,104,0.35)',
              }}
            >
              Explore Properties
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/properties"
              className="flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl transition-all hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: 'white',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Calendar className="w-5 h-5" style={{ color: '#C6A15B' }} />
              Schedule a Visit
            </Link>
          </div>

          {/* Search Bar */}
          <div className="pt-6">
            <SearchBar />
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            {[
              { icon: ShieldCheck, text: '100% RERA Verified' },
              { icon: Award, text: 'Zero Brokerage' },
              { icon: Users, text: '12,500+ Happy Buyers' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                <Icon className="w-3.5 h-3.5" style={{ color: '#C6A15B' }} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUSTED BUILDERS LOGOS ─────────────────────────────────────── */}
      <section className="py-16" style={{ background: 'white', borderBottom: '1px solid #E7E5E0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: '#1F7A68' }}
            >
              Trusted Partnerships
            </span>
            <h2 className="text-2xl font-heading font-bold" style={{ color: '#16324F' }}>
              India's Tier-1 Real Estate Developers
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {builderLogos.map((builder) => (
              <div
                key={builder.name}
                onClick={() => navigate(`/properties?search=${builder.name}`)}
                className="bg-white p-5 rounded-2xl cursor-pointer text-center space-y-2 group transition-all"
                style={{ border: '1px solid #E7E5E0', boxShadow: '0 2px 8px rgba(22,50,79,0.05)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(22,50,79,0.10)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#DDEFE9';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(22,50,79,0.05)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'none';
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#E7E5E0';
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
                  style={{ background: '#DDEFE9' }}
                >
                  <Building2 className="w-5 h-5" style={{ color: '#1F7A68' }} />
                </div>
                <h4 className="font-heading font-bold text-xs" style={{ color: '#16324F' }}>
                  {builder.name}
                </h4>
                <div className="flex items-center justify-center gap-1.5 text-[10px]">
                  <span style={{ color: '#C6A15B', fontWeight: 700 }}>{builder.rating}</span>
                  <span style={{ color: '#E7E5E0' }}>•</span>
                  <span style={{ color: '#94A3B8' }}>{builder.projects}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ───────────────────────────────────────── */}
      <section className="py-20" style={{ background: '#F7F6F2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: '#DDEFE9', color: '#1F7A68' }}
              >
                Handpicked Luxury
              </span>
              <h2 className="section-title mt-3">Featured Luxury Properties</h2>
              <p className="section-subtitle">Prime listings handpicked for high investment ROI and world-class living.</p>
            </div>
            <Link
              to="/properties"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all self-start md:self-auto"
              style={{ background: 'white', border: '1px solid #E7E5E0', color: '#16324F' }}
            >
              View All Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.slice(0, 6).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY ESTATEFLOW ────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: '#F3E7D3', color: '#92400E' }}
            >
              Why EstateFlow
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold" style={{ color: '#16324F' }}>
              The Enterprise Standard in Real Estate
            </h2>
            <p className="text-base" style={{ color: '#64748B' }}>
              Designed to eliminate opacity, delays, and friction in home buying.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {whyChooseUs.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl p-6 space-y-4 transition-all"
                  style={{ background: '#F7F6F2', border: '1px solid #E7E5E0' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(22,50,79,0.08)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#DDEFE9';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLDivElement).style.transform = 'none';
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#E7E5E0';
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: '#DDEFE9' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: '#1F7A68' }} />
                  </div>
                  <h3 className="font-heading font-bold text-sm" style={{ color: '#16324F' }}>{item.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATISTICS ────────────────────────────────────────────────── */}
      <section className="py-4" style={{ background: '#F7F6F2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-10 md:p-14"
            style={{
              background: 'linear-gradient(135deg, #16324F 0%, #1F4E6B 100%)',
              boxShadow: '0 12px 48px rgba(22,50,79,0.20)',
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="space-y-2 px-2"
                  style={{
                    borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none',
                  }}
                >
                  <div
                    className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight"
                    style={{ color: '#C6A15B' }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs md:text-sm font-medium uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: '#F7F6F2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: '#DDEFE9', color: '#1F7A68' }}
            >
              Client Reviews
            </span>
            <h2 className="section-title">Loved by Investors &amp; Homebuyers</h2>
            <p className="section-subtitle">Read what our verified buyers have to say about their EstateFlow experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white p-6 rounded-2xl space-y-4 flex flex-col justify-between transition-all"
                style={{ border: '1px solid #E7E5E0', boxShadow: '0 2px 8px rgba(22,50,79,0.05)' }}
              >
                <div className="space-y-3">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#C6A15B' }} />
                    ))}
                  </div>
                  <p className="text-sm italic leading-relaxed" style={{ color: '#64748B' }}>"{t.text}"</p>
                </div>

                <div
                  className="flex items-center gap-3 pt-4"
                  style={{ borderTop: '1px solid #F1EFE9' }}
                >
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-heading font-bold text-sm" style={{ color: '#16324F' }}>{t.name}</h4>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQS (ACCORDION) ───────────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'white' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: '#EBF1F7', color: '#16324F' }}
            >
              Answers
            </span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: isOpen ? 'white' : '#F7F6F2',
                    border: `1px solid ${isOpen ? '#DDEFE9' : '#E7E5E0'}`,
                    boxShadow: isOpen ? '0 4px 16px rgba(22,50,79,0.06)' : 'none',
                  }}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-heading font-bold text-sm transition-colors"
                    style={{ color: isOpen ? '#1F7A68' : '#16324F' }}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className="w-5 h-5 transition-transform shrink-0"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        color: isOpen ? '#1F7A68' : '#94A3B8',
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className="px-5 pb-5 text-sm leading-relaxed"
                      style={{ borderTop: '1px solid #F1EFE9', paddingTop: '0.75rem', color: '#64748B' }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};
