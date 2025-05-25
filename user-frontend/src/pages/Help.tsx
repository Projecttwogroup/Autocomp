
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BookOpen,
  FileText,
  Globe,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  Play,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

const Help = () => {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">
          Find guides, resources, and answers to your questions.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search help articles..."
              className="pl-8"
            />
          </div>
        </div>
        <Link to="/contact">
          <Button className="bg-autocomp-500 hover:bg-autocomp-600">
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="guides" className="w-full">
        <TabsList>
          <TabsTrigger value="guides">Quick Guides</TabsTrigger>
          <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
          <TabsTrigger value="faq">FAQs</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>
        
        <TabsContent value="guides" className="mt-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-autocomp-500" />
                  <span>Getting Started</span>
                </CardTitle>
                <CardDescription>
                  New to AutoComp? Start here to learn the basics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="group rounded-lg border p-3 hover:bg-accent">
                  <h3 className="font-medium group-hover:text-accent-foreground">Submitting your first ticket</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn how to create and submit a maintenance request.
                  </p>
                </div>
                <div className="group rounded-lg border p-3 hover:bg-accent">
                  <h3 className="font-medium group-hover:text-accent-foreground">Understanding ticket status</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn what each ticket status means and how to track progress.
                  </p>
                </div>
                <div className="group rounded-lg border p-3 hover:bg-accent">
                  <h3 className="font-medium group-hover:text-accent-foreground">Using the AI assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Get help with common issues using our AI assistant.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Guides</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-autocomp-500" />
                  <span>Account Management</span>
                </CardTitle>
                <CardDescription>
                  Manage your profile and account settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="group rounded-lg border p-3 hover:bg-accent">
                  <h3 className="font-medium group-hover:text-accent-foreground">Updating your profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn how to update your personal information.
                  </p>
                </div>
                <div className="group rounded-lg border p-3 hover:bg-accent">
                  <h3 className="font-medium group-hover:text-accent-foreground">Changing your password</h3>
                  <p className="text-sm text-muted-foreground">
                    Steps to update your password and secure your account.
                  </p>
                </div>
                <div className="group rounded-lg border p-3 hover:bg-accent">
                  <h3 className="font-medium group-hover:text-accent-foreground">Managing notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure your notification preferences.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Guides</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-autocomp-500" />
                  <span>Troubleshooting</span>
                </CardTitle>
                <CardDescription>
                  Common issues and their solutions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="group rounded-lg border p-3 hover:bg-accent">
                  <h3 className="font-medium group-hover:text-accent-foreground">Network connectivity</h3>
                  <p className="text-sm text-muted-foreground">
                    How to resolve common network connection issues.
                  </p>
                </div>
                <div className="group rounded-lg border p-3 hover:bg-accent">
                  <h3 className="font-medium group-hover:text-accent-foreground">Printer problems</h3>
                  <p className="text-sm text-muted-foreground">
                    Troubleshoot common printer issues.
                  </p>
                </div>
                <div className="group rounded-lg border p-3 hover:bg-accent">
                  <h3 className="font-medium group-hover:text-accent-foreground">Software installation</h3>
                  <p className="text-sm text-muted-foreground">
                    Resolve software installation and update issues.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/issues" className="w-full">
                  <Button variant="outline" className="w-full">View Common Issues</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Popular Help Articles</CardTitle>
              <CardDescription>
                Frequently accessed help resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <div className="rounded-full p-1.5 bg-autocomp-100 dark:bg-autocomp-900">
                    <FileText className="h-4 w-4 text-autocomp-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">How to reset your password</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Step by step guide to resetting your password if you've forgotten it.
                    </p>
                    <p className="text-xs text-autocomp-500 mt-1">3 min read</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="rounded-full p-1.5 bg-autocomp-100 dark:bg-autocomp-900">
                    <FileText className="h-4 w-4 text-autocomp-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Connecting to company VPN</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Instructions for setting up and connecting to the company VPN.
                    </p>
                    <p className="text-xs text-autocomp-500 mt-1">5 min read</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="rounded-full p-1.5 bg-autocomp-100 dark:bg-autocomp-900">
                    <FileText className="h-4 w-4 text-autocomp-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Accessing shared drives</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      How to connect to and use shared network drives.
                    </p>
                    <p className="text-xs text-autocomp-500 mt-1">4 min read</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="rounded-full p-1.5 bg-autocomp-100 dark:bg-autocomp-900">
                    <FileText className="h-4 w-4 text-autocomp-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email configuration guide</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Setting up your company email on various devices and clients.
                    </p>
                    <p className="text-xs text-autocomp-500 mt-1">6 min read</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Browse All Articles</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="videos" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-0">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center mb-2">
                  <Play className="h-12 w-12 text-autocomp-500" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="font-medium text-lg">Submitting a Maintenance Request</h3>
                <p className="text-muted-foreground text-sm mt-1">Learn how to submit a new maintenance request step by step.</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Play className="h-3 w-3" />
                  <span>3:45</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-0">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center mb-2">
                  <Play className="h-12 w-12 text-autocomp-500" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="font-medium text-lg">Setting Up Your Profile</h3>
                <p className="text-muted-foreground text-sm mt-1">How to update your profile information and preferences.</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Play className="h-3 w-3" />
                  <span>2:30</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-0">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center mb-2">
                  <Play className="h-12 w-12 text-autocomp-500" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="font-medium text-lg">Tracking Your Tickets</h3>
                <p className="text-muted-foreground text-sm mt-1">How to track the status and progress of your support tickets.</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Play className="h-3 w-3" />
                  <span>4:15</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-0">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center mb-2">
                  <Play className="h-12 w-12 text-autocomp-500" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="font-medium text-lg">Using the AI Assistant</h3>
                <p className="text-muted-foreground text-sm mt-1">How to get help from the AI assistant for common issues.</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Play className="h-3 w-3" />
                  <span>3:10</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-0">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center mb-2">
                  <Play className="h-12 w-12 text-autocomp-500" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="font-medium text-lg">Common Network Issues</h3>
                <p className="text-muted-foreground text-sm mt-1">Troubleshooting common network connectivity problems.</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Play className="h-3 w-3" />
                  <span>5:45</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-0">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center mb-2">
                  <Play className="h-12 w-12 text-autocomp-500" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="font-medium text-lg">Printer Setup Guide</h3>
                <p className="text-muted-foreground text-sm mt-1">How to set up and configure printers in the office.</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Play className="h-3 w-3" />
                  <span>4:30</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Quick answers to common questions about our support system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">How do I submit a maintenance request?</h3>
                <p className="text-sm text-muted-foreground">
                  You can submit a maintenance request by clicking on the "Submit Request" button in the navigation menu. Fill out the form with details about your issue, including the location, priority, and your availability for a technician visit.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium">How long will it take to resolve my issue?</h3>
                <p className="text-sm text-muted-foreground">
                  Resolution time depends on the nature and priority of your issue. Each ticket has a time limit that you can view in the ticket details. Our team aims to resolve high-priority issues within 24 hours and medium-priority issues within 48 hours.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium">Can I cancel or modify my maintenance request?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel a maintenance request if it's still in the "Received" status. To modify a request, please contact support directly with your ticket ID and the changes you'd like to make.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium">How do I track the status of my request?</h3>
                <p className="text-sm text-muted-foreground">
                  You can track your requests in the "My Tickets" section. Each ticket shows its current status (Received, In Progress, or Completed) and includes a detailed history of updates.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium">What should I do if my issue is urgent?</h3>
                <p className="text-sm text-muted-foreground">
                  For urgent issues, mark your ticket as "High Priority" when submitting. For critical emergencies that can't wait, contact the support team directly by phone at +1 (555) 123-4567.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium">How does the AI assistant work?</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI assistant is trained to help with common technical issues. It can provide troubleshooting steps and guide you through basic problem-solving. If the AI can't resolve your issue, it will suggest submitting a maintenance request or connecting with a human agent.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-autocomp-500" />
                  <span>Email Support</span>
                </CardTitle>
                <CardDescription>
                  Send us an email with your question or issue.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  For general inquiries and non-urgent issues, please email our support team.
                  We typically respond within 1 business day.
                </p>
                <div className="rounded-md bg-muted p-3">
                  <p className="font-medium">Support Email</p>
                  <a href="mailto:support@autocomp.example" className="text-autocomp-500 hover:underline">
                    support@autocomp.example
                  </a>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <a href="mailto:support@autocomp.example">
                    Send Email
                  </a>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-autocomp-500" />
                  <span>Phone Support</span>
                </CardTitle>
                <CardDescription>
                  Speak directly with a support agent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  For urgent issues or if you prefer speaking with someone directly,
                  call our support hotline during business hours.
                </p>
                <div className="rounded-md bg-muted p-3">
                  <p className="font-medium">Support Phone</p>
                  <a href="tel:+15551234567" className="text-autocomp-500 hover:underline">
                    +1 (555) 123-4567
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monday-Friday: 8AM-6PM<br />
                    Saturday: 9AM-3PM
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <a href="tel:+15551234567">
                    Call Support
                  </a>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-autocomp-500" />
                  <span>Live Chat</span>
                </CardTitle>
                <CardDescription>
                  Chat with a support agent or our AI assistant in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-6">
                  Get immediate assistance through our live chat feature. Connect with a human agent
                  or use our AI assistant for quick help with common issues.
                </p>
                <div className="flex items-center justify-center py-6">
                  <Link to="/contact">
                    <Button className="bg-autocomp-500 hover:bg-autocomp-600">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Start Chat
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-autocomp-500" />
                <span>Other Resources</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Browse our extensive documentation for self-help resources.
                  </p>
                  <Button variant="link" className="p-0 h-auto mt-2">
                    Browse Articles
                  </Button>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Community Forum</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect with other users and share solutions.
                  </p>
                  <Button variant="link" className="p-0 h-auto mt-2">
                    Visit Forum
                  </Button>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Video Tutorials</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Watch step-by-step guides for common procedures.
                  </p>
                  <Button variant="link" className="p-0 h-auto mt-2">
                    Watch Videos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;
