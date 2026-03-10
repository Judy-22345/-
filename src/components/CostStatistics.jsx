import React, { useMemo } from 'react'

export default function CostStatistics({ cases }) {
  // 统计成本信息
  const costStats = useMemo(() => {
    const totalCost = cases.reduce((sum, c) => sum + (c.costAmount || 0), 0)
    const casesWithCost = cases.filter(c => c.costAmount > 0)

    // 按案件类型统计成本
    const byCaseType = {}
    cases.forEach(c => {
      const type = c.caseType || 'other'
      if (!byCaseType[type]) {
        byCaseType[type] = { count: 0, amount: 0 }
      }
      byCaseType[type].count++
      byCaseType[type].amount += (c.costAmount || 0)
    })

    // 按法院统计成本
    const byCourt = {}
    cases.forEach(c => {
      const court = c.court || '未知'
      if (!byCourt[court]) {
        byCourt[court] = { count: 0, amount: 0 }
      }
      byCourt[court].count++
      byCourt[court].amount += (c.costAmount || 0)
    })

    // 按履行状态统计成本
    const byFulfillmentStatus = {
      not_due: { count: 0, amount: 0 },
      partial: { count: 0, amount: 0 },
      completed: { count: 0, amount: 0 },
      failed: { count: 0, amount: 0 },
      enforcement: { count: 0, amount: 0 }
    }

    cases.forEach(c => {
      const status = c.fulfillmentStatus || 'not_due'
      if (byFulfillmentStatus[status]) {
        byFulfillmentStatus[status].count++
        byFulfillmentStatus[status].amount += (c.costAmount || 0)
      }
    })

    // 成本类型分析（根据 costNote 关键词）
    const costTypes = {
      '案件受理费': 0,
      '保全费': 0,
      '仲裁费': 0,
      '律师费': 0,
      '鉴定费': 0,
      '公证费': 0,
      '其他': 0
    }

    cases.forEach(c => {
      const note = (c.costNote || '').toLowerCase()
      const amount = c.costAmount || 0
      if (note.includes('受理费')) costTypes['案件受理费'] += amount
      else if (note.includes('保全')) costTypes['保全费'] += amount
      else if (note.includes('仲裁')) costTypes['仲裁费'] += amount
      else if (note.includes('律师')) costTypes['律师费'] += amount
      else if (note.includes('鉴定')) costTypes['鉴定费'] += amount
      else if (note.includes('公证')) costTypes['公证费'] += amount
      else costTypes['其他'] += amount
    })

    return {
      totalCost,
      casesWithCost,
      byCaseType,
      byCourt,
      byFulfillmentStatus,
      costTypes
    }
  }, [cases])

  function formatCurrency(amount) {
    if (!amount || amount === 0) return '-'
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  function getCaseTypeLabel(type) {
    const labels = {
      'civil': '民事诉讼',
      'criminal': '刑事诉讼',
      'administrative': '行政诉讼',
      'arbitration': '仲裁',
      'labor': '劳动仲裁',
      'intellectual': '知识产权',
      'contract': '合同纠纷',
      'corporate': '公司纠纷',
      'other': '其他'
    }
    return labels[type] || type
  }

  // 获取成本最高的前 5 个案件
  const topCostCases = useMemo(() => {
    return [...cases]
      .filter(c => c.costAmount > 0)
      .sort((a, b) => (b.costAmount || 0) - (a.costAmount || 0))
      .slice(0, 5)
  }, [cases])

  return (
    <div>
      {/* 统计卡片 */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-title">成本总额</div>
          <div className="stat-card-value" style={{ fontSize: '18px' }}>
            {formatCurrency(costStats.totalCost)}
          </div>
          <div className="stat-card-change" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            涉及案件：{costStats.casesWithCost.length} 件
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">平均成本</div>
          <div className="stat-card-value" style={{ fontSize: '18px' }}>
            {formatCurrency(costStats.totalCost / (costStats.casesWithCost.length || 1))}
          </div>
          <div className="stat-card-change" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            每件案件平均
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">案件类型</div>
          <div className="stat-card-value" style={{ fontSize: '18px' }}>
            {Object.keys(costStats.byCaseType).length} 种
          </div>
          <div className="stat-card-change" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            已产生成本
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">管辖机构</div>
          <div className="stat-card-value" style={{ fontSize: '18px' }}>
            {Object.keys(costStats.byCourt).length} 个
          </div>
          <div className="stat-card-change" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            已产生成本
          </div>
        </div>
      </div>

      {/* 成本类型分布 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
          📊 成本类型分布
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px'
        }}>
          {Object.entries(costStats.costTypes).filter(([_, amount]) => amount > 0).map(([type, amount]) => {
            const percentage = costStats.totalCost > 0 ? (amount / costStats.totalCost * 100).toFixed(1) : 0
            return (
              <div
                key={type}
                style={{
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px'
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {type}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatCurrency(amount)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  占比 {percentage}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 按案件类型统计 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
          📁 按案件类型统计
        </h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>案件类型</th>
                <th>案件数量</th>
                <th>成本总额</th>
                <th>平均成本</th>
                <th>占比</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(costStats.byCaseType).map(([type, data]) => {
                const percentage = costStats.totalCost > 0 ? (data.amount / costStats.totalCost * 100).toFixed(1) : 0
                return (
                  <tr key={type}>
                    <td>{getCaseTypeLabel(type)}</td>
                    <td>{data.count} 件</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(data.amount)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(data.amount / (data.count || 1))}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{percentage}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 按履行状态统计 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
          📊 按履行状态统计
        </h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>履行状态</th>
                <th>案件数量</th>
                <th>成本总额</th>
                <th>平均成本</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(costStats.byFulfillmentStatus).filter(([_, data]) => data.count > 0).map(([status, data]) => {
                const labels = {
                  'not_due': '未履行期限',
                  'partial': '部分履行',
                  'completed': '全部履行',
                  'failed': '履行失败',
                  'enforcement': '强制执行中'
                }
                return (
                  <tr key={status}>
                    <td>{labels[status]}</td>
                    <td>{data.count} 件</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(data.amount)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(data.amount / (data.count || 1))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 高成本案件 TOP5 */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
          🔝 高成本案件 TOP 5
        </h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>案号</th>
                <th>案由</th>
                <th>成本金额</th>
                <th>费用说明</th>
              </tr>
            </thead>
            <tbody>
              {topCostCases.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    暂无成本数据
                  </td>
                </tr>
              ) : (
                topCostCases.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500, color: '#2f80ed' }}>{c.caseNumber}</td>
                    <td>{c.caseCause}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(c.costAmount)}
                    </td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.costNote || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
