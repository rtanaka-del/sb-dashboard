"use client";

import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, AreaChart, Area, PieChart, Pie, Cell, ReferenceLine, Label, LabelList
} from 'recharts';
import {
  LayoutDashboard, TrendingUp, Activity, Target, ArrowUpRight, ArrowDownRight,
  Users, DollarSign, Briefcase, AlertCircle, Link as LinkIcon, RefreshCw, CheckCircle, FileUp, Info,
  PieChart as PieChartIcon
} from 'lucide-react';

// --- 型定義 ---
type SalesRecord = {
  month: string;
  budget: number;
  target: number;
  actual: number | null;
  forecast: number;
};

// --- 初期モックデータ ---
const INITIAL_SALES_DATA: SalesRecord[] = [
  { month: '4月', budget: 12000, target: 13000, actual: 12500, forecast: 12500 },
  { month: '5月', budget: 13000, target: 14000, actual: 12800, forecast: 12800 },
  { month: '6月', budget: 14000, target: 15000, actual: 14500, forecast: 14500 },
  { month: '7月', budget: 15000, target: 16000, actual: 16000, forecast: 16000 },
  { month: '8月', budget: 16000, target: 17000, actual: 15800, forecast: 15800 },
  { month: '9月', budget: 17000, target: 18000, actual: 18200, forecast: 18200 },
  { month: '10月', budget: 18000, target: 19500, actual: null, forecast: 19000 },
  { month: '11月', budget: 19000, target: 20500, actual: null, forecast: 19500 },
  { month: '12月', budget: 20000, target: 21500, actual: null, forecast: 21000 },
  { month: '1月', budget: 21000, target: 22500, actual: null, forecast: 22000 },
  { month: '2月', budget: 22000, target: 23500, actual: null, forecast: 22500 },
  { month: '3月', budget: 23000, target: 25000, actual: null, forecast: 24000 },
];

const INDUSTRY_DATA = [
  { name: 'IT・通信', value: 45 },
  { name: '製造業', value: 25 },
  { name: '商社', value: 15 },
  { name: '金融', value: 10 },
  { name: 'その他', value: 5 },
];

