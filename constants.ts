import { ChartDataPoint, NavItem, StatCardData, StockItem, Transaction } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Genel Bakış", id: "dashboard", icon: "dashboard", href: "#", isActive: true },
  { label: "Stok Yönetimi", id: "inventory", icon: "inventory_2", href: "#" },
  { label: "Ürün Ekle", id: "add-product", icon: "add_circle", href: "#" },
  { label: "Satışlar", id: "sales", icon: "shopping_cart", href: "#" },
  { label: "Cariler", id: "accounts", icon: "group", href: "#" },
  { label: "Raporlar", id: "reports", icon: "bar_chart", href: "#" },
  { label: "Ayarlar", id: "settings", icon: "settings", href: "#" },
];

export const STATS_DATA: StatCardData[] = [
  {
    title: "Toplam Satış",
    value: "₺124,500",
    trend: "+12%",
    trendDirection: "up",
    trendColor: "green",
    icon: "payments",
    iconBgColor: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "Kritik Stok",
    value: "8 Ürün",
    trend: "Azalıyor",
    trendDirection: "down",
    trendColor: "red",
    icon: "warning",
    iconBgColor: "bg-red-100",
    iconColor: "text-red-600",
    subtitle: "Azalıyor",
  },
  {
    title: "Bekleyen Ödemeler",
    value: "₺15,200",
    trend: "+5%",
    trendDirection: "up",
    trendColor: "green",
    icon: "schedule",
    iconBgColor: "bg-accent-turquoise/10",
    iconColor: "text-accent-turquoise",
  },
  {
    title: "Yeni Müşteriler",
    value: "14",
    trend: "+8%",
    trendDirection: "up",
    trendColor: "green",
    icon: "person_add",
    iconBgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

export const STOCK_DATA: StockItem[] = [
  { category: "Gömlek", count: 1240, total: 1653, colorClass: "bg-primary" },
  { category: "Pantolon", count: 850, total: 1545, colorClass: "bg-accent-turquoise" },
  { category: "Aksesuar", count: 250, total: 1000, colorClass: "bg-primary-light" },
  { category: "Ayakkabı", count: 420, total: 1050, colorClass: "bg-purple-400" },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: "#TRX-9001",
    date: "12 Oca, 14:30",
    entityName: "Moda Butik A.Ş.",
    entityAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKgy-6YOyUtPMg1SHomZW2psj67Y_fgPuq-JDRg-9UCqVdGHSc_BB3Y5z2bO10XM8kZpOLCKDld6itsX_iifsee--lz5ilD434Ss2yKBKENeNkxejV25SapLP08Pj4uLpgLeQtwOydQg7ebyXpfI4OkWfeqXdpPb-x-6r1dWnB-Savu6Vg8T8XocDq8qEId_D3T6k15PhXzWTtuJd3lIqh8EG-yTweT7n42p6lZ1T1cU-Q0r2s8YIzWUB8EMcegbHwB0HpvO5QQFiZ",
    amount: "₺4,250.00",
    amountValue: 4250,
    status: "Tamamlandı",
    statusColor: "green",
  },
  {
    id: "#TRX-9002",
    date: "12 Oca, 11:15",
    entityName: "Kumaş Dünyası",
    entityAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQA0htQkqbUPSXlrQFqQJat7M8KrYs5pZo_kQg9zJUiRZVzM6_oQ7l8r8aUYlVKJQtbrAGcQsVQa1GfQNzmXqurKaCVJaubQ2yGY2wNEIRiy15H3ls36rgEMBjafXncTtQW9WlNWm2OIwR8-gkG8c8aKKeKR9CRKH9shvpBBgVbVtaUZavGpl9Cwo8D8gZG-Il7imPavh92wwF-gQdB1cT_lW9ZTvIvoNK9q2CHZYXI3ZA4CmeZFxfkcy3uXoYWXrE8naPe0H1ZgSQ",
    amount: "-₺12,000.00",
    amountValue: -12000,
    status: "Beklemede",
    statusColor: "yellow",
  },
  {
    id: "#TRX-9003",
    date: "11 Oca, 16:45",
    entityName: "Ahmet Kaya",
    entityAvatar: "",
    initials: "AK",
    initialsColorClass: "bg-primary/20 text-primary",
    amount: "₺850.00",
    amountValue: 850,
    status: "Tamamlandı",
    statusColor: "green",
  },
  {
    id: "#TRX-9004",
    date: "11 Oca, 10:00",
    entityName: "Stil Giyim",
    entityAvatar: "",
    initials: "ST",
    initialsColorClass: "bg-purple-100 text-purple-600",
    amount: "₺5,600.00",
    amountValue: 5600,
    status: "İptal",
    statusColor: "gray",
  },
];

export const CHART_DATA: ChartDataPoint[] = [
  { month: 'Oca', value: 250 },
  { month: 'Şub', value: 320 },
  { month: 'Mar', value: 280 },
  { month: 'Nis', value: 400 },
  { month: 'May', value: 180 },
  { month: 'Haz', value: 450 },
];
