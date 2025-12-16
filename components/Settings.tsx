import React, { useState, useEffect } from 'react';
import { ExchangeRate } from '../types';
import { getApiUrl } from '../config';

const Settings: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<ExchangeRate[]>([]);
    
    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [usdToTry, setUsdToTry] = useState<number>(0); // 1 USD = ? TL
    const [usdToEur, setUsdToEur] = useState<number>(0); // 1 USD = ? EUR

    // Fetch History on Mount
    useEffect(() => {
        fetchHistory();
        fetchLatest();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch(getApiUrl('/rates'));
            const data = await res.json();
            if (Array.isArray(data)) setHistory(data);
        } catch (error) {
            console.error("Geçmiş çekilemedi", error);
        }
    };

    const fetchLatest = async () => {
        try {
            const res = await fetch(getApiUrl('/rates/latest'));
            const data = await res.json();
            if (data.usd_try) {
                setUsdToTry(data.usd_try);
                setUsdToEur(data.usd_eur);
            }
        } catch (error) {
            console.error("Son kur çekilemedi", error);
        }
    };

    const handleSave = async () => {
        if (usdToTry <= 0 || usdToEur <= 0) {
            alert("Lütfen geçerli kur değerleri giriniz.");
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch(getApiUrl('/rates'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: date,
                    usd_try: usdToTry,
                    usd_eur: usdToEur
                })
            });

            if (response.ok) {
                alert("Kur bilgisi kaydedildi.");
                fetchHistory(); // Refresh table
            } else {
                alert("Kaydedilemedi.");
            }
        } catch (error) {
            console.error(error);
            alert("Sunucu hatası.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fadeIn pb-20">
            <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">settings</span>
                Sistem Ayarları
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Rate Entry Form */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-text-main dark:text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600">currency_exchange</span>
                        Günlük Kur Girişi
                    </h3>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 mb-4 text-xs text-blue-800 dark:text-blue-200">
                        <strong>Temel Para Birimi:</strong> Amerikan Doları ($)
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">Tarih</label>
                            <input 
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">TL Karşılığı</label>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-text-main dark:text-white">1 USD ($) = </span>
                                    <div className="relative flex-1">
                                        <input 
                                            type="number" 
                                            step="0.0001"
                                            value={usdToTry}
                                            onChange={(e) => setUsdToTry(Number(e.target.value))}
                                            className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white font-mono text-lg"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₺</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-text-secondary dark:text-gray-400">Euro Karşılığı</label>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-text-main dark:text-white">1 USD ($) = </span>
                                    <div className="relative flex-1">
                                        <input 
                                            type="number" 
                                            step="0.0001"
                                            value={usdToEur}
                                            onChange={(e) => setUsdToEur(Number(e.target.value))}
                                            className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary outline-none text-text-main dark:text-white font-mono text-lg"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSave}
                            disabled={isLoading}
                            className="mt-2 w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-light shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Kaydediliyor...' : 'Kurları Güncelle'}
                        </button>
                    </div>
                </div>

                {/* Info Card */}
                <div className="flex flex-col gap-6">
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex-1">
                        <h3 className="text-sm font-bold text-text-secondary uppercase mb-4">Kur Geçmişi</h3>
                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="p-3 text-text-secondary font-medium">Tarih</th>
                                        <th className="p-3 text-text-main dark:text-white font-bold text-right">1 $ = ? ₺</th>
                                        <th className="p-3 text-text-main dark:text-white font-bold text-right">1 $ = ? €</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {history.map((h) => (
                                        <tr key={h.id}>
                                            <td className="p-3 text-text-secondary font-mono">{h.date}</td>
                                            <td className="p-3 text-text-main dark:text-white text-right font-mono">{h.usd_try.toFixed(4)} ₺</td>
                                            <td className="p-3 text-text-main dark:text-white text-right font-mono">{h.usd_eur.toFixed(4)} €</td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="p-4 text-center text-gray-400 italic">Kayıt bulunamadı.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;