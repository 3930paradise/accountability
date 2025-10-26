'use client';

import { useState, useMemo } from 'react';
import { format, differenceInDays, startOfDay, endOfDay } from 'date-fns';

type Attachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  isPiiRedacted: boolean;
};

type Event = {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  category: string;
  createdAt: string;
  attachments: Attachment[];
};

type DashboardGraphProps = {
  events: Event[];
};

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    maintenance: '🔧',
    complaint: '📢',
    violation: '⚠️',
    notice: '📋',
    default: '📍',
  };
  return icons[category.toLowerCase()] || icons.default;
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    maintenance: 'bg-red-500',
    complaint: 'bg-yellow-400',
    violation: 'bg-red-600',
    notice: 'bg-gray-500',
    default: 'bg-white',
  };
  return colors[category.toLowerCase()] || colors.default;
};

const getCategoryBorderColor = (category: string): string => {
  const colors: Record<string, string> = {
    maintenance: 'border-red-500',
    complaint: 'border-yellow-400',
    violation: 'border-red-600',
    notice: 'border-gray-500',
    default: 'border-white',
  };
  return colors[category.toLowerCase()] || colors.default;
};

export function DashboardGraph({ events }: DashboardGraphProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);

  // Calculate date range from Oct 1 to now
  const startDate = useMemo(() => {
    const now = new Date();
    return startOfDay(new Date(now.getFullYear(), 9, 1)); // Oct 1 (month 9 = October)
  }, []);

  const endDate = useMemo(() => endOfDay(new Date()), []);
  const totalDays = differenceInDays(endDate, startDate);

  // Process events to get their positions on the timeline
  const processedEvents = useMemo(() => {
    return events.map((event) => {
      const eventDate = new Date(event.eventDate);
      const daysFromStart = differenceInDays(eventDate, startDate);
      const position = (daysFromStart / totalDays) * 100;

      return {
        ...event,
        position: Math.max(0, Math.min(100, position)), // Clamp between 0-100
        daysFromStart,
      };
    }).filter(e => e.daysFromStart >= 0 && e.daysFromStart <= totalDays);
  }, [events, startDate, totalDays]);

  // Group events by day for stacking
  const eventsByDay = useMemo(() => {
    const grouped = new Map<number, typeof processedEvents>();
    processedEvents.forEach(event => {
      const day = event.daysFromStart;
      if (!grouped.has(day)) {
        grouped.set(day, []);
      }
      grouped.get(day)!.push(event);
    });
    return grouped;
  }, [processedEvents]);

  // Generate week markers
  const weekMarkers = useMemo(() => {
    const markers = [];
    for (let day = 0; day <= totalDays; day += 7) {
      const markerDate = new Date(startDate);
      markerDate.setDate(markerDate.getDate() + day);
      markers.push({
        position: (day / totalDays) * 100,
        date: markerDate,
      });
    }
    return markers;
  }, [startDate, totalDays]);

  return (
    <div className="w-full border-4 border-white bg-gray-900 p-6">
      {/* Dashboard Header */}
      <div className="mb-6 pb-4 border-b-2 border-yellow-400">
        <h2 className="text-2xl font-bold text-white mb-1">INCIDENT DASHBOARD</h2>
        <p className="text-sm text-gray-400">
          Timeline from October 1, 2025 to Present • {processedEvents.length} documented event{processedEvents.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Graph Container */}
      <div className="bg-black border-2 border-white p-6">
        {/* Graph Area */}
        <div className="relative h-64 mb-8">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute w-full border-t border-gray-800"
                style={{ top: `${(i / 4) * 100}%` }}
              />
            ))}
          </div>

          {/* Vertical week markers */}
          {weekMarkers.map((marker, idx) => (
            <div
              key={idx}
              className="absolute h-full border-l border-gray-700"
              style={{ left: `${marker.position}%` }}
            >
              <div className="absolute -bottom-6 -translate-x-1/2 text-xs text-gray-500 font-bold">
                {format(marker.date, 'MMM d')}
              </div>
            </div>
          ))}

          {/* Main timeline bar */}
          <div className="absolute bottom-0 w-full h-1 bg-yellow-400" />

          {/* Event tick marks */}
          {processedEvents.map((event) => {
            const eventsOnSameDay = eventsByDay.get(event.daysFromStart) || [];
            const eventIndex = eventsOnSameDay.findIndex(e => e.id === event.id);
            const stackHeight = 40 + (eventIndex * 25); // Stack events on same day

            return (
              <div
                key={event.id}
                className="absolute"
                style={{
                  left: `${event.position}%`,
                  bottom: '0',
                }}
              >
                {/* Vertical tick line */}
                <div
                  className={`w-1 ${getCategoryColor(event.category)} transition-all`}
                  style={{ height: `${stackHeight}px` }}
                />

                {/* Clickable marker */}
                <button
                  onClick={() => setSelectedEvent(event)}
                  onMouseEnter={() => setHoveredEvent(event)}
                  onMouseLeave={() => setHoveredEvent(null)}
                  className={`
                    absolute -top-2 -left-3 w-7 h-7
                    flex items-center justify-center
                    ${getCategoryColor(event.category)}
                    border-2 ${getCategoryBorderColor(event.category)}
                    hover:scale-125 transition-transform cursor-pointer
                    text-sm font-bold
                  `}
                  style={{ top: `-${stackHeight + 8}px` }}
                  aria-label={`View ${event.title}`}
                >
                  {getCategoryIcon(event.category)}
                </button>

                {/* Hover tooltip */}
                {hoveredEvent?.id === event.id && (
                  <div
                    className="absolute z-20 bg-white text-black p-2 border-2 border-black text-xs font-bold whitespace-nowrap pointer-events-none"
                    style={{
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bottom: `${stackHeight + 35}px`,
                    }}
                  >
                    <div className="mb-1">{event.title}</div>
                    <div className="text-gray-600">{format(new Date(event.eventDate), 'MMM dd, yyyy')}</div>
                    <div className="text-xs text-gray-500 uppercase">{event.category}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-12 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap gap-4 justify-center text-xs font-bold">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 border-2 border-white" />
              <span className="text-gray-400">MAINTENANCE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 border-2 border-white" />
              <span className="text-gray-400">COMPLAINT</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 border-2 border-white" />
              <span className="text-gray-400">VIOLATION</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 border-2 border-white" />
              <span className="text-gray-400">NOTICE</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 border-2 border-gray-600 p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{processedEvents.length}</div>
            <div className="text-xs text-gray-400 mt-1">TOTAL EVENTS</div>
          </div>
          <div className="bg-gray-800 border-2 border-gray-600 p-3 text-center">
            <div className="text-2xl font-bold text-red-400">
              {processedEvents.filter(e => e.category.toLowerCase() === 'maintenance').length}
            </div>
            <div className="text-xs text-gray-400 mt-1">MAINTENANCE</div>
          </div>
          <div className="bg-gray-800 border-2 border-gray-600 p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {processedEvents.filter(e => e.category.toLowerCase() === 'complaint').length}
            </div>
            <div className="text-xs text-gray-400 mt-1">COMPLAINTS</div>
          </div>
          <div className="bg-gray-800 border-2 border-gray-600 p-3 text-center">
            <div className="text-2xl font-bold text-gray-400">
              {processedEvents.filter(e => e.category.toLowerCase() === 'notice').length}
            </div>
            <div className="text-xs text-gray-400 mt-1">NOTICES</div>
          </div>
        </div>
      </div>

      {/* Selected Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-gray-900 border-4 border-white max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="float-right bg-red-500 text-white px-4 py-2 font-bold border-2 border-white hover:bg-red-600"
            >
              ✕ CLOSE
            </button>

            {/* Event Details */}
            <div className="clear-both">
              <div className="flex items-center gap-2 mb-4">
                <span className={`${getCategoryColor(selectedEvent.category)} text-white px-3 py-1 text-sm font-bold border-2 border-white`}>
                  {getCategoryIcon(selectedEvent.category)} {selectedEvent.category.toUpperCase()}
                </span>
                <span className="text-gray-400 text-sm font-bold">
                  {format(new Date(selectedEvent.eventDate), 'MMMM dd, yyyy')}
                </span>
              </div>

              <h3 className="text-3xl font-bold mb-4 text-white">
                {selectedEvent.title}
              </h3>

              <p className="text-gray-300 mb-6 whitespace-pre-wrap leading-relaxed">
                {selectedEvent.description}
              </p>

              {/* Attachments */}
              {selectedEvent.attachments.length > 0 && (
                <div className="border-t-2 border-gray-700 pt-4">
                  <h4 className="text-yellow-400 font-bold mb-3 text-sm">EVIDENCE:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedEvent.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="border-2 border-gray-600 p-2 bg-black hover:border-yellow-400 transition-colors"
                      >
                        {att.fileType === 'image' ? (
                          <a
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={att.fileUrl}
                              alt={att.fileName}
                              className="w-full h-32 object-cover"
                            />
                            {att.isPiiRedacted && (
                              <span className="block text-xs text-red-500 mt-1 font-bold">
                                PII REDACTED
                              </span>
                            )}
                          </a>
                        ) : (
                          <a
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-blue-400 hover:underline text-sm"
                          >
                            📄 {att.fileName}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 text-xs text-gray-500 border-t border-gray-700 pt-3">
                Posted: {format(new Date(selectedEvent.createdAt), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
