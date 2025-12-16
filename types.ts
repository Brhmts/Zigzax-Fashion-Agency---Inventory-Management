
export interface NavItem {
  label: string;
  id: string; // Changed from purely label based for logic
  icon: string;
  href: string;
  isActive?: boolean;
}

export interface StatCardData {
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
  trendColor: 'green' | 'red';
  icon: string;
  iconBgColor: string;
  iconColor: string;
  subtitle?: string;
}

export interface StockItem {
  category: string;
  count: number;
  total: number; // For calculating percentage
  colorClass: string;
}

export interface Transaction {
  id: string;
  date: string;
  entityName: string; // Customer or Supplier
  entityAvatar: string;
  amount: string;
  amountValue: number; // For logic if needed, though display string is fine
  status: 'Tamamlandı' | 'Beklemede' | 'İptal';
  statusColor: 'green' | 'yellow' | 'gray';
  initials?: string; // Fallback if no avatar
  initialsColorClass?: string;
}

export interface ChartDataPoint {
  month: string;
  value: number;
}

// New Types for Product Add Module
export interface PackItem {
  id: string;
  color: string;
  size: string;
  quantity: number;
}

export interface VariantMatrixItem {
  id: string;
  color: string;
  size: string;
  sku: string;
  barcode: string;
  stock: number;
}

// New Type for Exchange Rates (Base USD)
export interface ExchangeRate {
    id: number;
    date: string; // YYYY-MM-DD
    usd_try: number; // 1 USD = ? TRY
    usd_eur: number; // 1 USD = ? EUR
}

// New Types for Sales Invoice
export interface Account {
    id: number;
    name: string;
    code: string;
    type: 'customer' | 'supplier';
    currency: string;
    taxId?: string;
    address?: string;
}

export interface Product {
    id: number;
    name: string;
    sku: string;
    type: 'standard' | 'pack';
    category: string;
    data: {
        basicInfo: any;
        pricing: {
            buyingPrice: number;
            wholesalePrice: number;
            retailPrice: number;
            currency: string;
        };
        variants?: VariantMatrixItem[];
        packDetails?: {
            items: PackItem[];
            totalStock: number;
        };
    };
}

export interface InvoiceItem {
    id: string;
    productId: number;
    productName: string;
    variantId: string; // "RED-S" or "PACK"
    variantName: string; 
    quantity: number;
    
    // Pricing
    basePriceUsd: number; // Always keep the original USD price reference!
    unitPrice: number; // The price in the Invoice Currency
    
    discountRate: number; // %
    taxRate: number; // %
    
    total: number; // Net total (Price * Qty - Discount)
}
