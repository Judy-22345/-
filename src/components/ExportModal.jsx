import React, { useState, useMemo } from 'react'
import * as XLSX from 'xlsx'
import { caseStatuses, caseTypes, preservationTypes, fulfillmentStatuses } from '../data/constants'

export default function ExportModal({ cases, filteredCases, onCancel }) {
  const [exportMode, setExportMode] = useState('selected') // 'selected' 或 'filtered'
  const [selectedRows, setSelectedRows] = useState({})
  const [isExporting, setIsExporting] = useState(false)
  const [exportedCount, setExportedCount] = useState(0)

  // 初始化全选
  React.useEffect(() => {
    const allSelected = {}
    filteredCases.forEach(c => {
      allSelected[c.id] = true
    })
    setSelectedRows(allSelected)
  }, [filteredCases])

  // 获取选中的案件
  const selectedCases = useMemo(() => {
    if (exportMode === 'filtered') {
      return filteredCases
    }
    return filteredCases.filter(c => selectedRows[c.id])
  }, [exportMode, filteredCases, selectedRows])

  const selectedCount = Object.values(selectedRows).filter(v => v).length

  // 获取状态标签
  function getStatusLabel(status) {
    return caseStatuses.find(s => s.value === status)?.label || status
  }

  // 获取类型标签
  function getTypeLabel(type) {
    return caseTypes.find(t => t.value === type)?.label || type
  }

  // 获取保全类型标签
  function getPreservationLabel(type) {
    return preservationTypes.find(t => t.value === type)?.label || type
  }

  // 获取履行状态标签
  function getFulfillmentLabel(status) {
    return fulfillmentStatuses.find(s => s.value === status)?.label || status
  }

  // 格式化日期
  function formatDate(dateStr) {
    if (!dateStr) return ''
    return dateStr.split('T')[0]
  }

  // 格式化金额
  function formatCurrency(amount) {
    if (!amount || amount === 0) return 0
    return amount
  }

  // 导出为 Excel
  function handleExport() {
    if (selectedCases.length === 0) {
      alert('请至少选择一个案件进行导出')
      return
    }

    setIsExporting(true)

    // 准备导出数据
    const exportData = selectedCases.map(c => ({
      '案号': c.caseNumber,
      '案由': c.caseCause,
      '案件类型': getTypeLabel(c.caseType),
      '案件状态': getStatusLabel(c.status),
      '管辖法院/仲裁机构': c.court,
      '原告/申请人': c.plaintiff,
      '被告/被申请人': c.defendant,
      '代理人': c.agent || '',
      '法官/仲裁员': c.judgeName || '',
      '联系电话': c.judgePhone || '',
      '立案日期': formatDate(c.acceptanceDate),
      '开庭时间': formatDate(c.trialDate),
      '涉诉金额（元）': formatCurrency(c.disputeAmount),
      '获支持金额（元）': formatCurrency(c.supportedAmount),
      '成本费用（元）': formatCurrency(c.costAmount),
      '费用说明': c.costNote || '',
      '诉讼/仲裁进展': c.progress || '',
      '裁决结果（含支持金额，元）': c.judgmentResult || '',
      '保全类型': getPreservationLabel(c.preservationType),
      '保全情况': c.preservationNote || '',
      '履行状态': getFulfillmentLabel(c.fulfillmentStatus),
      '履行说明': c.fulfillmentNote || '',
      '备注': c.remarks || ''
    }))

    // 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()

    // 设置列宽
    const colWidths = [
      { wch: 22 }, // 案号
      { wch: 18 }, // 案由
      { wch: 12 }, // 案件类型
      { wch: 10 }, // 案件状态
      { wch: 25 }, // 法院
      { wch: 20 }, // 原告
      { wch: 20 }, // 被告
      { wch: 12 }, // 代理人
      { wch: 10 }, // 法官
      { wch: 15 }, // 电话
      { wch: 12 }, // 立案日期
      { wch: 12 }, // 开庭时间
      { wch: 15 }, // 涉诉金额
      { wch: 15 }, // 支持金额
      { wch: 12 }, // 成本费用
      { wch: 30 }, // 费用说明
      { wch: 40 }, // 诉讼进展
      { wch: 40 }, // 裁决结果
      { wch: 12 }, // 保全类型
      { wch: 40 }, // 保全情况
      { wch: 12 }, // 履行状态
      { wch: 40 }, // 履行说明
      { wch: 40 }  // 备注
    ]
    worksheet['!cols'] = colWidths

    // 设置表头样式（加粗）
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1'
      if (!worksheet[address]) continue
      worksheet[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E1E1E0' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, '案件列表')

    // 生成文件名
    const date = new Date().toISOString().split('T')[0]
    const fileName = `法务案件列表_${date}_${selectedCases.length}件.xlsx`

    // 下载文件
    XLSX.writeFile(workbook, fileName)

    setExportedCount(selectedCases.length)
    setIsExporting(false)
  }

  function toggleRow(caseId) {
    setSelectedRows(prev => ({
      ...prev,
      [caseId]: !prev[caseId]
    }))
  }

  function toggleAll() {
    const allSelected = Object.values(selectedRows).every(v => v)
    const newSelected = {}
    filteredCases.forEach(c => {
      newSelected[c.id] = !allSelected
    })
    setSelectedRows(newSelected)
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
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 500,
        background: color.bg,
        color: color.color,
        whiteSpace: 'nowrap'
      }}>
        {statusInfo?.label || status}
      </span>
    )
  }

  function formatCurrencyDisplay(amount) {
    if (!amount || amount === 0) return '-'
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal"
        style={{ maxWidth: '1000px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>📤 导出案件</h2>
          <button className="modal-close" onClick={onCancel}>&times;</button>
        </div>

        <div className="modal-body">
          {/* 导出模式选择 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px',
            padding: '12px 16px',
            background: 'var(--bg-secondary)',
            borderRadius: '8px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'selected'}
                onChange={() => setExportMode('selected')}
                style={{ cursor: 'pointer' }}
              />
              <span>手动选择案件</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                （已选 {selectedCount} 件）
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'filtered'}
                onChange={() => setExportMode('filtered')}
                style={{ cursor: 'pointer' }}
              />
              <span>导出筛选结果</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                （共 {filteredCases.length} 件）
              </span>
            </label>
          </div>

          {exportMode === 'selected' && (
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                已选择 <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{selectedCount}</span> 件案件
              </span>
              <button className="btn" onClick={toggleAll}>
                {Object.values(selectedRows).every(v => v) ? '取消全选' : '全选'}
              </button>
            </div>
          )}

          {/* 案件列表 */}
          <div className="table-container" style={{ maxHeight: '400px', overflow: 'auto' }}>
            <table className="table">
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>
                <tr>
                  {exportMode === 'selected' && (
                    <th style={{ width: '50px' }}>
                      <input
                        type="checkbox"
                        checked={Object.values(selectedRows).every(v => v)}
                        onChange={toggleAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                  )}
                  <th>案号</th>
                  <th>案由</th>
                  <th>类型</th>
                  <th>原告/申请人</th>
                  <th>被告/被申请人</th>
                  <th>涉诉金额</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="empty-state">
                        <div className="empty-state-icon">📁</div>
                        <div className="empty-state-title">暂无案件</div>
                        <div className="empty-state-desc">
                          {exportMode === 'filtered' ? '当前筛选条件没有匹配的案件' : '没有可导出的案件'}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((caseItem) => (
                    <tr
                      key={caseItem.id}
                      onClick={() => exportMode === 'selected' && toggleRow(caseItem.id)}
                      style={{
                        background: exportMode === 'selected' && selectedRows[caseItem.id]
                          ? 'rgba(46, 170, 220, 0.08)' : 'transparent',
                        cursor: exportMode === 'selected' ? 'pointer' : 'default'
                      }}
                    >
                      {exportMode === 'selected' && (
                        <td>
                          <input
                            type="checkbox"
                            checked={!!selectedRows[caseItem.id]}
                            onChange={() => toggleRow(caseItem.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                      )}
                      <td style={{ fontWeight: 500, color: '#2f80ed' }}>{caseItem.caseNumber}</td>
                      <td>{caseItem.caseCause}</td>
                      <td>{getTypeLabel(caseItem.caseType)}</td>
                      <td>{caseItem.plaintiff}</td>
                      <td>{caseItem.defendant}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrencyDisplay(caseItem.disputeAmount)}</td>
                      <td>{getStatusBadge(caseItem.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {exportMode === 'filtered' && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#e7f3ff',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#0c5460'
            }}>
              ℹ️ 当前模式将导出所有筛选后的案件，共 {filteredCases.length} 件
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onCancel}>取消</button>
          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={selectedCases.length === 0 || isExporting}
          >
            {isExporting ? '导出中...' : `导出 Excel (${selectedCases.length} 件)`}
          </button>
        </div>
      </div>
    </div>
  )
}
