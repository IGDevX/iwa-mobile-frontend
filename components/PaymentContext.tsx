import React, { createContext, ReactNode, useContext, useState } from 'react';

/**
 * Payment record stored locally
 */
export interface PaymentRecord {
  paymentId: string; // Stripe payment intent ID
  orderId: string;
  amount: number; // Amount in cents
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  paidBy: string; // User ID who made the payment
  paidTo: string; // Producer/merchant name
  paymentDate: string; // ISO date string when payment was completed
  paymentDueDate: string; // ISO date string when payment should be completed
  clientSecret?: string;
  errorMessage?: string;
}

interface PaymentContextType {
  payments: Map<string, PaymentRecord>; // Map of orderId -> PaymentRecord
  addPayment: (payment: PaymentRecord) => void;
  getPaymentByOrderId: (orderId: string) => PaymentRecord | undefined;
  updatePaymentStatus: (orderId: string, status: PaymentRecord['status'], errorMessage?: string) => void;
  clearPayments: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<Map<string, PaymentRecord>>(new Map());

  const addPayment = (payment: PaymentRecord) => {
    setPayments(prev => {
      const newMap = new Map(prev);
      newMap.set(payment.orderId, payment);
      return newMap;
    });
  };

  const getPaymentByOrderId = (orderId: string): PaymentRecord | undefined => {
    return payments.get(orderId);
  };

  const updatePaymentStatus = (
    orderId: string, 
    status: PaymentRecord['status'],
    errorMessage?: string
  ) => {
    setPayments(prev => {
      const newMap = new Map(prev);
      const payment = newMap.get(orderId);
      
      if (payment) {
        newMap.set(orderId, {
          ...payment,
          status,
          errorMessage,
          paymentDate: status === 'succeeded' ? new Date().toISOString() : payment.paymentDate,
        });
      }
      
      return newMap;
    });
  };

  const clearPayments = () => {
    setPayments(new Map());
  };

  return (
    <PaymentContext.Provider 
      value={{ 
        payments, 
        addPayment, 
        getPaymentByOrderId, 
        updatePaymentStatus,
        clearPayments 
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePaymentContext must be used within a PaymentProvider');
  }
  return context;
};
