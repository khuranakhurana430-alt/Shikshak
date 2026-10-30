"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function PostRequirementWizard() {
  const supabase = createBrowserClient(
    "https://oahllfiowrgcqnmxgdfm.supabase.co",
    "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-"
  );
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    subject: "maths",
    startTime: "Immediately",
    mode: "online",
    board: "CBSE",
    pincode: "110024",
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    // Save to Supabase
    const { data: subjectData } = await supabase.from("subjects").select("id").eq("slug", form.subject).single();

    const { error } = await supabase.from("requirements").insert({
      subject_id: subjectData?.id,
      level: `${form.board} | ${form.startTime}`,
      mode: form.mode as any,
      pincode: form.pincode,
      notes: `Name: ${form.fullName} | Email: ${form.email} | Phone: ${form.phone} | Notes: ${form.notes}`,
    });

    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }

    setMsg("Requirement posted! Finding best tutors for you...");
    setLoading(false);
    
    // Redirect to the search page with their subject and pincode
    setTimeout(() => router.push(`/search?subject=${form.subject}&pincode=${form.pincode}`), 2000);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Top Green Header */}
      <div className="bg-emerald-600 text-white p-4 text-center text-xl font-bold sticky top-0 z-10">
        Post a Learning Requirement
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <div 
          className="bg-emerald-600 h-2 transition-all duration-300" 
          style={{ width: `${(step / 4) * 100}%` }}
        ></div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full p-6 bg-white md:my-8 md:rounded-xl md:shadow-lg border text-gray-900">
        
        <form onSubmit={onSubmit} className="h-full flex flex-col justify-between">
          
          {/* STEP 1: What & When */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold mb-4">What do you want to learn?</h2>
                <select 
                  className="w-full border p-4 rounded-lg text-lg bg-gray-50" 
                  value={form.subject} 
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                >
                  <option value="maths">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="english">English</option>
                  <option value="coding">Coding</option>
                </select>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">When do you plan to start classes?</h2>
                <div className="space-y-3">
                  {["Immediately", "Within a month", "Not sure, just want to look at options"].map((time) => (
                    <label key={time} className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${form.startTime === time ? 'border-emerald-600 bg-emerald-50' : 'hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="startTime" 
                        value={time} 
                        checked={form.startTime === time}
                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                        className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-lg">{time}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: How & Board */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold mb-4">How would you like to attend your classes?</h2>
                <div className="space-y-3">
                  {[
                    { id: "online", label: "Live Interactive Online Classes", rec: "Recommended" },
                    { id: "in_person", label: "Offline at my Home or nearby Classes", rec: "Very Few Tutors" }
                  ].map((mode) => (
                    <label key={mode.id} className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition ${form.mode === mode.id ? 'border-emerald-600 bg-emerald-50' : 'hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="mode" 
                        value={mode.id} 
                        checked={form.mode === mode.id}
                        onChange={(e) => setForm({ ...form, mode: e.target.value })}
                        className="w-5 h-5 mt-1 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-lg font-semibold block">{mode.label}</span>
                        <span className="text-sm text-gray-500">{mode.rec}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Which board of education are you looking for?</h2>
                <div className="grid grid-cols-2 gap-3">
                  {["CBSE", "ICSE", "State", "IB", "IGCSE", "NIOS"].map((board) => (
                    <label key={board} className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition text-center ${form.board === board ? 'border-emerald-600 bg-emerald-50 font-bold' : 'hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="board" 
                        value={board} 
                        checked={form.board === board}
                        onChange={(e) => setForm({ ...form, board: e.target.value })}
                        className="hidden"
                      />
                      <span>{board}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Location & Details */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold mb-4">A few more details...</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Your Pincode</label>
                <input 
                  className="w-full border p-3 rounded-lg text-lg" 
                  value={form.pincode} 
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Any specific notes for the teacher?</label>
                <textarea 
                  className="w-full border p-3 rounded-lg text-lg" 
                  rows={3} 
                  placeholder="e.g. Need help with board exam preparation..." 
                  value={form.notes} 
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                />
              </div>
            </div>
          )}

          {/* STEP 4: Contact Info */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Sign-up to Book a Free Demo Class</h2>
              </div>
              
              <div className="space-y-4">
                <input 
                  className="w-full border p-4 rounded-lg text-lg" 
                  placeholder="Full Name" 
                  value={form.fullName} 
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
                  required 
                />
                <input 
                  className="w-full border p-4 rounded-lg text-lg" 
                  type="email"
                  placeholder="Email" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  required 
                />
                <div className="flex border rounded-lg overflow-hidden">
                  <span className="bg-gray-100 p-4 text-gray-600 border-r font-semibold">India (+91)</span>
                  <input 
                    className="w-full p-4 text-lg outline-none" 
                    type="tel"
                    placeholder="Mobile number" 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              {msg && <p className="text-emerald-600 font-bold text-center bg-emerald-50 p-3 rounded">{msg}</p>}
              
              <p className="text-xs text-center text-gray-500">
                By signing up, you agree to our Terms of Use and Privacy Policy
              </p>
            </div>
          )}

          {/* Navigation Buttons (Mobile Fixed) */}
          <div className="mt-8 flex gap-4 border-t pt-6">
            {step > 1 && (
              <button 
                type="button" // <-- Changed to type="button"
                onClick={prevStep} 
                className="w-1/3 bg-gray-100 text-gray-700 font-bold py-4 rounded-lg hover:bg-gray-200 transition"
              >
                Back
              </button>
            )}
            
            {/* If not the last step, use type="button" to just advance the screen */}
            {step < 4 ? (
              <button 
                type="button" 
                onClick={nextStep}
                className={`bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition ${step === 1 ? 'w-full' : 'w-2/3'}`}
              >
                Next
              </button>
            ) : (
              /* Only use type="submit" on the very last step */
              <button 
                type="submit" 
                disabled={loading}
                className="w-2/3 bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Processing..." : "Continue"}
              </button>
            )}
          </div>

        </form>
      </div>
    </main>
  );
}