import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-primary-foreground text-sm"></i>
            </div>
            <span className="text-xl font-bold text-foreground">ATS AI</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-features"
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-pricing"
            >
              Pricing
            </a>
            <a 
              href="#contact" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-contact"
            >
              Contact
            </a>
            
            {user ? (
              <Link 
                href={user.role === "recruiter" ? "/recruiter" : "/candidate"}
                data-testid="link-dashboard"
              >
                <Button>
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth" data-testid="link-login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Login
                  </Button>
                </Link>
                <Link href="/auth" data-testid="link-get-started">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <Button variant="ghost" className="md:hidden" data-testid="button-mobile-menu">
            <i className="fas fa-bars text-foreground"></i>
          </Button>
        </div>
      </div>
    </nav>
  );
}
