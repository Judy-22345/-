import React, { useState, useMemo } from 'react'
import CaseList from './components/CaseList'
import CaseForm from './components/CaseForm'
import CaseDetail from './components/CaseDetail'
import TimelineForm from './components/TimelineForm'
import FilterPanel from './components/FilterPanel'
import ExcelImportModal from './components/ExcelImportModal'
import ExportModal from './components/ExportModal'
import PaymentView from './components/PaymentView'
import CostStatistics from './components/CostStatistics'
import QuickFileModal from './components/QuickFileModal'
import ScheduleCalendar from './components/ScheduleCalendar'
import { initialCases } from './data/initialData'
import { caseStatuses } from './data/constants'

function App() {
  const [cases, setCases] = useState(() => {
    const saved = localStorage.getItem('legalCases')
    return saved ? JSON.parse(saved) : initialCases
  })

  const [selectedCase, setSelectedCase] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCase, setEditingCase] = useState(null)
  const [isTimelineFormOpen, setIsTimelineFormOpen] = useState(false)
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeView, setActiveView] = useState('all-cases') // 'all-cases', 'schedule', 'payment', 'cost'
  const [showFilters, setShowFilters] = useState(false) // 控制筛选面板展开/收起
  const [isFileModalOpen, setIsFileModalOpen] = useState(false) // 文件管理弹窗
  const [fileModalCase, setFileModalCase] = useState(null) // 当前管理的案件

  // 筛选状态
  const [filters, setFilters] = useState({
    caseNumber: 'all',
    cause: 'all',
    type: 'all',
    plaintiff: 'all',
    defendant: 'all',
    agent: 'all',
    court: 'all',
    acceptanceDateStart: '',
    acceptanceDateEnd: '',
    trialDateStart: '',
    trialDateEnd: '',
    amountMin: '',
    amountMax: '',
    status: 'all'
  })

  React.useEffect(() => {
    localStorage.setItem('legalCases', JSON.stringify(cases))
  }, [cases])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      caseNumber: 'all',
      cause: 'all',
      type: 'all',
      plaintiff: 'all',
      defendant: 'all',
      agent: 'all',
      court: 'all',
      acceptanceDateStart: '',
      acceptanceDateEnd: '',
      trialDateStart: '',
      trialDateEnd: '',
      amountMin: '',
      amountMax: '',
      status: 'all'
    })
  }

  // 检查是否有激活的筛选条件
  const hasActiveFilters = Object.values(filters).some(v => v !== 'all' && v !== '' && v !== null)
  const activeFilterCount = Object.values(filters).filter(v => v !== 'all' && v !== '' && v !== null).length

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // 搜索匹配
      const matchSearch = !searchTerm ||
        c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.caseCause.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.plaintiff.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.defendant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.court.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.agent && c.agent.toLowerCase().includes(searchTerm.toLowerCase()))

      // 筛选匹配
      const matchCaseNumber = filters.caseNumber === 'all' || c.caseNumber === filters.caseNumber
      // 处理 civil 和 other 类型的兼容
      const matchType = filters.type === 'all' ||
        c.caseType === filters.type ||
        (filters.type === 'other' && c.caseType === 'civil') ||
        (filters.type === 'civil' && c.caseType === 'other')
      const matchStatus = filters.status === 'all' || c.status === filters.status
      const matchCause = filters.cause === 'all' || c.caseCause === filters.cause
      const matchCourt = filters.court === 'all' || c.court === filters.court
      const matchPlaintiff = filters.plaintiff === 'all' || c.plaintiff === filters.plaintiff
      const matchDefendant = filters.defendant === 'all' || c.defendant === filters.defendant
      const matchAgent = filters.agent === 'all' || !c.agent || c.agent === filters.agent

      // 日期筛选
      const matchAcceptanceDateStart = !filters.acceptanceDateStart || (c.acceptanceDate && c.acceptanceDate >= filters.acceptanceDateStart)
      const matchAcceptanceDateEnd = !filters.acceptanceDateEnd || (c.acceptanceDate && c.acceptanceDate <= filters.acceptanceDateEnd)
      const matchTrialDateStart = !filters.trialDateStart || (c.trialDate && c.trialDate >= filters.trialDateStart)
      const matchTrialDateEnd = !filters.trialDateEnd || (c.trialDate && c.trialDate <= filters.trialDateEnd)

      // 金额筛选
      const matchAmountMin = !filters.amountMin || (c.disputeAmount && c.disputeAmount >= parseFloat(filters.amountMin))
      const matchAmountMax = !filters.amountMax || (c.disputeAmount && c.disputeAmount <= parseFloat(filters.amountMax))

      return matchSearch &&
        matchCaseNumber &&
        matchType &&
        matchStatus &&
        matchCause &&
        matchCourt &&
        matchPlaintiff &&
        matchDefendant &&
        matchAgent &&
        matchAcceptanceDateStart &&
        matchAcceptanceDateEnd &&
        matchTrialDateStart &&
        matchTrialDateEnd &&
        matchAmountMin &&
        matchAmountMax
    })
  }, [cases, searchTerm, filters])

  const stats = useMemo(() => {
    // 根据筛选结果统计
    const data = filteredCases.length > 0 ? filteredCases : cases
    const total = data.length
    const totalAmount = data.reduce((sum, c) => sum + (c.disputeAmount || 0), 0)
    const supportedAmount = data.reduce((sum, c) => sum + (c.supportedAmount || 0), 0)
    const totalCost = data.reduce((sum, c) => sum + (c.costAmount || 0), 0)

    const statusCount = {}
    caseStatuses.forEach(s => {
      statusCount[s.value] = data.filter(c => c.status === s.value).length
    })

    return { total, totalAmount, supportedAmount, totalCost, statusCount }
  }, [cases, filteredCases])

  function handleSaveCase(caseData) {
    if (editingCase) {
      setCases(prev => prev.map(c => c.id === caseData.id ? caseData : c))
    } else {
      setCases(prev => [...prev, caseData])
    }
    setIsFormOpen(false)
    setEditingCase(null)
  }

  function handleUpdateFiles(caseId, files) {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updatedCase = {
          ...c,
          files,
          updatedAt: new Date().toISOString()
        }
        setSelectedCase(updatedCase)
        if (fileModalCase && fileModalCase.id === caseId) {
          setFileModalCase(updatedCase)
        }
        return updatedCase
      }
      return c
    }))
  }

  function handleManageFiles(caseItem) {
    setFileModalCase(caseItem)
    setIsFileModalOpen(true)
  }

  function handleDeleteCase(caseId) {
    if (confirm('确定要删除这个案件吗？此操作不可恢复。')) {
      setCases(prev => prev.filter(c => c.id !== caseId))
      setSelectedCase(null)
    }
  }

  function handleAddTimeline(caseData) {
    setIsTimelineFormOpen(true)
  }

  function handleAddTimelineFromCalendar(caseItem, timelineData) {
    const updatedCase = {
      ...caseItem,
      timeline: [...(caseItem.timeline || []), timelineData],
      updatedAt: new Date().toISOString()
    }
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c))
  }

  function handleDeleteTimeline(caseId, timelineIndex) {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updatedCase = {
          ...c,
          timeline: c.timeline?.filter((_, index) => index !== timelineIndex) || [],
          updatedAt: new Date().toISOString()
        }
        if (selectedCase && selectedCase.id === caseId) {
          setSelectedCase(updatedCase)
        }
        return updatedCase
      }
      return c
    }))
  }

  function handleUpdateTimeline(caseId, timelineIndex, timelineData) {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updatedTimeline = [...(c.timeline || [])]
        updatedTimeline[timelineIndex] = timelineData
        const updatedCase = {
          ...c,
          timeline: updatedTimeline,
          updatedAt: new Date().toISOString()
        }
        if (selectedCase && selectedCase.id === caseId) {
          setSelectedCase(updatedCase)
        }
        return updatedCase
      }
      return c
    }))
  }

  function handleSaveTimeline(timelineData) {
    if (selectedCase) {
      const updatedCase = {
        ...selectedCase,
        timeline: [...(selectedCase.timeline || []), timelineData],
        updatedAt: new Date().toISOString()
      }
      setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c))
      setSelectedCase(updatedCase)
      setIsTimelineFormOpen(false)
    }
  }

  function handleExcelImport(casesData) {
    setCases(prev => [...prev, ...casesData])
    setIsExcelImportOpen(false)
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="layout">
      {/* 侧边栏 */}
      <aside className="sidebar">
        <div className="sidebar-title" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
          ⚖️ 法务案件管理
        </div>

        <div
          className={`sidebar-item ${activeView === 'all-cases' ? 'active' : ''}`}
          onClick={() => setActiveView('all-cases')}
        >
          <span className="sidebar-icon">📁</span>
          全部案件 ({cases.length})
        </div>

        <div
          className={`sidebar-item ${activeView === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveView('schedule')}
        >
          <span className="sidebar-icon">📅</span>
          日程中心
        </div>

        <div
          className={`sidebar-item ${activeView === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveView('payment')}
        >
          <span className="sidebar-icon">💰</span>
          回款登记
        </div>

        <div
          className={`sidebar-item ${activeView === 'cost' ? 'active' : ''}`}
          onClick={() => setActiveView('cost')}
        >
          <span className="sidebar-icon">📊</span>
          成本统计
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="main-content">
        {/* 顶部工具栏 */}
        <div className="toolbar">
          <div className="toolbar-left">
            <h1 className="toolbar-title">
              {activeView === 'all-cases' && '案件列表'}
              {activeView === 'schedule' && '日程中心'}
              {activeView === 'payment' && '回款登记'}
              {activeView === 'cost' && '成本统计'}
            </h1>
          </div>
          <div className="toolbar-right">
            {activeView === 'all-cases' && (
              <>
                <input
                  type="text"
                  className="search-input"
                  placeholder="搜索案号、案由、当事人、代理人..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn" onClick={() => setIsExportOpen(true)}>
                  📤 导出
                </button>
                <button className="btn" onClick={() => setIsExcelImportOpen(true)}>
                  📥 Excel 导入
                </button>
                <button className="btn btn-primary" onClick={() => { setEditingCase(null); setIsFormOpen(true) }}>
                  + 新建案件
                </button>
              </>
            )}
          </div>
        </div>

        {/* 筛选面板 - 仅在全部案件视图显示 */}
        {activeView === 'all-cases' && (
          <div>
            {/* 筛选控制栏 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 24px',
              background: 'var(--bg-secondary)',
              borderBottom: hasActiveFilters ? '1px solid var(--border-color)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => setShowFilters(!showFilters)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  🔍 筛选条件
                </span>
                {hasActiveFilters && (
                  <span style={{
                    padding: '2px 8px',
                    background: 'var(--accent-color)',
                    color: '#fff',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}>
                    {activeFilterCount} 个条件
                  </span>
                )}
                {showFilters ? '▲' : '▼'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {hasActiveFilters && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    筛选结果：{filteredCases.length} 件
                  </span>
                )}
                {hasActiveFilters && (
                  <button
                    className="btn"
                    onClick={(e) => { e.stopPropagation(); clearFilters() }}
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    ✕ 清除筛选
                  </button>
                )}
              </div>
            </div>

            {/* 展开的筛选面板 */}
            {showFilters && (
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                caseData={cases}
              />
            )}
          </div>
        )}

        {/* 内容区 */}
        <div className="content">
          {activeView === 'all-cases' && (
            <>
              {/* 统计卡片 */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-title">案件总数</div>
                  <div className="stat-card-value">{stats.total}</div>
                  <div className="stat-card-change" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {hasActiveFilters ? `筛选结果：${filteredCases.length} 件` : `共 ${cases.length} 件`}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">涉案总金额</div>
                  <div className="stat-card-value" style={{ fontSize: '18px' }}>{formatCurrency(stats.totalAmount)}</div>
                  {hasActiveFilters && (
                    <div className="stat-card-change" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      全部：{formatCurrency(cases.reduce((sum, c) => sum + (c.disputeAmount || 0), 0))}
                    </div>
                  )}
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">获支持金额</div>
                  <div className="stat-card-value" style={{ fontSize: '18px', color: 'var(--success-color)' }}>{formatCurrency(stats.supportedAmount)}</div>
                  {hasActiveFilters && (
                    <div className="stat-card-change" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      全部：{formatCurrency(cases.reduce((sum, c) => sum + (c.supportedAmount || 0), 0))}
                    </div>
                  )}
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">成本费用</div>
                  <div className="stat-card-value" style={{ fontSize: '18px' }}>{formatCurrency(stats.totalCost)}</div>
                  {hasActiveFilters && (
                    <div className="stat-card-change" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      全部：{formatCurrency(cases.reduce((sum, c) => sum + (c.costAmount || 0), 0))}
                    </div>
                  )}
                </div>
              </div>

              {/* 案件列表 */}
              <CaseList
                cases={filteredCases}
                onSelectCase={(c) => { setSelectedCase(c); setIsFormOpen(false) }}
                onManageFiles={handleManageFiles}
              />
            </>
          )}

          {activeView === 'schedule' && (
            <ScheduleCalendar
              cases={cases}
              onAddTimeline={handleAddTimelineFromCalendar}
              onDeleteTimeline={handleDeleteTimeline}
              onUpdateTimeline={handleUpdateTimeline}
            />
          )}

          {activeView === 'payment' && (
            <PaymentView cases={cases} />
          )}

          {activeView === 'cost' && (
            <CostStatistics cases={cases} />
          )}
        </div>
      </main>

      {/* 案件详情弹窗 */}
      {selectedCase && !isFormOpen && (
        <div className="modal-overlay" onClick={() => setSelectedCase(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CaseDetail
              caseData={selectedCase}
              onEdit={() => { setEditingCase(selectedCase); setIsFormOpen(true) }}
              onClose={() => setSelectedCase(null)}
              onDelete={() => handleDeleteCase(selectedCase.id)}
              onAddTimeline={() => handleAddTimeline(selectedCase)}
              onUpdateFiles={(files) => handleUpdateFiles(selectedCase.id, files)}
              onDeleteTimeline={(caseId, timelineIndex) => handleDeleteTimeline(caseId, timelineIndex)}
            />
          </div>
        </div>
      )}

      {/* 新建/编辑案件弹窗 */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => { setIsFormOpen(false); setEditingCase(null) }}>
          <div className="modal" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCase ? '编辑案件' : '新建案件'}</h2>
              <button className="modal-close" onClick={() => { setIsFormOpen(false); setEditingCase(null) }}>&times;</button>
            </div>
            <div className="modal-body">
              <CaseForm
                caseData={editingCase}
                onSave={handleSaveCase}
                onCancel={() => { setIsFormOpen(false); setEditingCase(null) }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 添加时间线事件弹窗 */}
      {isTimelineFormOpen && (
        <div className="modal-overlay" onClick={() => setIsTimelineFormOpen(false)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>添加时间线事件</h2>
              <button className="modal-close" onClick={() => setIsTimelineFormOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <TimelineForm
                onSave={handleSaveTimeline}
                onCancel={() => setIsTimelineFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Excel 导入弹窗 */}
      {isExcelImportOpen && (
        <div className="modal-overlay" onClick={() => setIsExcelImportOpen(false)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <ExcelImportModal
              onImport={handleExcelImport}
              onCancel={() => setIsExcelImportOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 导出弹窗 */}
      {isExportOpen && (
        <div className="modal-overlay" onClick={() => setIsExportOpen(false)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <ExportModal
              cases={cases}
              filteredCases={filteredCases}
              onCancel={() => setIsExportOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 快速文件管理弹窗 */}
      {isFileModalOpen && fileModalCase && (
        <div className="modal-overlay" onClick={() => setIsFileModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <QuickFileModal
              caseData={fileModalCase}
              onClose={() => setIsFileModalOpen(false)}
              onUpdateFiles={(files) => handleUpdateFiles(fileModalCase.id, files)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
