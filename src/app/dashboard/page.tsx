"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  FileText,
  Upload,
  Download,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Dataset {
  id: string;
  title: string;
  description: string;
  file_url: string;
  created_at: string;
  file_size: number;
  access_type: string;
  price: number;
  downloads: number;
  curation_notes: string;
  user_id: string;
}

export default function DashboardPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDatasets() {
      try {
        // First get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error("No user found");
          return;
        }

        // Then fetch only this user's datasets
        const { data, error } = await supabase
          .from("datasets")
          .select("*")
          .eq("user_id", user.id) // Only get datasets where user_id matches current user
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDatasets(data || []);
      } catch (error) {
        console.error("Error fetching datasets:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDatasets();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
          <SidebarTrigger />
          <h1 className="text-sm ">My Data</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Datasets
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{datasets.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Downloads
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {datasets.reduce(
                    (sum, dataset) => sum + (dataset.downloads || 0),
                    0
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upload New Dataset
                </CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Link href="/uploaddata">
                  <Button className="w-full">Upload Dataset</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          <Separator className="my-6" />
          <h2 className="text-xl font-semibold mb-4">Your Datasets</h2>
          {datasets.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No datasets found. Click "Upload Dataset" to add your first
              dataset.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {datasets.map((dataset) => (
                <Card
                  key={dataset.id}
                  className={`flex flex-col transition-all duration-200 ease-in-out ${
                    expandedId === dataset.id
                      ? "md:col-span-2 lg:col-span-3"
                      : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {dataset.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {dataset.access_type === "paid" ? (
                            <span className="text-green-600 font-medium">
                              ${dataset.price}
                            </span>
                          ) : (
                            <span className="text-blue-600 font-medium">
                              Free
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Download className="h-4 w-4" />
                        <span>{dataset.downloads || 0}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div
                      className={`prose prose-sm max-w-none ${
                        expandedId === dataset.id ? "" : "line-clamp-2"
                      } mb-4`}
                      dangerouslySetInnerHTML={{
                        __html:
                          dataset.description || "No description provided",
                      }}
                    />
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Uploaded {formatDate(dataset.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{formatFileSize(dataset.file_size)}</span>
                      </div>
                    </div>
                    {expandedId === dataset.id && (
                      <div className="mt-4 space-y-4 border-t pt-4">
                        <div>
                          <h3 className="font-semibold mb-2">Curation Notes</h3>
                          <p className="text-sm text-muted-foreground">
                            {dataset.curation_notes}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Access Type</h3>
                          <p className="text-sm text-muted-foreground">
                            {dataset.access_type === "paid"
                              ? `Paid - $${dataset.price}`
                              : "Free Open Source"}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">
                            File Information
                          </h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Size: {formatFileSize(dataset.file_size)}</p>
                            <p>Upload Date: {formatDate(dataset.created_at)}</p>
                            <p>Downloads: {dataset.downloads || 0}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <a
                        href={dataset.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => toggleExpand(dataset.id)}
                    >
                      {expandedId === dataset.id ? (
                        <>
                          <ChevronUp className="mr-2 h-4 w-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-2 h-4 w-4" />
                          View Details
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
