'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
  const [randomHighlight, setRandomHighlight] = useState<Event | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pick a random event to highlight on mount
  useEffect(() => {
    if (events.length > 0 && !userInteracted) {
      const randomIndex = Math.floor(Math.random() * events.length);
      setRandomHighlight(events[randomIndex]);
    }
  }, [events, userInteracted]);

  // Clear random highlight on user interaction
  const handleUserInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      setRandomHighlight(null);
    }
  };

  // Calculate date range - start from first event or Oct 1, whichever is earlier
  const startDate = useMemo(() => {
    if (events.length === 0) {
      const now = new Date();
      return startOfDay(new Date(now.getFullYear(), 9, 1)); // Oct 1 (month 9 = October)
    }

    // Find earliest event date
    const firstEventDate = events.reduce((earliest, event) => {
      const eventDate = new Date(event.eventDate);
      return eventDate < earliest ? eventDate : earliest;
    }, new Date(events[0].eventDate));

    // Use first event date with 7 days padding before
    const paddedStart = new Date(firstEventDate);
    paddedStart.setDate(paddedStart.getDate() - 7);

    return startOfDay(paddedStart);
  }, [events]);

  const endDate = useMemo(() => {
    // Add 7 days padding after current date or last event
    const now = new Date();
    const paddedEnd = new Date(now);
    paddedEnd.setDate(paddedEnd.getDate() + 7);
    return endOfDay(paddedEnd);
  }, []);

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

  // Improved collision detection - group events by proximity, not just same day
  const eventsWithStacking = useMemo(() => {
    // Sort events by position
    const sorted = [...processedEvents].sort((a, b) => a.position - b.position);

    // Assign stack levels based on collision detection
    const COLLISION_THRESHOLD = 2.5; // Reduced for more compact grouping
    const MAX_STACK_LEVEL = 5; // Maximum stack height to prevent overflow
    const stackLevels: { event: typeof processedEvents[0], stackLevel: number }[] = [];

    sorted.forEach((event) => {
      // Find all events that would collide with this one
      const collidingEvents = stackLevels.filter(e =>
        Math.abs(e.event.position - event.position) < COLLISION_THRESHOLD
      );

      // Find the lowest available stack level
      let stackLevel = 0;
      if (collidingEvents.length > 0) {
        const usedLevels = collidingEvents.map(e => e.stackLevel);
        // Find first available level, capped at MAX_STACK_LEVEL
        while (usedLevels.includes(stackLevel) && stackLevel < MAX_STACK_LEVEL) {
          stackLevel++;
        }
      }

      stackLevels.push({ event, stackLevel });
    });

    // Create a map for easy lookup
    const stackMap = new Map<string, number>();
    stackLevels.forEach(({ event, stackLevel }) => {
      stackMap.set(event.id, stackLevel);
    });

    return stackMap;
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
    <div
      ref={containerRef}
      className="w-full bg-gray-900 border-4 border-white shadow-2xl"
      onMouseEnter={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      {/* Dashboard Header */}
      <div className="bg-black px-8 py-6 border-b-4 border-yellow-400">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight uppercase">Incident Dashboard</h2>
            <div className="flex items-center gap-3 text-gray-300">
              <span className="flex items-center gap-2 text-sm font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {format(startDate, 'MMM d, yyyy')} - Present
              </span>
              <span className="text-yellow-400">•</span>
              <span className="flex items-center gap-2 text-sm font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {processedEvents.length} Event{processedEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Moved to top */}
      <div className="px-8 py-6 bg-black border-b-2 border-gray-800">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 border-2 border-gray-600 p-5 hover:border-white transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gray-700 border border-gray-600">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{processedEvents.length}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Events</div>
          </div>

          <div className="bg-gray-800 border-2 border-red-500/50 p-5 hover:border-red-500 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-red-500/20 border border-red-500/50">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-red-400 mb-1">
              {processedEvents.filter(e => e.category.toLowerCase() === 'maintenance').length}
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Maintenance</div>
          </div>

          <div className="bg-gray-800 border-2 border-yellow-500/50 p-5 hover:border-yellow-400 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-500/20 border border-yellow-500/50">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {processedEvents.filter(e => e.category.toLowerCase() === 'complaint').length}
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Complaints</div>
          </div>

          <div className="bg-gray-800 border-2 border-gray-600 p-5 hover:border-gray-500 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gray-700 border border-gray-600">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-300 mb-1">
              {processedEvents.filter(e => e.category.toLowerCase() === 'notice').length}
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notices</div>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div className="px-8 py-6">
        <div className="bg-black border-2 border-white p-8">
          {/* Graph Area with proper spacing */}
          <div className="relative h-96 mb-16">
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
                <div className="absolute -bottom-12 -translate-x-1/2 text-xs text-white font-bold bg-gray-900 px-3 py-1.5 border border-gray-700 whitespace-nowrap">
                  {format(marker.date, 'MMM d')}
                </div>
              </div>
            ))}

            {/* Main timeline bar */}
            <div className="absolute bottom-0 w-full h-2 bg-yellow-400" />

            {/* Event tick marks */}
            {processedEvents.map((event) => {
              const stackLevel = eventsWithStacking.get(event.id) || 0;
              // Compact stacking: reduced spacing between levels for tighter grouping
              const stackHeight = 40 + (stackLevel * 35);

              return (
                <div
                  key={event.id}
                  className="absolute"
                  style={{
                    left: `${event.position}%`,
                    bottom: '0',
                  }}
                >
                  {/* Vertical tick line - thinner and lighter */}
                  <div
                    className={`w-0.5 transition-all opacity-30`}
                    style={{
                      height: `${stackHeight}px`,
                      backgroundColor: event.category.toLowerCase() === 'maintenance' ? '#ef4444' :
                                     event.category.toLowerCase() === 'complaint' ? '#facc15' :
                                     event.category.toLowerCase() === 'violation' ? '#dc2626' : '#6b7280'
                    }}
                  />

                  {/* Clickable marker - simple square like legend */}
                  <button
                    onClick={() => setSelectedEvent(event)}
                    onMouseEnter={() => setHoveredEvent(event)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    className={`
                      absolute -left-2 w-4 h-4
                      ${getCategoryColor(event.category)}
                      border-2 border-white
                      hover:scale-150 transition-all duration-200 cursor-pointer
                      ${randomHighlight?.id === event.id && !userInteracted ? 'animate-pulse scale-150 ring-2 ring-white ring-offset-2 ring-offset-black' : ''}
                    `}
                    style={{
                      top: `-${stackHeight + 2}px`
                    }}
                    aria-label={`View ${event.title}`}
                  />

                  {/* Hover tooltip or random highlight tooltip */}
                  {(hoveredEvent?.id === event.id || (randomHighlight?.id === event.id && !userInteracted)) && (
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
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 ${getCategoryColor(selectedEvent.category)} border-2 border-white`} />
                  <span className="text-white text-sm font-bold uppercase">
                    {selectedEvent.category}
                  </span>
                </div>
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
