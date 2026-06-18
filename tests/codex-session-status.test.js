import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inferStatusFromEvent,
  inferStatusFromSessionLines,
} from '../src/main/codex-session-status.js';

test('infers thinking while Codex is reasoning or calling tools', () => {
  assert.equal(inferStatusFromEvent({ type: 'response_item', payload: { type: 'reasoning' } }), 'thinking');
  assert.equal(inferStatusFromEvent({ type: 'response_item', payload: { type: 'function_call' } }), 'thinking');
  assert.equal(inferStatusFromEvent({ type: 'event_msg', payload: { type: 'user_message' } }), 'thinking');
});

test('infers done briefly after a final assistant answer', () => {
  const event = {
    timestamp: '2026-06-18T04:00:00.000Z',
    type: 'event_msg',
    payload: {
      type: 'agent_message',
      phase: 'final_answer',
    },
  };
  assert.equal(inferStatusFromEvent(event, Date.parse('2026-06-18T04:00:03.000Z')), 'done');
});

test('falls back from old final answer to waiting', () => {
  const event = {
    timestamp: '2026-06-18T04:00:00.000Z',
    type: 'event_msg',
    payload: {
      type: 'agent_message',
      phase: 'final_answer',
    },
  };
  assert.equal(inferStatusFromEvent(event, Date.parse('2026-06-18T04:00:15.000Z')), 'waiting');
});

test('infers status from the latest parseable JSONL line', () => {
  const lines = [
    '{"type":"event_msg","payload":{"type":"agent_message","phase":"final_answer"},"timestamp":"2026-06-18T04:00:00.000Z"}',
    'not json',
    '{"type":"response_item","payload":{"type":"function_call"},"timestamp":"2026-06-18T04:00:02.000Z"}',
  ];
  assert.equal(inferStatusFromSessionLines(lines, Date.parse('2026-06-18T04:00:03.000Z')), 'thinking');
});
