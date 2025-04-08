export interface Payment {
  id: string;
  amount: number;
  currency: 'BRL' | 'USD' | 'EUR';
  payee: string;
  requester: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  description?: string;
  departament: string;
}
