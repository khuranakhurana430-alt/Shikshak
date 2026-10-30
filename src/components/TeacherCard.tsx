import Link from "next/link";
import { MapPin, Star, CheckCircle, GraduationCap } from "lucide-react";

type Props = {
  teacher: {
    teacher_id: string;
    full_name: string;
    headline: string | null;
    base_rate_inr: number;
    currency: string;
    country: string | null;
    distance_km: number | null;
    rating_avg: number;
    rating_count: number;
    teaches_online: boolean;
    verified: boolean;
    city: string | null;
    avatar_url: string | null;
    languages: string[];
    boards: string[];
  };
};

export function TeacherCard({ teacher }: Props) {
  const currencySymbol: Record<string, string> = { INR: "₹", USD: "$", GBP: "£", EUR: "€", AED: "AED " };
  const symbol = currencySymbol[teacher.currency] || "$";

  let secondaryRate = "";
  if (teacher.currency === "INR") {
    secondaryRate = `≈ $${(teacher.base_rate_inr / 83.5).toFixed(1)}/hr`;
  } else if (teacher.currency === "USD") {
    secondaryRate = `≈ ₹${(teacher.base_rate_inr * 83.5).toFixed(0)}/hr`;
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl transition-all duration-300 text-slate-900 mb-4 group">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        
        <div className="flex gap-5 w-full">
          {teacher.avatar_url ? (
            <img src={teacher.avatar_url} alt="Profile" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-white shadow-md shrink-0" />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-2xl font-bold text-indigo-700 shrink-0 shadow-sm">
              {teacher.full_name?.substring(0, 2).toUpperCase() || "T"}
            </div>
          )}

          <div className="w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition">
                {teacher.full_name}
              </h3>
              {teacher.verified && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            
            <p className="text-sm font-medium text-slate-500 mt-1">
              {teacher.headline || "Expert Tutor"}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600 font-medium">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {teacher.city ? `${teacher.city}, ` : ""}{teacher.country || "Online"}</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {teacher.rating_avg.toFixed(1)} ({teacher.rating_count})</span>
              {teacher.distance_km != null && (
                <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md"><GraduationCap className="w-4 h-4" /> {teacher.distance_km.toFixed(1)} km away</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {teacher.languages?.slice(0, 3).map((lang) => (
                <span key={lang} className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold">Speaks {lang}</span>
              ))}
              {teacher.boards?.slice(0, 2).map((board) => (
                <span key={board} className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold">{board}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto md:min-w-[160px] md:border-l md:border-slate-100 md:pl-6 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 shrink-0">
          <div className="text-left md:text-right mb-4 md:mb-6">
            <p className="text-3xl font-extrabold text-slate-900">{symbol}{teacher.base_rate_inr}<span className="text-sm font-medium text-slate-500">/hr</span></p>
            {secondaryRate && <p className="text-xs text-slate-400 font-medium mt-1">{secondaryRate}</p>}
          </div>
          <Link href={`/tutors/${teacher.teacher_id}`} className="w-auto md:w-full text-center bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition shadow-md whitespace-nowrap">
            Book Demo
          </Link>
        </div>
      </div>
    </div>
  );
}