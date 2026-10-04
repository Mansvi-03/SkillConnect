import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Search,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  CheckCircle2,
  Wrench,
  Zap,
  Home as HomeIcon,
  Laptop,
  Paintbrush,
  Scissors,
  Users,
  MessageSquare,
  Award,
} from "lucide-react";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState("");

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/services?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate("/services");
    }
  };

  const categories = [
    { name: "Home Cleaning", icon: Sparkles, color: "text-blue-500", bg: "bg-blue-50", count: "120+ pros" },
    { name: "Plumbing", icon: Wrench, color: "text-cyan-500", bg: "bg-cyan-50", count: "85+ pros" },
    { name: "Electrical", icon: Zap, color: "text-amber-500", bg: "bg-amber-50", count: "95+ pros" },
    { name: "Painting & Renovation", icon: Paintbrush, color: "text-emerald-500", bg: "bg-emerald-50", count: "60+ pros" },
    { name: "Computer & Tech", icon: Laptop, color: "text-indigo-500", bg: "bg-indigo-50", count: "70+ pros" },
    { name: "Salon & Wellness", icon: Scissors, color: "text-rose-500", bg: "bg-rose-50", count: "50+ pros" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs sm:text-sm font-medium backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Verified Local Service Marketplace</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Book Trusted Local Pros for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                  Any Service.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                SkillConnect connects you with vetted, top-rated local professionals. 
                Compare services, schedule appointments, track status in real-time, and get things done effortlessly.
              </p>

              {/* Hero Search Box */}
              <form
                onSubmit={handleHeroSearch}
                className="mt-4 p-2 bg-white rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-xl mx-auto lg:mx-0 border border-slate-200"
              >
                <div className="flex items-center gap-2.5 px-3 py-2 w-full text-slate-700">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="E.g., AC Repair, Deep Cleaning, Electrician..."
                    className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shrink-0 transition-all shadow-md shadow-blue-600/30"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Vetted Backgrounds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>4.8/5 Avg Provider Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Instant Slot Booking</span>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md">
                {/* Floating Badge */}
                <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-100 flex items-center gap-3 z-20 animate-pulse-subtle">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">1,200+ Jobs Completed</p>
                    <p className="text-[11px] text-slate-500">Verified Local Pros</p>
                  </div>
                </div>

                {/* Main Hero Card Preview */}
                <div className="rounded-3xl bg-slate-800/90 border border-slate-700/80 p-6 shadow-2xl backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <div>
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                        Available Today
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        Top Rated Nearby
                      </h3>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ● Active Now
                    </span>
                  </div>

                  {/* Sample Pro 1 */}
                  <div className="p-3.5 rounded-2xl bg-slate-700/50 hover:bg-slate-700 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Full Home Repair</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          4.9 (128 reviews) • Ramesh K.
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white bg-slate-800/80 px-2.5 py-1 rounded-lg">
                      ₹499
                    </span>
                  </div>

                  {/* Sample Pro 2 */}
                  <div className="p-3.5 rounded-2xl bg-slate-700/50 hover:bg-slate-700 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-cyan-600 text-white font-bold flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Deep Home Cleaning</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          4.8 (94 reviews) • CleanPro
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white bg-slate-800/80 px-2.5 py-1 rounded-lg">
                      ₹799
                    </span>
                  </div>

                  {/* Sample Pro 3 */}
                  <div className="p-3.5 rounded-2xl bg-slate-700/50 hover:bg-slate-700 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Electrical Wiring</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          4.9 (210 reviews) • Amit P.
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white bg-slate-800/80 px-2.5 py-1 rounded-lg">
                      ₹399
                    </span>
                  </div>

                  <Link
                    to="/services"
                    className="block w-full py-2.5 text-center text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View all 150+ available services →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES SECTION
      ===================================================== */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                Browse by Category
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Popular Services Near You
              </h2>
            </div>
            <Link
              to="/services"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Explore all categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  to="/services"
                  className="group p-5 rounded-2xl border border-slate-100 hover:border-blue-200 bg-white hover:bg-blue-50/30 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center"
                >
                  <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center ${cat.color} mb-3 group-hover:scale-110 transition-transform shadow-inner`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-slate-600 mt-1 font-medium">
                    {cat.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              Effortless Booking
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How SkillConnect Works
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 font-normal">
              Book skilled help in just three quick steps with guaranteed quality and upfront pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm relative group hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-500/20 mb-6">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Discover & Compare
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Browse verified local service profiles, compare prices, read genuine customer reviews, and find the right pro.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm relative group hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-indigo-500/20 mb-6">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Choose Slot & Book
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Select your preferred date and available time slot. Confirm your booking instantly with no phone tag.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm relative group hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-emerald-500/20 mb-6">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Track & Relax
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Communicate directly with your provider via in-app chat, monitor progress live, and pay securely once done.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY CHOOSE US / TRUST SECTION
      ===================================================== */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                The SkillConnect Advantage
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 leading-tight">
                Designed for Safety, Speed, and Complete Peace of Mind
              </h2>
              <p className="text-slate-500 mt-4 leading-relaxed font-normal">
                Whether you need urgent plumbing at home or a scheduled deep clean, SkillConnect brings top-tier service standards to your doorstep.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Strictly Vetted Professionals</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Every provider is verified with identity and experience checks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Upfront Transparent Pricing</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Clear flat or hourly pricing with zero hidden fees or surprises.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">In-App Chat & Real-Time Tracking</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Coordinate arrival, clarify instructions, and track statuses seamlessly.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card / Metric Highlight */}
            <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Community Highlights
                </span>
                <h3 className="text-2xl font-bold">Trusted by Thousands in Local Neighborhoods</h3>
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-700">
                  <div>
                    <p className="text-3xl font-extrabold text-blue-400">98%</p>
                    <p className="text-xs text-slate-400 mt-1">Satisfaction Score</p>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-indigo-400">15 min</p>
                    <p className="text-xs text-slate-400 mt-1">Avg Response Time</p>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-emerald-400">500+</p>
                    <p className="text-xs text-slate-400 mt-1">Services Listed</p>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-amber-400">24/7</p>
                    <p className="text-xs text-slate-400 mt-1">Customer Assistance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA BANNER
      ===================================================== */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-16 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Find Your Next Service Provider?
          </h2>
          <p className="mt-3 text-base sm:text-lg text-blue-100 max-w-xl mx-auto font-normal">
            Join thousands of satisfied neighbors who book reliable local help on SkillConnect every day.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/services"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all"
            >
              Explore Services Now
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-blue-700/80 hover:bg-blue-700 text-white border border-blue-400/40 transition-all"
              >
                Sign Up as a Professional
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
