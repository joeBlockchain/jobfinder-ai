//import next stuff
import Link from "next/link";

//import clerk stuff
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

//import shadcnui stuff
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="w-full py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col justify-center space-y-4">
          <div className="mx-3 space-y-2 lg:space-y-3 max-w-md md:max-w-2xl lg:max-w-3xl">
            <h1 className="leading-tight lg::leading-snug font-black text-5xl lg:text-7xl ">
              Revolutionize Your Job Hunt with AI.
            </h1>
            <p className="leading-normal text-xl text-muted-foreground">
              A smarter way to find and apply for your dream job awaits!
            </p>
          </div>
          <SignedOut>
            <SignUpButton>
              <Button
                variant="default"
                className="mx-3 w-40 text-lg h-12 lg:h-14 lg:rounded-xl lg:text-xl"
              >
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Button className="mx-3 w-40 text-lg h-12 lg:h-14 lg:rounded-xl lg:text-xl">
              <Link href="/job-hunt">My Job Hunt</Link>
            </Button>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}
