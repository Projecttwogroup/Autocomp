import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  ChevronDown,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Search,
  Trash2,
  Image,
  MessageSquare,
} from "lucide-react";

const Tickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const getFileMimeType = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "image/*";
      case "pdf":
        return "application/pdf";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "txt":
        return "text/plain";
      default:
        return "application/octet-stream";
    }
  };

  const fetchTickets = async () => {
    const userId = localStorage.getItem("autocomp-user-id");
    if (!userId) return;

    try {
      const response = await fetch(
        `https://localhost:7181/api/ticket/user/${userId}`
      );
      const data = await response.json();

      const mapped = data.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.description.split(" ").slice(0, 5).join(" ") + "...",
        description: ticket.description,
        status:
          ticket.status.toLowerCase() === "pending"
            ? "received"
            : ticket.status.toLowerCase().replace(" ", "-"),
        department: ticket.department || "Unknown",
        submittedOn: ticket.createdAt,
        timeLimit: new Date(
          new Date(ticket.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        location: ticket.location,
        contactNumber: ticket.contactNumber,
        officeHours: `${ticket.officeHoursStart} - ${ticket.officeHoursEnd}`,
        attachments:
          ticket.attachments?.map((file: any) => ({
            name: file.name,
            type: getFileMimeType(file.url),
            url: `https://localhost:7181${file.url}`,
          })) || [],
        updates: [
          {
            date: ticket.createdAt,
            message: "Ticket received",
          },
        ],
      }));

      setTickets(mapped);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets(); // initial load

    const interval = setInterval(() => {
      fetchTickets(); // auto-refresh every 5 seconds
    }, 5000);

    return () => clearInterval(interval); // clean up on unmount
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    // Filter by search term
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.department.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by status tab
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active")
      return ticket.status !== "completed" && matchesSearch;
    if (activeTab === "completed")
      return ticket.status === "completed" && matchesSearch;

    return matchesSearch && ticket.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "received":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
          >
            Received
          </Badge>
        );
      case "in-progress":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
          >
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-600 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
          >
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsViewOpen(true);
  };

  const handleDeleteConfirmation = (ticketId: string) => {
    setTicketToDelete(ticketId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (ticketToDelete) {
      try {
        // Filter out the deleted ticket
        const updatedTickets = tickets.filter(
          (ticket) => ticket.id !== ticketToDelete
        );
        setTickets(updatedTickets);

        toast({
          title: "Request Deleted",
          description: `Request ${ticketToDelete} has been deleted.`,
        });
      } catch (error) {
        console.error("Error deleting ticket:", error);
      } finally {
        setIsDeleteDialogOpen(false);
        setTicketToDelete(null);
      }
    }
  };

  const handleRateTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setRating(ticket.rating || 0);
    setFeedback(ticket.feedback || "");
    setIsRatingDialogOpen(true);
  };

  const submitRating = () => {
    if (selectedTicket) {
      // Update the rating for the selected ticket
      const updatedTickets = tickets.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              rating,
              feedback,
              completedOn: ticket.completedOn || new Date().toISOString(),
            }
          : ticket
      );

      setTickets(updatedTickets);

      toast({
        title: "Thank You for Your Feedback",
        description: "Your rating has been submitted successfully.",
      });

      setIsRatingDialogOpen(false);
    }
  };

  const renderStarRating = (value: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl ${
              star <= value
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
            onClick={() => setRating(star)}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
        <p className="text-muted-foreground">
          View and manage all your support requests in one place.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button asChild className="bg-autocomp-500 hover:bg-autocomp-600">
          <Link to="/submit">Create New Request</Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Requests</CardTitle>
          <CardDescription>
            {filteredTickets.length} requests found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No requests found</h3>
              <p className="text-muted-foreground max-w-sm text-center">
                {searchTerm
                  ? "No requests matching your search criteria"
                  : "You don't have any requests in this category yet"}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono">{ticket.id}</TableCell>
                      <TableCell className="font-medium">
                        {ticket.title}
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{formatDate(ticket.submittedOn)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewTicket(ticket)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {ticket.status === "completed" &&
                              !ticket.rating && (
                                <DropdownMenuItem
                                  onClick={() => handleRateTicket(ticket)}
                                >
                                  <Star className="mr-2 h-4 w-4" />
                                  Rate Service
                                </DropdownMenuItem>
                              )}
                            {ticket.status === "received" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteConfirmation(ticket.id)
                                }
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        {selectedTicket && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Request Details: {selectedTicket.id}</DialogTitle>
              <DialogDescription>
                Submitted on {formatDate(selectedTicket.submittedOn)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-2">
                  {selectedTicket.title}
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  {getStatusBadge(selectedTicket.status)}
                  <Badge
                    variant="outline"
                    className="bg-autocomp-50 text-autocomp-600 border-autocomp-200 dark:bg-autocomp-950 dark:text-autocomp-400 dark:border-autocomp-800"
                  >
                    {selectedTicket.department}
                  </Badge>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg mb-4">
                  <p>{selectedTicket.description}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Contact Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Location:</span>{" "}
                    {selectedTicket.location}
                  </div>
                  <div>
                    <span className="font-medium">Contact Number:</span>{" "}
                    {selectedTicket.contactNumber}
                  </div>
                  <div>
                    <span className="font-medium">Office Hours:</span>{" "}
                    {selectedTicket.officeHours}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Submitted:</span>{" "}
                    {formatDate(selectedTicket.submittedOn)}
                  </div>
                  <div>
                    <span className="font-medium">Time Limit:</span>{" "}
                    {formatDate(selectedTicket.timeLimit)}
                  </div>
                  {selectedTicket.completedOn && (
                    <div>
                      <span className="font-medium">Completed:</span>{" "}
                      {formatDate(selectedTicket.completedOn)}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <h4 className="text-sm font-medium mb-2">Attachments</h4>
                {selectedTicket.attachments.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {selectedTicket.attachments.map(
                      (attachment: any, index: number) => (
                        <div
                          key={index}
                          className="flex flex-col items-center rounded-lg border border-border p-3 text-center bg-muted"
                        >
                          <div className="mb-2">
                            {attachment.type.startsWith("image/") ? (
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={attachment.url}
                                  alt={attachment.name}
                                  className="h-20 w-20 object-cover rounded hover:opacity-90 transition"
                                />
                              </a>
                            ) : (
                              <FileText className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="text-sm font-medium truncate w-full">
                            {attachment.name}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    No attachments provided
                  </div>
                )}
              </div>

              {selectedTicket.updates && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium mb-2">Activity</h4>
                  <div className="space-y-3">
                    {selectedTicket.updates.map(
                      (update: any, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="h-2 w-2 mt-2 rounded-full bg-autocomp-500"></div>
                          <div>
                            <p className="text-sm">{update.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(update.date)}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {selectedTicket.status === "completed" && (
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <h4 className="text-sm font-medium mb-2">Service Rating</h4>
                  {selectedTicket.rating ? (
                    <div>
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-xl ${
                              star <= selectedTicket.rating
                                ? "text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {selectedTicket.feedback && (
                        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-sm">
                          "{selectedTicket.feedback}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setIsViewOpen(false);
                        setTimeout(() => handleRateTicket(selectedTicket), 100);
                      }}
                      className="bg-autocomp-500 hover:bg-autocomp-600"
                    >
                      Rate This Service
                    </Button>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              {selectedTicket.status === "received" && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsViewOpen(false);
                    setTimeout(
                      () => handleDeleteConfirmation(selectedTicket.id),
                      100
                    );
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Request
                </Button>
              )}

              <Button asChild className="bg-autocomp-500 hover:bg-autocomp-600">
                <Link to={`/contact?ticket=${selectedTicket.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              request
              {ticketToDelete && ` ${ticketToDelete}`} from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rate Service Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Our Service</DialogTitle>
            <DialogDescription>
              How satisfied were you with the resolution of your request?
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rating">Rating</Label>
              {renderStarRating(rating)}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <textarea
                id="feedback"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Tell us about your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRatingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitRating}
              className="bg-autocomp-500 hover:bg-autocomp-600"
              disabled={rating === 0}
            >
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tickets;
