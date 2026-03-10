import React, { useMemo } from 'react'

export default function ScheduleView({ cases }) {
  // 提取所有案件的开庭时间和立案日期作为日程
  const schedules = useMemo(() => {
    const events = []

    cases.forEach(c => {
      // 开庭时间
      if (c.trialDate) {
        events.push({
          id: `trial_${c.id}`,
          date: c.trialDate,
          type: 'trial',
          title: `开庭 - ${c.caseNumber}`,
          caseNumber: c.caseNumber,
          caseCause: c.caseCause,
          court: c.court,
          plaintiff: c.plaintiff,
          defendant: c.defendant
        })
      }

      // 立案日期
      if (c.acceptanceDate) {
        events.push({
          id: `filing_${c.id}`,
          date: c.acceptanceDate,
          type: 'filing',
          title: `立案 - ${c.caseNumber}`,
          caseNumber: c.caseNumber,
          caseCause: c.caseCause,
          court: c.court
        })
      }

      // 时间线事件
      if (c.timeline && c.timeline.length > 0) {
        c.timeline.forEach((item, index) => {
          events.push({
            id: `timeline_${c.id}_${index}`,
            date: item.date,
            type: 'timeline',
            title: `${item.event} - ${c.caseNumber}`,
            caseNumber: c.caseNumber,
            event: item.event,
            note: item.note
          })
        })
      }
    })

    // 按日期倒序排序（最近的日期在最上面）
    return events.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [cases])

  function getTypeIcon(type) {
    switch (type) {
      case 'trial': return '⚖️'
      case 'filing': return '📋'
      case 'timeline': return '📝'
      default: return '📅'
    }
  }

  function getTypeColor(type) {
    switch (type) {
      case 'trial': return { bg: '#fff3cd', color: '#856404' }
      case 'filing': return { bg: '#d1ecf1', color: '#0c5460' }
      case 'timeline': return { bg: '#d4edda', color: '#155724' }
      default: return { bg: '#efefef', color: '#37352f' }
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const isTomorrow = date.toDateString() === tomorrow.toDateString()

    if (isToday) return '今天'
    if (isTomorrow) return '明天'

    return dateStr
  }

  function formatTime(dateStr) {
    if (!dateStr) return ''
    // 检查是否有时间部分
    if (dateStr.includes('T')) {
      const time = dateStr.split('T')[1]
      if (time && time.includes(':')) {
        const [hours, minutes] = time.split(':')
        return `${hours}:${minutes}`
      }
    }
    return ''
  }

  const groupedSchedules = useMemo(() => {
    const groups = {}
    schedules.forEach(event => {
      const key = event.date
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(event)
    })
    return groups
  }, [schedules])

  return (
    <div>
      {schedules.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">暂无日程</div>
          <div className="empty-state-desc">案件中的开庭时间和重要事件将在此显示</div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            共 {schedules.length} 条日程安排
          </div>

          {Object.entries(groupedSchedules).map(([date, events]) => (
            <div key={date} style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{formatDate(date)}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>({date})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {events.map(event => {
                  const color = getTypeColor(event.type)
                  return (
                    <div
                      key={event.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 16px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    >
                      <span style={{ fontSize: '20px' }}>{getTypeIcon(event.type)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            background: color.bg,
                            color: color.color
                          }}>
                            {event.type === 'trial' && '开庭'}
                            {event.type === 'filing' && '立案'}
                            {event.type === 'timeline' && '事件'}
                          </span>
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                            {event.title}
                          </span>
                          {formatTime(event.date) && (
                            <span style={{
                              fontSize: '11px',
                              color: 'var(--accent-color)',
                              fontWeight: 600,
                              marginLeft: '8px'
                            }}>
                              🕐 {formatTime(event.date)}
                            </span>
                          )}
                        </div>
                        {event.caseCause && (
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                            案由：{event.caseCause}
                          </div>
                        )}
                        {event.court && (
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            法院：{event.court}
                          </div>
                        )}
                        {event.plaintiff && event.defendant && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {event.plaintiff} vs {event.defendant}
                          </div>
                        )}
                        {event.note && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {event.note}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
