"use client";

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, AreaChart, Area, PieChart, Pie, Cell, ReferenceLine, Label, LabelList
} from 'recharts';
import {
  LayoutDashboard, TrendingUp, Activity, Target, ArrowUpRight, ArrowDownRight,
  Users, DollarSign, Briefcase, AlertCircle, Link as LinkIcon, RefreshCw, CheckCircle, FileUp, Info,
  PieChart as PieChartIcon, ChevronRight, Building, FileText, CheckSquare, XSquare
} from 'lucide-react';

// --- 型定義 ---
type SalesRecord = {
  month: string;
  sales_budget: number;
  sales_target: number;
  sales_actual: number | null;
  sales_forecast: number;
  cost_budget: number;
  cost_target: number;
  cost_actual: number | null;
  cost_forecast: number;
  profit_budget: number;
  profit_target: number;
  profit_actual: number | null;
  profit_forecast: number;
};

// 新規売上分析用の型（項目追加）
type NewSalesRecord = {
  segment: string;
  budget: number;
  target: number; // 追加
  actual: number;
  last_year: number; // 追加
  count: number;
  win_rate: number;
  lead_time: number;
  unit_price: number;
  id_price: number;
  duration: number;
};

type ExistingSalesRecord = {
  segment: string;
  sales: number;
  nrr: number;
  renewal: number;
  id_growth: number;
};

// --- 初期モックデータ ---
const INITIAL_SALES_DATA: SalesRecord[] = [
  { month: '1月', sales_budget: 12000, sales_target: 13000, sales_actual: 12500, sales_forecast: 12500, cost_budget: 4800, cost_target: 5200, cost_actual: 5000, cost_forecast: 5000, profit_budget: 7200, profit_target: 7800, profit_actual: 7500, profit_forecast: 7500 },
];

const INITIAL_NEW_SALES: NewSalesRecord[] = [
  { segment: 'Enterprise', budget: 5000, target: 5500, actual: 4200, last_year: 3800, count: 5, win_rate: 35, lead_time: 120, unit_price: 840, id_price: 2000, duration: 12 },
  { segment: 'Mid', budget: 3000, target: 3300, actual: 3500, last_year: 2500, count: 12, win_rate: 45, lead_time: 60, unit_price: 291, id_price: 1500, duration: 12 },
  { segment: 'Small', budget: 1500, target: 1800, actual: 1800, last_year: 1000, count: 30, win_rate: 60, lead_time: 30, unit_price: 60, id_price: 1200, duration: 12 },
];

const INITIAL_EXISTING_SALES: ExistingSalesRecord[] = [
  { segment: 'Enterprise', sales: 12500, nrr: 115, renewal: 98, id_growth: 110 },
  { segment: 'Mid', sales: 4800, nrr: 102, renewal: 92, id_growth: 105 },
  { segment: 'Small', sales: 1200, nrr: 85, renewal: 80, id_growth: 90 },
];

