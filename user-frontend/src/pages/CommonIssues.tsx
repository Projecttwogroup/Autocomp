import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  CheckCircle2,
  Clipboard,
  MessageSquare,
  PlusCircle,
  Search,
  ThumbsUp,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const commonIssues = [
  {
    id: "network-connectivity",
    category: "network",
    title: "Network Connectivity Problems",
    problem: "Unable to connect to the internet or company network.",
    solution: [
      "Check if your Ethernet cable is properly connected or if Wi-Fi is turned on.",
      "Restart your computer and network devices (router, modem).",
      "Run the network troubleshooter by right-clicking on the network icon in the taskbar and selecting 'Troubleshoot problems'.",
      "Reset your network settings: Go to Settings > Network & Internet > Status > Network reset.",
      "Check if other devices can connect to the same network. If not, contact the IT department as there might be a broader network issue.",
    ],
    tags: ["network", "connectivity", "internet"]
  },
  {
    id: "printer-issues",
    category: "printer",
    title: "Printer Not Working",
    problem: "Unable to print documents or printer showing offline status.",
    solution: [
      "Ensure the printer is powered on and connected to the same network as your computer.",
      "Check for paper jams or low ink/toner warnings.",
      "Restart the printer and wait for it to fully initialize.",
      "On your computer, go to Settings > Devices > Printers & scanners, remove the printer, and add it again.",
      "Update or reinstall the printer drivers from the manufacturer's website.",
      "Check if the print spooler service is running: Press Win+R, type 'services.msc', find 'Print Spooler' service, and ensure it's running.",
    ],
    tags: ["printer", "offline", "printing"]
  },
  {
    id: "email-setup",
    category: "email",
    title: "Email Setup and Configuration",
    problem: "Issues with email configuration, sending/receiving emails, or connecting email clients.",
    solution: [
      "Verify your email address and password are correct.",
      "For Outlook: Go to File > Account Settings > Account Settings, select your email account, and click Repair.",
      "Ensure your email client has the correct server settings (SMTP, IMAP/POP3).",
      "Check your internet connection, as email requires internet access.",
      "If using webmail, clear your browser cache and try a different browser.",
      "Ensure you have sufficient storage space in your mailbox.",
      "Contact IT support for specific company email configuration details.",
    ],
    tags: ["email", "outlook", "configuration"]
  },
  {
    id: "software-installation",
    category: "software",
    title: "Software Installation Issues",
    problem: "Unable to install or update software applications.",
    solution: [
      "Ensure you have administrator rights on your computer.",
      "Close all running applications before installing new software.",
      "Download the software directly from the official website or company software portal.",
      "Try running the installer as an administrator: Right-click the installer and select 'Run as administrator'.",
      "Check for and install any pending Windows updates.",
      "Temporarily disable antivirus software during installation.",
      "Clear temporary files: Press Win+R, type '%temp%', and delete unnecessary files.",
    ],
    tags: ["software", "installation", "updates"]
  },
  {
    id: "password-reset",
    category: "account",
    title: "Password Reset Procedure",
    problem: "Need to reset password for company accounts or systems.",
    solution: [
      "For Windows login: Contact IT support for an admin password reset.",
      "For company applications: Use the 'Forgot Password' option on the login page if available.",
      "For email password reset: Go to the webmail login page and click 'Forgot Password' or contact IT support.",
      "After reset, create a strong password with a mix of upper and lower case letters, numbers, and special characters.",
      "Do not reuse passwords across multiple accounts.",
      "Consider using a password manager to securely store your passwords.",
    ],
    tags: ["password", "reset", "account"]
  },
  {
    id: "slow-computer",
    category: "hardware",
    title: "Computer Running Slow",
    problem: "Computer performance has decreased significantly.",
    solution: [
      "Restart your computer to clear temporary memory issues.",
      "Check for and close resource-intensive applications using Task Manager (Ctrl+Shift+Esc).",
      "Run a virus scan using your company's antivirus software.",
      "Clean up disk space: Delete temporary files and unused applications.",
      "Disable unnecessary startup programs: Open Task Manager > Startup tab.",
      "Check if your computer meets the minimum requirements for the software you're using.",
      "Consider requesting a hardware upgrade if your computer is outdated.",
    ],
    tags: ["performance", "slow", "computer"]
  },
  {
    id: "vpn-connection",
    category: "network",
    title: "VPN Connection Issues",
    problem: "Unable to connect to company VPN or frequent disconnections.",
    solution: [
      "Ensure you have a stable internet connection before connecting to VPN.",
      "Restart the VPN client application completely.",
      "Check if your VPN credentials are correct and not expired.",
      "Temporarily disable firewall and antivirus software to test if they're interfering.",
      "Try connecting from a different network if possible.",
      "Clear the VPN client cache or reinstall the VPN client software.",
      "Contact IT support for specific VPN configuration settings.",
    ],
    tags: ["vpn", "remote", "connection"]
  },
  {
    id: "file-sharing",
    category: "network",
    title: "Accessing Shared Drives",
    problem: "Unable to access network shared drives or folders.",
    solution: [
      "Verify you're connected to the company network or VPN if working remotely.",
      "Check if you have the correct permissions to access the shared resource.",
      "Try accessing by IP address instead of hostname: \\\\192.168.x.x\\sharename.",
      "Restart the File Explorer or your computer.",
      "Map the network drive again: Right-click on 'This PC' > 'Map network drive'.",
      "Ensure the server hosting the shared drive is online and accessible.",
      "Contact IT support if you need permission changes or if the issue persists.",
    ],
    tags: ["shared drive", "network", "file sharing"]
  },
  {
    id: "screen-sharing",
    category: "software",
    title: "Screen Sharing in Video Conferences",
    problem: "Issues with screen sharing during video conferences or presentations.",
    solution: [
      "Ensure you've granted the application permission to screen share in your system settings.",
      "Close applications with sensitive information before sharing your screen.",
      "If using multiple monitors, make sure you're sharing the correct screen.",
      "Some applications may require you to quit and restart them before they can be shared.",
      "Check if your web browser is up to date if using web-based conferencing tools.",
      "Try a different web browser if issues persist.",
      "Ensure you have sufficient bandwidth for screen sharing.",
    ],
    tags: ["meetings", "screen sharing", "video conference"]
  },
  {
    id: "outlook-sync",
    category: "email",
    title: "Outlook Calendar Sync Problems",
    problem: "Outlook calendar not syncing properly with mobile devices or other applications.",
    solution: [
      "Ensure you have the latest updates for Outlook installed.",
      "Check your internet connection, as syncing requires internet access.",
      "In Outlook, go to Send/Receive tab and click 'Update Folder'.",
      "Verify your account settings are correct: File > Account Settings.",
      "Reset the Outlook profile: Control Panel > Mail > Show Profiles > Add a new profile.",
      "On mobile devices, remove and re-add the account.",
      "Check if there are any sync restrictions set by your IT administrator.",
    ],
    tags: ["outlook", "calendar", "synchronization"]
  },
  {
    id: "audio-issues",
    category: "hardware",
    title: "Audio Issues in Meetings",
    problem: "Microphone or speakers not working properly during video/audio calls.",
    solution: [
      "Check if your device is properly connected and recognized by your computer.",
      "Set the correct audio input/output device: Right-click on the volume icon > Sounds > Playback/Recording tabs.",
      "Test your microphone and speakers in the meeting application's settings.",
      "Make sure the application has permission to access your microphone: Settings > Privacy > Microphone.",
      "Update your audio drivers from the manufacturer's website.",
      "Try using headphones instead of speakers to eliminate echo.",
      "Restart the meeting application or your computer.",
    ],
    tags: ["audio", "microphone", "meetings"]
  },
  {
    id: "system-updates",
    category: "software",
    title: "System Updates Not Installing",
    problem: "Windows or software updates failing to download or install.",
    solution: [
      "Check your internet connection, as updates require a stable connection.",
      "Ensure you have enough disk space for the updates.",
      "Run the Windows Update Troubleshooter: Settings > Update & Security > Troubleshoot.",
      "Restart the Windows Update service: Press Win+R, type 'services.msc', find 'Windows Update' service, and restart it.",
      "Clear the Windows Update cache: Stop the Windows Update service, delete files in C:\\Windows\\SoftwareDistribution, then restart the service.",
      "Try installing updates in Safe Mode if normal mode fails.",
      "Contact IT support if specific updates consistently fail.",
    ],
    tags: ["updates", "windows", "software"]
  },
];

