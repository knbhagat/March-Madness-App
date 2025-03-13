import { ShoppingBasket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/navbar";

export function LoginForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    try {
      // Make the POST request to Flask login endpoint
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // If login is successful, store the token or user ID in localStorage
      localStorage.setItem("token", data.token);

      // Navigate to homepage or dashboard
      navigate("/");
    } catch (error: any) {
      console.error("Login failed:", error);
      alert(error.message); // Show the actual error message
    }
  };

  // Header content
  const header = () => {
    return (
      <div className="flex flex-col items-center gap-2">
        <a href="#" className="flex flex-col items-center gap-2 font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-md">
            <ShoppingBasket className="size-6" />
          </div>
          <span className="sr-only"></span>
        </a>
        <h1 className="text-xl font-bold">Welcome Back</h1>
        <div className="text-center text-sm">
          Don't have an account?{" "}
          <a
            onClick={() => navigate("/signup")}
            className="underline underline-offset-4 cursor-pointer"
          >
            Sign Up
          </a>
        </div>
      </div>
    );
  };

  // Input + submit button
  const inputBody = () => {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="q@example.com"
            ref={emailRef}
            required
          />
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            ref={passwordRef}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Log In
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-[500px] m-auto mt-20">
      <div className={cn("flex flex-col gap-6")}>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {header()}
            {inputBody()}
          </div>
        </form>
      </div>
    </div>
  );
}