// ファネルデータ定義
const FUNNEL_DATA = [
  { stage: 'リード獲得', value: 1200 },
  { stage: '商談化', value: 450 },
  { stage: '提案', value: 200 },
  { stage: '受注', value: 85 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const PIE_COLORS = { on: '#3b82f6', off: '#e2e8f0' };

// --- ヘルパー関数: 安全なCSVパース ---
const parseCSV = (csvText: string): any[] => {
  const cleanText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const lines = cleanText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    if (!line.trim()) return null;
    const values = line.split(',');
    const record: any = {};
    headers.forEach((header, index) => {
      let val = values[index]?.trim().replace(/"/g, '');
      if (val) val = val.replace(/,/g, '');
      if (val === '' || val === undefined || val === '-') {
        record[header] = null;
      } else if (!isNaN(Number(val))) {
        record[header] = Number(val);
      } else {
        record[header] = val;
      }
    });
    return record;
  }).filter(r => r !== null);
};

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  return `¥${value.toLocaleString()}`;
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(1)}%`;
};

// --- メインコンポーネント ---
export default function CBDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [salesData, setSalesData] = useState<SalesRecord[]>(INITIAL_SALES_DATA);
  const [newSalesData, setNewSalesData] = useState<NewSalesRecord[]>(INITIAL_NEW_SALES);
  const [existingSalesData, setExistingSalesData] = useState<ExistingSalesRecord[]>(INITIAL_EXISTING_SALES);

  const [sheetInput, setSheetInput] = useState('1UijNvely71JDu73oBoBpho9P84fT-yPmNH2QVVstwO4'); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');
  
  const [currentMonthName, setCurrentMonthName] = useState<string>('');
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    const mIndex = today.getMonth(); 
    const m = mIndex + 1; 
    setCurrentMonthIndex(mIndex);
    setCurrentMonthName(`${m}月`);
    
    if (sheetInput) {
       handleSheetSync();
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 簡易実装（Mainのみ）
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsed = parseCSV(text);
          setSalesData(parsed);
          setFileName(file.name);
          setSyncStatus('success');
          setTimeout(() => setSyncStatus('idle'), 3000);
        } catch (err: any) {
          setSyncStatus('error');
          setErrorMessage('読込失敗');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSheetSync = async () => {
    if (!sheetInput) return;
    setIsSyncing(true);
    setSyncStatus('idle');
    setErrorMessage('');
    
    try {
      const idMatch = sheetInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const cleanId = idMatch ? idMatch[1] : sheetInput;

      const sheets = ['Main', 'New', 'Existing'];
      const requests = sheets.map(sheetName => 
        fetch(`https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`)
          .then(res => {
            if (!res.ok) throw new Error(`${sheetName} tab fetch failed`);
            return res.text();
          })
      );

      const results = await Promise.all(requests);

      const mainData = parseCSV(results[0]);
      if (mainData.length > 0) setSalesData(mainData);

      const newData = parseCSV(results[1]);
      if (newData.length > 0) setNewSalesData(newData);

      const existData = parseCSV(results[2]);
      if (existData.length > 0) setExistingSalesData(existData);

      setSyncStatus('success');
      setFileName(`All Sheets Synced`);
      setTimeout(() => setSyncStatus('idle'), 3000);

    } catch (error: any) {
      console.error(error);
      setSyncStatus('error');
      setErrorMessage('シート読込失敗: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const currentMonthData = currentMonthName 
    ? (salesData.find(d => d.month === currentMonthName) || salesData[salesData.length - 1])
    : salesData[salesData.length - 1];

  if (!isClient) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab data={salesData} currentData={currentMonthData} monthIndex={currentMonthIndex} />;
      case 'sales': return <SalesAnalysisTab newSalesData={newSalesData} existingSalesData={existingSalesData} />;
      case 'process': return <ProcessAnalysisTab />;
      case 'future': return <FutureActionTab data={salesData} />;
      default: return <OverviewTab data={salesData} currentData={currentMonthData} monthIndex={currentMonthIndex} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-xl z-20 overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">SB</div>
            <span>Corporate Div.</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">経営管理ダッシュボード v24.11.23</p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <NavItem id="overview" label="サマリー / 予実" icon={<LayoutDashboard size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="sales" label="売上分析" icon={<TrendingUp size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="process" label="要因・プロセス" icon={<Activity size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="future" label="未来・アクション" icon={<Target size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="bg-slate-800 rounded-lg p-4 shadow-inner border border-slate-700 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-indigo-300 font-bold flex items-center gap-1">
                  <LinkIcon size={12} /> Google Sheets 連携
                </p>
                {syncStatus === 'success' && <CheckCircle size={14} className="text-emerald-400" />}
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="標準ID"
                  value={sheetInput}
                  onChange={(e) => setSheetInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSheetSync}
                  disabled={isSyncing || !sheetInput}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded transition-all ${
                    isSyncing 
                      ? 'bg-slate-700 text-slate-400 cursor-wait' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20'
                  }`}
                >
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'データ同期' : 'データ同期'}
                </button>
              </div>
              <div className="mt-2 flex items-start gap-1 text-[10px] text-slate-400">
                <Info size={12} className="mt-0.5 shrink-0" />
                <p>3つのシート(Main, New, Existing)を読込中</p>
              </div>
            </div>
            {fileName && syncStatus === 'success' && (
               <div className="mt-2 p-2 bg-emerald-900/30 border border-emerald-800/50 rounded text-[10px] text-emerald-300 truncate">{fileName}</div>
            )}
            {syncStatus === 'error' && (
              <div className="mt-2 p-2 bg-rose-900/30 border border-rose-800/50 rounded text-[10px] text-rose-300 leading-tight">⚠ {errorMessage}</div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 px-8 py-4 flex justify-between items-center border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {activeTab === 'overview' && '月次売上および今後の売上予測'}
              {activeTab === 'sales' && '詳細売上分析 (新規/既存)'}
              {activeTab === 'process' && 'プロセス・要因分析'}
              {activeTab === 'future' && '未来予測とアクションプラン'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-sm font-medium">山田 太郎</p>
                <p className="text-xs text-slate-500">法人事業部長</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">YT</div>
          </div>
        </header>

        <div className="p-8 pb-20">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ id, label, icon, activeTab, setActiveTab }: any) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
      activeTab === id
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

// --- OverviewTab (省略せず保持) ---
const OverviewTab = ({ data, currentData, monthIndex }: any) => {
  if (!currentData || !data) return <div className="p-4 text-slate-500">Loading data...</div>;

  const quarterIdx = Math.floor(monthIndex / 3);
  const quarterStartIdx = quarterIdx * 3;
  const quarterEndIdx = quarterStartIdx + 3;
  const quarterData = data.slice(quarterStartIdx, quarterEndIdx);

  const halfIdx = monthIndex < 6 ? 0 : 1;
  const halfStartIdx = halfIdx === 0 ? 0 : 6;
  const halfEndIdx = halfStartIdx + 6;
  const halfData = data.slice(halfStartIdx, halfEndIdx);

  const safeSum = (arr: any[], key: string) => arr.reduce((acc, cur) => acc + (Number(cur[key]) || 0), 0);

  const qBudget = safeSum(quarterData, 'sales_budget');
  const qTarget = safeSum(quarterData, 'sales_target');
  const qForecast = safeSum(quarterData, 'sales_forecast');
  const qBudgetAchieve = qBudget ? (qForecast / qBudget) * 100 : 0;
  const qTargetAchieve = qTarget ? (qForecast / qTarget) * 100 : 0;

  const hBudget = safeSum(halfData, 'sales_budget');
  const hTarget = safeSum(halfData, 'sales_target');
  const hForecast = safeSum(halfData, 'sales_forecast');
  const hBudgetAchieve = hBudget ? (hForecast / hBudget) * 100 : 0;
  const hTargetAchieve = hTarget ? (hForecast / hTarget) * 100 : 0;

  const salesBudget = Number(currentData.sales_budget) || 0;
  const salesTarget = Number(currentData.sales_target) || 0;
  const salesActual = Number(currentData.sales_actual) || Number(currentData.sales_forecast) || 0;
  const budgetAchieve = salesBudget ? (salesActual / salesBudget) * 100 : 0;
  const targetAchieve = salesTarget ? (salesActual / salesTarget) * 100 : 0;

  const costActualVal = Number(currentData.cost_actual) || Number(currentData.cost_forecast) || 0;
  const profitActualVal = Number(currentData.profit_actual) || Number(currentData.profit_forecast) || 0;

  const comparisonData = [
    { name: '売上', budget: salesBudget, target: salesTarget, actual: salesActual },
    { name: 'コスト', budget: Number(currentData.cost_budget) || 0, target: Number(currentData.cost_target) || 0, actual: costActualVal },
    { name: '貢献利益', budget: Number(currentData.profit_budget) || 0, target: Number(currentData.profit_target) || 0, actual: profitActualVal },
  ];

  const summaryTableData = [
    { name: '売上', budget: salesBudget, target: salesTarget, actual: salesActual },
    { name: 'コスト', budget: Number(currentData.cost_budget) || 0, target: Number(currentData.cost_target) || 0, actual: costActualVal },
    { name: '貢献利益', budget: Number(currentData.profit_budget) || 0, target: Number(currentData.profit_target) || 0, actual: profitActualVal },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-center mb-6">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-400 rounded-sm"></div><span className="text-sm text-slate-600 font-bold">予算</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-400 rounded-sm"></div><span className="text-sm text-slate-600 font-bold">目標</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-500 rounded-sm"></div><span className="text-sm text-slate-600 font-bold">実績</span></div>
            </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{fontSize: 14, fontWeight: 'bold', fill: '#334155'}} />
              <YAxis tickFormatter={(value) => `¥${(value/1000).toLocaleString()}k`} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="budget" name="予算" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={40}>
                 <LabelList dataKey="budget" position="top" formatter={(value: any) => value.toLocaleString()} style={{fontSize: '11px', fill: '#fb7185', fontWeight: 'bold'}} />
              </Bar>
              <Bar dataKey="target" name="目標" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={40}>
                 <LabelList dataKey="target" position="top" formatter={(value: any) => value.toLocaleString()} style={{fontSize: '11px', fill: '#d97706', fontWeight: 'bold'}} />
              </Bar>
              <Bar dataKey="actual" name="実績" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40}>
                 <LabelList dataKey="actual" position="top" formatter={(value: any) => value.toLocaleString()} style={{fontSize: '11px', fill: '#6366f1', fontWeight: 'bold'}} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-l-4 border-indigo-500 pl-3">
            前月 ({currentData.month}) サマリー詳細
        </h2>
        <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[600px]">
                <thead>
                    <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                        <th className="py-3 px-4 text-left">項目</th>
                        <th className="py-3 px-4">予算</th>
                        <th className="py-3 px-4">目標 (Target)</th>
                        <th className="py-3 px-4 font-bold text-slate-700">実績 (Actual)</th>
                        <th className="py-3 px-4 text-rose-600">対予算比</th>
                        <th className="py-3 px-4 text-amber-600">対目標比</th>
                    </tr>
                </thead>
                <tbody>
                    {summaryTableData.map((row) => {
                        const vsBudget = row.budget ? (row.actual / row.budget) * 100 : 0;
                        const vsTarget = row.target ? (row.actual / row.target) * 100 : 0;
                        return (
                            <tr key={row.name} className="text-slate-800 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-4 text-left font-bold">{row.name}</td>
                                <td className="py-4 px-4">{row.budget.toLocaleString()}</td>
                                <td className="py-4 px-4">{row.target.toLocaleString()}</td>
                                <td className="py-4 px-4 font-bold text-lg">{row.actual.toLocaleString()}</td>
                                <td className="py-4 px-4 font-bold text-rose-600">{formatPercent(vsBudget)}</td>
                                <td className="py-4 px-4 font-bold text-amber-600">{formatPercent(vsTarget)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-slate-200 my-8 pt-8">
         <p className="text-center text-sm text-slate-400 mb-6 font-bold uppercase tracking-widest">Global Trend Analysis</p>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp size={20} className="text-indigo-600" />
                    予算・目標 vs 実績・予測推移 (売上)
                    </h3>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} formatter={(value: any) => `¥${Number(value).toLocaleString()}`} />
                        <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                        <ReferenceLine x="11月" stroke="#10b981" strokeDasharray="3 3">
                            <Label value="Current" position="top" fill="#10b981" fontSize={10} fontWeight="bold" offset={10} />
                        </ReferenceLine>
                        <Bar dataKey="sales_actual" name="実績" barSize={30} fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="sales_forecast" name="予測" stroke="#94a3b8" strokeDasharray="5 5" dot={{r: 3}} strokeWidth={2} />
                        <Line type="monotone" dataKey="sales_budget" name="予算" stroke="#fb7185" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                        <Line type="monotone" dataKey="sales_target" name="目標" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                    </ComposedChart>
                    </ResponsiveContainer>
                </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">着地見込サマリー</h3>
                    <div className="space-y-4">
                      
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-500 mb-1">当月着地見込</p>
                          <div className="flex items-end justify-between mb-2">
                              <span className="text-2xl font-bold text-slate-800">{formatCurrency(salesActual)}</span>
                          </div>
                          <div className="flex gap-2 text-[10px]">
                              <span className={`px-2 py-0.5 rounded-full font-bold ${budgetAchieve >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                  予算比 {formatPercent(budgetAchieve)}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full font-bold border ${targetAchieve >= 100 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-slate-200'}`}>
                                  目標比 {formatPercent(targetAchieve)}
                              </span>
                          </div>
                      </div>

                      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                          <p className="text-xs text-indigo-800 mb-1 font-bold">四半期予測合計</p>
                          <div className="flex items-end justify-between mb-2">
                              <span className="text-2xl font-bold text-slate-800">{formatCurrency(qForecast)}</span>
                          </div>
                          <div className="flex gap-2 text-[10px]">
                              <span className={`px-2 py-0.5 rounded-full font-bold bg-white border ${qBudgetAchieve >= 100 ? 'text-indigo-700 border-indigo-200' : 'text-rose-700 border-rose-200'}`}>
                                  予算比 {formatPercent(qBudgetAchieve)}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 font-bold border border-indigo-300">
                                  目標比 {formatPercent(qTargetAchieve)}
                              </span>
                          </div>
                      </div>
                      
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                          <p className="text-xs text-amber-800 mb-1 font-bold">半期予測合計</p>
                          <div className="flex items-end justify-between mb-2">
                              <span className="text-2xl font-bold text-slate-800">{formatCurrency(hForecast)}</span>
                          </div>
                          <div className="flex gap-2 text-[10px]">
                              <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 font-bold border border-slate-200">
                                  予算比 {formatPercent(hBudgetAchieve)}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-bold border border-amber-300">
                                  目標比 {formatPercent(hTargetAchieve)}
                              </span>
                          </div>
                      </div>

                    </div>
                  </div>
                </div>
            </div>
      </div>
    </div>
  );
};

// --- Sales Analysis Tab ---
const SalesAnalysisTab = ({ newSalesData, existingSalesData }: { newSalesData: NewSalesRecord[], existingSalesData: ExistingSalesRecord[] }) => {
  const [subTab, setSubTab] = useState<'new' | 'existing'>('new');

  // Hardcoded Lists
  const dealList = [
    { date: '2024/09/25', client: '株式会社A商事', segment: 'Enterprise', amount: 1500, id_count: 50, duration: '12ヶ月', owner: '佐藤' },
    { date: '2024/09/20', client: 'Bテック株式会社', segment: 'Mid', amount: 400, id_count: 20, duration: '12ヶ月', owner: '田中' },
    { date: '2024/09/18', client: 'Cソリューションズ', segment: 'Mid', amount: 350, id_count: 15, duration: '6ヶ月', owner: '田中' },
    { date: '2024/09/15', client: 'D物流', segment: 'Small', amount: 50, id_count: 5, duration: '1ヶ月', owner: '鈴木' },
    { date: '2024/09/10', client: 'E不動産', segment: 'Enterprise', amount: 1200, id_count: 40, duration: '12ヶ月', owner: '佐藤' },
    { date: '2024/09/05', client: 'Fサービス', segment: 'Mid', amount: 600, id_count: 30, duration: '12ヶ月', owner: '田中' },
    { date: '2024/09/02', client: 'G商会', segment: 'Small', amount: 100, id_count: 10, duration: '12ヶ月', owner: '鈴木' },
    { date: '2024/08/28', client: 'H工業', segment: 'Enterprise', amount: 2000, id_count: 80, duration: '24ヶ月', owner: '佐藤' },
  ];

  const fluctuationList = [
    { client: 'Xホールディングス', segment: 'Enterprise', oldAmount: 2000, newAmount: 2500, diff: '+25%', reason: '部署拡大' },
    { client: 'Yシステムズ', segment: 'Mid', oldAmount: 500, newAmount: 0, diff: '-100%', reason: '解約 (予算縮小)' },
  ];

  const notRenewedList = [
    { client: 'Zマート', segment: 'Small', expiry: '2024/09/30', amount: 100, owner: '鈴木' },
  ];

  const renewedList = [
    { client: 'アルファ工業', segment: 'Enterprise', amount: 1200, term: '12ヶ月' },
    { client: 'ベータ銀行', segment: 'Enterprise', amount: 3000, term: '12ヶ月' },
  ];

  const CircularRate = ({ value, color }: { value: number, color: string }) => {
    const data = [
      { name: 'Val', value: value },
      { name: 'Rest', value: 100 - (value > 100 ? 0 : value) },
    ];
    return (
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={25} outerRadius={35} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                <Cell fill={color} />
                <Cell fill={PIE_COLORS.off} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
            {value}%
          </div>
        </div>
      </div>
    );
  };

  // 新規売上のグラフ用データ生成
  const graphData = newSalesData.map(d => ({
    segment: d.segment,
    budget: Number(d.budget) || 0,
    target: Number(d.target) || 0,
    actual: Number(d.actual) || 0,
    // 達成率や前年比 (右軸用)
    budget_achiev: d.budget ? ((Number(d.actual) / Number(d.budget)) * 100).toFixed(1) : 0,
    target_achiev: d.target ? ((Number(d.actual) / Number(d.target)) * 100).toFixed(1) : 0,
    yoy: d.last_year ? ((Number(d.actual) / Number(d.last_year)) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('new')}
          className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${
            subTab === 'new' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          新規売上 (New Sales)
        </button>
        <button
          onClick={() => setSubTab('existing')}
          className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${
            subTab === 'existing' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          既存売上 (Existing Sales)
        </button>
      </div>

      {subTab === 'new' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* 1) Top Section: Graphs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-indigo-600" />
              セグメント別 予実・達成率
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={graphData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="segment" />
                  <YAxis yAxisId="left" tickFormatter={(val) => `${val/1000}k`} />
                  <YAxis yAxisId="right" orientation="right" unit="%" domain={[0, 'auto']} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="budget" name="予算" fill="#94a3b8" barSize={20} />
                  <Bar yAxisId="left" dataKey="target" name="目標" fill="#fbbf24" barSize={20} />
                  <Bar yAxisId="left" dataKey="actual" name="実績" fill="#6366f1" barSize={20} />
                  <Line yAxisId="right" type="monotone" dataKey="budget_achiev" name="予算達成率" stroke="#10b981" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="target_achiev" name="目標達成率" stroke="#f59e0b" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="yoy" name="昨年比" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2) Middle Section: Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building size={20} className="text-indigo-600" />
              セグメント別 詳細指標
            </h3>
            <table className="w-full text-right text-sm min-w-[800px]">
              <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
                <tr>
                  <th className="p-3 text-left">セグメント</th>
                  <th className="p-3">金額 (Actual)</th>
                  <th className="p-3 border-l border-slate-200">件数</th>
                  <th className="p-3">受注率</th>
                  <th className="p-3">リードタイム</th>
                  <th className="p-3">平均社単価</th>
                  <th className="p-3">平均ID単価</th>
                  <th className="p-3">平均期間</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {newSalesData.map((row) => (
                  <tr key={row.segment} className="hover:bg-slate-50">
                    <td className="p-3 text-left font-bold">{row.segment}</td>
                    <td className="p-3 font-bold text-indigo-600">{Number(row.actual).toLocaleString()}</td>
                    <td className="p-3 border-l border-slate-200">{row.count}件</td>
                    <td className="p-3">{row.win_rate}%</td>
                    <td className="p-3">{row.lead_time}日</td>
                    <td className="p-3">{Number(row.unit_price).toLocaleString()}</td>
                    <td className="p-3">{Number(row.id_price).toLocaleString()}</td>
                    <td className="p-3">{row.duration}ヶ月</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3) Bottom Section: Deal List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" />
                受注案件詳細 (全件)
              </h3>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm text-left text-slate-600 sticky top-0">
                  <thead className="bg-slate-50 text-xs uppercase sticky top-0 z-10">
                    <tr>
                      <th className="p-3">顧客名</th>
                      <th className="p-3">セグメント</th>
                      <th className="p-3 text-right">金額</th>
                      <th className="p-3 text-right">ID数</th>
                      <th className="p-3">受講期間</th>
                      <th className="p-3">担当</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dealList.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">{d.client}</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{d.segment}</span></td>
                        <td className="p-3 text-right font-medium">{d.amount.toLocaleString()}</td>
                        <td className="p-3 text-right">{d.id_count}</td>
                        <td className="p-3">{d.duration}</td>
                        <td className="p-3">{d.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4) Comments */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Info size={20} className="text-indigo-600" />
                新規売上コメント
              </h3>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 h-96 overflow-y-auto text-sm text-slate-700 leading-relaxed">
                <p className="mb-2"><strong>Enterprise:</strong> 製造業向けのアプローチが奏功し、大型案件を2件獲得。リードタイムも短縮傾向。</p>
                <p className="mb-2"><strong>Mid:</strong> 競合との価格競争が激化しており、受注率が微減。差別化資料の再整備が必要。</p>
                <p><strong>Small:</strong> インバウンド流入が好調。Web完結型のプランへの誘導がスムーズに進んでいる。</p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <RefreshCw size={20} className="text-emerald-600" />
              セグメント別 既存売上・維持率分析
            </h3>
            <table className="w-full text-center min-w-[800px]">
              <thead className="bg-emerald-50 text-emerald-800 text-sm font-bold">
                <tr>
                  <th className="p-3 text-left">セグメント</th>
                  <th className="p-3">売上金額</th>
                  <th className="p-3">金額継続率 (NRR)</th>
                  <th className="p-3">契約更新率</th>
                  <th className="p-3">ID増減率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {existingSalesData.map((row) => (
                  <tr key={row.segment} className="hover:bg-slate-50">
                    <td className="p-4 text-left font-bold text-lg">{row.segment}</td>
                    <td className="p-4 text-xl font-bold">{Number(row.sales).toLocaleString()}</td>
                    <td className="p-2"><CircularRate value={Number(row.nrr)} color="#10b981" /></td>
                    <td className="p-2"><CircularRate value={Number(row.renewal)} color="#3b82f6" /></td>
                    <td className="p-2"><CircularRate value={Number(row.id_growth)} color="#f59e0b" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-rose-500" />
                大幅変動企業リスト (±10%以上)
              </h3>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs">
                  <tr>
                    <th className="p-2">顧客名</th>
                    <th className="p-2">変更前</th>
                    <th className="p-2">変更後</th>
                    <th className="p-2">変動</th>
                    <th className="p-2">理由</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fluctuationList.map((f, i) => (
                    <tr key={i}>
                      <td className="p-2 font-bold">{f.client}</td>
                      <td className="p-2">{f.oldAmount}</td>
                      <td className="p-2">{f.newAmount}</td>
                      <td className={`p-2 font-bold ${f.diff.includes('-') ? 'text-rose-600' : 'text-emerald-600'}`}>{f.diff}</td>
                      <td className="p-2 text-xs text-slate-500">{f.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <XSquare size={20} className="text-slate-500" />
                未更新企業一覧
              </h3>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs">
                  <tr>
                    <th className="p-2">顧客名</th>
                    <th className="p-2">満了日</th>
                    <th className="p-2">金額</th>
                    <th className="p-2">担当</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notRenewedList.map((f, i) => (
                    <tr key={i}>
                      <td className="p-2 font-bold">{f.client}</td>
                      <td className="p-2 text-rose-600">{f.expiry}</td>
                      <td className="p-2">{f.amount}</td>
                      <td className="p-2">{f.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Info size={20} className="text-emerald-600" />
                更新・アップセルコメント
              </h3>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 h-40 overflow-y-auto text-sm text-emerald-900 leading-relaxed">
                <p className="mb-2"><strong>Enterprise:</strong> 大手X社の全社導入に伴い、NRRが大きく伸長。CSチームのオンボーディング支援が評価された。</p>
                <p><strong>General:</strong> 小規模契約の解約が数件発生したが、全体のID数は増加傾向を維持。価格改定の影響は軽微。</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckSquare size={20} className="text-emerald-600" />
                主な更新完了企業
              </h3>
              <ul className="space-y-2">
                {renewedList.map((r, i) => (
                  <li key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                    <span className="font-bold text-sm text-slate-700">{r.client}</span>
                    <div className="text-xs text-slate-500">
                      <span className="mr-2">¥{r.amount.toLocaleString()}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{r.term}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

const ProcessAnalysisTab = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
       <h3 className="text-lg font-bold text-slate-800 mb-6">セールスファネル分析 (当月)</h3>
       <div className="flex flex-col md:flex-row items-center justify-around gap-4 mb-8">
          {FUNNEL_DATA.map((stage, index) => (
              <div key={stage.stage} className="relative flex-1 w-full text-center group">
                  <div className="mx-auto flex items-center justify-center text-white font-bold shadow-md transition-transform group-hover:scale-105 rounded-sm" style={{ width: `${100 - (index * 15)}%`, height: '50px', backgroundColor: COLORS[index], minWidth: '100px' }}>
                      {stage.value}
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-700">{stage.stage}</p>
              </div>
          ))}
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg">
               <h4 className="font-bold text-rose-700 flex items-center gap-2 mb-2 text-sm">
                   <AlertCircle size={16} /> ボトルネック検知
               </h4>
               <p className="text-xs text-rose-800 leading-relaxed">
                   「提案→受注」の転換率が42.5%と、目標の50%を下回っています。競合他社との価格競争要因を排除するため、ROI訴求資料の強化が必要です。
               </p>
           </div>
           <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
               <h4 className="font-bold text-indigo-700 flex items-center gap-2 mb-2 text-sm">
                   <Activity size={16} /> リードソース分析
               </h4>
               <p className="text-xs text-indigo-800 leading-relaxed">
                   Webナーチャリング経由の商談化率が過去最高の35%を記録。ホワイトペーパーの効果が顕著です。
               </p>
           </div>
       </div>
    </div>
  );
};

const FutureActionTab = ({ data }: any) => {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-800 to-indigo-900 text-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="text-indigo-400" />
                    戦略的フォーカスエリア (Q3-Q4)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                        <h3 className="font-bold text-indigo-300 mb-2 text-sm">1. エンタープライズ深耕</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">製造業大手の導入成功事例を横展開。</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                        <h3 className="font-bold text-emerald-300 mb-2 text-sm">2. チャーンレートの抑制</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">学習定着ワークショップを無償提供。</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                        <h3 className="font-bold text-rose-300 mb-2 text-sm">3. 営業リソース最適化</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">提案→受注転換率改善に集中。</p>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.slice(6, 12)} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{fontSize: 12}} />
                            <YAxis domain={['auto', 'auto']} tick={{fontSize: 12}} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="sales_forecast" name="ベースライン" stroke="#6366f1" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};