const categories = [
  { id: "all", name: "All Categories" },
  { id: "network", name: "Network" },
  { id: "hardware", name: "Hardware" },
  { id: "software", name: "Software" },
  { id: "printer", name: "Printer" },
  { id: "email", name: "Email" },
  { id: "account", name: "Account" },
];

const CommonIssues = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { toast } = useToast();

  const filteredIssues = commonIssues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = activeCategory === "all" || issue.category === activeCategory;
      
    return matchesSearch && matchesCategory;
  });

  const handleCopyToClipboard = (solution: string[]) => {
    const textToCopy = solution.map((step, index) => `${index + 1}. ${step}`).join("\n");
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copied to Clipboard",
      description: "Solution steps have been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Common Issues</h1>
        <p className="text-muted-foreground">
          Find solutions to frequently reported technical problems.
        </p>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Knowledge Base</CardTitle>
          <CardDescription>
            Search for common technical issues and their solutions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search issues..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="w-max">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </Tabs>

          {filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No results found</h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't find any issues matching your search. Try different keywords or browse by category.
              </p>
              {searchTerm && (
                <div className="mt-4 space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-muted-foreground mt-4">
                      Can't find what you're looking for?
                    </p>
                    <div className="flex gap-3 mt-2">
                      <Button asChild className="bg-autocomp-500 hover:bg-autocomp-600">
                        <Link to="/contact">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Contact Support
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link to="/submit">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Submit Request
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredIssues.map((issue) => (
                <AccordionItem key={issue.id} value={issue.id}>
                  <AccordionTrigger className="hover:no-underline p-4">
                    <div className="flex flex-col items-start text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">{issue.title}</h3>
                        <Badge variant="secondary" className="ml-2">
                          {categories.find(cat => cat.id === issue.category)?.name || issue.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {issue.problem}
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                        <h4 className="font-medium flex items-center">
                          <CheckCircle2 className="h-5 w-5 text-autocomp-500 mr-2" />
                          Solution Steps
                        </h4>
                        <ol className="list-decimal pl-5 space-y-2">
                          {issue.solution.map((step, index) => (
                            <li key={index} className="text-sm">{step}</li>
                          ))}
                        </ol>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {issue.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          
          <Separator className="my-6" />
          
          <div className="rounded-lg border border-border p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Can't find a solution?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              If you couldn't find a solution to your problem, you can contact our support team or submit a new maintenance request.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-autocomp-500 hover:bg-autocomp-600">
                <Link to="/contact" onClick={() => window.scrollTo(0, 0)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/submit" onClick={() => window.scrollTo(0, 0)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Submit Request
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
};

export default CommonIssues;
