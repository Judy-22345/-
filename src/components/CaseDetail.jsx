import React from 'react'
import { caseStatuses, caseTypes, preservationTypes, fulfillmentStatuses } from '../data/constants'
import FileUpload from './FileUpload'

export default function CaseDetail({ caseData, onEdit, onClose, onDelete, onAddTimeline, onUpdateFiles, onDeleteTimeline }) {
  const [activeTab, setActiveTab] = React.useState('overview')

  function handleFilesChange(category, files) {
    onUpdateFiles && onUpdateFiles({
      ...caseData.files,
      [category]: files
    })
  }

  function handleDeleteTimelineItem(index) {
    if (confirm('确定要删除这个事件吗？')) {
      if (onDeleteTimeline) {
        onDeleteTimeline(caseData.id, index)
      }
    }
  }

  function formatFullDate(dateTime) {
    if (!dateTime) return ''
    const date = new Date(dateTime)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

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
    if (!amount) return '0'
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  function getCaseTypeLabel(type) {
    return caseTypes.find(t => t.value === type)?.label || type
  }

  function getPreservationLabel(type) {
    return preservationTypes.find(t => t.value === type)?.label || type
  }

  function getFulfillmentLabel(status) {
    return fulfillmentStatuses.find(s => s.value === status)?.label || status
  }

  const DetailItem = ({ label, value, children }) => (
    <div className="detail-item">
      <div className="detail-item-label">{label}</div>
      <div className="detail-item-value">{children || value || '-'}</div>
    </div>
  )

  return (
    <div className="modal" style={{ maxWidth: '1000px' }}>
      <div className="modal-header">
        <div>
          <h2 style={{ color: '#2f80ed' }}>{caseData.caseNumber}</h2>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {caseData.caseCause}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {getStatusBadge(caseData.status)}
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 20px' }}>
        {['overview', 'progress', 'timeline'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent-color)' : 'none',
              color: activeTab === tab ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? 500 : 400,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {tab === 'overview' && '📋 案件概览'}
            {tab === 'progress' && '📊 进展详情'}
            {tab === 'timeline' && '📅 时间线'}
          </button>
        ))}
      </div>

      <div className="modal-body" style={{ padding: '24px' }}>
        {activeTab === 'overview' && (
          <>
            <div className="detail-section">
              <h3 className="detail-section-title">基本信息</h3>
              <div className="detail-grid">
                <DetailItem label="案号" value={caseData.caseNumber} />
                <DetailItem label="案由" value={caseData.caseCause} />
                <DetailItem label="案件类型" value={getCaseTypeLabel(caseData.caseType)} />
                <DetailItem label="案件状态">
                  {getStatusBadge(caseData.status)}
                </DetailItem>
                <DetailItem label="管辖法院/仲裁机构" value={caseData.court} />
                <DetailItem label="代理人" value={caseData.agent || '-'} />
                <DetailItem label="法官/仲裁员" value={`${caseData.judgeName || '-'} ${caseData.judgePhone ? `(${caseData.judgePhone})` : ''}`} />
                <DetailItem label="原告/申请人" value={caseData.plaintiff} />
                <DetailItem label="被告/被申请人" value={caseData.defendant} />
                <DetailItem label="收案日期" value={caseData.acceptanceDate} />
                <DetailItem label="开庭时间" value={caseData.trialDate} />
              </div>
            </div>

            <div className="detail-section">
              <h3 className="detail-section-title">金额信息</h3>
              <div className="detail-grid">
                <DetailItem
                  label="涉诉金额"
                  value={formatCurrency(caseData.disputeAmount)}
                />
                <DetailItem
                  label="裁决支持金额"
                  value={formatCurrency(caseData.supportedAmount)}
                />
                <DetailItem
                  label="成本费用"
                  value={caseData.costNote ? `${formatCurrency(caseData.costAmount)} - ${caseData.costNote}` : formatCurrency(caseData.costAmount)}
                />
                <DetailItem
                  label="保全类型"
                  value={getPreservationLabel(caseData.preservationType)}
                />
              </div>
            </div>

            <div className="detail-section">
              <h3 className="detail-section-title">履行情况</h3>
              <div className="detail-grid">
                <DetailItem label="履行状态" value={getFulfillmentLabel(caseData.fulfillmentStatus)} />
                <DetailItem label="履行说明" value={caseData.fulfillmentNote} />
              </div>
            </div>
          </>
        )}

        {activeTab === 'progress' && (
          <>
            <div className="detail-section">
              <h3 className="detail-section-title">诉讼/仲裁进展</h3>
              <div style={{
                background: 'var(--bg-secondary)',
                padding: '16px',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.8'
              }}>
                {caseData.progress || '暂无进展记录'}
              </div>
            </div>

            <div className="detail-section">
              <h3 className="detail-section-title">裁决结果</h3>
              <div style={{
                background: 'var(--bg-secondary)',
                padding: '16px',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.8'
              }}>
                {caseData.judgmentResult || '暂无裁决结果'}
              </div>
            </div>

            <div className="detail-section">
              <h3 className="detail-section-title">保全情况</h3>
              <div style={{
                background: 'var(--bg-secondary)',
                padding: '16px',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.8'
              }}>
                {caseData.preservationNote || '暂无保全信息'}
              </div>
            </div>

            <div className="detail-section">
              <h3 className="detail-section-title">履行情况说明</h3>
              <div style={{
                background: 'var(--bg-secondary)',
                padding: '16px',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.8'
              }}>
                {caseData.fulfillmentNote || '暂无履行说明'}
              </div>
            </div>

            {caseData.remarks && (
              <div className="detail-section">
                <h3 className="detail-section-title">备注</h3>
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: '16px',
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.8'
                }}>
                  {caseData.remarks}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h3 className="detail-section-title">📎 附件文件</h3>
              <div style={{ marginTop: '12px' }}>
                <FileUpload
                  category="party"
                  files={caseData.files?.party || []}
                  onFilesChange={handleFilesChange}
                />
                <FileUpload
                  category="court"
                  files={caseData.files?.court || []}
                  onFilesChange={handleFilesChange}
                />
                <FileUpload
                  category="opponent"
                  files={caseData.files?.opponent || []}
                  onFilesChange={handleFilesChange}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'timeline' && (
          <div className="detail-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="detail-section-title" style={{ margin: 0 }}>案件时间线</h3>
              <button className="btn btn-primary" onClick={onAddTimeline}>+ 添加事件</button>
            </div>
            <div className="timeline">
              {caseData.timeline?.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', padding: '20px' }}>暂无时间线记录</div>
              ) : (
                caseData.timeline?.sort((a, b) => new Date(b.date) - new Date(a.date)).map((item, index) => {
                  // 找到原始索引
                  const originalIndex = caseData.timeline.findIndex(t => t.date === item.date && t.event === item.event)
                  return (
                    <div key={index} className="timeline-item" style={{ position: 'relative' }}>
                      <div className="timeline-date">
                        {item.isAllDay ? item.date : formatFullDate(item.date)}
                        {item.isAllDay && <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--accent-color)' }}>（全天）</span>}
                      </div>
                      <div className="timeline-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <strong>{item.event}</strong>
                          <button
                            onClick={() => handleDeleteTimelineItem(originalIndex)}
                            style={{
                              padding: '2px 6px',
                              fontSize: '11px',
                              background: '#dc3545',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              opacity: 0.7,
                              transition: 'opacity 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '1'}
                            onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                          >
                            删除
                          </button>
                        </div>
                        {item.note && <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{item.note}</div>}
                        {!item.isAllDay && item.endTime && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            结束时间：{formatFullDate(item.endTime)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button className="btn btn-danger" onClick={onDelete}>删除案件</button>
        <button className="btn" onClick={onEdit}>编辑</button>
      </div>
    </div>
  )
}
