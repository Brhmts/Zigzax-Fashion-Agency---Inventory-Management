import React, { useState, useEffect } from 'react';
import { PackItem, VariantMatrixItem } from '../types';
import { getApiUrl } from '../config';

const ProductAdd: React.FC = () => {
  const [productType, setProductType] = useState<'standard' | 'pack'>('standard');
  const [isLoading, setIsLoading] = useState(false);
  
  // Basic Info Inputs
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Gömlek');
  const [description, setDescription] = useState('');
  const [baseSku, setBaseSku] = useState('');

  // Global Pricing (ALWAYS IN USD)
  const [buyingPrice, setBuyingPrice] = useState(0);
  const [wholesalePrice, setWholesalePrice] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);

  // Standard Variant Logic
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [combinations, setCombinations] = useState<VariantMatrixItem[]>([]);

  // Pack Logic
  const [packName, setPackName] = useState('');
  const [packSku, setPackSku] = useState('');
  const [packBarcode, setPackBarcode] = useState('');
  const [packItems, setPackItems] = useState<PackItem[]>([]);
  const [packTotalStock, setPackTotalStock] = useState(0);

  // Re-generate combinations
  useEffect(() => {
    if (productType === 'standard') {
        const newCombos: VariantMatrixItem[] = [];
        colors.forEach(c => {
            sizes.forEach(s => {
                const id = `${c}-${s}`;
                const existing = combinations.find(x => x.id === id);
                
                const defaultSku = baseSku 
                    ? `${baseSku}-${c.substring(0,3).toUpperCase()}-${s.toUpperCase()}` 
                    : `ZIG-${c.substring(0,1)}${s}-${Math.floor(Math.random()*1000)}`;

                newCombos.push({
                    id,
                    color: c,
                    size: s,
                    stock: existing ? existing.stock : 0,
                    sku: existing ? existing.sku : defaultSku,
                    barcode: existing ? existing.barcode : ''
                });
            });
        });
        setCombinations(newCombos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, sizes, productType, baseSku]);

  const updateCombination = (id: string, field: keyof VariantMatrixItem, value: any) => {
    setCombinations(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addColor = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && colorInput.trim()) {
        e.preventDefault();
        if (!colors.includes(colorInput.trim())) {
            setColors([...colors, colorInput.trim()]);
        }
        setColorInput('');
    }
  };

  const addSize = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && sizeInput.trim()) {
        e.preventDefault();
        if (!sizes.includes(sizeInput.trim())) {
            setSizes([...sizes, sizeInput.trim()]);
        }
        setSizeInput('');
    }
  };

  const removeColor = (color: string) => setColors(colors.filter(c => c !== color));
  const removeSize = (size: string) => setSizes(sizes.filter(s => s !== size));

  const addPackItem = () => {
    const newItem: PackItem = {
        id: Date.now().toString(),
        color: '',
        size: '',
        quantity: 0
    };
    setPackItems([...packItems, newItem]);
  };

  const updatePackItem = (id: string, field: keyof PackItem, value: any) => {
    setPackItems(packItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removePackItem = (id: string) => {
    setPackItems(packItems.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    // VALIDATIONS
    if (!productName.trim()) {
        alert("Lütfen 'Temel Bilgiler' alanında Ürün Adını giriniz.");
        return;
    }
    if (buyingPrice <= 0 || retailPrice <= 0) {
        alert("Lütfen geçerli bir Alış ve Satış fiyatı giriniz.");
        return;
    }

    const pricingPayload = {
        currency: 'USD', // Hardcoded as requested
        buyingPrice,
        wholesalePrice,
        retailPrice
    };

    let payload: any = {};

    if (productType === 'standard') {
        if (!baseSku.trim()) {
            alert("Model Kodu (Base SKU) giriniz.");
            return;
        }
        if (combinations.length === 0) {
            alert("En az bir varyant tanımlayınız.");
            return;
        }
        
        payload = {
            type: 'standard',
            basicInfo: {
                name: productName,
                category,
                description,
                baseSku
            },
            pricing: pricingPayload,
            variants: combinations
        };
    } else {
        if (!packName.trim() || !packSku.trim() || packItems.length === 0) {
            alert("Pack bilgilerini eksiksiz giriniz.");
            return;
        }
        payload = {
            type: 'pack',
            basicInfo: {
                name: productName,
                category,
                description
            },
            pricing: pricingPayload,
            packDetails: {
                name: packName,
                sku: packSku,
                barcode: packBarcode,
                items: packItems,
                totalStock: packTotalStock
            }
        };
    }

    // API CALL
    try {
        setIsLoading(true);
        const response = await fetch(getApiUrl('/products'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Kaydetme işlemi başarısız oldu.');
        }

        const result = await response.json();
        console.log("Server Response:", result);
        
        alert(`Başarılı! Ürün ID: ${result.data.id} olarak veritabanına kaydedildi.`);
        // Optional: Reset form here
    } catch (error: any) {
        console.error("Save Error:", error);
        alert(`Hata oluştu: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const totalItemsInPack = packItems.reduce((acc, item) => acc + Number(item.quantity), 0);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-20">
      
      {/* Top Bar: Title */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-secondary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-2xl font-bold text-text-main dark:text-white">Yeni Ürün Ekle</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Basic Info */}
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">info</span>
                    Temel Bilgiler
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">Ürün Adı <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-main dark:text-white" 
                            placeholder="Örn: Slim Fit Gömlek" 
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">Model Kodu (Base SKU) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={baseSku}
                                onChange={(e) => setBaseSku(e.target.value.toUpperCase())}
                                className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-main dark:text-white uppercase" 
                                placeholder="Örn: GOM-001" 
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-sm">qr_code_2</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">Kategori</label>
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white"
                        >
                            <option>Gömlek</option>
                            <option>Pantolon</option>
                            <option>Ceket</option>
                            <option>Aksesuar</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">Açıklama</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2} 
                            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-main dark:text-white resize-none" 
                            placeholder="Ürün özelliklerini giriniz..."
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Pricing Card (USD Only) */}
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600">payments</span>
                        Fiyatlandırma
                    </h3>
                    
                    <div className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs font-bold border border-green-100 dark:border-green-800">
                        Base Currency: USD ($)
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">
                            Alış Fiyatı ($)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                            <input 
                                type="number" 
                                value={buyingPrice === 0 ? '' : buyingPrice}
                                onChange={(e) => setBuyingPrice(Number(e.target.value))}
                                className="w-full h-11 pl-8 pr-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white font-medium" 
                                placeholder="0.00" 
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">
                            Toptan Satış ($)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                            <input 
                                type="number" 
                                value={wholesalePrice === 0 ? '' : wholesalePrice}
                                onChange={(e) => setWholesalePrice(Number(e.target.value))}
                                className="w-full h-11 pl-8 pr-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white font-medium" 
                                placeholder="0.00" 
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">
                            Perakende Satış ($)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                            <input 
                                type="number" 
                                value={retailPrice === 0 ? '' : retailPrice}
                                onChange={(e) => setRetailPrice(Number(e.target.value))}
                                className="w-full h-11 pl-8 pr-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white font-medium" 
                                placeholder="0.00" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Variant Type Selector & Content */}
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">style</span>
                    Ürün Tipi ve Varyantlar
                </h3>

                <div className="flex gap-4 mb-8">
                    <button 
                        onClick={() => setProductType('standard')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${
                            productType === 'standard' 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-text-secondary'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[28px]">palette</span>
                        <div className="text-left">
                            <div className="font-bold">Standart Varyant</div>
                            <div className="text-xs opacity-70">Renk ve Beden Seçimi</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setProductType('pack')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${
                            productType === 'pack' 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-text-secondary'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[28px]">inventory_2</span>
                        <div className="text-left">
                            <div className="font-bold">Pack (Seri) Tanımla</div>
                            <div className="text-xs opacity-70">Toptan Satış için Paketleme</div>
                        </div>
                    </button>
                </div>

                {productType === 'standard' ? (
                    <div className="flex flex-col gap-6 animate-fadeIn">
                        {/* Inputs for Color/Size */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">Renkler</label>
                                <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                                    {colors.map(c => (
                                        <span key={c} className="bg-white dark:bg-gray-800 text-text-main dark:text-white px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-sm flex items-center gap-1">
                                            {c}
                                            <button onClick={() => removeColor(c)} className="hover:text-red-500"><span className="material-symbols-outlined text-[16px]">close</span></button>
                                        </span>
                                    ))}
                                    <input 
                                        type="text" 
                                        value={colorInput}
                                        onChange={(e) => setColorInput(e.target.value)}
                                        onKeyDown={addColor}
                                        className="bg-transparent outline-none flex-1 min-w-[80px] h-8 text-text-main dark:text-white"
                                        placeholder="Renk yazıp Enter'a basın"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">Bedenler</label>
                                <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                                    {sizes.map(s => (
                                        <span key={s} className="bg-white dark:bg-gray-800 text-text-main dark:text-white px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-sm flex items-center gap-1">
                                            {s}
                                            <button onClick={() => removeSize(s)} className="hover:text-red-500"><span className="material-symbols-outlined text-[16px]">close</span></button>
                                        </span>
                                    ))}
                                    <input 
                                        type="text" 
                                        value={sizeInput}
                                        onChange={(e) => setSizeInput(e.target.value)}
                                        onKeyDown={addSize}
                                        className="bg-transparent outline-none flex-1 min-w-[80px] h-8 text-text-main dark:text-white"
                                        placeholder="Beden yazıp Enter'a basın"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Matrix Table */}
                        {combinations.length > 0 && (
                            <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Varyant</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase w-48">SKU <span className="text-red-500">*</span></th>
                                            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase w-36">Barkod</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase w-24 text-right">Stok</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {combinations.map((combo) => (
                                            <tr key={combo.id} className="bg-surface-light dark:bg-surface-dark group">
                                                <td className="px-4 py-3 text-sm text-text-main dark:text-white font-medium">
                                                    {combo.color} - {combo.size}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input 
                                                        type="text" 
                                                        value={combo.sku}
                                                        onChange={(e) => updateCombination(combo.id, 'sku', e.target.value.toUpperCase())}
                                                        className="w-full h-9 px-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-text-main dark:text-white focus:border-primary outline-none uppercase font-mono text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input 
                                                        type="text" 
                                                        value={combo.barcode}
                                                        onChange={(e) => updateCombination(combo.id, 'barcode', e.target.value)}
                                                        className="w-full h-9 px-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-text-main dark:text-white focus:border-primary outline-none font-mono text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input 
                                                        type="number" 
                                                        value={combo.stock === 0 ? '' : combo.stock}
                                                        onChange={(e) => updateCombination(combo.id, 'stock', Number(e.target.value))}
                                                        className="w-full h-9 px-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-text-main dark:text-white focus:border-primary outline-none text-right"
                                                        placeholder="0"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 animate-fadeIn">
                        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-lg text-sm flex items-start gap-2">
                            <span className="material-symbols-outlined text-[20px]">info</span>
                            <div>
                                <strong>Pack (Seri) Modu:</strong> Bu ürünü tekil olarak değil, içinde farklı renk ve bedenlerin bulunduğu bir paket olarak tanımlıyorsunuz.
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2 md:col-span-1">
                                <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">Pack / Seri Adı <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={packName}
                                    onChange={(e) => setPackName(e.target.value)}
                                    className="h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white" 
                                    placeholder="Örn: Yazlık Seri 1 (S-M-L)" 
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">Pack SKU <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={packSku}
                                    onChange={(e) => setPackSku(e.target.value.toUpperCase())}
                                    className="h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white font-mono uppercase" 
                                    placeholder="PACK-001" 
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">Pack Barkod (POS)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={packBarcode}
                                        onChange={(e) => setPackBarcode(e.target.value)}
                                        className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white font-mono" 
                                        placeholder="869..." 
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-sm">qr_code_scanner</span>
                                </div>
                            </div>
                        </div>

                        {/* Pack Builder */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <span className="font-semibold text-sm text-text-secondary uppercase">Pack İçeriği</span>
                                <button 
                                    onClick={addPackItem}
                                    className="text-primary text-sm font-bold flex items-center gap-1 hover:text-primary-light"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span> Satır Ekle
                                </button>
                            </div>
                            
                            <div className="p-4 flex flex-col gap-3">
                                {packItems.length === 0 && (
                                    <p className="text-center text-text-secondary text-sm py-4 italic">Henüz pakete ürün eklenmedi. "Satır Ekle" butonunu kullanın.</p>
                                )}
                                {packItems.map((item, index) => (
                                    <div key={item.id} className="flex gap-3 items-center">
                                        <span className="text-text-secondary text-xs font-mono w-6">{index + 1}.</span>
                                        <input 
                                            type="text" 
                                            value={item.color}
                                            onChange={(e) => updatePackItem(item.id, 'color', e.target.value)}
                                            placeholder="Renk (Örn: Kırmızı)"
                                            className="flex-1 h-10 px-3 rounded border border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark text-text-main dark:text-white text-sm outline-none focus:border-primary"
                                        />
                                        <input 
                                            type="text" 
                                            value={item.size}
                                            onChange={(e) => updatePackItem(item.id, 'size', e.target.value)}
                                            placeholder="Beden (Örn: M)"
                                            className="w-24 h-10 px-3 rounded border border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark text-text-main dark:text-white text-sm outline-none focus:border-primary"
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-text-secondary">Adet:</span>
                                            <input 
                                                type="number" 
                                                value={item.quantity === 0 ? '' : item.quantity}
                                                onChange={(e) => updatePackItem(item.id, 'quantity', Number(e.target.value))}
                                                className="w-20 h-10 px-3 rounded border border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark text-text-main dark:text-white text-sm outline-none focus:border-primary text-center"
                                                placeholder="0"
                                                min="1"
                                            />
                                        </div>
                                        <button onClick={() => removePackItem(item.id)} className="text-gray-400 hover:text-red-500 p-2">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <span className="text-sm font-medium text-text-secondary">Toplam Ürün / Pack:</span>
                                <span className="text-lg font-bold text-text-main dark:text-white">{totalItemsInPack} Adet</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">Toplam Pack Stok Miktarı</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={packTotalStock === 0 ? '' : packTotalStock}
                                    onChange={(e) => setPackTotalStock(Number(e.target.value))}
                                    className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white font-bold text-lg" 
                                    placeholder="0"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">Paket</span>
                            </div>
                            <p className="text-xs text-text-secondary">
                                Elinizdeki {packTotalStock} paket toplam {packTotalStock * totalItemsInPack} adet tekil ürüne denk gelmektedir.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Actions / Summary */}
        <div className="lg:col-span-1">
             <div className="sticky top-24 bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-6">
                <h3 className="text-lg font-bold text-text-main dark:text-white">Özet ve Kayıt</h3>
                
                <div className="flex flex-col gap-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Ürün Tipi:</span>
                        <span className="font-semibold text-text-main dark:text-white capitalize">{productType}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Varyant Sayısı:</span>
                        <span className="font-semibold text-text-main dark:text-white">
                            {productType === 'standard' ? combinations.length : packItems.length}
                        </span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-text-secondary">Toplam Stok:</span>
                        <span className="font-semibold text-text-main dark:text-white">
                            {productType === 'standard' 
                                ? combinations.reduce((acc, curr) => acc + curr.stock, 0)
                                : packTotalStock
                            }
                        </span>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                    
                    {/* Price Summary */}
                    <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Para Birimi:</span>
                        <span className="font-bold text-text-main dark:text-white">USD ($)</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Satış Fiyatı:</span>
                        <div className="text-right">
                             <div className="font-bold text-lg text-primary">${retailPrice.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                     <button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className={`w-full py-3 rounded-lg text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2 ${
                            isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-primary hover:bg-primary-light'
                        }`}
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <span className="material-symbols-outlined">save</span>
                        )}
                        {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button className="w-full py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-text-main dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Vazgeç
                    </button>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAdd;