import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  FileCheck,
  FileWarning,
  MessageSquare,
  PlusCircle,
  TicketCheck,
  SquareCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const HomePage = () => {
  // Add scroll to top effect when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [stats, setStats] = useState({
  active: 0,
  completed: 0,
  total: 0,
});

useEffect(() => {
  window.scrollTo(0, 0);

  const userId = localStorage.getItem("autocomp-user-id");
  if (!userId) return;

  fetch(`https://localhost:7181/api/ticket/user/${userId}/stats`)
    .then((res) => res.json())
    .then((data) => setStats(data))
    .catch(console.error);
}, []);

  return (
    <div className="space-y-8 pb-10">
      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to AutoComp
          </h1>
          <p className="text-muted-foreground">
            Your complete technical support solution. Get help, track requests,
            and solve common issues all in one place.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TicketCheck className="h-4 w-4 text-autocomp-500" />
                    Active Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold">{stats.active}</div>
                </CardContent>
                <CardFooter>
                  <Link
                    to="/tickets"
                    className="text-xs text-autocomp-500 hover:underline"
                  >
                    View tickets
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-green-500" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold">{stats.completed}</div>
                </CardContent>
                <CardFooter>
                  <Link
                    to="/tickets"
                    className="text-xs text-autocomp-500 hover:underline"
                  >
                    View history
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <SquareCheck className="h-4 w-4 text-blue-500" />
                    Total Requests{" "}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
                <CardFooter>
                  <Link
                    to="/tickets"
                    className="text-xs text-autocomp-500 hover:underline"
                  >
                    View details
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    Request Response
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold">Same Day</div>
                </CardContent>
                <CardFooter>
                  <span className="text-xs text-green-500">
                    Efficient service
                  </span>
                </CardFooter>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Need Technical Support?
                  </CardTitle>
                  <CardDescription>
                    Submit a new maintenance request for our technical team to
                    help you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TicketCheck className="h-5 w-5 text-autocomp-500" />
                    <span>Detailed issue tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-autocomp-500" />
                    <span>Direct communication with experts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileWarning className="h-5 w-5 text-autocomp-500" />
                    <span>Fast response to issues</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-autocomp-500 hover:bg-autocomp-600"
                  >
                    <Link to="/submit">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Submit Request
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">Common Issues</CardTitle>
                  <CardDescription>
                    Find solutions to frequently reported problems.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Link
                      to="/issues"
                      className="group flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-autocomp-500" />
                        <div>Network connectivity problems</div>
                      </div>
                      <div className="text-sm text-muted-foreground group-hover:underline">
                        View
                      </div>
                    </Link>
                    <Link
                      to="/issues"
                      className="group flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-autocomp-500" />
                        <div>Software installation issues</div>
                      </div>
                      <div className="text-sm text-muted-foreground group-hover:underline">
                        View
                      </div>
                    </Link>
                    <Link
                      to="/issues"
                      className="group flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-autocomp-500" />
                        <div>Printer not working</div>
                      </div>
                      <div className="text-sm text-muted-foreground group-hover:underline">
                        View
                      </div>
                    </Link>
                    <Link
                      to="/issues"
                      className="group flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-autocomp-500" />
                        <div>Email setup and configuration</div>
                      </div>
                      <div className="text-sm text-muted-foreground group-hover:underline">
                        View
                      </div>
                    </Link>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/issues">View All Issues</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets">
            <div className="flex justify-center py-16">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  My Tickets Preview
                </h2>
                <p className="text-muted-foreground max-w-md mb-4">
                  View and manage all your support tickets in one place.
                </p>
                <Button
                  asChild
                  className="bg-autocomp-500 hover:bg-autocomp-600"
                >
                  <Link to="/tickets">Go to My Tickets</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="issues">
            <div className="flex justify-center py-16">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  Common Issues Preview
                </h2>
                <p className="text-muted-foreground max-w-md mb-4">
                  Find solutions to frequently encountered technical problems.
                </p>
                <Button
                  asChild
                  className="bg-autocomp-500 hover:bg-autocomp-600"
                >
                  <Link to="/issues">Go to Common Issues</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <div className="flex justify-center py-16">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  Contact Us Preview
                </h2>
                <p className="text-muted-foreground max-w-md mb-4">
                  Get in touch with our technical support team via chat.
                </p>
                <Button
                  asChild
                  className="bg-autocomp-500 hover:bg-autocomp-600"
                >
                  <Link to="/contact">Go to Contact Us</Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default HomePage;
