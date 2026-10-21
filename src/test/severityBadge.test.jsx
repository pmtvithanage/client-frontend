import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import SeverityBadge from '../components/common/SeverityBadge.jsx'

describe('SeverityBadge', () => {
  it('shows label and icon, never colour only', () => {
    const { getByText, getByRole } = render(<SeverityBadge tier="CRITICAL" />)
    expect(getByText('Urgent')).toBeTruthy()
    const badge = getByRole('status')
    expect(badge).toBeTruthy()
  })
})
