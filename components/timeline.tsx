'use client';

import { useState } from 'react';
import { format } from 'date-fns';

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

type TimelineProps = {
  events: Event[];
};

// Category icon mapping
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

export function Timeline({ events }: TimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Safety check for events
  if (!events || events.length === 0) {
    return (
      <div className="text-center border-4 border-white p-8 bg-gray-900">
        <p className="text-xl mb-4">NO EVENTS IN TIMELINE</p>
        <p className="text-sm text-gray-400">Events will appear here once approved.</p>
      </div>
    );
  }

  // Sort events by date (oldest to newest for timeline left-to-right)
  const sortedEvents = [...events].sort((a, b) =>
    new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  return (
    <div className="w-full border-4 border-white bg-gray-900 p-6">
      {/* Timeline Title */}
      <div className="mb-6 pb-4 border-b-2 border-yellow-400">
        <h2 className="text-2xl font-bold text-white mb-1">EVENT TIMELINE</h2>
        <p className="text-sm text-gray-400">
          {sortedEvents.length} documented incident{sortedEvents.length !== 1 ? 's' : ''} • Click icons for details
        </p>
      </div>

      {/* Horizontal Timeline */}
      <div className="relative overflow-x-auto pb-8 bg-black p-4">
        <div className="flex items-start gap-0 min-w-max">
          {sortedEvents.map((event, index) => (
            <div key={event.id} className="flex items-center">
              {/* Timeline Node */}
              <div className="flex flex-col items-center">
                {/* Icon Button */}
                <button
                  onClick={() => setSelectedEvent(event)}
                  className={`
                    relative z-10 w-16 h-16 flex items-center justify-center
                    border-4 border-white ${getCategoryColor(event.category)}
                    hover:scale-110 transition-transform cursor-pointer
                    font-bold text-2xl
                  `}
                  aria-label={`View ${event.title}`}
                >
                  {getCategoryIcon(event.category)}
                </button>

                {/* Date Label */}
                <div className="mt-2 text-xs text-center font-bold text-yellow-400 w-24">
                  {format(new Date(event.eventDate), 'MMM dd')}
                  <br />
                  {format(new Date(event.eventDate), 'yyyy')}
                </div>

                {/* Category Label */}
                <div className="mt-1 text-xs text-center text-gray-400 uppercase w-24">
                  {event.category}
                </div>
              </div>

              {/* Connecting Line */}
              {index < sortedEvents.length - 1 && (
                <div className="h-1 w-12 bg-white mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="text-center text-xs text-gray-500 mt-4 font-bold">
          ← SCROLL TO VIEW TIMELINE →
        </div>
      </div>

      {/* Compact Event List */}
      <div className="mt-8 border-t-2 border-gray-700 pt-6">
        <h3 className="text-lg font-bold text-white mb-4">ALL EVENTS</h3>
        <div className="space-y-3">
          {sortedEvents.map((event, index) => (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="w-full text-left bg-black border-2 border-gray-700 hover:border-yellow-400 p-4 transition-colors group"
            >
              <div className="flex items-start gap-4">
                {/* Event Number */}
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-800 border border-gray-600 text-xs font-bold text-gray-400">
                  #{index + 1}
                </div>

                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center ${getCategoryColor(event.category)} border-2 border-white text-lg`}>
                  {getCategoryIcon(event.category)}
                </div>

                {/* Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`${getCategoryColor(event.category)} text-black px-2 py-0.5 text-xs font-bold border border-white uppercase`}>
                      {event.category}
                    </span>
                    <span className="text-xs text-yellow-400 font-bold">
                      {format(new Date(event.eventDate), 'MMM dd, yyyy')}
                    </span>
                    {event.attachments.length > 0 && (
                      <span className="text-xs text-gray-500">
                        📎 {event.attachments.length} attachment{event.attachments.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <h4 className="text-white font-bold text-sm group-hover:text-yellow-400 transition-colors truncate">
                    {event.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Posted: {format(new Date(event.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="flex-shrink-0 text-gray-600 group-hover:text-yellow-400 transition-colors">
                  →
                </div>
              </div>
            </button>
          ))}
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
