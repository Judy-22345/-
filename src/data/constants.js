export const caseTypes = [
  { value: 'arbitration', label: '仲裁' },
  { value: 'labor', label: '劳动仲裁' },
  { value: 'intellectual', label: '知识产权' },
  { value: 'contract', label: '合同纠纷' },
  { value: 'corporate', label: '公司纠纷' },
  { value: 'other', label: '其他' }
]

export const caseStatuses = [
  { value: 'pending', label: '待立案', color: 'default' },
  { value: 'accepted', label: '已受理', color: 'info' },
  { value: 'evidence', label: '举证期', color: 'warning' },
  { value: 'trial', label: '审理中', color: 'info' },
  { value: 'awaiting_judgment', label: '待判决', color: 'warning' },
  { value: 'judged', label: '已判决', color: 'success' },
  { value: 'mediation', label: '调解中', color: 'info' },
  { value: 'mediated', label: '已调解', color: 'success' },
  { value: 'appeal', label: '上诉中', color: 'warning' },
  { value: 'enforcement', label: '执行中', color: 'info' },
  { value: 'completed', label: '已结案', color: 'success' },
  { value: 'terminated', label: '已终止', color: 'danger' }
]

export const casePartyTypes = [
  { value: 'plaintiff', label: '原告/申请人' },
  { value: 'defendant', label: '被告/被申请人' },
  { value: 'third_party', label: '第三人' },
  { value: 'co_plaintiff', label: '共同原告' },
  { value: 'co_defendant', label: '共同被告' }
]

export const courtLevels = [
  { value: 'basic', label: '基层法院' },
  { value: 'intermediate', label: '中级法院' },
  { value: 'high', label: '高级法院' },
  { value: 'supreme', label: '最高法院' },
  { value: 'arbitration', label: '仲裁委员会' },
  { value: 'labor', label: '劳动仲裁委' }
]

export const preservationTypes = [
  { value: 'none', label: '无' },
  { value: 'property', label: '财产保全' },
  { value: 'evidence', label: '证据保全' },
  { value: 'conduct', label: '行为保全' }
]

export const fulfillmentStatuses = [
  { value: 'not_due', label: '未履行期限' },
  { value: 'partial', label: '部分履行' },
  { value: 'completed', label: '全部履行' },
  { value: 'failed', label: '履行失败' },
  { value: 'enforcement', label: '强制执行中' }
]

export function getStatusBadge(status) {
  const statusInfo = caseStatuses.find(s => s.value === status)
  return statusInfo ? statusInfo.label : status
}

export function getStatusColor(status) {
  const statusInfo = caseStatuses.find(s => s.value === status)
  return statusInfo ? statusInfo.color : 'default'
}
