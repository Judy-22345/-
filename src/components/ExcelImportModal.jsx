import React, { useState } from 'react'
import * as XLSX from 'xlsx'
import { caseStatuses, caseTypes, preservationTypes, fulfillmentStatuses } from '../data/constants'

// Excel 列名映射 - 支持更多列名变体
const columnMapping = {
  caseNumber: ['案号', '案件编号', '编号', '案件号', '案号编号'],
  caseCause: ['案由', '纠纷类型', '纠纷事由', '案由类型'],
  court: ['管辖法院', '法院', '仲裁机构', '受理机构', '审理法院', '法院/仲裁机构', '管辖法院/仲裁机构'],
  caseType: ['案件类型', '类型', '案件分类', '分类', '纠纷类型'],
  // 状态列优先从"诉讼/仲裁进展"等列获取
  status: ['诉讼/仲裁进展', '案件状态', '状态', '进展状态', '当前状态', '诉讼状态', '进展', '诉讼进展'],
  filingDate: ['立案/收案时间', '立案日期', '起诉日期', ' filing 日期', '立案时间', '收案日期'],
  acceptanceDate: ['立案/收案时间', '收案日期', '受理日期', '立案时间', '受理时间'],
  trialDate: ['开庭时间', '开庭日期', '审理日期', '庭审时间'],
  plaintiff: ['原告', '申请人', '原告/申请人', '申请方', '起诉方'],
  defendant: ['被告', '被申请人', '被告/被申请人', '被申请方', '被诉方'],
  agent: ['代理人', '代理律师', '承办律师', '律师', '承办人'],
  disputeAmount: ['涉诉金额', '争议金额', '标的金额', '金额', '标的', '涉案金额', '涉诉金额（元）'],
  supportedAmount: ['支持金额', '获支持金额', '裁决金额', '判决金额', '支持数额', '裁决结果（含支持金额，元）'],
  progress: ['诉讼/仲裁进展', '进展', '诉讼进展', '案件进展', '目前进展', '当前进展', '进展情况'],
  judgmentResult: ['裁决结果', '判决结果', '裁判结果', '判决内容', '裁决内容', '裁决结果（含支持金额，元）'],
  fulfillmentStatus: ['履行状态', '执行状态', '履行情况'],
  fulfillmentNote: ['履行说明', '履行情况', '执行情况', '履行备注', '请注明目前案件的诉讼进展、判决/调解内容及履行情况'],
  judgeName: ['法官', '仲裁员', '审判长', '承办法官', '主审法官'],
  judgePhone: ['法官联系方式', '法官电话', '联系电话', '法官电话/联系方式', '法官/仲裁员联系方式'],
  preservationType: ['保全类型', '财产保全类型'],
  preservationNote: ['保全情况', '保全说明', '保全措施', '保全详情'],
  costAmount: ['成本费用', '诉讼费', '案件费用', '费用', '成本'],
  costNote: ['费用说明', '成本说明', '诉讼费说明', '费用明细'],
  remarks: ['备注', '其他说明', '其他', '附注', '说明']
}

// 状态值映射 - 支持更多变体
const statusMapping = {
  '待立案': 'pending',
  '已受理': 'accepted',
  '举证期': 'evidence',
  '审理中': 'trial',
  '待判决': 'awaiting_judgment',
  '已判决': 'judged',
  '调解中': 'mediation',
  '已调解': 'mediated',
  '上诉中': 'appeal',
  '执行中': 'enforcement',
  '已结案': 'completed',
  '已终止': 'terminated',
  // 变体
  ' pending': 'pending',
  'accepted': 'accepted',
  'trial': 'trial',
  'judged': 'judged',
  'completed': 'completed',
  // 从裁决结果列提取状态
  '待判决': 'awaiting_judgment',
  '判决': 'judged',
  '调解': 'mediated',
  '执行': 'enforcement'
}

// 案件类型映射 - 支持更多变体和模糊匹配
const typeMapping = {
  '民事诉讼': 'civil',
  '刑事诉讼': 'criminal',
  '行政诉讼': 'administrative',
  '仲裁': 'arbitration',
  '劳动仲裁': 'labor',
  '知识产权': 'intellectual',
  '合同纠纷': 'contract',
  '公司纠纷': 'corporate',
  '其他': 'other',
  // 变体
  '民事': 'civil',
  '刑事': 'criminal',
  '行政': 'administrative',
  '劳动': 'labor',
  '合同': 'contract',
  '公司': 'corporate',
  '专利': 'intellectual',
  '商标': 'intellectual',
  '著作权': 'intellectual',
  '借款': 'contract',
  '股权': 'corporate',
  // 从案由自动推断
  '不当得利': 'civil',
  '侵权': 'civil',
  '劳动争议': 'labor',
  '买卖': 'contract',
  '借款': 'contract',
  '合伙': 'corporate',
  '专利': 'intellectual',
  '商标': 'intellectual'
}

