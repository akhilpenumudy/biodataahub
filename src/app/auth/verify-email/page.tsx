"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-center">Check your email</h1>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              We've sent you an email with a confirmation link. Please check your
              inbox and click the link to verify your account.
            </p>
            <div className="flex flex-col space-y-2">
              <Button variant="outline" asChild>
                <Link href="/auth/login">Return to login</Link>
              </Button>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Didn't receive an email?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Try signing up again
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 