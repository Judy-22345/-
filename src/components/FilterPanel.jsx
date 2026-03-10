import React from 'react'
import { caseStatuses, caseTypes } from '../data/constants'

export default function FilterPanel({ filters, onFilterChange, onClearFilters, caseData }) {
  // 从案件数据中提取唯一的选项
  const uniqueCaseNumbers = [...new Set(caseData.map(c => c.caseNumber))].sort()
  const uniqueCauses = [...new Set(caseData.map(c => c.caseCause))].sort()
  const uniqueCourts = [...new Set(caseData.map(c => c.court))].sort()
  const uniquePlaintiffs = [...new Set(caseData.map(c => c.plaintiff))].sort()
  const uniqueDefendants = [...new Set(caseData.map(c => c.defendant))].sort()
  const uniqueAgents = [...new Set(caseData.map(c => c.agent).filter(Boolean))].sort()

  return (
    <div style={{
      padding: '16px 24px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px'
      }}>
        {/* 案号 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            案号
          </label>
          <select
            className="input"
            value={filters.caseNumber}
            onChange={(e) => onFilterChange('caseNumber', e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px' }}
          >
            <option value="all">全部案号</option>
            {uniqueCaseNumbers.map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        {/* 案由 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            案由
          </label>
          <select
            className="input"
            value={filters.cause}
            onChange={(e) => onFilterChange('cause', e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px' }}
          >
            <option value="all">全部案由</option>
            {uniqueCauses.map(cause => (
              <option key={cause} value={cause}>{cause}</option>
            ))}
          </select>
        </div>

        {/* 案件类型 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            类型
          </label>
          <select
            className="input"
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px' }}
          >
            <option value="all">全部类型</option>
            {caseTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
            {/* 添加 civil 选项以兼容旧数据 */}
            <option value="civil" style={{ display: 'none' }}>其他</option>
          </select>
        </div>

        {/* 原告/申请人 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            原告/申请人
          </label>
          <select
            className="input"
            value={filters.plaintiff}
            onChange={(e) => onFilterChange('plaintiff', e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px' }}
          >
            <option value="all">全部原告</option>
            {uniquePlaintiffs.map(plaintiff => (
              <option key={plaintiff} value={plaintiff}>{plaintiff}</option>
            ))}
          </select>
        </div>

        {/* 被告/被申请人 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            被告/被申请人
          </label>
          <select
            className="input"
            value={filters.defendant}
            onChange={(e) => onFilterChange('defendant', e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px' }}
          >
            <option value="all">全部被告</option>
            {uniqueDefendants.map(defendant => (
              <option key={defendant} value={defendant}>{defendant}</option>
            ))}
          </select>
        </div>

        {/* 代理人 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            代理人
          </label>
          <select
            className="input"
            value={filters.agent}
            onChange={(e) => onFilterChange('agent', e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px' }}
          >
            <option value="all">全部代理人</option>
            {uniqueAgents.map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
        </div>

        {/* 管辖法院 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            管辖法院/仲裁机构
          </label>
          <select
            className="input"
            value={filters.court}
            onChange={(e) => onFilterChange('court', e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px' }}
          >
            <option value="all">全部法院</option>
            {uniqueCourts.map(court => (
              <option key={court} value={court}>{court}</option>
            ))}
          </select>
        </div>

        {/* 立案日期 - 开始 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            立案日期（起）
          </label>
          <input
            type="date"
            className="input"
            value={filters.acceptanceDateStart || ''}
            onChange={(e) => onFilterChange('acceptanceDateStart', e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px' }}
          />
        </div>

        {/* 立案日期 - 结束 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            立案日期（止）
          </label>
          <input
            type="date"
            className="input"
            value={filters.acceptanceDateEnd || ''}
            onChange={(e) => onFilterChange('acceptanceDateEnd', e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px' }}
          />
        </div>

        {/* 开庭时间 - 开始 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            开庭时间（起）
          </label>
          <input
            type="date"
            className="input"
            value={filters.trialDateStart || ''}
            onChange={(e) => onFilterChange('trialDateStart', e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px' }}
          />
        </div>

        {/* 开庭时间 - 结束 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            开庭时间（止）
          </label>
          <input
            type="date"
            className="input"
            value={filters.trialDateEnd || ''}
            onChange={(e) => onFilterChange('trialDateEnd', e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px' }}
          />
        </div>

        {/* 涉诉金额 - 最小值 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            涉诉金额 ≥
          </label>
          <input
            type="number"
            className="input"
            value={filters.amountMin || ''}
            onChange={(e) => onFilterChange('amountMin', e.target.value)}
            placeholder="0"
            style={{ fontSize: '13px', padding: '6px 10px' }}
          />
        </div>

        {/* 涉诉金额 - 最大值 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            涉诉金额 ≤
          </label>
          <input
            type="number"
            className="input"
            value={filters.amountMax || ''}
            onChange={(e) => onFilterChange('amountMax', e.target.value)}
            placeholder="无上限"
            style={{ fontSize: '13px', padding: '6px 10px' }}
          />
        </div>

        {/* 案件状态 */}
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            状态
          </label>
          <select
            className="input"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px' }}
          >
            <option value="all">全部状态</option>
            {caseStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
