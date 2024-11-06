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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { BarChart, FileText, Upload } from "lucide-react";

// This would typically come from your backend
const userDatasets = [
  {
    id: 1,
    title: "Genome Sequence Data",
    type: "DNA",
    size: "2.3 GB",
    downloads: 156,
  },
  {
    id: 2,
    title: "Cancer Cell Mutations",
    type: "Cellular",
    size: "500 MB",
    downloads: 89,
  },
  {
    id: 3,
    title: "Brain Activity Patterns",
    type: "Neuroscience",
    size: "1.1 GB",
    downloads: 203,
  },
];

export default function MyDataPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>My Data</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
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
                <div className="text-2xl font-bold">{userDatasets.length}</div>
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
                  {userDatasets.reduce(
                    (sum, dataset) => sum + dataset.downloads,
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userDatasets.map((dataset) => (
              <Card key={dataset.id}>
                <CardHeader>
                  <CardTitle>{dataset.title}</CardTitle>
                  <CardDescription>{dataset.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Size: {dataset.size}</p>
                  <p>Downloads: {dataset.downloads}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
