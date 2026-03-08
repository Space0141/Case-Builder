import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

describe("LoginPage", () => {
  it("renders login button", () => {
    render(
      <MemoryRouter>
        <LoginPage user={null} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Login with Discord/i)).toBeInTheDocument();
  });
});
