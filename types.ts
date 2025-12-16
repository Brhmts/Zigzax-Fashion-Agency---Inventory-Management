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