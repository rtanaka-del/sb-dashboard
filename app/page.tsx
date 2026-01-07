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

