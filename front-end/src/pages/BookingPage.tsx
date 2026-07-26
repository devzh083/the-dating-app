import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import { User, Heart, PartyPopper, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/config";

const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";

interface Cafe {
  id: number;
  name: string;
  area: string;
  price_for_two: number;
  date_booking_discount_percent: number;
}

interface MatchOption {
  match_id: number;
  email: string;
  first_name: string | null;
}

interface Slot {
  time: string;
  remaining: number;
  available: boolean;
}

type BookingMode = "solo" | "date";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export default function BookingPage() {
  const { id } = useParams(); // cafe id
  const navigate = useNavigate();

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [matchesLoaded, setMatchesLoaded] = useState(false);
  const [mode, setMode] = useState<BookingMode>("date");
  const [matchId, setMatchId] = useState("");
  const [date, setDate] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* ---------------- LOAD CAFE + MATCHES ---------------- */
  useEffect(() => {
    fetch(`${API_BASE_URL}/cafes/${id}/`)
      .then((res) => res.json())
      .then(setCafe)
      .catch(() => setError("Could not load this cafe"));

    fetch(`${API_BASE_URL}/chats/matched/`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => setMatches(Array.isArray(data) ? data : []))
      .catch(() => setError("Could not load your matches"))
      .finally(() => setMatchesLoaded(true));
  }, [id]);

  /* ---------------- DEFAULT MODE BASED ON WHETHER USER HAS MATCHES ---------------- */
  useEffect(() => {
    if (matchesLoaded && matches.length === 0) setMode("solo");
  }, [matchesLoaded, matches]);

  /* ---------------- LOAD AVAILABILITY WHEN DATE CHANGES ---------------- */
  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setSelectedSlot("");
    fetch(`${API_BASE_URL}/cafes/${id}/availability/?date=${date}`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setError("Could not load availability"))
      .finally(() => setLoadingSlots(false));
  }, [date, id]);

  /* ---------------- SUBMIT BOOKING ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "date" && !matchId) {
      setError("Choose who you're booking this date with");
      return;
    }
    if (!date || !selectedSlot) {
      setError("Pick a date and time");
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        date,
        time_slot: selectedSlot,
        party_size: partySize,
      };
      if (mode === "date") body.match_id = matchId;

      const res = await fetch(`${API_BASE_URL}/cafes/${id}/book/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to book table");
      }

      setSuccess(true);
      setTimeout(() => navigate("/cafes"), 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const discountPercent = cafe?.date_booking_discount_percent ?? 0;
  const originalPrice = cafe?.price_for_two ?? 0;
  const discountedPrice =
    mode === "date" && discountPercent > 0
      ? Math.round((originalPrice * (100 - discountPercent)) / 100)
      : originalPrice;

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 md:pt-20 pb-10 overflow-x-hidden">
      <TopBar />

      <div className="w-full max-w-xl mx-auto px-4 sm:px-6">
        <div className="rounded-[28px] sm:rounded-[32px] bg-white border border-gray-100 shadow-xl p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">Book a Table</h1>
          <p className="text-sm text-gray-500 mb-6">
            {cafe ? `at ${cafe.name}${cafe.area ? ` — ${cafe.area}` : ""}` : "Loading..."}
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success ? (
            <div className="rounded-xl bg-emerald-50 p-6 text-emerald-700 text-center">
              <PartyPopper className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
              <p className="font-bold text-lg">Table booked!</p>
              <p className="text-sm mt-1">
                {mode === "date" ? "We've let your match know too." : "See you there!"}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Solo vs Date toggle */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Who's this booking for?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("solo")}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3.5 transition",
                      mode === "solo"
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    )}
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-semibold">Just Me</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("date")}
                    disabled={matches.length === 0}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3.5 transition disabled:opacity-40 disabled:cursor-not-allowed",
                      mode === "date"
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    )}
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-semibold">A Date</span>
                    {discountPercent > 0 && (
                      <span
                        className={cn(
                          "absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] text-white font-bold shadow-sm",
                          PRIMARY_GRADIENT
                        )}
                      >
                        {discountPercent}% off
                      </span>
                    )}
                  </button>
                </div>
                {matches.length === 0 && (
                  <p className="mt-2 text-xs text-gray-400">
                    You don't have any matches yet — go find one first, or book solo for now!
                  </p>
                )}
              </div>

              {/* Match picker */}
              {mode === "date" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Who's this date with?
                  </label>
                  <select
                    value={matchId}
                    onChange={(e) => setMatchId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 p-3 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-300 outline-none"
                  >
                    <option value="">Select a match</option>
                    {matches.map((m) => (
                      <option key={m.match_id} value={m.match_id}>
                        {m.first_name || m.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price preview */}
              {cafe && (
                <div className={cn("rounded-2xl p-4 flex items-center justify-between", mode === "date" && discountPercent > 0 ? "bg-teal-50" : "bg-gray-50")}>
                  <span className="text-sm text-gray-600">Estimated price for two</span>
                  <div className="flex items-center gap-2">
                    {mode === "date" && discountPercent > 0 && (
                      <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
                    )}
                    <span className="text-lg font-bold text-gray-900">₹{discountedPrice}</span>
                  </div>
                </div>
              )}
              {mode === "date" && discountPercent > 0 && (
                <p className="-mt-3 flex items-center gap-1.5 text-xs font-semibold text-teal-600">
                  <Sparkles className="w-3.5 h-3.5 fill-teal-500" />
                  Date bookings get {discountPercent}% off — on us.
                </p>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 p-3 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-300 outline-none"
                />
              </div>

              {date && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Time</label>
                  {loadingSlots ? (
                    <p className="text-sm text-gray-500">Loading availability...</p>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-gray-500">No slots available that day.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots.map((slot) => (
                        <button
                          type="button"
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={cn(
                            "rounded-xl border py-2 text-sm font-medium transition",
                            selectedSlot === slot.time
                              ? "bg-teal-500 text-white border-teal-500"
                              : slot.available
                              ? "bg-white text-gray-700 border-gray-200 hover:border-teal-400"
                              : "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Party size</label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 p-3 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-300 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>

              <button
                disabled={submitting}
                className={cn(
                  "w-full rounded-2xl py-3.5 text-white font-bold shadow-lg transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100",
                  PRIMARY_GRADIENT
                )}
              >
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
