import Link from "next/link";

type Props = {
  teacher: {
    teacher_id: string;
    full_name: string;
    headline: string | null;
    base_rate_inr: number; // This now holds the local rate
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
  // Logic to show Dual Currency
  const currencySymbol: Record<string, string> = { INR: "₹", USD: "$", GBP: "£", EUR: "€", AED: "AED " };
  const symbol = currencySymbol[teacher.currency] || "$";

  let secondaryRate = "";
  if (teacher.currency === "INR") {
    // If Indian teacher, show USD equivalent
    secondaryRate = `≈ $${(teacher.base_rate_inr / 83.5).toFixed(1)}/hr`;
  } else if (teacher.currency === "USD") {
    // If US teacher, show INR equivalent
    secondaryRate = `≈ ₹${(teacher.base_rate_inr * 83.5).toFixed(0)}/hr`;
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md text-gray-900 mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        
        <div className="flex gap-4 w-full">
          {teacher.avatar_url ? (
            <img src={teacher.avatar_url} alt="Profile" className="w-16 h-16 rounded-full object-cover border shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-xl font-bold text-emerald-700 shrink-0">
              {teacher.full_name?.substring(0, 2).toUpperCase() || "T"}
            </div>
          )}

          <div className="w-full">
            <h3 className="text-xl font-bold text-gray-900">{teacher.full_name}</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              📍 {teacher.city ? `${teacher.city}, ` : ""}{teacher.country || "Online"} · {teacher.headline}
            </p>
            
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className="text-emerald-600 font-semibold flex items-center gap-1">✓ Verified</span>
              <span className="text-gray-300">•</span>
              <span className="text-amber-500 font-semibold flex items-center gap-1">★ {teacher.rating_avg.toFixed(1)}</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {teacher.languages?.slice(0, 2).map((lang) => (
                <span key={lang} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">Speaks {lang}</span>
              ))}
              {teacher.distance_km != null && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">{teacher.distance_km.toFixed(1)} km away</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-w-[150px] border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 mt-2 md:mt-0">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{symbol}{teacher.base_rate_inr}<span className="text-sm font-normal text-gray-500">/hr</span></p>
            {secondaryRate && <p className="text-xs text-gray-500 font-medium mt-1">{secondaryRate}</p>}
          </div>
          <Link href={`/tutors/${teacher.teacher_id}`} className="mt-4 w-full text-center bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition shadow-sm">
            Book free demo
          </Link>
        </div>
      </div>
    </div>
  );
}