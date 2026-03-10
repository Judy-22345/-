import React from 'react'
import { caseStatuses, caseTypes } from '../data/constants'

export default function CaseList({ cases, onSelectCase, onNewCase, onManageFiles }) {
  function getStatusBadge(status) {
    const statusInfo = caseStatuses.find(s => s.value === status)
    const colors = {
      default: { bg: '#efefef', color: '#37352f' },
      info: { bg: '#d1ecf1', color: '#0c5460' },
      warning: { bg: '#fff3cd', color: '#856404' },
      success: { bg: '#d4edda', color: '#155724' },
      danger: { bg: '#f8d7da', color: '#721c24' }
    }
    const color = colors[statusInfo?.color] || colors.default
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
        background: color.bg,
        color: color.color
      }}>
        {statusInfo?.label || status}
      </span>
    )
  }

  function formatCurrency(amount) {
    if (!amount) return '-'
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  function getCaseTypeLabel(type) {
    return caseTypes.find(t => t.value === type)?.label || type
  }

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th className="sticky-col sticky-left">案号</th>
              <th className="sticky-col">案由</th>
              <th className="sticky-col">类型</th>
              <th className="sticky-col">原告/申请人</th>
              <th className="sticky-col">被告/被申请人</th>
              <th className="sticky-col">代理人</th>
              <th className="sticky-col">管辖法院/仲裁机构</th>
              <th className="sticky-col">立案日期</th>
              <th className="sticky-col">开庭时间</th>
              <th>涉诉金额</th>
              <th>进展</th>
              <th className="sticky-col sticky-right-1">状态</th>
              <th className="sticky-col sticky-right" style={{ width: '80px' }}>文件</th>
            </tr>
          </thead>
          <tbody>
          {cases.length === 0 ? (
            <tr>
              <td colSpan="13" style={{ textAlign: 'center', padding: '40px' }}>
                <div className="empty-state">
                  <div className="empty-state-icon">📁</div>
                  <div className="empty-state-title">暂无案件</div>
                  <div className="empty-state-desc">点击右上角"新建案件"添加第一个案件</div>
                </div>
              </td>
            </tr>
          ) : (
            cases.map((caseItem) => {
              const fileCount = (caseItem.files?.party || []).length +
                               (caseItem.files?.court || []).length +
                               (caseItem.files?.opponent || []).length

              return (
                <tr key={caseItem.id} onClick={() => onSelectCase(caseItem)}>
                  <td className="sticky-col sticky-left" style={{ fontWeight: 500, color: '#2f80ed' }}>{caseItem.caseNumber}</td>
                  <td className="sticky-col">{caseItem.caseCause}</td>
                  <td className="sticky-col">{getCaseTypeLabel(caseItem.caseType)}</td>
                  <td className="sticky-col">{caseItem.plaintiff}</td>
                  <td className="sticky-col">{caseItem.defendant}</td>
                  <td className="sticky-col" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {caseItem.agent || '-'}
                  </td>
                  <td className="sticky-col" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {caseItem.court}
                  </td>
                  <td className="sticky-col">{caseItem.acceptanceDate || '-'}</td>
                  <td className="sticky-col">{caseItem.trialDate || '-'}</td>
                  <td style={{ textAlign: 'right', minWidth: '100px' }}>{formatCurrency(caseItem.disputeAmount)}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: '150px' }}>
                    {caseItem.progress || '-'}
                  </td>
                  <td className="sticky-col sticky-right-1">{getStatusBadge(caseItem.status)}</td>
                  <td className="sticky-col sticky-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onManageFiles(caseItem)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        background: fileCount > 0 ? 'var(--accent-color)' : 'var(--bg-secondary)',
                        color: fileCount > 0 ? '#fff' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = fileCount > 0 ? '#1a5fb4' : 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = fileCount > 0 ? 'var(--accent-color)' : 'var(--bg-secondary)'}
                    >
                      <span>📎</span>
                      {fileCount > 0 && <span style={{ fontWeight: 600 }}>{fileCount}</span>}
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}
