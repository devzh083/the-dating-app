import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BookingPage from "./BookingPage";

const CAFE = {
  id: 7,
  name: "Skyline Lounge",
  area: "Hitech City",
  price_for_two: 2000,
  date_booking_discount_percent: 20,
};

const MATCHES = [{ match_id: 2, email: "grace@example.com", first_name: "Grace" }];

function mockFetchSequence() {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      if (url.includes("/cafes/7/") && url.includes("availability")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ date: "2026-08-01", slots: [{ time: "19:00", remaining: 5, available: true }] }),
        } as Response);
      }
      if (url.includes("/cafes/7/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(CAFE) } as Response);
      }
      if (url.includes("/chats/matched/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(MATCHES) } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    })
  );
}

function renderBookingPage() {
  return render(
    <MemoryRouter initialEntries={["/cafes/7/book"]}>
      <Routes>
        <Route path="/cafes/:id/book" element={<BookingPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("BookingPage", () => {
  beforeEach(() => {
    localStorage.setItem("access_token", "test-token");
    mockFetchSequence();
  });

  it("defaults to date mode with a discount once matches load, not stuck on solo", async () => {
    // Regression test: the mode-defaulting effect used to fire on the
    // transient empty `matches` array before the fetch resolved, permanently
    // locking the page into solo mode even for users with real matches.
    renderBookingPage();

    await waitFor(() => expect(screen.getByText("Grace")).toBeInTheDocument());

    expect(screen.getByText(/Estimated price for two/)).toBeInTheDocument();
    expect(screen.getByText("₹1600")).toBeInTheDocument(); // 2000 - 20%
    expect(screen.getByText("₹2000")).toBeInTheDocument(); // struck-through original
  });

  it("shows full price with no discount when switching to solo", async () => {
    const user = userEvent.setup();
    renderBookingPage();

    await waitFor(() => expect(screen.getByText("Grace")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /Just Me/i }));

    await waitFor(() => {
      expect(screen.queryByText("Who's this date with?")).not.toBeInTheDocument();
    });
    expect(screen.getByText("₹2000")).toBeInTheDocument();
    expect(screen.queryByText("₹1600")).not.toBeInTheDocument();
  });

  it("defaults to solo mode when the user genuinely has no matches", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("availability")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ date: "2026-08-01", slots: [] }) } as Response);
        }
        if (url.includes("/cafes/7/")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(CAFE) } as Response);
        }
        if (url.includes("/chats/matched/")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
      })
    );

    renderBookingPage();

    await waitFor(() => {
      expect(screen.getByText(/don't have any matches yet/)).toBeInTheDocument();
      expect(screen.queryByText("Who's this date with?")).not.toBeInTheDocument();
    });
  });
});
