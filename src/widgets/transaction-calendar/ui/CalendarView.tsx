import { Adaptive } from '@/shared/ui/adaptive'
import { CalendarViewDesktop } from './CalendarView.desktop'
import { CalendarViewMobile } from './CalendarView.mobile'
import type { ComponentProps } from 'react'

type CalendarViewProps = ComponentProps<typeof CalendarViewDesktop>

export function CalendarView(props: CalendarViewProps) {
  return (
    <Adaptive
      desktop={<CalendarViewDesktop {...props} />}
      mobile={<CalendarViewMobile {...props} />}
    />
  )
}
