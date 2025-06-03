
import { Link } from "react-router-dom";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                <img src="/favicon.ico" alt="AutoComp Logo" className="h-8 w-8" />
              </div>
              <span className="font-bold text-lg">AutoComp</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your complete technical support solution. Streamline your maintenance
              requests and get the help you need quickly.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" onClick={scrollToTop} className="text-muted-foreground hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tickets" onClick={scrollToTop} className="text-muted-foreground hover:text-foreground">
                  My Tickets
                </Link>
              </li>
              <li>
                <Link to="/submit" onClick={scrollToTop} className="text-muted-foreground hover:text-foreground">
                  Submit Request
                </Link>
              </li>
              <li>
                <Link to="/issues" onClick={scrollToTop} className="text-muted-foreground hover:text-foreground">
                  Common Issues
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-sm">Contact Info</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>projecttwogroup1@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+962781234567</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <Link to="/contact" onClick={scrollToTop} className="hover:text-foreground">
                  Live Chat
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3 md:col-span-1">
            <h3 className="font-medium text-sm">Need Help?</h3>
            <p className="text-sm text-muted-foreground">
              Can't find a solution to your problem? Contact our support team.
            </p>
            <div className="flex gap-2">
              <Button asChild className="bg-autocomp-500 hover:bg-autocomp-600">
                <Link to="/contact" onClick={scrollToTop}>Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col gap-4 sm:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AutoComp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
