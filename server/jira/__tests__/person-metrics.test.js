import { describe, it, expect } from 'vitest'
import { computeCycleTimeDays, findWorkStartDate } from '../person-metrics'

function makeIssue({ created, resolutiondate, histories }) {
  return {
    fields: { created, resolutiondate },
    changelog: histories !== undefined ? { histories } : undefined
  }
}

function makeHistory(created, fromString, toString) {
  return {
    created,
    items: [{ field: 'status', fromString, toString }]
  }
}

describe('findWorkStartDate', () => {
  it('returns the first In Progress transition timestamp', () => {
    const issue = makeIssue({
      created: '2026-01-12T10:00:00.000+0000',
      resolutiondate: '2026-02-25T10:00:00.000+0000',
      histories: [
        makeHistory('2026-02-20T10:30:00.000+0000', 'New', 'In Progress'),
        makeHistory('2026-02-23T14:00:00.000+0000', 'In Progress', 'Code Review')
      ]
    })
    expect(findWorkStartDate(issue)).toBe('2026-02-20T10:30:00.000+0000')
  })

  it('matches other active statuses (Code Review, Testing, etc.)', () => {
    const issue = makeIssue({
      created: '2026-01-01T00:00:00.000+0000',
      resolutiondate: '2026-02-01T00:00:00.000+0000',
      histories: [
        makeHistory('2026-01-15T08:00:00.000+0000', 'New', 'Code Review')
      ]
    })
    expect(findWorkStartDate(issue)).toBe('2026-01-15T08:00:00.000+0000')
  })

  it('matches statuses case-insensitively', () => {
    const issue = makeIssue({
      created: '2026-01-01T00:00:00.000+0000',
      resolutiondate: '2026-02-01T00:00:00.000+0000',
      histories: [
        makeHistory('2026-01-20T00:00:00.000+0000', 'New', 'IN PROGRESS')
      ]
    })
    expect(findWorkStartDate(issue)).toBe('2026-01-20T00:00:00.000+0000')
  })

  it('returns first active transition when there are multiple', () => {
    const issue = makeIssue({
      created: '2026-01-01T00:00:00.000+0000',
      resolutiondate: '2026-03-01T00:00:00.000+0000',
      histories: [
        makeHistory('2026-01-10T00:00:00.000+0000', 'New', 'In Progress'),
        makeHistory('2026-01-15T00:00:00.000+0000', 'In Progress', 'On Hold'),
        makeHistory('2026-02-01T00:00:00.000+0000', 'On Hold', 'In Progress')
      ]
    })
    expect(findWorkStartDate(issue)).toBe('2026-01-10T00:00:00.000+0000')
  })

  it('returns null when no active status transition exists', () => {
    const issue = makeIssue({
      created: '2026-01-01T00:00:00.000+0000',
      resolutiondate: '2026-02-01T00:00:00.000+0000',
      histories: [
        makeHistory('2026-01-05T00:00:00.000+0000', 'New', 'Closed')
      ]
    })
    expect(findWorkStartDate(issue)).toBeNull()
  })

  it('returns null when changelog is missing', () => {
    const issue = makeIssue({
      created: '2026-01-01T00:00:00.000+0000',
      resolutiondate: '2026-02-01T00:00:00.000+0000',
      histories: undefined
    })
    expect(findWorkStartDate(issue)).toBeNull()
  })

  it('returns null when histories is empty', () => {
    const issue = makeIssue({
      created: '2026-01-01T00:00:00.000+0000',
      resolutiondate: '2026-02-01T00:00:00.000+0000',
      histories: []
    })
    expect(findWorkStartDate(issue)).toBeNull()
  })
})

describe('computeCycleTimeDays', () => {
  it('uses In Progress transition as start date when available', () => {
    const issue = makeIssue({
      created: '2026-01-12T10:00:00.000+0000',
      resolutiondate: '2026-02-25T10:00:00.000+0000',
      histories: [
        makeHistory('2026-02-20T10:00:00.000+0000', 'New', 'In Progress')
      ]
    })
    // Feb 20 → Feb 25 = 5 days
    expect(computeCycleTimeDays(issue)).toBeCloseTo(5, 0)
  })

  it('falls back to created date when no active transition exists', () => {
    const issue = makeIssue({
      created: '2026-01-01T10:00:00.000+0000',
      resolutiondate: '2026-01-11T10:00:00.000+0000',
      histories: [
        makeHistory('2026-01-11T09:00:00.000+0000', 'New', 'Closed')
      ]
    })
    // Jan 1 → Jan 11 = 10 days
    expect(computeCycleTimeDays(issue)).toBeCloseTo(10, 0)
  })

  it('falls back to created date when changelog is null', () => {
    const issue = makeIssue({
      created: '2026-02-01T00:00:00.000+0000',
      resolutiondate: '2026-02-08T00:00:00.000+0000',
      histories: undefined
    })
    // Feb 1 → Feb 8 = 7 days
    expect(computeCycleTimeDays(issue)).toBeCloseTo(7, 0)
  })

  it('returns null when resolutiondate is missing', () => {
    const issue = makeIssue({
      created: '2026-01-01T00:00:00.000+0000',
      resolutiondate: null,
      histories: []
    })
    expect(computeCycleTimeDays(issue)).toBeNull()
  })

  it('handles vulnerability created by scanner and picked up weeks later', () => {
    // Scanner creates issue Jan 12, engineer starts Feb 20, resolves Feb 25
    const issue = makeIssue({
      created: '2026-01-12T00:00:00.000+0000',
      resolutiondate: '2026-02-25T00:00:00.000+0000',
      histories: [
        makeHistory('2026-02-20T00:00:00.000+0000', 'New', 'In Progress'),
        makeHistory('2026-02-24T00:00:00.000+0000', 'In Progress', 'Code Review'),
        makeHistory('2026-02-25T00:00:00.000+0000', 'Code Review', 'Closed')
      ]
    })
    // Should be ~5 days (Feb 20 → Feb 25), NOT 44 days (Jan 12 → Feb 25)
    expect(computeCycleTimeDays(issue)).toBeCloseTo(5, 0)
  })

  it('uses first active transition when issue bounces between statuses', () => {
    const issue = makeIssue({
      created: '2026-01-01T00:00:00.000+0000',
      resolutiondate: '2026-02-15T00:00:00.000+0000',
      histories: [
        makeHistory('2026-01-10T00:00:00.000+0000', 'New', 'In Progress'),
        makeHistory('2026-01-12T00:00:00.000+0000', 'In Progress', 'On Hold'),
        makeHistory('2026-02-01T00:00:00.000+0000', 'On Hold', 'In Progress'),
        makeHistory('2026-02-15T00:00:00.000+0000', 'In Progress', 'Closed')
      ]
    })
    // Jan 10 → Feb 15 = 36 days (uses first In Progress transition)
    expect(computeCycleTimeDays(issue)).toBeCloseTo(36, 0)
  })
})