const FUNNEL_DATA = [
  { stage: 'リード獲得', value: 1200 },
  { stage: '商談化', value: 450 },
  { stage: '提案', value: 200 },
  { stage: '受注', value: 85 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// --- ヘルパー関数 ---
const parseCSV = (csvText: string): SalesRecord[] => {
  const cleanText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const lines = cleanText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    if (!line.trim()) return {} as SalesRecord;
    const values = line.split(',');
    const record: any = {};
    headers.forEach((header, index) => {
      const val = values[index]?.trim().replace(/"/g, '');
      if (header === 'month') {
        record[header] = val;
      } else {
        record[header] = (val === '' || val === '-' || val === undefined) ? null : Number(val);
      }
    });
    return record as SalesRecord;
  }).filter(r => r.month);
};

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  return `¥${value.toLocaleString()}`;
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(1)}%`;
};

export default function CBDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [salesData, setSalesData] = useState<SalesRecord[]>(INITIAL_SALES_DATA);
  const [sheetInput, setSheetInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsed = parseCSV(text);
          if (parsed.length > 0 && parsed[0].month) {
            setSalesData(parsed);
            setFileName(file.name);
            setSyncStatus('success');
            setTimeout(() => setSyncStatus('idle'), 3000);
          } else {
            throw new Error('ヘッダー(month,budget...)を確認してください');
          }
        } catch (err: any) {
          setSyncStatus('error');
          setErrorMessage(err.message || '読込失敗');
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

      let csvText = '';
      let usedMethod = '';

      try {
        const gvizUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
        const res = await fetch(gvizUrl);
        if (res.ok) {
           const text = await res.text();
           if (!text.includes('<!DOCTYPE html>') && !text.includes('google.com/accounts')) {
             csvText = text;
             usedMethod = 'Shared Link (Gviz)';
           }
        }
      } catch (e) { console.log('Gviz failed', e); }

      if (!csvText) {
        try {
          const pubUrl = sheetInput.includes('/d/e/2PACX') 
            ? sheetInput 
            : `https://docs.google.com/spreadsheets/d/${cleanId}/pub?output=csv`;
          const res = await fetch(pubUrl);
          if (res.ok) {
            const text = await res.text();
            if (!text.includes('<!DOCTYPE html>')) {
              csvText = text;
              usedMethod = 'Published Link';
            }
          }
        } catch (e) { console.log('Pub failed', e); }
      }

      if (!csvText) throw new Error('アクセスできませんでした。「リンクを知っている全員」に共有設定してください。');

      const parsedData = parseCSV(csvText);
      if (parsedData.length === 0 || !parsedData[0].month) throw new Error('データ形式不正');

      setSalesData(parsedData);
      setSyncStatus('success');
      setFileName(`Sheet (${usedMethod})`);
      setTimeout(() => setSyncStatus('idle'), 3000);

    } catch (error: any) {
      console.error(error);
      setSyncStatus('error');
      setErrorMessage(error.message || '取得失敗');
    } finally {
      setIsSyncing(false);
    }
  };

  const currentMonthData = [...salesData].reverse().find(d => d.actual !== null) || salesData[salesData.length - 1];
  
  const budgetAchievement = currentMonthData.actual 
    ? (currentMonthData.actual / currentMonthData.budget) * 100 
    : 0;
  const targetAchievement = currentMonthData.actual && currentMonthData.target
    ? (currentMonthData.actual / currentMonthData.target) * 100
    : 0;
    
  const secondHalfForecast = salesData.slice(6, 12).reduce((acc, cur) => acc + cur.forecast, 0);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab data={salesData} currentData={currentMonthData} secondHalfForecast={secondHalfForecast} />;
      case 'sales': return <SalesAnalysisTab data={salesData} />;
      case 'process': return <ProcessAnalysisTab />;
      case 'future': return <FutureActionTab data={salesData} />;
      default: return <OverviewTab data={salesData} currentData={currentMonthData} secondHalfForecast={secondHalfForecast} />;
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
          <p className="text-xs text-slate-400 mt-2">法人事業部 ダッシュボードver.1</p>
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
                  placeholder="標準ID (1OGA...) または URL"
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
                  {isSyncing ? 'データを更新' : 'データを更新'}
                </button>
              </div>
              <div className="mt-2 flex items-start gap-1 text-[10px] text-slate-400">
                <Info size={12} className="mt-0.5 shrink-0" />
                <p>「2PACX」ではなく「1OGA...」で始まる標準IDを入力してください。</p>
              </div>
            </div>
            {fileName && syncStatus === 'success' && (
               <div className="mt-2 p-2 bg-emerald-900/30 border border-emerald-800/50 rounded text-[10px] text-emerald-300 truncate">読込完了: {fileName}</div>
            )}
            {syncStatus === 'error' && (
              <div className="mt-2 p-2 bg-rose-900/30 border border-rose-800/50 rounded text-[10px] text-rose-300 leading-tight">⚠ {errorMessage}</div>
            )}
            <div className="border-t border-slate-600 my-2"></div>
            <div>
              <label className="flex items-center justify-center w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded cursor-pointer transition-colors border border-slate-600">
                <FileUp size={12} className="mr-2" />
                <span>CSVを手動読込</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 px-8 py-4 flex justify-between items-center border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {activeTab === 'overview' && '月次売上および今後の売上予測'}
              {activeTab === 'sales' && '詳細売上分析'}
              {activeTab === 'process' && 'プロセス・要因分析'}
              {activeTab === 'future' && '未来予測とアクションプラン'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-sm font-medium">田中 太郎</p>
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

const KPICard = ({ title, value, subValue, trend, icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow group">
    <div>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{value}</h3>
      <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500'}`}>
        {trend === 'up' ? <ArrowUpRight size={16} /> : trend === 'down' ? <ArrowDownRight size={16} /> : null}
        <span className="ml-1 font-medium">{subValue}</span>
      </div>
    </div>
    <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
      {icon}
    </div>
  </div>
);

const OverviewTab = ({ data, currentData, secondHalfForecast }: any) => {
  // 数値計算 (予算・目標・実績)
  const salesBudget = currentData.budget;
  const salesTarget = currentData.target;
  const salesActual = currentData.actual || currentData.forecast;

  // コスト計算 (仮定: 予算比40%程度で推移)
  const costBudget = Math.round(salesBudget * 0.4);
  const costTarget = Math.round(salesTarget * 0.4); 
  const costActual = Math.round(salesActual * 0.38);

  // 利益計算
  const profitBudget = salesBudget - costBudget;
  const profitTarget = salesTarget - costTarget;
  const profitActual = salesActual - costActual;

  // グラフ用データ (3本立て)
  const comparisonData = [
    { name: '売上', budget: salesBudget, target: salesTarget, actual: salesActual },
    { name: 'コスト', budget: costBudget, target: costTarget, actual: costActual },
    { name: '貢献利益', budget: profitBudget, target: profitTarget, actual: profitActual },
  ];

  // 表用データ
  const summaryTableData = [
    { name: '売上', budget: salesBudget, target: salesTarget, actual: salesActual },
    { name: 'コスト', budget: costBudget, target: costTarget, actual: costActual },
    { name: '貢献利益', budget: profitBudget, target: profitTarget, actual: profitActual },
  ];

  // 達成率計算 (当月)
  const budgetAchieve = (salesActual / salesBudget) * 100;
  const targetAchieve = (salesActual / salesTarget) * 100;

  // 達成率計算 (四半期: Q3 = 10月-12月)
  // データ配列のインデックス: 4月=0 ... 9月=5, 10月=6, 11月=7, 12月=8
  const q3Data = data.slice(6, 9); 
  const q3Budget = q3Data.reduce((acc: number, cur: any) => acc + cur.budget, 0);
  const q3Target = q3Data.reduce((acc: number, cur: any) => acc + cur.target, 0);
  const q3Forecast = q3Data.reduce((acc: number, cur: any) => acc + cur.forecast, 0);
  
  const q3BudgetAchieve = (q3Forecast / q3Budget) * 100;
  const q3TargetAchieve = (q3Forecast / q3Target) * 100;

  // 達成率計算 (半期: 10月-3月)
  const halfYearBudget = data.slice(6, 12).reduce((acc: number, cur: any) => acc + cur.budget, 0);
  const halfYearTarget = data.slice(6, 12).reduce((acc: number, cur: any) => acc + cur.target, 0);
  const halfYearBudgetAchieve = (secondHalfForecast / halfYearBudget) * 100;
  const halfYearTargetAchieve = (secondHalfForecast / halfYearTarget) * 100;

  return (
    <div className="space-y-8">
      {/* --- Section 1: 棒グラフ (3要素比較) --- */}
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

      {/* --- Section 2: 詳細テーブル (予算・目標・実績・達成率x2) --- */}
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

      {/* --- Section 3: 旧コンテンツ (トレンドグラフ & KPI & サマリー) --- */}
      <div className="border-t-2 border-dashed border-slate-200 my-8 pt-8">
         <p className="text-center text-sm text-slate-400 mb-6 font-bold uppercase tracking-widest">Global Trend Analysis</p>
         
         <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="今月売上" value={formatCurrency(salesActual)} subValue={`対予算 ${formatPercent(budgetAchieve - 100)}`} trend={budgetAchieve >= 100 ? 'up' : 'down'} icon={<DollarSign size={24} className="text-indigo-600" />} colorClass="bg-indigo-100" />
                <KPICard title="新規売上" value="¥2,450,000" subValue="前月比 +12.5%" trend="up" icon={<Briefcase size={24} className="text-emerald-600" />} colorClass="bg-emerald-100" />
                <KPICard title="解約率" value="0.85%" subValue="前月比 +0.05pt" trend="down" icon={<AlertCircle size={24} className="text-rose-600" />} colorClass="bg-rose-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp size={20} className="text-indigo-600" />
                    予算・目標 vs 実績・予測推移
                    </h3>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} formatter={(value: any) => `¥${value.toLocaleString()}`} />
                        <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                        <ReferenceLine x="11月" stroke="#10b981" strokeDasharray="3 3">
                            <Label value="Current" position="top" fill="#10b981" fontSize={10} fontWeight="bold" offset={10} />
                        </ReferenceLine>
                        <Bar dataKey="actual" name="実績" barSize={30} fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="forecast" name="予測" stroke="#94a3b8" strokeDasharray="5 5" dot={{r: 3}} strokeWidth={2} />
                        <Line type="monotone" dataKey="budget" name="予算" stroke="#fb7185" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                        <Line type="monotone" dataKey="target" name="目標" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                    </ComposedChart>
                    </ResponsiveContainer>
                </div>
                </div>

                {/* --- 改修されたサマリーカード (予算比・目標比併記) --- */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">着地見込サマリー</h3>
                    <div className="space-y-4">
                      
                      {/* 1. 当月 */}
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-500 mb-1">当月 ({currentData?.month}) 着地見込</p>
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

                      {/* 2. 四半期 (Q3) - NEW! */}
                      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                          <p className="text-xs text-indigo-800 mb-1 font-bold">四半期 (Q3) 予測合計</p>
                          <div className="flex items-end justify-between mb-2">
                              <span className="text-2xl font-bold text-slate-800">¥{(q3Forecast / 1000).toFixed(1)}M</span>
                          </div>
                          <div className="flex gap-2 text-[10px]">
                              <span className={`px-2 py-0.5 rounded-full font-bold bg-white border ${q3BudgetAchieve >= 100 ? 'text-indigo-700 border-indigo-200' : 'text-rose-700 border-rose-200'}`}>
                                  予算比 {formatPercent(q3BudgetAchieve)}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 font-bold border border-indigo-300">
                                  目標比 {formatPercent(q3TargetAchieve)}
                              </span>
                          </div>
                      </div>
                      
                      {/* 3. 半期 */}
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                          <p className="text-xs text-amber-800 mb-1 font-bold">半期 (10-3月) 予測合計</p>
                          <div className="flex items-end justify-between mb-2">
                              <span className="text-2xl font-bold text-slate-800">¥{(secondHalfForecast / 1000).toFixed(0)}M</span>
                          </div>
                          <div className="flex gap-2 text-[10px]">
                              <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 font-bold border border-slate-200">
                                  予算比 {formatPercent(halfYearBudgetAchieve)}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-bold border border-amber-300">
                                  目標比 {formatPercent(halfYearTargetAchieve)}
                              </span>
                          </div>
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

const SalesAnalysisTab = ({ data }: any) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <PieChartIcon size={20} className="text-indigo-600" />
          業界別売上構成比
        </h3>
        <div className="h-72 w-full flex">
          <ResponsiveContainer width="60%" height="100%">
            <PieChart>
              <Pie data={INDUSTRY_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {INDUSTRY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-[40%] flex flex-col justify-center space-y-3">
             {INDUSTRY_DATA.map((item, index) => (
               <div key={index} className="flex items-center justify-between pr-4">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                   <span className="text-xs text-slate-600 font-medium">{item.name}</span>
                 </div>
                 <span className="font-bold text-slate-800 text-sm">{item.value}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">プラン別 MRR推移</h3>
        <div className="h-72 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.slice(0, 6)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <Tooltip />
              <Area type="monotone" dataKey="budget" name="Standard" stackId="1" stroke="#6366f1" fillOpacity={1} fill="url(#colorStandard)" />
              <Area type="monotone" dataKey="actual" name="Premium" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorPremium)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
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
                            <Line type="monotone" dataKey="forecast" name="ベースライン" stroke="#6366f1" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};