
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MoveLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center p-6">
        <h1 className="text-6xl font-bold mb-4 text-autocomp-500">404</h1>
        <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Page Not Found</p>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Sorry, we couldn't find the page you're looking for. The page may have been moved or doesn't exist.
        </p>
        <Button asChild className="bg-autocomp-500 hover:bg-autocomp-600">
          <Link to="/">
            <MoveLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
