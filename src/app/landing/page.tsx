"use client";

import { useAuth } from "@/lib/clerk-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PawPrint, Shield, BarChart3, Users, CheckCircle, LogIn } from "lucide-react";
import { SITE_BRANDING } from "@/lib/site-branding";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="bg-card/80 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <PawPrint className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline text-primary leading-tight">
                  {SITE_BRANDING.organisationShortName}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Wildlife Shelter Authorisation {SITE_BRANDING.authorisationNumber}
                </p>
              </div>
            </div>
            <Link href="/sign-in">
              <Button size="lg">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16 space-y-8">
          <div className="flex justify-center px-4">
            <div className="relative h-36 w-72 sm:h-48 sm:w-96">
              <Image
                src={SITE_BRANDING.logoPath}
                alt={SITE_BRANDING.organisationName}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-primary">
              {SITE_BRANDING.organisationName}
              <span className="block text-3xl lg:text-4xl mt-2 text-muted-foreground">
                Licensed wildlife rehabilitation in the Macedon Ranges
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We care for sick, injured and orphaned native wildlife under a
              Victorian shelter authorisation. This site is where our carers
              record the animals in their care, from intake through to release.
            </p>
          </div>
          
          <div className="flex justify-center pt-4">
            <Link href="/sign-in">
              <Button size="lg" className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all">
                <LogIn className="mr-2 h-5 w-5" />
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground pt-4">
            Contact your organisation administrator for access
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 py-8 sm:py-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <span className="text-sm font-medium">ACT Wildlife Compliant</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <span className="text-sm font-medium">Multi-Jurisdiction Support</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <span className="text-sm font-medium">Secure Cloud Storage</span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center space-y-4">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <PawPrint className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Animal tracking Australia</h3>
              <p className="text-muted-foreground text-sm">
                Track every animal from rescue to release with medical records and care notes.
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center space-y-4">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Compliance ready</h3>
              <p className="text-muted-foreground text-sm">
                Built-in tools for Australian wildlife codes of practice and regulations.
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center space-y-4">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Carer management</h3>
              <p className="text-muted-foreground text-sm">
                Manage carers, track licences, training, and coordinate care assignments.
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center space-y-4">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Analytics and reports</h3>
              <p className="text-muted-foreground text-sm">
                Generate compliance reports, track outcomes, and see how the operation is going.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="text-center py-8 text-muted-foreground border-t mt-16">
        <div className="container mx-auto px-4">
          <p>
            &copy; {new Date().getFullYear()} {SITE_BRANDING.organisationName}
            {' '}({SITE_BRANDING.registrationNumber})
          </p>
          <p className="text-sm mt-1">
            Wildlife Shelter Authorisation {SITE_BRANDING.authorisationNumber},
            issued under the Wildlife Act 1975 (Vic).
          </p>
          <p className="text-sm mt-3">
            Running on {SITE_BRANDING.productName}.
          </p>
        </div>
      </footer>
    </div>
  );
}
