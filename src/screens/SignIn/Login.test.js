import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter as Router } from "react-router-dom";
import Login from "./Login";

test("Login> Should be able to type in inputs", () => {
    render(<Router><Login /></Router>);
    const emailInputElement = screen.getByRole("textbox");
    const passwordInputElement = screen.getByPlaceholderText("Password");

    userEvent.type(emailInputElement, "navnath@werqlabs.com")
    userEvent.type(passwordInputElement, "password!")
    expect(emailInputElement.value).toBe("navnath@werqlabs.com");
    expect(passwordInputElement.value).toBe("password!");
    // expect(emailError).toBeInTheDocument();
})

test("Email validation", () => {
    render(<Router><Login /></Router>);
    const emailInputElement = screen.getByRole("textbox");
    const passwordInputElement = screen.getByPlaceholderText("Password");
    const submitBtn = screen.getByRole("button");
    userEvent.type(passwordInputElement, "password!")
    userEvent.type(emailInputElement, "")
    userEvent.click(submitBtn);
    const emptyEmail = screen.getByText(/This field cannot be empty./i)
    expect(emptyEmail).toBeInTheDocument();
    userEvent.type(emailInputElement, "navnathwerqlabs.com")
    const invalidEmailError = screen.getByText(/Enter valid email./i)
    expect(invalidEmailError).toBeInTheDocument();
})
// test("it should have Empty inputs", () => {
//     render(<Router><Login /></Router>);
//     const emailInputElement = screen.getByRole("textbox");
//     const passwordInputElement = screen.getByPlaceholderText("Password");
//     expect(emailInputElement.value).toBe("navnath@werqlabs.com");
//     expect(passwordInputElement.value).toBe("password@abc");
//     const submitBtn = screen.getByRole("button");
//     console.log("submitBtn", submitBtn);
// });

// test("Is Login page on screen", () => {
//     render(<Router><Login /></Router>);
//     const linkElement = screen.getByText(/chat/i);
//     expect(linkElement).toBeInTheDocument();
// })