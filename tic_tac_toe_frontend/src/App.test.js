import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders tic tac toe title", () => {
  render(<App />);
  const title = screen.getByRole("heading", { name: /tic tac toe/i });
  expect(title).toBeInTheDocument();
});
