import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL, API_ORIGIN } from "@/lib/config";

const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";

/* ------------------ TYPES ------------------ */
interface Cafe {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  price_for_two: number;
  area: string;
  image: string | null;
  has_table_booking: boolean;
  pure_veg: boolean;
  serves_alcohol: boolean;
  rooftop: boolean;
  date_booking_discount_percent: number;
}

interface CafesPageProps {
  onLogout?: () => void;
}

/* ------------------ FILTERS ------------------ */
const filters = [
  "Book a table",
  "Rating 4+",
  "Pure Veg",
  "Serves Alcohol",
  "Rooftop",
];

/* ------------------ COMPONENT ------------------ */
export default function CafesPage({ onLogout }: CafesPageProps) {
  const navigate = useNavigate();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  /* ------------------ FETCH CAFES ------------------ */
  useEffect(() => {
    fetch(`${API_BASE_URL}/cafes/`)
      .then((res) => res.json())
      .then((data) => setCafes(data))
      .catch((err) => console.error("Failed to load cafes", err))
      .finally(() => setLoading(false));
  }, []);

  /* ------------------ FILTER TOGGLE ------------------ */
  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  /* ------------------ FILTER LOGIC ------------------ */
  const filteredCafes = useMemo(() => {
    let result = cafes;

    if (searchQuery) {
      result = result.filter((cafe) =>
        cafe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilters.includes("Book a table")) {
      result = result.filter((cafe) => cafe.has_table_booking);
    }

    if (activeFilters.includes("Rating 4+")) {
      result = result.filter((cafe) => Number(cafe.rating) >= 4);
    }

    if (activeFilters.includes("Pure Veg")) {
      result = result.filter((cafe) => cafe.pure_veg);
    }

    if (activeFilters.includes("Serves Alcohol")) {
      result = result.filter((cafe) => cafe.serves_alcohol);
    }

    if (activeFilters.includes("Rooftop")) {
      result = result.filter((cafe) => cafe.rooftop);
    }

    return result;
  }, [cafes, searchQuery, activeFilters]);

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 md:pt-20 overflow-x-hidden">
      <TopBar onLogout={onLogout} />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Hero */}
        <div className="text-center mb-8 md:mb-12 px-2">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 mb-3 leading-tight">
            Plan Your Next{" "}
            <span className="text-teal-500 inline-flex items-center gap-2">
              Date
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-4">
            Partner-verified cafes and restaurants for you and your match.
          </p>
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs sm:text-sm font-bold shadow-md",
              PRIMARY_GRADIENT
            )}
          >
            <Sparkles className="w-4 h-4 fill-white" />
            Book with a match and get 20% off
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-2xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cafes"
            className="w-full rounded-full border border-gray-200 bg-white py-3.5 md:py-4 pl-14 pr-6 shadow-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-300 outline-none transition"
          />
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>

          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={cn(
                "shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold border transition",
                activeFilters.includes(filter)
                  ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Cafe Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[300px] w-full bg-white rounded-[32px] border border-gray-100 shadow-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mb-4" />
            <p className="text-sm md:text-base text-gray-500 font-medium">Loading date spots...</p>
          </div>
        ) : filteredCafes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] w-full bg-white rounded-[32px] border border-gray-100 shadow-xl">
            <p className="text-gray-500 font-medium">No cafes found matching your filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCafes.map((cafe) => (
              <div
                key={cafe.id}
                onClick={() => navigate(`/cafes/${cafe.id}/book`)}
                className="cursor-pointer overflow-hidden rounded-[28px] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={
                      cafe.image
                        ? cafe.image.startsWith("http")
                          ? cafe.image
                          : `${API_ORIGIN}${cafe.image}`
                        : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"
                    }
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-xs text-gray-900 font-bold flex items-center gap-1 shadow-sm">
                    {cafe.rating}
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </div>
                  {cafe.date_booking_discount_percent > 0 && (
                    <div
                      className={cn(
                        "absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs text-white font-bold shadow-sm",
                        PRIMARY_GRADIENT
                      )}
                    >
                      {cafe.date_booking_discount_percent}% off for dates
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{cafe.name}</h3>
                  <p className="text-sm text-gray-500">{cafe.cuisine}</p>

                  <div className="flex justify-between items-center mt-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-500 min-w-0">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{cafe.area}</span>
                    </div>
                    <span className="font-semibold text-gray-900 shrink-0 ml-2">
                      ₹{cafe.price_for_two} for two
                    </span>
                  </div>

                  <div className="mt-3">
                    {cafe.has_table_booking ? (
                      <span className="text-xs font-bold text-teal-600 flex items-center gap-1">
                        <CalendarCheck className="h-4 w-4" />
                        Tap to book a table
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Walk-in only</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