// 保全类型映射
const preservationMapping = {
  '无': 'none',
  '财产保全': 'property',
  '证据保全': 'evidence',
  '行为保全': 'conduct',
  'none': 'none',
  'property': 'property',
  'evidence': 'evidence',
  'conduct': 'conduct'
}

// 履行状态映射
const fulfillmentMapping = {
  '未履行期限': 'not_due',
  '部分履行': 'partial',
  '全部履行': 'completed',
  '履行失败': 'failed',
  '强制执行中': 'enforcement',
  'not_due': 'not_due',
  'partial': 'partial',
  'completed': 'completed',
  'failed': 'failed',
  'enforcement': 'enforcement'
}

// 智能匹配函数 - 支持模糊匹配
function smartMatch(value, mapping) {
  if (!value) return null
  const strValue = String(value).trim()

  // 1. 精确匹配
  if (mapping[strValue]) {
    return mapping[strValue]
  }

  // 2. 忽略大小写匹配
  const lowerValue = strValue.toLowerCase()
  for (const [key, val] of Object.entries(mapping)) {
    if (key.toLowerCase() === lowerValue) {
      return val
    }
  }

  // 3. 包含匹配（检查 value 是否包含 mapping 中的某个 key）
  for (const [key, val] of Object.entries(mapping)) {
    if (strValue.includes(key) || key.includes(strValue)) {
      return val
    }
  }

  // 4. 部分匹配 - 检查 value 中是否包含 key 的部分
  for (const [key, val] of Object.entries(mapping)) {
    if (key.length >= 2 && strValue.includes(key)) {
      return val
    }
  }

  return null
}

