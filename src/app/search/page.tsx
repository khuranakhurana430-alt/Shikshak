import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { TeacherCard } from "../../components/TeacherCard";
import { SearchFilters } from "../../components/SearchFilters";

async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; pincode?: string; online?: string; language?: string; fee?: string }>;
}) {
  await connection();

  const params = await searchParams;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    "https://oahllfiowrgcqnmxgdfm.supabase.co",
    "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );

  const rawSubject = params.subject ?? "maths";
  const activeSubject = rawSubject === "all" ? null : rawSubject;
  const location = params.pincode ?? "";
  const language = params.language ?? "Any language";
  const fee = params.fee ?? "";

  let lat = null;
  let lng = null;
  
  if (location && /^\d{6}$/.test(location)) {
    const { data: pin } = await supabase.from("pincodes").select("lat,lng").eq("pincode", location).maybeSingle();
    lat = pin?.lat ?? null;
    lng = pin?.lng ?? null;
  }

  const searchSubject = activeSubject || "maths"; 

  const { data: teachers, error } = await supabase.rpc("search_teachers", {
    p_subject_slug: searchSubject,
    p_level: null,
    p_lat: lat,
    p_lng: lng,
    p_online_only: !lat,
    p_max_price: fee ? parseFloat(fee) : null,
    p_language: language,
    p_limit: 20,
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-sm">
          {teachers?.length || 0} Tutors Found
        </p>
      </div>

      {error && <p className="text-red-600 mb-4 font-semibold bg-red-50 p-3 rounded-xl border border-red-100">Error: {error.message}</p>}
      
      <div className="space-y-4">
        {teachers?.length === 0 && (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 border-dashed">
            <p className="text-slate-500 font-medium text-lg">No tutors found matching your filters.</p>
            <p className="text-slate-400 text-sm mt-2">Try adjusting your language or fee filters.</p>
          </div>
        )}
        {teachers?.map((t: any) => (
          <TeacherCard key={t.teacher_id} teacher={t} />
        ))}
      </div>
    </>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; pincode?: string; online?: string; language?: string; fee?: string }>;
}) {
  await connection();

  return (
    <main className="min-h-screen relative overflow-hidden pb-20">
      
      {/* Background Blur Orbs */}
      <div className="absolute top-[-5%] left-[-10%] w-[30%] h-[30%] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-violet-200/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto p-4 md:p-8 relative z-10">
        <div className="mb-8 mt-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Find your perfect tutor.</h1>
          <p className="text-slate-500 mt-2 text-lg">Verified teachers worldwide. Try the first class free.</p>
        </div>

        <SearchFilters />

        <Suspense fallback={
          <div className="animate-pulse space-y-4 mt-8">
            <div className="h-32 bg-slate-200/50 rounded-2xl"></div>
            <div className="h-32 bg-slate-200/50 rounded-2xl"></div>
          </div>
        }>
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}