"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft } from "lucide-react";

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
    if (step < 4) {
      nextStep();
      return;
    }

    setLoading(true);
    setMsg(null);

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
    
    setTimeout(() => router.push(`/search?subject=${form.subject}&pincode=${form.pincode}`), 2000);
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col pb-20 relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute top-[0%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6 z-10">
        
        <div className="mb-8 mt-4 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">Post a Requirement</h1>
          <p className="text-slate-500 mt-2">Tell us what you need and we'll find the perfect tutor.</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
          <div 
            className="bg-indigo-600 h-2 transition-all duration-500 ease-out" 
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-white/50 text-slate-900">
          <form onSubmit={onSubmit} className="h-full flex flex-col justify-between">
            
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold mb-3">What do you want to learn?</h2>
                  <select 
                    className="w-full border border-slate-200 p-4 rounded-xl text-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
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
                  <h2 className="text-xl font-bold mb-3">When do you plan to start?</h2>
                  <div className="space-y-3">
                    {["Immediately", "Within a month", "Not sure, just want to look at options"].map((time) => (
                      <label key={time} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${form.startTime === time ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input 
                          type="radio" 
                          name="startTime" 
                          value={time} 
                          checked={form.startTime === time}
                          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-md font-medium">{time}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold mb-3">How would you like to attend classes?</h2>
                  <div className="space-y-3">
                    {[
                      { id: "online", label: "Live Interactive Online Classes", rec: "Recommended" },
                      { id: "in_person", label: "Offline at my Home or nearby Classes", rec: "Very Few Tutors" }
                    ].map((mode) => (
                      <label key={mode.id} className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition ${form.mode === mode.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input 
                          type="radio" 
                          name="mode" 
                          value={mode.id} 
                          checked={form.mode === mode.id}
                          onChange={(e) => setForm({ ...form, mode: e.target.value })}
                          className="w-5 h-5 mt-1 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <span className="text-md font-bold block">{mode.label}</span>
                          <span className="text-sm text-slate-500">{mode.rec}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-3">Which board of education?</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["CBSE", "ICSE", "State", "IB", "IGCSE", "NIOS"].map((board) => (
                      <label key={board} className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition text-center font-medium ${form.board === board ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600 text-indigo-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                        <input type="radio" name="board" value={board} checked={form.board === board} onChange={(e) => setForm({ ...form, board: e.target.value })} className="hidden" />
                        <span>{board}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-bold mb-3">A few more details...</h2>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Your Pincode</label>
                  <input className="w-full border border-slate-200 p-4 rounded-xl text-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Any specific notes for the teacher?</label>
                  <textarea className="w-full border border-slate-200 p-4 rounded-xl text-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} placeholder="e.g. Need help with board exam preparation..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">Sign-up to Book a Free Demo</h2>
                </div>
                <div className="space-y-4">
                  <input className="w-full border border-slate-200 p-4 rounded-xl text-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                  <input className="w-full border border-slate-200 p-4 rounded-xl text-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <span className="bg-slate-100 p-4 text-slate-600 border-r border-slate-200 font-bold">India (+91)</span>
                    <input className="w-full p-4 text-lg outline-none bg-transparent" type="tel" placeholder="Mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                </div>
                {msg && <p className="text-indigo-600 font-bold text-center bg-indigo-50 p-3 rounded-xl border border-indigo-100">{msg}</p>}
              </div>
            )}

            <div className="mt-8 flex gap-4 pt-6 border-t border-slate-100">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="w-1/3 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-200 transition">
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
              )}
              {step < 4 ? (
                <button type="button" onClick={nextStep} className={`bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition ${step === 1 ? 'w-full' : 'w-2/3'}`}>
                  Next Step
                </button>
              ) : (
                <button type="submit" disabled={loading} className="w-2/3 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
                  {loading ? "Processing..." : "Submit Requirement"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}