import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CafesPage from "./CafesPage";

const CAFES = [
  {
    id: 1, name: "Sunset Terrace", cuisine: "Italian", rating: 4.6, price_for_two: 1200,
    area: "Jubilee Hills", image: null, has_table_booking: true,
    pure_veg: false, serves_alcohol: true, rooftop: true, date_booking_discount_percent: 20,
  },
  {
    id: 2, name: "Green Leaf Kitchen", cuisine: "Pure Vegetarian", rating: 4.5, price_for_two: 800,
    area: "Madhapur", image: null, has_table_booking: true,
    pure_veg: true, serves_alcohol: false, rooftop: false, date_booking_discount_percent: 20,
  },
];

describe("CafesPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("/cafes/")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(CAFES) } as Response);
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
      })
    );
  });

  it("renders all fetched cafes", async () => {
    render(
      <MemoryRouter>
        <CafesPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Sunset Terrace")).toBeInTheDocument());
    expect(screen.getByText("Green Leaf Kitchen")).toBeInTheDocument();
  });

  it("filters to only pure veg cafes when that filter is toggled", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CafesPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Sunset Terrace")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Pure Veg" }));

    expect(screen.queryByText("Sunset Terrace")).not.toBeInTheDocument();
    expect(screen.getByText("Green Leaf Kitchen")).toBeInTheDocument();
  });
});
