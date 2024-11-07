import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
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
  Clock,
} from "lucide-react";
import { redirect } from "next/navigation";

async function getUserDatasets() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    // First, try to get all datasets without filtering
    const { data: datasets, error: datasetsError } = await supabase
      .from("datasets")
      .select("*")
      .order("created_at", { ascending: false });

    if (datasetsError) {
      console.error("Error fetching datasets:", datasetsError);
      return { datasets: [], error: datasetsError.message };
    }

    console.log("Fetched datasets:", datasets); // Debug log
    return { datasets: datasets || [], error: null };
  } catch (error) {
    console.error("Error in getUserDatasets:", error);
    return { datasets: [], error: "Failed to fetch datasets" };
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatFileSize(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  const { data: datasets } = await supabase
    .from("datasets")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">My Data</h1>
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
                <Card key={dataset.id} className="flex flex-col">
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
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {dataset.description}
                    </p>
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
                    <Button variant="outline" className="flex-1">
                      View Details
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
