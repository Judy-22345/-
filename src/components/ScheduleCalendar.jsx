import React, { useMemo, useState, useEffect, useRef } from 'react'

export default function ScheduleCalendar({ cases, onAddTimeline, onDeleteTimeline, onUpdateTimeline }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month', 'week', 'list'
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false)
  const [showWeekPicker, setShowWeekPicker] = useState(false)
  const [listFilterMonth, setListFilterMonth] = useState('') // 列表视图筛选月份
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

  const componentRef = useRef(null)
  const yearMonthButtonRef = useRef(null)
  const weekButtonRef = useRef(null)
  const eventsListRef = useRef(null)

  // 点击组件外部时关闭选择器
  useEffect(() => {
    function handleClickOutside(event) {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        setShowYearMonthPicker(false)
        setShowWeekPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 当选中日期变化时，自动滚动到对应事件
  useEffect(() => {
    if (viewMode === 'month' && eventsListRef.current) {
      // 使用本地时间生成日期字符串，与 data-date 属性格式保持一致
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const selectedDateStr = `${year}-${month}-${day}`
      const eventElement = eventsListRef.current.querySelector(`[data-date="${selectedDateStr}"]`)
      if (eventElement) {
        eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [selectedDate, viewMode])

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
          title: `开庭`,
          caseNumber: c.caseNumber,
          caseCause: c.caseCause,
          court: c.court,
          plaintiff: c.plaintiff,
          defendant: c.defendant
        })
      }

      // 立案日期
      if (c.acceptanceDate) {
        eventList.push({
          id: `filing_${c.id}`,
          dateTime: c.acceptanceDate,
          type: 'filing',
          title: `立案`,
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
            note: item.note,
            caseId: c.id,
            timelineIndex: index
          })
        })
      }
    })

    return eventList
  }, [cases])

  // 获取某一天的事件
  const getEventsForDate = (date) => {
    // 使用本地时间生成日期字符串，避免时区问题
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    return events.filter(e => {
      const eventDate = e.dateTime.split('T')[0]
      return eventDate === dateStr
    })
  }

  // 获取某一月的所有事件
  const getEventsForMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`
    return events.filter(e => {
      const eventDateStr = e.dateTime.split('T')[0]
      return eventDateStr.startsWith(yearMonth)
    }).sort((a, b) => {
      // 全天事件优先，然后按时间排序
      if (a.isAllDay && !b.isAllDay) return -1
      if (!a.isAllDay && b.isAllDay) return 1
      return a.dateTime.localeCompare(b.dateTime)
    })
  }

  // 获取本周的所有事件
  const getEventsForWeek = (date) => {
    // 获取本周日开始和周六结束
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    return events.filter(e => {
      const eventDate = new Date(e.dateTime.split('T')[0])
      return eventDate >= startOfWeek && eventDate <= endOfWeek
    }).sort((a, b) => {
      // 全天事件优先，然后按时间排序
      if (a.isAllDay && !b.isAllDay) return -1
      if (!a.isAllDay && b.isAllDay) return 1
      return a.dateTime.localeCompare(b.dateTime)
    })
  }

  // 获取某一天的事件（用于右侧面板，带排序）
  const getEventsForSelectedDate = () => {
    // 使用本地时间生成日期字符串，避免时区问题
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    return events
      .filter(e => e.dateTime.split('T')[0] === dateStr)
      .sort((a, b) => {
        // 全天事件优先，然后按时间排序
        if (a.isAllDay && !b.isAllDay) return -1
        if (!a.isAllDay && b.isAllDay) return 1
        return a.dateTime.localeCompare(b.dateTime)
      })
  }

  // 获取周视图的数据
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      days.push({
        date,
        events: getEventsForDate(date)
      })
    }
    return days
  }, [currentDate, events])

  // 日历辅助函数
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  const calendarDays = useMemo(() => {
    const days = []
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)

    // 只填充当月日期，不显示上月和下月的日期
    // 用空位填充第一天之前的位置
    for (let i = 0; i < firstDay; i++) {
      days.push({
        day: null,
        isCurrentMonth: false,
        date: null,
        isEmpty: true
      })
    }

    // 当月
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
        isEmpty: false
      })
    }

    return days
  }, [currentDate])

  // 格式化函数
  function formatTime(dateTime) {
    if (!dateTime) return ''
    const date = new Date(dateTime)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
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

  function formatDateCN(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
    return `${year}年${month}月${day}日 周${weekDay}`
  }

  function getTypeColor(type) {
    switch (type) {
      case 'trial': return { bg: '#fff3cd', border: '#f0c36d', text: '#856404', light: '#fff9e6' }
      case 'filing': return { bg: '#d1ecf1', border: '#a8d5e8', text: '#0c5460', light: '#e8f4f8' }
      case 'timeline': return { bg: '#d4edda', border: '#a7d9b2', text: '#155724', light: '#eaf8ed' }
      default: return { bg: '#efefef', border: '#ccc', text: '#37352f', light: '#f5f5f5' }
    }
  }

  function getTypeLabel(type) {
    const labels = { trial: '开庭', filing: '立案', timeline: '事件' }
    return labels[type] || '事件'
  }

  function getTypeIcon(type) {
    const icons = { trial: '⚖️', filing: '📋', timeline: '📝' }
    return icons[type] || '📅'
  }

  // 导航函数
  function prevPeriod() {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() - 7)
      setCurrentDate(newDate)
    }
  }

  function nextPeriod() {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + 7)
      setCurrentDate(newDate)
    }
  }

  function goToToday() {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // 事件操作
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

  function handleSaveEvent() {
    if (!newEvent.event.trim() || !newEvent.caseId) {
      alert('请填写事件名称并选择关联案件')
      return
    }

    const dateValue = newEvent.isAllDay ? newEvent.dateTime.split('T')[0] : newEvent.dateTime
    const timelineData = {
      date: dateValue,
      event: newEvent.event,
      note: newEvent.note,
      endTime: newEvent.isAllDay ? null : newEvent.endTime,
      isAllDay: newEvent.isAllDay
    }

    const selectedCase = cases.find(c => c.id === newEvent.caseId)
    if (selectedCase && onAddTimeline) {
      onAddTimeline(selectedCase, timelineData)
    }

    setIsAddModalOpen(false)
    setNewEvent({ dateTime: '', endTime: '', event: '', note: '', caseId: '', isAllDay: false })
  }

  function handleDeleteEvent(caseId, timelineIndex) {
    const caseItem = cases.find(c => c.id === caseId)
    if (!caseItem || !onDeleteTimeline) return

    if (confirm('确定要删除这个事件吗？')) {
      onDeleteTimeline(caseId, timelineIndex)
    }
  }

  function handleOpenEditModal(event) {
    if (event.type !== 'timeline' || !event.caseId || event.timelineIndex === null) return

    const caseItem = cases.find(c => c.id === event.caseId)
    if (!caseItem) return

    const timelineItem = caseItem.timeline?.[event.timelineIndex]
    if (!timelineItem) return

    setEditingEvent({ ...event, ...timelineItem })
    setIsEditModalOpen(true)
  }

  function handleSaveEdit() {
    if (!editingEvent.event.trim() || !editingEvent.caseId) {
      alert('请填写事件名称并选择关联案件')
      return
    }

    const dateValue = editingEvent.isAllDay ? editingEvent.dateTime.split('T')[0] : editingEvent.dateTime
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

  const today = new Date()
  const isToday = (date) => date.toDateString() === today.toDateString()
  const isSelected = (date) => date.toDateString() === selectedDate.toDateString()
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  const weekDaysLabel = ['日', '一', '二', '三', '四', '五', '六']

  const selectedDateEvents = getEventsForSelectedDate()
  const currentMonthEvents = getEventsForMonth(currentDate)
  const currentWeekEvents = getEventsForWeek(currentDate)

  // 列表视图的所有事件（按月分组）
  const listEventsByMonth = useMemo(() => {
    const months = {}
    const sortedEvents = [...events].sort((a, b) => {
      const dateA = new Date(a.dateTime)
      const dateB = new Date(b.dateTime)
      return dateA - dateB
    })

    sortedEvents.forEach(event => {
      const monthKey = event.dateTime.substring(0, 7) // YYYY-MM
      if (!months[monthKey]) {
        months[monthKey] = []
      }
      months[monthKey].push(event)
    })

    return months
  }, [events])

  // 列表视图筛选后的事件
  const filteredListEvents = useMemo(() => {
    if (!listFilterMonth) return listEventsByMonth
    const filtered = {}
    if (listEventsByMonth[listFilterMonth]) {
      filtered[listFilterMonth] = listEventsByMonth[listFilterMonth]
    }
    return filtered
  }, [listEventsByMonth, listFilterMonth])

  // 获取所有有事件的月份列表
  const availableMonths = useMemo(() => {
    return Object.keys(listEventsByMonth).sort().reverse()
  }, [listEventsByMonth])

  return (
    <div ref={componentRef} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      {/* 头部工具栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        marginBottom: '16px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          {/* 年月选择器（月视图和列表视图） */}
          {(viewMode === 'month' || viewMode === 'list') && (
            <>
              <button
                onClick={() => {
                  if (viewMode === 'month') {
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
                  } else {
                    const [year, month] = (listFilterMonth || new Date().toISOString().slice(0, 7)).split('-')
                    let newYear = parseInt(year)
                    let newMonth = parseInt(month) - 1
                    if (newMonth < 1) {
                      newMonth = 12
                      newYear--
                    }
                    setListFilterMonth(`${newYear}-${newMonth.toString().padStart(2, '0')}`)
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}
              >
                ◀ 上月
              </button>

              <button
                ref={yearMonthButtonRef}
                onClick={(e) => { e.stopPropagation(); setShowYearMonthPicker(!showYearMonthPicker); }}
                style={{
                  padding: '6px 14px',
                  background: '#fff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  minWidth: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span>{viewMode === 'month'
                  ? `${currentDate.getFullYear()}年 ${monthNames[currentDate.getMonth()]}`
                  : (listFilterMonth || '全部月份')
                }</span>
                <span style={{ marginLeft: '6px', fontSize: '12px' }}>{showYearMonthPicker ? '▲' : '▼'}</span>
              </button>

              <button
                onClick={() => {
                  if (viewMode === 'month') {
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
                  } else {
                    const [year, month] = (listFilterMonth || new Date().toISOString().slice(0, 7)).split('-')
                    let newYear = parseInt(year)
                    let newMonth = parseInt(month) + 1
                    if (newMonth > 12) {
                      newMonth = 1
                      newYear++
                    }
                    setListFilterMonth(`${newYear}-${newMonth.toString().padStart(2, '0')}`)
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}
              >
                下月 ▶
              </button>
            </>
          )}

          {/* 周选择器（周视图） */}
          {viewMode === 'week' && (
            <>
              <button
                onClick={() => {
                  const newDate = new Date(currentDate)
                  newDate.setDate(newDate.getDate() - 7)
                  setCurrentDate(newDate)
                }}
                style={{
                  padding: '6px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}
              >
                ◀ 上周
              </button>

              <button
                ref={weekButtonRef}
                onClick={(e) => { e.stopPropagation(); setShowWeekPicker(!showWeekPicker); }}
                style={{
                  padding: '6px 14px',
                  background: '#fff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  minWidth: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span>{currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]} 第{getWeekNumber(currentDate)}周</span>
                <span style={{ marginLeft: '6px', fontSize: '12px' }}>{showWeekPicker ? '▲' : '▼'}</span>
              </button>

              <button
                onClick={() => {
                  const newDate = new Date(currentDate)
                  newDate.setDate(newDate.getDate() + 7)
                  setCurrentDate(newDate)
                }}
                style={{
                  padding: '6px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}
              >
                下周 ▶
              </button>
            </>
          )}

          <button onClick={goToToday} style={{
            padding: '6px 14px',
            background: 'var(--accent-color)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            marginLeft: '12px'
          }}>
            今天
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['month', 'week', 'list'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '6px 14px',
                background: viewMode === mode ? 'var(--accent-color)' : 'transparent',
                color: viewMode === mode ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: viewMode === mode ? 500 : 400
              }}
            >
              {mode === 'month' && '月视图'}
              {mode === 'week' && '周视图'}
              {mode === 'list' && '列表'}
            </button>
          ))}
        </div>
      </div>

      {/* 年/月选择器弹出面板 */}
      {showYearMonthPicker && yearMonthButtonRef.current && (() => {
        const rect = yearMonthButtonRef.current.getBoundingClientRect()
        return (
          <div
            style={{
              position: 'fixed',
              top: rect.bottom + 8,
              left: rect.left,
              background: '#fff',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '16px',
              zIndex: 1000,
              minWidth: '340px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>选择年份</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {[-2, -1, 0, 1, 2, 3, 4, 5].map(offset => {
                const year = currentDate.getFullYear() + offset
                const isCurrentYear = year === new Date().getFullYear()
                const isSelected = year === currentDate.getFullYear()
                return (
                  <button
                    key={year}
                    onClick={() => {
                      setCurrentDate(new Date(year, currentDate.getMonth(), 1))
                      setShowYearMonthPicker(false)
                    }}
                    style={{
                      padding: '8px',
                      background: isSelected ? 'var(--accent-color)' : (isCurrentYear ? 'var(--bg-secondary)' : '#fff'),
                      color: isSelected ? '#fff' : (isCurrentYear ? 'var(--text-primary)' : 'var(--text-primary)'),
                      border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 400
                    }}
                  >
                    {year}年
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>选择月份</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {monthNames.map((name, index) => {
                const isCurrentMonth = index === new Date().getMonth()
                const isSelected = index === currentDate.getMonth()
                return (
                  <button
                    key={name}
                    onClick={() => {
                      setCurrentDate(new Date(currentDate.getFullYear(), index, 1))
                      setShowYearMonthPicker(false)
                    }}
                    style={{
                      padding: '8px',
                      background: isSelected ? 'var(--accent-color)' : (isCurrentMonth ? 'var(--bg-secondary)' : '#fff'),
                      color: isSelected ? '#fff' : (isCurrentMonth ? 'var(--text-primary)' : 'var(--text-primary)'),
                      border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 400
                    }}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        )
      })()}

      {/* 周选择器弹出面板 */}
      {showWeekPicker && weekButtonRef.current && (() => {
        const rect = weekButtonRef.current.getBoundingClientRect()
        return (
          <div
            style={{
              position: 'fixed',
              top: rect.bottom + 8,
              left: rect.left,
              background: '#fff',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '16px',
              zIndex: 1000,
              minWidth: '180px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>选择周</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(() => {
              const weeks = []
              const year = currentDate.getFullYear()
              const month = currentDate.getMonth()
              const firstDay = new Date(year, month, 1)
              const lastDay = new Date(year, month + 1, 0)
              const startOffset = firstDay.getDay()
              const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7)

              for (let i = 0; i < totalCells; i++) {
                const weekStart = new Date(firstDay)
                weekStart.setDate(firstDay.getDate() - startOffset + i * 7)
                const weekEnd = new Date(weekStart)
                weekEnd.setDate(weekStart.getDate() + 6)

                const weekNum = getWeekNumber(weekStart)
                const isCurrentWeek = weekNum === getWeekNumber(new Date())
                const isSelected = weekNum === getWeekNumber(currentDate)

                weeks.push(
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentDate(weekStart)
                      setShowWeekPicker(false)
                    }}
                    style={{
                      padding: '8px 12px',
                      background: isSelected ? 'var(--accent-color)' : (isCurrentWeek ? 'var(--bg-secondary)' : '#fff'),
                      color: isSelected ? '#fff' : (isCurrentWeek ? 'var(--text-primary)' : 'var(--text-primary)'),
                      border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 400,
                      textAlign: 'left'
                    }}
                  >
                    第{weekNum}周
                  </button>
                )
              }
              return weeks
            })()}
          </div>
        </div>
        )
      })()}

      {/* 主体内容 */}
      <div style={{ display: 'flex', flex: 1, gap: '20px', minHeight: 0 }}>
        {/* 左侧：日历/列表 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* 月视图 */}
          {viewMode === 'month' && (
            <>
              {/* 星期标题 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                background: 'var(--border-color)',
                borderBottom: '1px solid var(--border-color)'
              }}>
                {weekDaysLabel.map(day => (
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
                flex: 1,
                minHeight: 0
              }}>
                {calendarDays.map((dayInfo, index) => {
                  // 空白位置显示为灰色背景
                  if (dayInfo.isEmpty) {
                    return (
                      <div
                        key={index}
                        style={{
                          padding: '8px',
                          background: '#fafafa',
                          cursor: 'default'
                        }}
                      />
                    )
                  }

                  const dayEvents = getEventsForDate(dayInfo.date)
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(dayInfo.date)}
                      style={{
                        padding: '8px',
                        background: '#fff',
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
                          e.currentTarget.style.background = '#fff'
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

                      {/* 事件指示 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                        {dayEvents.slice(0, 4).map((event, idx) => {
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
                                textOverflow: 'ellipsis',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <span>{getTypeIcon(event.type)}</span>
                              <span>{event.title}</span>
                            </div>
                          )
                        })}
                        {dayEvents.length > 4 && (
                          <div style={{
                            fontSize: '10px',
                            color: 'var(--text-secondary)',
                            paddingLeft: '4px'
                          }}>
                            +{dayEvents.length - 4} 更多
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* 周视图 */}
          {viewMode === 'week' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '1px',
              background: 'var(--border-color)',
              flex: 1,
              minHeight: 0
            }}>
              {/* 星期标题 */}
              {weekDays.map((dayInfo, idx) => (
                <div key={idx} style={{
                  padding: '12px 8px',
                  background: 'var(--bg-secondary)',
                  textAlign: 'center',
                  borderBottom: `1px solid ${isToday(dayInfo.date) ? 'var(--accent-color)' : 'transparent'}`
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {weekDaysLabel[idx]}
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: isToday(dayInfo.date) ? '#fff' : (idx === 0 || idx === 6 ? 'var(--accent-color)' : 'var(--text-primary)'),
                    background: isToday(dayInfo.date) ? 'var(--accent-color)' : 'transparent',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    lineHeight: '36px',
                    margin: '0 auto'
                  }}>
                    {dayInfo.date.getDate()}
                  </div>
                </div>
              ))}

              {/* 周事件格子 */}
              {weekDays.map((dayInfo, idx) => {
                const isSelDay = isSelected(dayInfo.date)
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(dayInfo.date)}
                    style={{
                      padding: '8px',
                      background: isSelDay ? 'var(--bg-selected)' : '#fff',
                      cursor: 'pointer',
                      border: isSelDay ? '2px solid var(--accent-color)' : 'none',
                      transition: 'background 0.15s ease',
                      overflow: 'auto'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelDay) e.currentTarget.style.background = 'var(--bg-hover)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelDay) e.currentTarget.style.background = '#fff'
                    }}
                  >
                    {dayInfo.events.map((event, eIdx) => {
                      const color = getTypeColor(event.type)
                      return (
                        <div
                          key={eIdx}
                          style={{
                            padding: '6px 8px',
                            background: color.light,
                            borderLeft: `3px solid ${color.border}`,
                            borderRadius: '4px',
                            marginBottom: '6px',
                            fontSize: '11px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                            <span>{getTypeIcon(event.type)}</span>
                            <span style={{ fontWeight: 500, color: color.text }}>{event.title}</span>
                          </div>
                          {!event.isAllDay && (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                              {formatTime(event.dateTime)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}

          {/* 列表视图 */}
          {viewMode === 'list' && (
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
              {Object.entries(filteredListEvents).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📅</div>
                  <div className="empty-state-title">暂无日程</div>
                  <div className="empty-state-desc">
                    {listFilterMonth ? '该月份暂无日程，请选择其他月份或显示全部' : '案件中的开庭时间和重要事件将在此显示'}
                  </div>
                </div>
              ) : (
                Object.entries(filteredListEvents).map(([month, monthEvents]) => (
                  <div key={month} style={{ marginBottom: '24px' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: '12px',
                      padding: '8px 12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '6px'
                    }}>
                      {month}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {monthEvents.map(event => {
                        const color = getTypeColor(event.type)
                        return (
                          <div
                            key={event.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 16px',
                              background: '#fff',
                              borderRadius: '8px',
                              border: `1px solid var(--border-color)`,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onClick={() => {
                              const eventDate = new Date(event.dateTime)
                              setSelectedDate(eventDate)
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--bg-hover)'
                              e.currentTarget.style.borderColor = 'var(--accent-color)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fff'
                              e.currentTarget.style.borderColor = 'var(--border-color)'
                            }}
                          >
                            <div style={{
                              minWidth: '60px',
                              textAlign: 'center',
                              padding: '8px',
                              background: color.light,
                              borderRadius: '6px'
                            }}>
                              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                                {event.dateTime.substring(5, 7)}/{event.dateTime.substring(8, 10)}
                              </div>
                              <div style={{ fontSize: '16px', fontWeight: 600, color: color.text }}>
                                {new Date(event.dateTime).getDate()}
                              </div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  background: color.bg,
                                  color: color.text
                                }}>
                                  {getTypeLabel(event.type)}
                                </span>
                                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                  {event.title}
                                </span>
                                {event.caseNumber && (
                                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    · {event.caseNumber}
                                  </span>
                                )}
                              </div>
                              {event.caseCause && (
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                  案由：{event.caseCause}
                                </div>
                              )}
                            </div>
                            {!event.isAllDay && (
                              <div style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                padding: '4px 8px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '4px'
                              }}>
                                {formatTime(event.dateTime)}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 右侧：选中日期详情面板 */}
        <div style={{
          width: '340px',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                {viewMode === 'month'
                  ? `${currentDate.getFullYear()}年 ${monthNames[currentDate.getMonth()]}`
                  : viewMode === 'week'
                  ? `${currentDate.getFullYear()}年 ${monthNames[currentDate.getMonth()]} 第${getWeekNumber(currentDate)}周`
                  : `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日`
                }
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {viewMode === 'month'
                  ? `${currentMonthEvents.length} 个事件`
                  : viewMode === 'week'
                  ? `${currentWeekEvents.length} 个事件`
                  : `周${weekDaysLabel[selectedDate.getDay()]}${isToday(selectedDate) ? ' · 今天' : ''}`
                }
              </div>
            </div>
            <button
              onClick={handleOpenAddModal}
              style={{
                padding: '6px 12px',
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

          <div style={{ flex: 1, overflowY: 'auto' }} ref={eventsListRef}>
            {(viewMode === 'month' ? currentMonthEvents : viewMode === 'week' ? currentWeekEvents : selectedDateEvents).length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>📅</div>
                <div style={{ fontSize: '13px' }}>暂无日程</div>
                <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-muted)' }}>
                  点击"添加"创建新事件
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(viewMode === 'month' ? currentMonthEvents : viewMode === 'week' ? currentWeekEvents : selectedDateEvents).map((event, index) => {
                  const color = getTypeColor(event.type)
                  const isTimelineEvent = event.type === 'timeline'
                  // 使用字符串方式解析日期，避免时区问题
                  const eventDateStr = event.dateTime.split('T')[0]
                  const [eventYear, eventMonth, eventDay] = eventDateStr.split('-').map(Number)
                  const eventDate = new Date(eventYear, eventMonth - 1, eventDay)

                  const selectedDateStr = selectedDate.toISOString().split('T')[0]
                  const isSameDay = eventDateStr === selectedDateStr
                  const isWeekView = viewMode === 'week'

                  return (
                    <div
                      key={event.id}
                      data-date={eventDateStr}
                      onClick={() => {
                        if (viewMode === 'month' || viewMode === 'week') {
                          setSelectedDate(eventDate)
                        }
                      }}
                      style={{
                        padding: '14px',
                        background: isSameDay && (viewMode === 'month' || isWeekView) ? 'var(--accent-color)' : '#fff',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${color.border}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        cursor: (viewMode === 'month' || isWeekView) ? 'pointer' : 'default',
                        opacity: (viewMode === 'month' || isWeekView) && !isSameDay ? 0.85 : 1,
                        transform: (viewMode === 'month' || isWeekView) && isSameDay ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {(viewMode === 'month' || isWeekView) && (
                        <div style={{
                          fontSize: '11px',
                          color: isSameDay ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)',
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>{eventDate.getMonth() + 1}月{eventDate.getDate()}日</span>
                          <span>·</span>
                          <span>{weekDaysLabel[eventDate.getDay()]}</span>
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>{getTypeIcon(event.type)}</span>
                          <span style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            background: isSameDay && viewMode === 'month' ? 'rgba(255,255,255,0.2)' : color.bg,
                            color: isSameDay && viewMode === 'month' ? '#fff' : color.text,
                            borderRadius: '4px',
                            fontWeight: 500
                          }}>
                            {getTypeLabel(event.type)}
                          </span>
                        </div>

                        {isTimelineEvent && event.caseId !== null && event.timelineIndex !== null && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenEditModal(event)
                              }}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                background: isSameDay && viewMode === 'month' ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
                                color: isSameDay && viewMode === 'month' ? '#fff' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                              }}
                            >
                              编辑
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteEvent(event.caseId, event.timelineIndex)
                              }}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                background: isSameDay && viewMode === 'month' ? 'rgba(255,255,255,0.2)' : '#ffebee',
                                color: isSameDay && viewMode === 'month' ? '#fff' : '#c62828',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                              }}
                            >
                              删除
                            </button>
                          </div>
                        )}
                      </div>

                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: isSameDay && viewMode === 'month' ? '#fff' : 'var(--text-primary)'
                      }}>
                        {event.title}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '10px',
                        fontSize: '12px',
                        color: isSameDay && viewMode === 'month' ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)'
                      }}>
                        <span>
                          {event.isAllDay ? (
                            <span>📅 全天</span>
                          ) : (
                            <span>🕐 {formatTimeRange(event.dateTime, event.endTime)}</span>
                          )}
                        </span>
                      </div>

                      {event.caseNumber && (
                        <div style={{
                          padding: '8px 10px',
                          background: isSameDay && viewMode === 'month' ? 'rgba(255,255,255,0.15)' : 'var(--bg-secondary)',
                          borderRadius: '6px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: 500, color: isSameDay && viewMode === 'month' ? '#fff' : 'var(--text-primary)', marginBottom: '4px' }}>
                            {event.caseNumber}
                          </div>
                          {event.caseCause && (
                            <div style={{ fontSize: '11px', color: isSameDay && viewMode === 'month' ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                              案由：{event.caseCause}
                            </div>
                          )}
                        </div>
                      )}

                      {event.court && (
                        <div style={{ fontSize: '12px', color: isSameDay && viewMode === 'month' ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }}>
                           {event.court}
                        </div>
                      )}

                      {event.note && (
                        <div style={{
                          fontSize: '12px',
                          color: isSameDay && viewMode === 'month' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: `1px dashed ${isSameDay && viewMode === 'month' ? 'rgba(255,255,255,0.3)' : 'var(--border-color)'}`
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

          {/* 底部统计 */}
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-around'
          }}>
            {[
              { type: 'trial', label: '开庭' },
              { type: 'filing', label: '立案' },
              { type: 'timeline', label: '事件' }
            ].map(item => {
              const sourceEvents = viewMode === 'month' ? currentMonthEvents : viewMode === 'week' ? currentWeekEvents : selectedDateEvents
              const count = sourceEvents.filter(e => e.type === item.type).length
              const color = getTypeColor(item.type)
              return (
                <div key={item.type} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: color.text,
                    background: color.bg,
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    lineHeight: '32px',
                    margin: '0 auto 4px'
                  }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 添加事件弹窗 */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
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
          <div className="modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
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

// 辅助函数：计算是一年中的第几周
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}
