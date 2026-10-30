import Link from "next/link";

export function Footer() {
  const cities = [
    "Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Pune", 
    "New York", "London", "Dubai", "Toronto", "Sydney", "Singapore"
  ];
  
  const courses = ["Maths Tutors", "Physics Tutors", "IELTS Coaching", "Coding Classes", "English Speaking", "NEET Tutors"];

  return (
    <footer className="bg-white border-t mt-20 pt-12 pb-24 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Nearby Cities */}
        <div>
          <h3 className="text-lg font-bold mb-4">Top Cities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
            {cities.map((city) => (
              <Link key={city} href={`/search?city=${city}`} className="hover:text-emerald-600 hover:underline">
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Courses */}
        <div>
          <h3 className="text-lg font-bold mb-4">Popular Courses</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            {courses.map((course) => (
              <Link key={course} href={`/search?course=${course}`} className="hover:text-emerald-600 hover:underline">
                {course}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="max-w-6xl mx-auto px-4 mt-12 pt-6 border-t text-center text-sm text-gray-500">
        <p>About Shikshak.com • Terms of Use • Privacy Policy</p>
        <p className="mt-2">Shikshak Jobs • Learn • Sitemap</p>
        <p className="mt-4 font-medium">Made in India. Made for the World. 🇮🇳 🌍</p>
        <p className="mt-2 text-xs">© 2026 Shikshak Learning Pvt Ltd. All Rights Reserved.</p>
      </div>
    </footer>
  );
}