import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const BillingSuccess = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="text-center space-y-4">
      <CheckCircle className="h-16 w-16 text-success mx-auto" />
      <h1 className="text-2xl font-bold">Pagamento realizado!</h1>
      <p className="text-muted-foreground">Sua assinatura foi ativada com sucesso.</p>
      <Button asChild><Link to="/dashboard">Ir para Dashboard</Link></Button>
    </div>
  </div>
);

export default BillingSuccess;
