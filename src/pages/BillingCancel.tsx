import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const BillingCancel = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="text-center space-y-4">
      <XCircle className="h-16 w-16 text-destructive mx-auto" />
      <h1 className="text-2xl font-bold">Pagamento cancelado</h1>
      <p className="text-muted-foreground">O processo foi cancelado.</p>
      <Button asChild><Link to="/billing">Voltar aos planos</Link></Button>
    </div>
  </div>
);

export default BillingCancel;
