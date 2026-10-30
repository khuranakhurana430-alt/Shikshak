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
      <p className="text-sm text-gray-500 mb-4">{teachers?.length || 0} tutors found</p>
      {error && <p className="text-red-600 mb-4 font-semibold">Error: {error.message}</p>}
      
      <div className="space-y-4">
        {teachers?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed">
            <p className="text-gray-500 font-medium">No tutors found. Try searching for online tutors instead.</p>
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
    <main className="max-w-4xl mx-auto p-4 md:p-6 text-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Learn from a tutor who speaks your language.</h1>
        <p className="text-gray-500 text-sm mt-1">Verified teachers across India and worldwide. Try the first class free, then pay by the hour.</p>
      </div>

      <SearchFilters />

      <Suspense fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      }>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}