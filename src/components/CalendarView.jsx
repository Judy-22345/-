import React, { useMemo, useState } from 'react'

export default function CalendarView({ cases, onAddTimeline, onDeleteTimeline, onUpdateTimeline }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [newEvent, setNewEvent] = useState({
    dateTime: '',
    endTime: '',
    event: '',
    note: '',
    caseId: '',
    isAllDay: false
  })

  // 提取所有事件
  const events = useMemo(() => {
    const eventList = []

    cases.forEach(c => {
      // 开庭时间
      if (c.trialDate) {
        eventList.push({
          id: `trial_${c.id}`,
          dateTime: c.trialDate,
          type: 'trial',
          title: `开庭 - ${c.caseNumber}`,
          caseNumber: c.caseNumber,
          caseCause: c.caseCause,
          court: c.court
        })
      }

      // 立案日期
      if (c.acceptanceDate) {
        eventList.push({
          id: `filing_${c.id}`,
          dateTime: c.acceptanceDate,
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
          eventList.push({
            id: `timeline_${c.id}_${index}`,
            dateTime: item.date,
            type: 'timeline',
            title: item.event,
            caseNumber: c.caseNumber,
            note: item.note
          })
        })
      }
    })

    return eventList
  }, [cases])

  // 获取当月天数
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  // 获取当月第一天是周几
  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  // 生成日历格子
  const calendarDays = useMemo(() => {
    const days = []
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)

    // 填充上月空白
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i)
      })
    }

    // 当月天数
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      })
    }

    // 填充下月空白
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
      })
    }

    return days
  }, [currentDate])

  // 获取某一天的事件
  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => {
      const eventDate = e.dateTime.split('T')[0]
      return eventDate === dateStr
    })
  }

  // 获取某一时段的事件
  const getEventsForSelectedDate = () => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    return events
      .filter(e => e.dateTime.split('T')[0] === dateStr)
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
  }

  // 格式化时间显示
  function formatTime(dateTime) {
    if (!dateTime) return ''
    const date = new Date(dateTime)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  function formatFullDate(dateTime) {
    if (!dateTime) return ''
    const date = new Date(dateTime)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  function formatTimeRange(startTime, endTime) {
    if (!startTime) return ''
    const start = new Date(startTime)
    const startHours = start.getHours().toString().padStart(2, '0')
    const startMinutes = start.getMinutes().toString().padStart(2, '0')

    if (endTime) {
      const end = new Date(endTime)
      const endHours = end.getHours().toString().padStart(2, '0')
      const endMinutes = end.getMinutes().toString().padStart(2, '0')
      return `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`
    }
    return `${startHours}:${startMinutes}`
  }

  function getTypeColor(type) {
    switch (type) {
      case 'trial': return { bg: '#fff3cd', border: '#f0c36d', text: '#856404' }
      case 'filing': return { bg: '#d1ecf1', border: '#a8d5e8', text: '#0c5460' }
      case 'timeline': return { bg: '#d4edda', border: '#a7d9b2', text: '#155724' }
      default: return { bg: '#efefef', border: '#ccc', text: '#37352f' }
    }
  }

  function getTypeIcon(type) {
    switch (type) {
      case 'trial': return '⚖️'
      case 'filing': return '📋'
      case 'timeline': return '📝'
      default: return '📅'
    }
  }

  // 导航到上个月
  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // 导航到下个月
  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // 回到今天
  function goToToday() {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // 打开添加事件弹窗
  function handleOpenAddModal() {
    const dateStr = selectedDate.toISOString().split('T')[0]
    const timeStr = new Date().toTimeString().slice(0, 5)
    const endHour = (new Date().getHours() + 1) % 24
    const endTimeStr = endHour.toString().padStart(2, '0') + ':' + timeStr.slice(3, 5)
    setNewEvent({
      dateTime: `${dateStr}T${timeStr}`,
      endTime: `${dateStr}T${endTimeStr}`,
      event: '',
      note: '',
      caseId: '',
      isAllDay: false
    })
    setIsAddModalOpen(true)
  }

  // 保存新事件
  function handleSaveEvent() {
    if (!newEvent.event.trim() || !newEvent.caseId) {
      alert('请填写事件名称并选择关联案件')
      return
    }

    // 如果是全天事件，只保存日期
    const dateValue = newEvent.isAllDay
      ? newEvent.dateTime.split('T')[0]
      : newEvent.dateTime

    const timelineData = {
      date: dateValue,
      event: newEvent.event,
      note: newEvent.note,
      endTime: newEvent.isAllDay ? null : newEvent.endTime,
      isAllDay: newEvent.isAllDay
    }

    // 找到选中的案件并添加时间线
    const selectedCase = cases.find(c => c.id === newEvent.caseId)
    if (selectedCase && onAddTimeline) {
      onAddTimeline(selectedCase, timelineData)
    }

    setIsAddModalOpen(false)
    setNewEvent({ dateTime: '', endTime: '', event: '', note: '', caseId: '', isAllDay: false })
  }

  // 删除事件
  function handleDeleteEvent(caseId, timelineIndex) {
    const caseItem = cases.find(c => c.id === caseId)
    if (!caseItem || !onDeleteTimeline) return

    if (confirm('确定要删除这个事件吗？')) {
      onDeleteTimeline(caseId, timelineIndex)
    }
  }

  // 打开编辑事件弹窗
  function handleOpenEditModal(event, caseId, timelineIndex) {
    const caseItem = cases.find(c => c.id === caseId)
    if (!caseItem) return

    const timelineItem = caseItem.timeline?.[timelineIndex]
    if (!timelineItem) return

    setEditingEvent({ caseId, timelineIndex, ...timelineItem })
    setIsEditModalOpen(true)
  }

  // 保存编辑后事件
  function handleSaveEdit() {
    if (!editingEvent.event.trim() || !editingEvent.caseId) {
      alert('请填写事件名称并选择关联案件')
      return
    }

    const dateValue = editingEvent.isAllDay
      ? editingEvent.dateTime.split('T')[0]
      : editingEvent.dateTime

    const timelineData = {
      date: dateValue,
      event: editingEvent.event,
      note: editingEvent.note,
      endTime: editingEvent.isAllDay ? null : editingEvent.endTime,
      isAllDay: editingEvent.isAllDay
    }

    if (onUpdateTimeline) {
      onUpdateTimeline(editingEvent.caseId, editingEvent.timelineIndex, timelineData)
    }

    setIsEditModalOpen(false)
    setEditingEvent(null)
  }

  const selectedDateEvents = getEventsForSelectedDate()
  const today = new Date()
  const isToday = (date) => {
    return date.toDateString() === today.toDateString()
  }
  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 200px)' }}>
      {/* 日历主体 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 日历头部 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={prevMonth} style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              ◀
            </button>
            <h2 style={{ fontSize: '16px', fontWeight: 600, minWidth: '140px', textAlign: 'center' }}>
              {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
            </h2>
            <button onClick={nextMonth} style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              ▶
            </button>
          </div>
          <button onClick={goToToday} style={{
            padding: '8px 16px',
            background: 'var(--accent-color)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500
          }}>
            今天
          </button>
        </div>

        {/* 星期标题 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          background: 'var(--border-color)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {weekDays.map(day => (
            <div key={day} style={{
              padding: '10px',
              background: 'var(--bg-secondary)',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 500,
              color: day === '日' || day === '六' ? 'var(--accent-color)' : 'var(--text-secondary)'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* 日历格子 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          background: 'var(--border-color)',
          flex: 1
        }}>
          {calendarDays.map((dayInfo, index) => {
            const dayEvents = getEventsForDate(dayInfo.date)
            return (
              <div
                key={index}
                onClick={() => setSelectedDate(dayInfo.date)}
                style={{
                  padding: '8px',
                  background: dayInfo.isCurrentMonth ? '#fff' : '#f8f9fa',
                  minHeight: '80px',
                  cursor: 'pointer',
                  position: 'relative',
                  border: isSelected(dayInfo.date) ? '2px solid var(--accent-color)' : 'none',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected(dayInfo.date)) {
                    e.currentTarget.style.background = 'var(--bg-hover)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected(dayInfo.date)) {
                    e.currentTarget.style.background = dayInfo.isCurrentMonth ? '#fff' : '#f8f9fa'
                  }
                }}
              >
                <div style={{
                  fontSize: '13px',
                  fontWeight: isSelected(dayInfo.date) ? 600 : 400,
                  marginBottom: '4px',
                  color: isToday(dayInfo.date)
                    ? '#fff'
                    : dayInfo.date.getDay() === 0 || dayInfo.date.getDay() === 6
                    ? 'var(--accent-color)'
                    : 'var(--text-primary)',
                  display: 'inline-block',
                  width: '28px',
                  height: '28px',
                  lineHeight: '28px',
                  textAlign: 'center',
                  borderRadius: '50%',
                  background: isToday(dayInfo.date) ? 'var(--accent-color)' : 'transparent'
                }}>
                  {dayInfo.day}
                </div>

                {/* 事件指示点 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                  {dayEvents.slice(0, 3).map((event, idx) => {
                    const color = getTypeColor(event.type)
                    return (
                      <div
                        key={idx}
                        style={{
                          fontSize: '10px',
                          padding: '2px 4px',
                          background: color.bg,
                          color: color.text,
                          borderRadius: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {formatTime(event.dateTime)} {event.title}
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <div style={{
                      fontSize: '10px',
                      color: 'var(--text-secondary)',
                      paddingLeft: '4px'
                    }}>
                      +{dayEvents.length - 3} 更多
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 右侧事件详情面板 */}
      <div style={{
        width: '320px',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
            {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 日程
          </h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              background: 'var(--accent-color)',
              color: '#fff',
              borderRadius: '10px'
            }}>
              {selectedDateEvents.length}
            </span>
            <button
              onClick={handleOpenAddModal}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                background: 'var(--accent-color)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              + 添加
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {selectedDateEvents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
              <div style={{ fontSize: '13px' }}>暂无日程</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedDateEvents.map(event => {
                const color = getTypeColor(event.type)
                const isTimelineEvent = event.type === 'timeline'
                const caseId = event.caseNumber ? cases.find(c => c.caseNumber === event.caseNumber)?.id : null
                const timelineIndex = caseId ? cases.find(c => c.id === caseId)?.timeline?.findIndex(t => t.date === event.dateTime && t.event === event.title) : null

                return (
                  <div
                    key={event.id}
                    style={{
                      padding: '12px',
                      background: '#fff',
                      borderRadius: '6px',
                      borderLeft: `3px solid ${color.border}`,
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '16px' }}>{getTypeIcon(event.type)}</span>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          background: color.bg,
                          color: color.text,
                          borderRadius: '3px',
                          fontWeight: 500
                        }}>
                          {event.type === 'trial' && '开庭'}
                          {event.type === 'filing' && '立案'}
                          {event.type === 'timeline' && '事件'}
                        </span>
                      </div>

                      {/* 编辑和删除按钮（仅 timeline 事件可编辑/删除） */}
                      {isTimelineEvent && caseId !== null && timelineIndex !== null && timelineIndex >= 0 && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenEditModal(event, caseId, timelineIndex)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              background: '#2f80ed',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              opacity: 0.8,
                              transition: 'opacity 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '1'}
                            onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(caseId, timelineIndex)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              background: '#dc3545',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              opacity: 0.8,
                              transition: 'opacity 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '1'}
                            onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                          >
                            删除
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      marginBottom: '6px',
                      color: 'var(--text-primary)'
                    }}>
                      {event.title}
                    </div>

                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginBottom: '4px'
                    }}>
                      {event.isAllDay ? (
                        <span>📅 全天事件</span>
                      ) : (
                        <span>🕐 {formatTimeRange(event.dateTime, event.endTime)}</span>
                      )}
                    </div>

                    {event.caseCause && (
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                      }}>
                        案由：{event.caseCause}
                      </div>
                    )}

                    {event.court && (
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                      }}>
                        法院：{event.court}
                      </div>
                    )}

                    {event.note && (
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        marginTop: '4px'
                      }}>
                        {event.note}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 添加事件弹窗 */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal"
            style={{ maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>📝 添加日程</h2>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>&times;</button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label form-label-required">关联案件</label>
                  <select
                    className="input"
                    value={newEvent.caseId}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, caseId: e.target.value }))}
                    required
                  >
                    <option value="">选择案件</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.caseNumber} - {c.caseCause}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={newEvent.isAllDay}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, isAllDay: e.target.checked }))}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    全天事件
                  </label>
                </div>

                {!newEvent.isAllDay && (
                  <>
                    <div className="form-group">
                      <label className="form-label form-label-required">开始时间</label>
                      <input
                        type="datetime-local"
                        className="input"
                        value={newEvent.dateTime}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, dateTime: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">结束时间</label>
                      <input
                        type="datetime-local"
                        className="input"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                {newEvent.isAllDay && (
                  <div className="form-group">
                    <label className="form-label form-label-required">日期</label>
                    <input
                      type="date"
                      className="input"
                      value={newEvent.dateTime.split('T')[0]}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, dateTime: `${e.target.value}T00:00` }))}
                      required
                    />
                  </div>
                )}

                <div className="form-group full-width">
                  <label className="form-label form-label-required">事件名称</label>
                  <input
                    type="text"
                    className="input"
                    value={newEvent.event}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, event: e.target.value }))}
                    placeholder="例：提交证据、开庭审理"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">说明</label>
                  <textarea
                    className="input form-textarea"
                    value={newEvent.note}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="事件详细说明..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setIsAddModalOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSaveEvent}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑事件弹窗 */}
      {isEditModalOpen && editingEvent && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div
            className="modal"
            style={{ maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>✏️ 编辑日程</h2>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label form-label-required">关联案件</label>
                  <select
                    className="input"
                    value={editingEvent.caseId}
                    onChange={(e) => setEditingEvent(prev => ({ ...prev, caseId: e.target.value }))}
                    required
                  >
                    <option value="">选择案件</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.caseNumber} - {c.caseCause}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={editingEvent.isAllDay}
                      onChange={(e) => setEditingEvent(prev => ({ ...prev, isAllDay: e.target.checked }))}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    全天事件
                  </label>
                </div>

                {!editingEvent.isAllDay && (
                  <>
                    <div className="form-group">
                      <label className="form-label form-label-required">开始时间</label>
                      <input
                        type="datetime-local"
                        className="input"
                        value={editingEvent.dateTime || editingEvent.date}
                        onChange={(e) => setEditingEvent(prev => ({ ...prev, dateTime: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">结束时间</label>
                      <input
                        type="datetime-local"
                        className="input"
                        value={editingEvent.endTime || ''}
                        onChange={(e) => setEditingEvent(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                {editingEvent.isAllDay && (
                  <div className="form-group">
                    <label className="form-label form-label-required">日期</label>
                    <input
                      type="date"
                      className="input"
                      value={(editingEvent.dateTime || editingEvent.date)?.split('T')[0]}
                      onChange={(e) => setEditingEvent(prev => ({ ...prev, dateTime: `${e.target.value}T00:00` }))}
                      required
                    />
                  </div>
                )}

                <div className="form-group full-width">
                  <label className="form-label form-label-required">事件名称</label>
                  <input
                    type="text"
                    className="input"
                    value={editingEvent.event}
                    onChange={(e) => setEditingEvent(prev => ({ ...prev, event: e.target.value }))}
                    placeholder="例：提交证据、开庭审理"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">说明</label>
                  <textarea
                    className="input form-textarea"
                    value={editingEvent.note}
                    onChange={(e) => setEditingEvent(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="事件详细说明..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setIsEditModalOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
