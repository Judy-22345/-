import React, { useState, useMemo } from 'react'

export default function PaymentView({ cases }) {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState(null)

  // 提取有回款的案件（supportedAmount > 0 的案件）
  const casesWithPayments = useMemo(() => {
    return cases.filter(c => c.supportedAmount > 0 || c.costAmount > 0)
  }, [cases])

  // 统计回款信息
  const paymentStats = useMemo(() => {
    const totalSupported = cases.reduce((sum, c) => sum + (c.supportedAmount || 0), 0)
    const totalCost = cases.reduce((sum, c) => sum + (c.costAmount || 0), 0)
    const netAmount = totalSupported - totalCost

    // 按履行状态统计
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
        byFulfillmentStatus[status].amount += (c.supportedAmount || 0)
      }
    })

    return { totalSupported, totalCost, netAmount, byFulfillmentStatus }
  }, [cases])

  function formatCurrency(amount) {
    if (!amount || amount === 0) return '-'
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  function getFulfillmentLabel(status) {
    const labels = {
      'not_due': '未履行期限',
      'partial': '部分履行',
      'completed': '全部履行',
      'failed': '履行失败',
      'enforcement': '强制执行中'
    }
    return labels[status] || status
  }

  function getFulfillmentColor(status) {
    const colors = {
      'not_due': { bg: '#efefef', color: '#37352f' },
      'partial': { bg: '#fff3cd', color: '#856404' },
      'completed': { bg: '#d4edda', color: '#155724' },
      'failed': { bg: '#f8d7da', color: '#721c24' },
      'enforcement': { bg: '#d1ecf1', color: '#0c5460' }
    }
    return colors[status] || colors['not_due']
  }

  return (
    <div>
      {/* 统计卡片 */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-title">获支持总额</div>
          <div className="stat-card-value" style={{ fontSize: '18px', color: 'var(--success-color)' }}>
            {formatCurrency(paymentStats.totalSupported)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">成本费用</div>
          <div className="stat-card-value" style={{ fontSize: '18px' }}>
            {formatCurrency(paymentStats.totalCost)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">净回款</div>
          <div className="stat-card-value" style={{ fontSize: '18px', color: paymentStats.netAmount >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
            {formatCurrency(paymentStats.netAmount)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">有回款案件</div>
          <div className="stat-card-value" style={{ fontSize: '18px' }}>
            {casesWithPayments.length} 件
          </div>
        </div>
      </div>

      {/* 履行状态分布 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {Object.entries(paymentStats.byFulfillmentStatus).filter(([_, data]) => data.count > 0).map(([status, data]) => {
          const color = getFulfillmentColor(status)
          return (
            <div
              key={status}
              style={{
                padding: '12px 16px',
                background: color.bg,
                borderRadius: '8px',
                border: `1px solid ${color.bg}`
              }}
            >
              <div style={{ fontSize: '12px', color: color.color, fontWeight: 500, marginBottom: '4px' }}>
                {getFulfillmentLabel(status)}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: color.color }}>
                {data.count} 件 · {formatCurrency(data.amount)}
              </div>
            </div>
          )
        })}
      </div>

      {/* 回款明细列表 */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>案号</th>
              <th>案由</th>
              <th>获支持金额</th>
              <th>成本费用</th>
              <th>净回款</th>
              <th>履行状态</th>
              <th>履行说明</th>
              <th>原告/申请人</th>
              <th>被告/被申请人</th>
            </tr>
          </thead>
          <tbody>
            {casesWithPayments.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-state">
                    <div className="empty-state-icon">💰</div>
                    <div className="empty-state-title">暂无回款记录</div>
                    <div className="empty-state-desc">有获支持金额或成本费用的案件将在此显示</div>
                  </div>
                </td>
              </tr>
            ) : (
              casesWithPayments.map(c => {
                const netAmount = (c.supportedAmount || 0) - (c.costAmount || 0)
                const color = getFulfillmentColor(c.fulfillmentStatus || 'not_due')
                return (
                  <tr
                    key={c.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedCase(c)}
                  >
                    <td style={{ fontWeight: 500, color: '#2f80ed' }}>{c.caseNumber}</td>
                    <td>{c.caseCause}</td>
                    <td style={{ textAlign: 'right', color: 'var(--success-color)' }}>
                      {formatCurrency(c.supportedAmount)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {formatCurrency(c.costAmount)}
                    </td>
                    <td style={{ textAlign: 'right', color: netAmount >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                      {formatCurrency(netAmount)}
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: color.bg,
                        color: color.color
                      }}>
                        {getFulfillmentLabel(c.fulfillmentStatus || 'not_due')}
                      </span>
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.fulfillmentNote || '-'}
                    </td>
                    <td>{c.plaintiff}</td>
                    <td>{c.defendant}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 案件详情弹窗 */}
      {selectedCase && (
        <div className="modal-overlay" onClick={() => setSelectedCase(null)}>
          <div className="modal" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCase.caseNumber}</h2>
              <button className="modal-close" onClick={() => setSelectedCase(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3 className="detail-section-title">回款信息</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-item-label">获支持金额</div>
                    <div className="detail-item-value" style={{ color: 'var(--success-color)', fontSize: '18px' }}>
                      {formatCurrency(selectedCase.supportedAmount)}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-item-label">成本费用</div>
                    <div className="detail-item-value" style={{ fontSize: '18px' }}>
                      {formatCurrency(selectedCase.costAmount)}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-item-label">净回款</div>
                    <div className="detail-item-value" style={{
                      fontSize: '18px',
                      color: ((selectedCase.supportedAmount || 0) - (selectedCase.costAmount || 0)) >= 0
                        ? 'var(--success-color)' : 'var(--danger-color)'
                    }}>
                      {formatCurrency((selectedCase.supportedAmount || 0) - (selectedCase.costAmount || 0))}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-item-label">履行状态</div>
                    <div className="detail-item-value">
                      {getFulfillmentLabel(selectedCase.fulfillmentStatus || 'not_due')}
                    </div>
                  </div>
                </div>
              </div>

              {selectedCase.fulfillmentNote && (
                <div className="detail-section">
                  <h3 className="detail-section-title">履行说明</h3>
                  <div style={{
                    background: 'var(--bg-secondary)',
                    padding: '16px',
                    borderRadius: '8px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.8'
                  }}>
                    {selectedCase.fulfillmentNote}
                  </div>
                </div>
              )}

              {selectedCase.costNote && (
                <div className="detail-section">
                  <h3 className="detail-section-title">费用说明</h3>
                  <div style={{
                    background: 'var(--bg-secondary)',
                    padding: '16px',
                    borderRadius: '8px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.8'
                  }}>
                    {selectedCase.costNote}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setSelectedCase(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
