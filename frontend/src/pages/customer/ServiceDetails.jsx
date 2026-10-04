import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";
import {
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  Wrench,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
} from "lucide-react";

const ServiceDetails = () => {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/services/${id}`);
        setService(response.data.service);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load service details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id]);

  if (loading) {
    return <Loading message="Loading service details..." />;
  }

  if (error || !service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {error ? "Unable to Load Service" : "Service Not Found"}
          </h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            {error || "The service you are looking for does not exist or has been removed."}
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Services</span>
          </Link>
        </div>
      </div>
    );
  }

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `http://localhost:5000${image.startsWith("/") ? image : `/${image}`}`;
  };

  const images = service.images || [];
  const provider = service.provider;
  const providerUser = provider?.user;
  const providerName = providerUser?.name || "Verified Provider";
  const mainImage = images.length > 0 ? getImageUrl(images[selectedImage]) : "";
  const rating = Number(service.averageRating || 4.8).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Services Catalog</span>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Gallery & Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Gallery Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm overflow-hidden">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={service.name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50/50 text-slate-400">
                    <Wrench className="w-12 h-12 text-blue-500 mb-2" />
                    <p className="text-sm font-medium">SkillConnect Verified Service</p>
                  </div>
                )}

                {/* Category Floating Pill */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-md">
                    {service.category?.name || "Professional Service"}
                  </span>
                </div>
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        selectedImage === index
                          ? "border-blue-600 ring-2 ring-blue-500/20"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`${service.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Service Description Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Service Overview
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  {service.name}
                </h1>
              </div>

              {/* Quick Info Badges */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex flex-col items-center text-center">
                  <MapPin className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-[11px] text-slate-600 uppercase font-semibold">Location</span>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-full">
                    {service.location || "Local Area"}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center border-x border-slate-200">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400 mb-1" />
                  <span className="text-[11px] text-slate-600 uppercase font-semibold">Rating</span>
                  <span className="text-xs font-bold text-slate-800">
                    {rating}★ ({service.totalReviews || 0} reviews)
                  </span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-[11px] text-slate-600 uppercase font-semibold">Standard</span>
                  <span className="text-xs font-bold text-slate-800">Verified Pro</span>
                </div>
              </div>

              {/* Description Body */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  About this Service
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                  {service.description ||
                    "Professional service delivered by verified local experts with complete satisfaction assurance."}
                </p>
              </div>

              {/* Included Checklist */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  What's Included:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Free service inspection upon arrival</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Direct chat communication with provider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Real-time booking status tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Simulated digital invoice & payments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Box & Provider Card */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Booking Action Card */}
            <div className="bg-white rounded-3xl border border-blue-200/80 p-6 sm:p-8 shadow-xl shadow-blue-500/5 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Transparent Pricing
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    ₹{service.price ?? 0}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">/ fixed service rate</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-3 text-xs text-blue-800">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Choose your preferred date and available time slot in the next step.</span>
              </div>

              <Link
                to={`/customer/book-service/${service._id}`}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Calendar className="w-5 h-5" />
                <span>Check Availability & Book</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Provider Information Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                  {providerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      Service Provider
                    </span>
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {providerName}
                  </h3>
                </div>
              </div>

              {provider?.bio && (
                <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
                  "{provider.bio}"
                </p>
              )}

              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
                {providerUser?.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{providerUser.phone}</span>
                  </div>
                )}
                {providerUser?.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{providerUser.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{provider?.city || service.location || "Local region"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceDetails;
