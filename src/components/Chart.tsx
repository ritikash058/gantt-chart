"use client";

import React, { useMemo } from "react";

export type Task = {
  actualEndDate: string;
  actualStartDate: string;
  id: number | string;
  name: string;
  plannedStartDate: string; // ISO
  plannedEndDate: string;   // ISO
};

// Helper functions that work with local dates (ignore timezone)
function startOfMonthLocal(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonthLocal(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function daysInMonthLocal(date: Date) {
  return endOfMonthLocal(date).getDate();
}

function addMonthsLocal(d: Date, m: number) {
  return new Date(d.getFullYear(), d.getMonth() + m, 1);
}

// Parse date string without timezone issues
function parseDateLocal(dateString: string): Date {
  // Handle ISO strings and other formats
  const d = new Date(dateString);
  
  // If it's an ISO string with timezone, extract just the date part
  if (dateString.includes('T')) {
    // Get the date part only (YYYY-MM-DD)
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  }
  
  // For MM/DD/YYYY format (from your example: "12/25/2025")
  if (dateString.includes('/')) {
    const [month, day, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
  
  return d;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toDateSafe(iso: string) {
  try {
    return parseDateLocal(iso);
  } catch {
    return null;
  }
}

function monthsBetween(start: Date, end: Date) {
  const months: Date[] = [];
  let current = startOfMonthLocal(start);
  const endMonth = startOfMonthLocal(end);
  while (current <= endMonth) {
    months.push(current);
    current = addMonthsLocal(current, 1);
  }
  return months;
}

function getMonthDaysGrid(months: Date[]) {
  const days: Array<{
    date: Date;
    monthStart: boolean;
    dayOfMonth: number;
    monthIndex: number;
    month: Date;
  }> = [];
  
  months.forEach((month, monthIndex) => {
    const daysInThisMonth = daysInMonthLocal(month);
    for (let day = 1; day <= daysInThisMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      days.push({
        date,
        monthStart: day === 1,
        dayOfMonth: day,
        monthIndex,
        month
      });
    }
  });
  
  return days;
}

function fmtMonth(d: Date) {
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

export default function Gantt({
  tasks,
  rowHeight = 60,
}: {
  tasks: Task[];
  rowHeight?: number;
}) {

  // Normalize tasks to ensure start and end dates are valid and handle reversed ranges
  const normalized = useMemo(() => {
    return tasks
      .map((t) => {
        const s = toDateSafe(t.plannedStartDate);
        const e = toDateSafe(t.plannedEndDate);
        const actualS = toDateSafe(t.actualStartDate || t.plannedStartDate);
        const actualE = toDateSafe(t.actualEndDate || t.plannedEndDate);

        if (!s || !e || !actualS || !actualE) return null;

        // Normalize dates to start of day
        const start = new Date(actualS.getFullYear(), actualS.getMonth(), actualS.getDate());
        const end = new Date(actualE.getFullYear(), actualE.getMonth(), actualE.getDate());
        
        // Ensure start <= end
        const finalStart = start <= end ? start : end;
        const finalEnd = start <= end ? end : start;

        return { ...t, start: finalStart, end: finalEnd };
      })
      .filter(Boolean) as Array<Task & { start: Date; end: Date }>;
  }, [tasks]);

  // Determine the global date range based on tasks
  const { months, monthDaysGrid } = useMemo(() => {
    if (normalized.length === 0) {
      const now = new Date();
      const m = startOfMonthLocal(now);
      const maxM = addMonthsLocal(m, 2); // Show only 3 months by default
      const monthsList = monthsBetween(m, maxM);
      const grid = getMonthDaysGrid(monthsList);
      return { 
        months: monthsList,
        monthDaysGrid: grid,
      };
    }

    const min = new Date(Math.min(...normalized.map((t) => t.start.getTime())));
    const max = new Date(Math.max(...normalized.map((t) => t.end.getTime())));

    const minM = startOfMonthLocal(min);
    
    // Only go to the end of the month that contains the max date
    const maxM = endOfMonthLocal(max);
    const maxMonth = startOfMonthLocal(maxM);

    const monthsList = monthsBetween(minM, maxMonth);
    const grid = getMonthDaysGrid(monthsList);
    
    return { 
      months: monthsList,
      monthDaysGrid: grid,
    };
  }, [normalized]);

  const monthSpans = useMemo(() => {
    const spans: Array<{ month: Date; startIndex: number; days: number }> = [];
    
    months.forEach((month) => {
      const monthDays = monthDaysGrid.filter(d => 
        d.date.getMonth() === month.getMonth() && 
        d.date.getFullYear() === month.getFullYear()
      );
      
      if (monthDays.length > 0) {
        const startIndex = monthDaysGrid.findIndex(d => 
          d.date.getMonth() === month.getMonth() && 
          d.date.getFullYear() === month.getFullYear()
        );
        
        spans.push({
          month,
          startIndex,
          days: monthDays.length
        });
      }
    });
    
    return spans;
  }, [months, monthDaysGrid]);

  return (
    <div className="w-full overflow-x-auto">
      <div className="rounded-xl border bg-white min-w-[800px]">
        {/* Header - Two rows: Month and Days */}
        <div className="grid" style={{ gridTemplateColumns: `210px 1fr` }}>
          <div className="border-b border-r px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50">
            Phase Name
          </div>
          
          {/* Timeline Header */}
          <div className="border-b">
            {/* Month Header Row */}
            <div 
              className="grid border-b bg-gray-50" 
              style={{ 
                gridTemplateColumns: `repeat(${monthDaysGrid.length}, 1fr)`,
                height: '36px'
              }}
            >
              {monthSpans.map((span, index) => (
                <div
                  key={`month-header-${span.month.toISOString()}`}
                  className={`
                    border-l px-2 py-2 text-center text-sm font-semibold text-gray-700
                    ${index === 0 ? 'border-l-0' : ''}
                    flex items-center justify-center
                  `}
                  style={{
                    gridColumn: `${span.startIndex + 1} / span ${span.days}`,
                  }}
                >
                  {fmtMonth(span.month)}
                </div>
              ))}
            </div>
            
            {/* Days Header Row */}
            <div 
              className="grid" 
              style={{ 
                gridTemplateColumns: `repeat(${monthDaysGrid.length}, 1fr)`,
                height: '48px'
              }}
            >
              {monthDaysGrid.map((day, index) => (
                <div
                  key={`day-header-${day.date.toISOString()}-${index}`}
                  className={`
                    border-l text-center text-xs
                    ${day.monthStart ? 'border-l-2 border-l-gray-400' : 'border-l-gray-200'}
                    ${day.date.getDay() === 0 || day.date.getDate() === 6 ? 'bg-gray-50' : 'bg-white'}
                    flex flex-col justify-center
                  `}
                  title={fmtDate(day.date)}
                >
                  {/* <div className="font-medium text-gray-800">
                    {day.dayOfMonth}
                  </div> */}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body rows */}
        <div>
          {normalized.map((t) => {
            // Calculate bar position based on exact days
            const taskStartDay = new Date(t.start);
            taskStartDay.setHours(0, 0, 0, 0);
            
            const taskEndDay = new Date(t.end);
            taskEndDay.setHours(23, 59, 59, 999);
            
            // Find the day indices
            const startIndex = monthDaysGrid.findIndex(day => {
              const dayDate = new Date(day.date);
              dayDate.setHours(0, 0, 0, 0);
              return dayDate.getTime() >= taskStartDay.getTime();
            });
            
            const endIndex = monthDaysGrid.findIndex(day => {
              const dayDate = new Date(day.date);
              dayDate.setHours(23, 59, 59, 999);
              return dayDate.getTime() >= taskEndDay.getTime();
            });
            
            // If exact day not found, use closest
            const barStartIndex = startIndex >= 0 ? startIndex : 0;
            const barEndIndex = endIndex >= 0 ? endIndex : monthDaysGrid.length - 1;
            
            const daysSpan = Math.max(1, barEndIndex - barStartIndex + 1);
            
            const left = (barStartIndex / monthDaysGrid.length) * 100;
            const width = (daysSpan / monthDaysGrid.length) * 100;

            const startLabel = fmtDate(t.start);
            const endLabel = fmtDate(t.end);

            return (
              <div key={t.id} className="grid border-t hover:bg-gray-50" style={{ 
                gridTemplateColumns: `210px 1fr`, 
                height: rowHeight,
                minHeight: rowHeight
              }}>
                {/* Left label + dates */}
                <div className="flex flex-col justify-center px-4 border-r bg-white">
                  <div className="text-sm text-gray-800 font-medium">{t.name}</div>
                </div>
                
                {/* Timeline cell */}
                <div className="relative bg-white">
                  {/* Day grid lines (behind) */}
                  <div className="absolute inset-0 grid" style={{ 
                    gridTemplateColumns: `repeat(${monthDaysGrid.length}, 1fr)`
                  }}>
                    {monthDaysGrid.map((day, index) => (
                      <div
                        key={`grid-${day.date.toISOString()}-${index}`}
                        className={`
                          border-l
                          ${day.monthStart ? 'border-l-2 border-l-gray-400' : 'border-l-gray-200'}
                          ${day.date.getDay() === 0 || day.date.getDay() === 6 ? 'bg-gray-50' : 'bg-white'}
                        `}
                      />
                    ))}
                  </div>
                  
                  {/* Bar (on top) */}
                  <div className="absolute inset-0">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-6 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors shadow-sm"
                      style={{
                        left: `${Math.max(0, left)}%`,
                        width: `${Math.max(8, width)}%`,
                        minWidth: '8px',
                      }}
                      title={`${t.name}
                      Start: ${startLabel}
                      End: ${endLabel}
                      Duration: ${daysSpan} day${daysSpan !== 1 ? 's' : ''}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          {normalized.length === 0 && (
            <div className="p-6 text-sm text-gray-500 text-center">
              No tasks to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}