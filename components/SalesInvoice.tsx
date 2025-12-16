
import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config';
import { Account, Product, InvoiceItem, ExchangeRate } from '../types';

const SalesInvoice: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    
    // Master Data
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [rates, setRates] = useState<{ usd_try: number, usd_eur: number }>({ usd_try: 34, usd_eur: 0.92 });

    // Invoice Header State
    const [accountId, setAccountId] = useState<string>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0]);
    const [warehouse, setWarehouse] = useState('01 - Merter Depo');
    const [currency, setCurrency] = useState<'USD' | 'EUR' | 'TRY'>('USD');
    const [noTax, setNoTax] = useState(false);
    const [transportation, setTransportation] = useState<number>(0);

    // Invoice Items
    const [items, setItems] = useState<InvoiceItem[]>([]);

    // Load Data on Mount
    useEffect(() => {
        fetchAccounts();
        fetchProducts();
        fetchRates();
    }, []);

    // Recalculate Prices when Currency Changes
    useEffect(() => {
        recalculatePricesForNewCurrency(currency);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currency, rates]);

    const fetchAccounts = async () => {
        try {
            const res = await fetch(getApiUrl('/accounts'));
            const data = await res.json();
            setAccounts(data);
        } catch (e) { console.error(e); }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch(getApiUrl('/products'));
            const data = await res.json();
            if (data.data) setProducts(data.data);
        } catch (e) { console.error(e); }
    };

    const fetchRates = async () => {
        try {
            const res = await fetch(getApiUrl('/rates/latest'));
            const data = await res.json();
            if (data.usd_try) {
                setRates({ usd_try: data.usd_try, usd_eur: data.usd_eur });
            }
        } catch (e) { console.error(e); }
    };

    // --- CURRENCY LOGIC ---

    const getExchangeRate = (targetCurrency: string): number => {
        if (targetCurrency === 'USD') return 1;
        if (targetCurrency === 'EUR') return rates.usd_eur;
        if (targetCurrency === 'TRY') return rates.usd_try;
        return 1;
    };

    const recalculatePricesForNewCurrency = (newCurrency: string) => {
        const rate = getExchangeRate(newCurrency);
        setItems(prevItems => prevItems.map(item => {
            // Formula: Unit Price = Base USD Price * Rate
            // Note: In a real app, we might check if user manually locked the price, 
            // but per requirements, we convert from Master USD.
            const newUnitPrice = item.basePriceUsd * rate;
            return calculateLineTotal({ ...item, unitPrice: newUnitPrice });
        }));
    };

    // --- LINE ITEM LOGIC ---

    const addItem = () => {
        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            productId: 0,
            productName: '',
            variantId: '',
            variantName: '',
            quantity: 1,
            basePriceUsd: 0,
            unitPrice: 0,
            discountRate: 0,
            taxRate: 10, // Default VAT
            total: 0
        };
        setItems([...items, newItem]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                
                // Specific Logic for Product Selection
                if (field === 'productId') {
                    const product = products.find(p => p.id === Number(value));
                    if (product) {
                        updatedItem.productName = product.name;
                        updatedItem.variantId = ''; // Reset variant
                        updatedItem.basePriceUsd = product.data.pricing.wholesalePrice;
                        // Convert to current invoice currency
                        updatedItem.unitPrice = product.data.pricing.wholesalePrice * getExchangeRate(currency);
                    }
                }

                // Specific Logic for Variant Selection (PACK vs Standard)
                if (field === 'variantId') {
                     const product = products.find(p => p.id === updatedItem.productId);
                     if (product && product.type === 'pack' && value === 'PACK') {
                         // Auto-fill quantity for PACK
                         const itemsCount = product.data.packDetails?.items.reduce((acc, curr) => acc + Number(curr.quantity), 0) || 1;
                         if (updatedItem.quantity <= 1) { // Only override if not already set high
                            updatedItem.quantity = itemsCount;
                         }
                         updatedItem.variantName = "PACK (Seri)";
                     } else if (product) {
                         // Find variant name for standard
                         const v = product.data.variants?.find(v => v.id === value);
                         updatedItem.variantName = v ? `${v.color} / ${v.size}` : value;
                     }
                }

                return calculateLineTotal(updatedItem);
            }
            return item;
        }));
    };

    const calculateLineTotal = (item: InvoiceItem): InvoiceItem => {
        const gross = item.quantity * item.unitPrice;
        const discountAmount = gross * (item.discountRate / 100);
        item.total = gross - discountAmount;
        return item;
    };

    // --- FOOTER CALCULATIONS ---

    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const discountTotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.discountRate / 100)), 0);
    
    // Tax Calculation
    const taxTotal = noTax ? 0 : items.reduce((acc, item) => {
        return acc + (item.total * (item.taxRate / 100));
    }, 0);

    const grandTotal = subtotal + transportation + taxTotal;

    // --- SAVE ---

    const handleSave = async () => {
        if (!accountId) { alert("Lütfen bir Cari (Müşteri) seçiniz."); return; }
        if (items.length === 0) { alert("Lütfen en az bir ürün ekleyiniz."); return; }

        setIsLoading(true);
        try {
            const payload = {
                accountId,
                date,
                dueDate,
                warehouse,
                currency,
                exchangeRate: getExchangeRate(currency),
                subtotal,
                discountTotal,
                taxTotal,
                transportation,
                grandTotal,
                noTax,
                items
            };

            const res = await fetch(getApiUrl('/invoices'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Fatura başarıyla kaydedildi!");
                // Reset or Redirect could go here
                setItems([]);
                setAccountId('');
            } else {
                alert("Kaydedilemedi.");
            }
        } catch (e) {
            console.error(e);
            alert("Hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 animate-fadeIn">
            {/* Header Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-secondary transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-2xl font-bold text-text-main dark:text-white">Yeni Satış Faturası</h2>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-bold text-text-secondary border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        Taslak Olarak Kaydet
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-light shadow-lg shadow-primary/30 flex items-center gap-2"
                    >
                        {isLoading ? '...' : 'Faturayı Oluştur (Post)'}
                    </button>
                </div>
            </div>

            {/* Invoice Header Form */}
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Customer */}
                    <div className="flex flex-col gap-2 md:col-span-1">
                        <label className="text-xs font-bold text-text-secondary uppercase">Cari / Müşteri</label>
                        <select 
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="h-10 px-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white text-sm"
                        >
                            <option value="">Seçiniz...</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Warehouse */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-secondary uppercase">Depo</label>
                        <select 
                            value={warehouse}
                            onChange={(e) => setWarehouse(e.target.value)}
                            className="h-10 px-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white text-sm"
                        >
                            <option>01 - Merter Depo</option>
                            <option>02 - Showroom</option>
                            <option>03 - İade Deposu</option>
                        </select>
                    </div>

                    {/* Dates */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-secondary uppercase">Fatura Tarihi</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            className="h-10 px-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-secondary uppercase">Vade Tarihi</label>
                        <input 
                            type="date" 
                            value={dueDate} 
                            onChange={(e) => setDueDate(e.target.value)}
                            className="h-10 px-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 border-t border-gray-100 dark:border-gray-800 pt-6">
                    {/* Currency Selector */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-secondary uppercase">Para Birimi</label>
                        <div className="flex bg-gray-50 dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                            {(['USD', 'EUR', 'TRY'] as const).map(curr => (
                                <button
                                    key={curr}
                                    onClick={() => setCurrency(curr)}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                                        currency === curr 
                                        ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' 
                                        : 'text-text-secondary hover:text-text-main'
                                    }`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Current Rates Display */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-secondary uppercase">Kur Bilgisi</label>
                        <div className="flex items-center gap-2 h-10 text-xs text-text-secondary bg-blue-50/50 dark:bg-blue-900/10 px-3 rounded-lg border border-blue-100 dark:border-blue-800">
                            <span className="font-mono">1$ = {rates.usd_try}₺</span>
                            <span className="w-px h-4 bg-blue-200 dark:bg-blue-700"></span>
                            <span className="font-mono">1$ = {rates.usd_eur}€</span>
                        </div>
                    </div>

                    {/* No Tax Checkbox */}
                    <div className="flex flex-col gap-2 justify-center">
                         <label className="flex items-center gap-3 cursor-pointer group">
                             <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                 noTax ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                             }`}>
                                 {noTax && <span className="material-symbols-outlined text-[16px] text-white">check</span>}
                             </div>
                             <input type="checkbox" className="hidden" checked={noTax} onChange={() => setNoTax(!noTax)} />
                             <span className="text-sm font-medium text-text-main dark:text-white group-hover:text-primary transition-colors">
                                 Vergisiz Fatura (No Tax)
                             </span>
                         </label>
                    </div>
                </div>
            </div>

            {/* Invoice Items Table */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[400px] flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase w-10">#</th>
                                <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase min-w-[200px]">Ürün</th>
                                <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase w-48">Varyant / Pack</th>
                                <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase w-32">Miktar</th>
                                <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase w-32">Birim Fiyat ({currency})</th>
                                <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase w-24">İsk. %</th>
                                {!noTax && <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase w-24">KDV %</th>}
                                <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase w-32 text-right">Tutar</th>
                                <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {items.map((item, index) => {
                                const selectedProduct = products.find(p => p.id === item.productId);
                                return (
                                    <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 text-xs text-text-secondary font-mono">{index + 1}</td>
                                        
                                        {/* Product Selection */}
                                        <td className="px-4 py-2">
                                            <select 
                                                value={item.productId}
                                                onChange={(e) => updateItem(item.id, 'productId', e.target.value)}
                                                className="w-full h-9 px-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-text-main dark:text-white text-sm focus:border-primary outline-none"
                                            >
                                                <option value={0}>Ürün Seçin...</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* Variant Selection */}
                                        <td className="px-4 py-2">
                                            <select 
                                                value={item.variantId}
                                                onChange={(e) => updateItem(item.id, 'variantId', e.target.value)}
                                                disabled={!item.productId}
                                                className="w-full h-9 px-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-text-main dark:text-white text-sm focus:border-primary outline-none disabled:opacity-50"
                                            >
                                                <option value="">Seçiniz...</option>
                                                {selectedProduct?.type === 'pack' ? (
                                                     <option value="PACK">PACK (Seri)</option>
                                                ) : (
                                                    selectedProduct?.data.variants?.map(v => (
                                                        <option key={v.id} value={v.id}>{v.color} / {v.size}</option>
                                                    ))
                                                )}
                                            </select>
                                        </td>

                                        {/* Quantity */}
                                        <td className="px-4 py-2">
                                            <input 
                                                type="number" 
                                                value={item.quantity}
                                                min="1"
                                                onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                                className="w-full h-9 px-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-text-main dark:text-white text-sm focus:border-primary outline-none text-right font-mono"
                                            />
                                        </td>

                                        {/* Unit Price (Dynamic Currency) */}
                                        <td className="px-4 py-2">
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                                                className="w-full h-9 px-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-text-main dark:text-white text-sm focus:border-primary outline-none text-right font-mono"
                                            />
                                        </td>

                                        {/* Discount */}
                                        <td className="px-4 py-2">
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    min="0" max="100"
                                                    value={item.discountRate}
                                                    onChange={(e) => updateItem(item.id, 'discountRate', Number(e.target.value))}
                                                    className="w-full h-9 pl-2 pr-5 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-text-main dark:text-white text-sm focus:border-primary outline-none text-right font-mono"
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary text-xs">%</span>
                                            </div>
                                        </td>

                                        {/* Tax Rate */}
                                        {!noTax && (
                                            <td className="px-4 py-2">
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={item.taxRate}
                                                    onChange={(e) => updateItem(item.id, 'taxRate', Number(e.target.value))}
                                                    className="w-full h-9 px-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-text-main dark:text-white text-sm focus:border-primary outline-none text-right font-mono"
                                                />
                                            </td>
                                        )}

                                        {/* Total */}
                                        <td className="px-4 py-3 text-right font-bold text-text-main dark:text-white font-mono text-sm">
                                            {item.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-2 text-right">
                                            <button 
                                                onClick={() => removeItem(item.id)}
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <button 
                        onClick={addItem}
                        className="text-primary text-sm font-bold flex items-center gap-1 hover:text-primary-light transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span> Satır Ekle
                    </button>
                </div>
            </div>

            {/* Footer / Totals */}
            <div className="flex justify-end">
                <div className="w-full md:w-1/3 bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Ara Toplam (Subtotal)</span>
                            <span className="font-mono font-medium text-text-main dark:text-white">{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})} {currency}</span>
                        </div>
                        
                        {discountTotal > 0 && (
                            <div className="flex justify-between text-sm text-red-500">
                                <span>İskonto Toplamı</span>
                                <span className="font-mono font-medium">-{discountTotal.toLocaleString(undefined, {minimumFractionDigits: 2})} {currency}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm items-center">
                            <span className="text-text-secondary">Nakliye / Taşıma</span>
                            <div className="w-24">
                                <input 
                                    type="number" 
                                    value={transportation}
                                    onChange={(e) => setTransportation(Number(e.target.value))}
                                    className="w-full h-8 px-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-right text-sm outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        {!noTax && (
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">KDV Toplamı (Tax)</span>
                                <span className="font-mono font-medium text-text-main dark:text-white">{taxTotal.toLocaleString(undefined, {minimumFractionDigits: 2})} {currency}</span>
                            </div>
                        )}

                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-text-main dark:text-white">Genel Toplam</span>
                            <span className="text-2xl font-bold text-primary font-mono">{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})} {currency}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesInvoice;
