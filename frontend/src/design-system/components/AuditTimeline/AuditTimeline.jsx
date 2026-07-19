import React from 'react';
import Timeline from '../Timeline/index.js';

/**
 * AuditTimeline — audit log feed reusing Timeline.
 * @param {Array<{id?,actor,action,target?,time?,tone?}>} events
 */
export default function AuditTimeline({ events = [], className, ...rest }) {
  const items = events.map((e) => ({
    id: e.id,
    tone: e.tone,
    title: (
      <span className="ds-audit__item">
        <span><strong className="ds-audit__actor">{e.actor}</strong> <span className="ds-audit__action">{e.action}</span>{e.target && <> <span>{e.target}</span></>}</span>
        {e.time && <span className="ds-audit__time"> · {e.time}</span>}
      </span>
    ),
  }));
  return <Timeline items={items} className={className} {...rest} />;
}
