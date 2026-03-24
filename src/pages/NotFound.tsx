import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ShoppingBag, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex items-center justify-center bg-background">
        <div className="container-tight py-20">
          <div className="max-w-lg mx-auto text-center">
            {/* Large 404 Display */}
            <div className="relative mb-8">
              <span className="font-display text-[150px] md:text-[200px] font-bold text-muted/50 leading-none">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary/10 rounded-full p-6">
                  <ShoppingBag className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>

            {/* Message */}
            <h1 className="font-display text-3xl md:text-4xl uppercase tracking-wide mb-4">
              Page Not Found
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like this jersey got lost in the transfer window. 
              The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button asChild className="btn-hero gap-2">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/shop">
                  <ShoppingBag className="h-4 w-4" />
                  Browse Shop
                </Link>
              </Button>
            </div>

            {/* Help Link */}
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <Link to="/contact" className="text-primary hover:underline inline-flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
