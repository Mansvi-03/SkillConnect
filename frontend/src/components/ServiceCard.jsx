import { Link } from "react-router-dom";
import { Star, MapPin, ArrowRight, ShieldCheck, Wrench } from "lucide-react";

const ServiceCard = ({ service }) => {
  const image =
    service?.images?.length > 0
      ? `http://localhost:5000${service.images[0]}`
      : null;

  const providerName =
    service?.provider?.user?.name || "Verified Provider";

  const rating = Number(service?.averageRating || 4.8).toFixed(1);
  const totalReviews = service?.totalReviews || 0;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-300/60 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Thumbnail with Overlay Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={service?.name || "Service"}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
        ) : null}

        {/* Fallback image placeholder */}
        <div
          className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50/50 text-slate-400 ${
            image ? "hidden" : "flex"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500 mb-1">
            <Wrench className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-slate-400">SkillConnect Service</span>
        </div>

        {/* Floating Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-white/60">
            {service?.category?.name || "General Service"}
          </span>
        </div>

        {/* Floating Rating Pill */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 shadow-sm border border-white/60">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
            {totalReviews > 0 && (
              <span className="text-[11px] text-slate-600 font-normal">
                ({totalReviews})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {service?.name || "Professional Local Service"}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {service?.description ||
            "Reliable and highly rated local service delivered by experienced professionals."}
        </p>

        {/* Location & Provider Info */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0">
              {providerName.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-slate-700 truncate max-w-[110px]">
              {providerName}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" title="Verified Provider" />
          </div>

          <div className="flex items-center gap-1 text-slate-600 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-slate-600" />
            <span className="truncate max-w-[100px]">{service?.location || "Local Area"}</span>
          </div>
        </div>

        {/* Footer with Price and View Button */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-600 block">
              Starts at
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">
                ₹{service?.price ?? 0}
              </span>
              <span className="text-[11px] text-slate-600">/ job</span>
            </div>
          </div>

          <Link
            to={`/services/${service?._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-xl transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;