export default function ExcelImportModal({ onImport, onCancel }) {
  const [parsedData, setParsedData] = useState([])
  const [selectedRows, setSelectedRows] = useState({})
  const [step, setStep] = useState(1) // 1: 上传，2: 选择，3: 完成
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null) // 调试信息
  const [rawData, setRawData] = useState([]) // 原始数据

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    // 验证文件类型
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('请上传有效的 Excel 文件（.xlsx 或 .xls）')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)

        if (jsonData.length === 0) {
          setError('Excel 文件为空或格式不正确')
          return
        }

        // 保存原始数据和列名用于调试
        const firstRow = jsonData[0]
        const columnNames = Object.keys(firstRow)
        setDebugInfo({
          columnNames,
          firstRow,
          totalRows: jsonData.length
        })
        setRawData(jsonData.slice(0, 3)) // 保存前 3 行原始数据用于调试

        // 解析数据
        const cases = jsonData.map((row, index) => parseRow(row, index))
        setParsedData(cases)

        // 默认全选
        const allSelected = {}
        cases.forEach(c => {
          allSelected[c.tempId] = true
        })
        setSelectedRows(allSelected)

        setStep(2)
        setError('')
      } catch (err) {
        console.error(err)
        setError('读取 Excel 文件失败：' + err.message)
      }
    }
    reader.onerror = () => {
      setError('读取文件失败')
    }
    reader.readAsArrayBuffer(file)
  }

  function parseRow(row, index) {
    // 动态检测列名 - 遍历所有可能的列名变体
    const findValueByKeys = (possibleKeys) => {
      for (const key of possibleKeys) {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
          return row[key]
        }
      }
      // 如果上面的精确匹配没找到，尝试模糊匹配 row 中的实际列名
      const rowKeys = Object.keys(row)
      for (const rowKey of rowKeys) {
        for (const possibleKey of possibleKeys) {
          // 去除空格和特殊字符后比较
          const cleanRowKey = rowKey.trim().replace(/\s+/g, '')
          const cleanPossibleKey = possibleKey.trim().replace(/\s+/g, '')
          if (cleanRowKey === cleanPossibleKey && row[rowKey] !== undefined && row[rowKey] !== null && row[rowKey] !== '') {
            return row[rowKey]
          }
        }
      }
      return ''
    }

    // 查找原始值
    const rawCaseTypeValue = findValueByKeys(columnMapping.caseType)
    const rawStatusValue = findValueByKeys(columnMapping.status)
    const rawPreservationValue = findValueByKeys(columnMapping.preservationType)
    const rawFulfillmentValue = findValueByKeys(columnMapping.fulfillmentStatus)
    const rawDisputeAmount = findValueByKeys(columnMapping.disputeAmount)
    const rawSupportedAmount = findValueByKeys(columnMapping.supportedAmount)
    const rawCostAmount = findValueByKeys(columnMapping.costAmount)
    const rawCaseCauseValue = findValueByKeys(columnMapping.caseCause)

    // 特殊处理：如果类型列的值是"被告"、"原告"等，说明这是当事人类型，不是案件类型
    const isPartyType = ['被告', '原告', '申请人', '被申请人', '第三人'].includes(String(rawCaseTypeValue).trim())
    let finalCaseType = 'civil' // 默认民事诉讼
    if (!isPartyType && rawCaseTypeValue) {
      // 如果不是当事人类型，尝试映射
      const matchedType = smartMatch(rawCaseTypeValue, typeMapping)
      if (matchedType) finalCaseType = matchedType
    }
    // 如果没有案件类型，尝试从案由推断
    if (isPartyType || !rawCaseTypeValue) {
      const inferredType = smartMatch(rawCaseCauseValue, typeMapping)
      if (inferredType) finalCaseType = inferredType
    }

    // 使用智能匹配转换状态值
    let finalStatus = 'pending' // 默认待立案
    if (rawStatusValue) {
      const matchedStatus = smartMatch(rawStatusValue, statusMapping)
      if (matchedStatus) {
        finalStatus = matchedStatus
      } else {
        // 如果智能匹配失败，检查是否包含状态关键词
        const statusStr = String(rawStatusValue).trim()
        if (statusStr.includes('待判决')) finalStatus = 'awaiting_judgment'
        else if (statusStr.includes('已判决')) finalStatus = 'judged'
        else if (statusStr.includes('审理中')) finalStatus = 'trial'
        else if (statusStr.includes('已受理')) finalStatus = 'accepted'
        else if (statusStr.includes('待立案')) finalStatus = 'pending'
        else if (statusStr.includes('执行')) finalStatus = 'enforcement'
        else if (statusStr.includes('调解')) finalStatus = 'mediated'
        else finalStatus = statusStr
      }
    }

    const matchedPreservation = smartMatch(rawPreservationValue, preservationMapping)
    const matchedFulfillment = smartMatch(rawFulfillmentValue, fulfillmentMapping)

    // 处理日期 - 支持多种格式
    const formatDate = (date) => {
      if (!date || date === '' || date === null) return ''
      if (date instanceof Date) {
        return date.toISOString().split('T')[0]
      }
      // 处理 Excel 日期数字
      if (typeof date === 'number') {
        const d = XLSX.SSF.parse_date_code(date)
        return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
      }
      // 处理字符串日期
      const dateStr = String(date).trim()

      // 格式：2025.12.8 或 26.1.26
      if (dateStr.includes('.')) {
        const parts = dateStr.split('.')
        if (parts.length >= 3) {
          let year = parts[0]
          let month = parts[1]
          let day = parts[2]
          // 如果年份是两位数，转换为四位数
          if (year.length === 2) {
            year = year >= '50' ? '19' + year : '20' + year
          }
          // 提取时间前的日期部分（处理 26.1.26 14:25 这种情况）
          day = day.split(' ')[0]
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        }
      }
      // 格式：2025/12/8
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          return `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`
        }
      }
      // 格式：2025-12-08
      if (dateStr.includes('-')) {
        return dateStr.split(' ')[0]
      }
      return dateStr
    }

    return {
      tempId: `import_${index}_${Date.now()}`,
      caseNumber: findValueByKeys(columnMapping.caseNumber),
      caseCause: rawCaseCauseValue,
      court: findValueByKeys(columnMapping.court),
      caseType: finalCaseType,
      status: finalStatus,
      filingDate: formatDate(findValueByKeys(columnMapping.filingDate)),
      acceptanceDate: formatDate(findValueByKeys(columnMapping.acceptanceDate)),
      trialDate: formatDate(findValueByKeys(columnMapping.trialDate)),
      plaintiff: findValueByKeys(columnMapping.plaintiff),
      defendant: findValueByKeys(columnMapping.defendant),
      agent: findValueByKeys(columnMapping.agent),
      disputeAmount: parseFloat(rawDisputeAmount) || 0,
      supportedAmount: parseFloat(rawSupportedAmount) || 0,
      progress: findValueByKeys(columnMapping.progress),
      judgmentResult: findValueByKeys(columnMapping.judgmentResult),
      fulfillmentStatus: matchedFulfillment || (rawFulfillmentValue ? String(rawFulfillmentValue).trim() : 'not_due'),
      fulfillmentNote: findValueByKeys(columnMapping.fulfillmentNote),
      judgeName: findValueByKeys(columnMapping.judgeName),
      judgePhone: findValueByKeys(columnMapping.judgePhone),
      preservationType: matchedPreservation || (rawPreservationValue ? String(rawPreservationValue).trim() : 'none'),
      preservationNote: findValueByKeys(columnMapping.preservationNote),
      costAmount: parseFloat(rawCostAmount) || 0,
      costNote: findValueByKeys(columnMapping.costNote),
      remarks: findValueByKeys(columnMapping.remarks),
      timeline: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  function toggleRow(tempId) {
    setSelectedRows(prev => ({
      ...prev,
      [tempId]: !prev[tempId]
    }))
  }

  function toggleAll() {
    const allSelected = Object.values(selectedRows).every(v => v)
    const newSelected = {}
    parsedData.forEach(c => {
      newSelected[c.tempId] = !allSelected
    })
    setSelectedRows(newSelected)
  }

  function handleImport() {
    const toImport = parsedData.filter(c => selectedRows[c.tempId])
    if (toImport.length === 0) {
      setError('请至少选择一个案件进行导入')
      return
    }

    setImporting(true)

    // 生成最终案件数据（移除 tempId，添加正式 ID）
    const finalCases = toImport.map(c => {
      const { tempId, ...rest } = c
      return {
        ...rest,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }
    })

    setTimeout(() => {
      onImport(finalCases)
      setStep(3)
      setImporting(false)
    }, 500)
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

  function getCaseTypeLabel(type) {
    // 如果 type 是内部值（如 'civil'），找到对应的中文标签
    const typeInfo = caseTypes.find(t => t.value === type)
    if (typeInfo) return typeInfo.label
    // 如果没有找到，返回原始值
    return type || '-'
  }

  function formatCurrency(amount) {
    if (!amount || amount === 0) return '-'
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const selectedCount = Object.values(selectedRows).filter(v => v).length

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal"
        style={{ maxWidth: step === 2 ? '1200px' : '600px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>📥 Excel 导入案件</h2>
          <button className="modal-close" onClick={onCancel}>&times;</button>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
              <h3 style={{ marginBottom: '12px' }}>上传 Excel 文件</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                支持 .xlsx 或 .xls 格式，将自动识别案件信息
              </p>

              <label className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '16px', cursor: 'pointer' }}>
                选择文件
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {error && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#f8d7da', borderRadius: '6px', color: '#721c24' }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ marginTop: '32px', textAlign: 'left', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>📋 Excel 列名参考：</h4>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div>案号、案由、案件类型</div>
                  <div>管辖法院、原告、被告</div>
                  <div>代理人、法官、联系电话</div>
                  <div>立案日期、开庭时间</div>
                  <div>涉诉金额、支持金额</div>
                  <div>案件状态、保全类型</div>
                  <div>诉讼进展、裁决结果</div>
                  <div>履行状态、履行说明</div>
                  <div>成本费用、备注</div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    共解析 {parsedData.length} 条数据，已选择 <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{selectedCount}</span> 条
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn" onClick={toggleAll}>
                    {Object.values(selectedRows).every(v => v) ? '取消全选' : '全选'}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleImport}
                    disabled={selectedCount === 0 || importing}
                  >
                    {importing ? '导入中...' : `导入选中的 ${selectedCount} 条`}
                  </button>
                </div>
              </div>

              <div className="table-container" style={{ maxHeight: '500px', overflow: 'auto' }}>
                <table className="table">
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>
                    <tr>
                      <th style={{ width: '50px' }}>
                        <input
                          type="checkbox"
                          checked={Object.values(selectedRows).every(v => v)}
                          onChange={toggleAll}
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                      <th>案号</th>
                      <th>案由</th>
                      <th>类型</th>
                      <th>原告/申请人</th>
                      <th>被告/被申请人</th>
                      <th>管辖法院</th>
                      <th>立案日期</th>
                      <th>涉诉金额</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((caseItem) => (
                      <tr
                        key={caseItem.tempId}
                        onClick={() => toggleRow(caseItem.tempId)}
                        style={{
                          background: selectedRows[caseItem.tempId] ? 'rgba(46, 170, 220, 0.08)' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={!!selectedRows[caseItem.tempId]}
                            onChange={() => toggleRow(caseItem.tempId)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ fontWeight: 500, color: '#2f80ed' }}>{caseItem.caseNumber || '-'}</td>
                        <td>{caseItem.caseCause || '-'}</td>
                        <td>{getCaseTypeLabel(caseItem.caseType)}</td>
                        <td>{caseItem.plaintiff || '-'}</td>
                        <td>{caseItem.defendant || '-'}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {caseItem.court || '-'}
                        </td>
                        <td>{caseItem.acceptanceDate || '-'}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(caseItem.disputeAmount)}</td>
                        <td>{getStatusBadge(caseItem.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {error && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#f8d7da', borderRadius: '6px', color: '#721c24' }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
              <h3 style={{ marginBottom: '12px' }}>导入成功！</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                案件已成功导入系统
              </p>
            </div>
          )}
        </div>

        {step === 2 && (
          <div className="modal-footer">
            <button className="btn" onClick={() => setStep(1)}>返回上传</button>
          </div>
        )}
        {step === 3 && (
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onCancel}>完成</button>
          </div>
        )}
      </div>
    </div>
  )
}
